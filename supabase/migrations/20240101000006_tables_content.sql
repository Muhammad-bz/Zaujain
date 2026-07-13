-- Migration: 0006_tables_content
-- Description: Content tables that live inside an experience
--
-- Tables: memories, quizzes, questions, answers,
--         games, drawings, time_capsules, notifications
--
-- All depend on: users, experiences, experience_members (migrations 0004–0005)

-- ── Table: memories ───────────────────────────────────────────────────────────

create table public.memories (
  id              uuid                primary key default uuid_generate_v4(),
  experience_id   uuid                not null references public.experiences(id) on delete cascade,
  type            public.memory_type  not null,
  title           text,
  description     text,
  media_url       text,
  unlock_date     timestamptz,
  created_by      uuid                not null references public.users(id),
  created_at      timestamptz         not null default now(),
  updated_at      timestamptz         not null default now(),

  constraint memories_title_length       check (char_length(title) <= 100),
  constraint memories_description_length check (char_length(description) <= 1000)
);

create trigger memories_updated_at
  before update on public.memories
  for each row execute function public.handle_updated_at();

alter table public.memories enable row level security;

create policy "memories_select_member"
  on public.memories for select
  using (
    exists (
      select 1 from public.experiences e
      left join public.experience_members em on em.experience_id = e.id
      where e.id = memories.experience_id
        and (e.owner_id = auth.uid() or em.user_id = auth.uid())
    )
  );

create policy "memories_all_owner"
  on public.memories for all
  using (
    exists (
      select 1 from public.experiences
      where id = memories.experience_id
        and owner_id = auth.uid()
    )
  );


-- ── Table: quizzes ────────────────────────────────────────────────────────────

create table public.quizzes (
  id              uuid        primary key default uuid_generate_v4(),
  experience_id   uuid        not null references public.experiences(id) on delete cascade,
  title           text        not null,
  description     text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create trigger quizzes_updated_at
  before update on public.quizzes
  for each row execute function public.handle_updated_at();

alter table public.quizzes enable row level security;

create policy "quizzes_select_member"
  on public.quizzes for select
  using (
    exists (
      select 1 from public.experiences e
      left join public.experience_members em on em.experience_id = e.id
      where e.id = quizzes.experience_id
        and (e.owner_id = auth.uid() or em.user_id = auth.uid())
    )
  );

create policy "quizzes_all_owner"
  on public.quizzes for all
  using (
    exists (
      select 1 from public.experiences
      where id = quizzes.experience_id
        and owner_id = auth.uid()
    )
  );


-- ── Table: questions ──────────────────────────────────────────────────────────

create table public.questions (
  id          uuid                    primary key default uuid_generate_v4(),
  quiz_id     uuid                    not null references public.quizzes(id) on delete cascade,
  question    text                    not null,
  type        public.question_type    not null default 'text',
  "order"     integer                 not null default 0,

  constraint questions_question_length check (char_length(question) between 1 and 300)
);

alter table public.questions enable row level security;

create policy "questions_select_member"
  on public.questions for select
  using (
    exists (
      select 1 from public.quizzes q
      join public.experiences e on e.id = q.experience_id
      left join public.experience_members em on em.experience_id = e.id
      where q.id = questions.quiz_id
        and (e.owner_id = auth.uid() or em.user_id = auth.uid())
    )
  );

create policy "questions_all_owner"
  on public.questions for all
  using (
    exists (
      select 1 from public.quizzes q
      join public.experiences e on e.id = q.experience_id
      where q.id = questions.quiz_id
        and e.owner_id = auth.uid()
    )
  );


-- ── Table: answers ────────────────────────────────────────────────────────────

create table public.answers (
  id            uuid        primary key default uuid_generate_v4(),
  question_id   uuid        not null references public.questions(id) on delete cascade,
  user_id       uuid        not null references public.users(id) on delete cascade,
  answer        text        not null,
  answered_at   timestamptz not null default now(),

  unique (question_id, user_id),
  constraint answers_answer_length check (char_length(answer) <= 500)
);

alter table public.answers enable row level security;

-- Single SELECT policy: a user can read any answer in an experience they belong to,
-- which already covers reading their own answers. answers_select_own was redundant.
create policy "answers_select_member"
  on public.answers for select
  using (
    exists (
      select 1 from public.questions q
      join public.quizzes qz on qz.id = q.quiz_id
      join public.experiences e on e.id = qz.experience_id
      left join public.experience_members em on em.experience_id = e.id
      where q.id = answers.question_id
        and (e.owner_id = auth.uid() or em.user_id = auth.uid())
    )
  );

create policy "answers_insert_own"
  on public.answers for insert
  with check (auth.uid() = user_id);

create policy "answers_update_own"
  on public.answers for update
  using (auth.uid() = user_id);


-- ── Table: games ──────────────────────────────────────────────────────────────

create table public.games (
  id              uuid                primary key default uuid_generate_v4(),
  experience_id   uuid                not null references public.experiences(id) on delete cascade,
  game_type       public.game_type    not null,
  status          public.game_status  not null default 'not_started',
  score           integer,
  created_at      timestamptz         not null default now(),
  updated_at      timestamptz         not null default now()
);

create trigger games_updated_at
  before update on public.games
  for each row execute function public.handle_updated_at();

alter table public.games enable row level security;

-- Explicit with check mirrors the using clause; FOR ALL requires both to be safe.
create policy "games_all_member"
  on public.games for all
  using (
    exists (
      select 1 from public.experiences e
      left join public.experience_members em on em.experience_id = e.id
      where e.id = games.experience_id
        and (e.owner_id = auth.uid() or em.user_id = auth.uid())
    )
  )
  with check (
    exists (
      select 1 from public.experiences e
      left join public.experience_members em on em.experience_id = e.id
      where e.id = games.experience_id
        and (e.owner_id = auth.uid() or em.user_id = auth.uid())
    )
  );


-- ── Table: drawings ───────────────────────────────────────────────────────────

create table public.drawings (
  id                uuid        primary key default uuid_generate_v4(),
  experience_id     uuid        not null references public.experiences(id) on delete cascade,
  artist_id         uuid        not null references public.users(id),
  cloudinary_url    text        not null,
  note              text,
  wallpaper_enabled boolean     not null default false,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),

  constraint drawings_note_length check (char_length(note) <= 300)
);

