-- ─────────────────────────────────────────────────────────────────────────────
-- Zaujain Database Schema — Part 5 of 7
-- Tables: answers, games, drawings
--
-- Run order: Part 1 → 2 → 3 → 4 → 5 → 6 → 7
-- Depends on: Part 1 (enums, handle_updated_at), Part 2 (users),
--             Part 3 (experiences, experience_members),
--             Part 4 (questions, quizzes)
-- ─────────────────────────────────────────────────────────────────────────────


-- ─────────────────────────────────────────────────────────────────────────────
-- TABLE: answers
-- A user's answer to a specific quiz question.
-- Each user can answer each question exactly once.
-- ─────────────────────────────────────────────────────────────────────────────

create table public.answers (
  id            uuid primary key default uuid_generate_v4(),
  question_id   uuid not null references public.questions(id) on delete cascade,
  user_id       uuid not null references public.users(id) on delete cascade,
  answer        text not null,
  answered_at   timestamptz not null default now(),

  unique (question_id, user_id),

  constraint answer_length check (char_length(answer) <= 500)
);

create index idx_answers_question_id on public.answers(question_id);
create index idx_answers_user_id on public.answers(user_id);

-- RLS
alter table public.answers enable row level security;

create policy "Users can view their own answers"
  on public.answers for select
  using (auth.uid() = user_id);

create policy "Experience members can view all answers in their experience"
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

create policy "Users can insert their own answers"
  on public.answers for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own answers"
  on public.answers for update
  using (auth.uid() = user_id);


-- ─────────────────────────────────────────────────────────────────────────────
-- TABLE: games
-- A game session within an experience.
-- ─────────────────────────────────────────────────────────────────────────────

create table public.games (
  id              uuid primary key default uuid_generate_v4(),
  experience_id   uuid not null references public.experiences(id) on delete cascade,
  game_type       game_type not null,
  status          game_status not null default 'not_started',
  score           integer,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create trigger games_updated_at
  before update on public.games
  for each row execute function handle_updated_at();

create index idx_games_experience_id on public.games(experience_id);
create index idx_games_type on public.games(game_type);

alter table public.games enable row level security;

create policy "Experience members can view and play games"
  on public.games for all
  using (
    exists (
      select 1 from public.experiences e
      left join public.experience_members em on em.experience_id = e.id
      where e.id = games.experience_id
        and (e.owner_id = auth.uid() or em.user_id = auth.uid())
    )
  );


-- ─────────────────────────────────────────────────────────────────────────────
-- TABLE: drawings
-- Love Canvas drawings delivered inside animated envelopes.
-- ─────────────────────────────────────────────────────────────────────────────

create table public.drawings (
  id                uuid primary key default uuid_generate_v4(),
  experience_id     uuid not null references public.experiences(id) on delete cascade,
  artist_id         uuid not null references public.users(id),
  cloudinary_url    text not null,
  note              text,
  wallpaper_enabled boolean not null default false,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),

  constraint note_length check (char_length(note) <= 300)
);

create trigger drawings_updated_at
  before update on public.drawings
  for each row execute function handle_updated_at();

create index idx_drawings_experience_id on public.drawings(experience_id);
create index idx_drawings_artist_id on public.drawings(artist_id);

alter table public.drawings enable row level security;

create policy "Experience members can view drawings"
  on public.drawings for select
  using (
    exists (
      select 1 from public.experiences e
      left join public.experience_members em on em.experience_id = e.id
      where e.id = drawings.experience_id
        and (e.owner_id = auth.uid() or em.user_id = auth.uid())
    )
  );

create policy "Experience members can create drawings"
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