create trigger drawings_updated_at
  before update on public.drawings
  for each row execute function public.handle_updated_at();

alter table public.drawings enable row level security;

create policy "drawings_select_member"
  on public.drawings for select
  using (
    exists (
      select 1 from public.experiences e
      left join public.experience_members em on em.experience_id = e.id
      where e.id = drawings.experience_id
        and (e.owner_id = auth.uid() or em.user_id = auth.uid())
    )
  );

create policy "drawings_insert_member"
  on public.drawings for insert
  with check (
    auth.uid() = artist_id
    and exists (
      select 1 from public.experiences e
      left join public.experience_members em on em.experience_id = e.id
      where e.id = drawings.experience_id
        and (e.owner_id = auth.uid() or em.user_id = auth.uid())
    )
  );


-- ── Table: time_capsules ──────────────────────────────────────────────────────

create table public.time_capsules (
  id              uuid                          primary key default uuid_generate_v4(),
  experience_id   uuid                          not null references public.experiences(id) on delete cascade,
  unlock_date     timestamptz                   not null,
  title           text                          not null,
  message         text,
  status          public.time_capsule_status    not null default 'draft',
  created_at      timestamptz                   not null default now(),
  updated_at      timestamptz                   not null default now(),

  constraint time_capsules_title_length   check (char_length(title) between 2 and 100),
  constraint time_capsules_message_length check (char_length(message) <= 2000)
);

create trigger time_capsules_updated_at
  before update on public.time_capsules
  for each row execute function public.handle_updated_at();

alter table public.time_capsules enable row level security;

-- Owners can always see and manage their capsules
create policy "time_capsules_all_owner"
  on public.time_capsules for all
  using (
    exists (
      select 1 from public.experiences
      where id = time_capsules.experience_id
        and owner_id = auth.uid()
    )
  );

-- Members can only read after unlock date has passed
create policy "time_capsules_select_unlocked_member"
  on public.time_capsules for select
  using (
    status = 'unlocked'
    and exists (
      select 1 from public.experience_members
      where experience_id = time_capsules.experience_id
        and user_id = auth.uid()
    )
  );


-- ── Table: notifications ──────────────────────────────────────────────────────

create table public.notifications (
  id        uuid                        primary key default uuid_generate_v4(),
  user_id   uuid                        not null references public.users(id) on delete cascade,
  title     text                        not null,
  message   text                        not null,
  type      public.notification_type    not null default 'system',
  read      boolean                     not null default false,
  sent_at   timestamptz                 not null default now(),

  constraint notifications_title_length   check (char_length(title) <= 100),
  constraint notifications_message_length check (char_length(message) <= 500)
);

alter table public.notifications enable row level security;

create policy "notifications_select_own"
  on public.notifications for select
  using (auth.uid() = user_id);

create policy "notifications_update_own"
  on public.notifications for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
