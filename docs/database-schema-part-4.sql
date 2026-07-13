-- ─────────────────────────────────────────────────────────────────────────────
-- Zaujain Database Schema — Part 4 of 7
-- Tables: memories, quizzes, questions
--
-- Run order: Part 1 → 2 → 3 → 4 → 5 → 6 → 7
-- Depends on: Part 1 (enums, handle_updated_at), Part 2 (users),
--             Part 3 (experiences, experience_members)
-- ─────────────────────────────────────────────────────────────────────────────


-- ─────────────────────────────────────────────────────────────────────────────
-- TABLE: memories
-- Individual memory items within an experience.
-- Supports photos, videos, letters, voice notes, drawings, and wallpapers.
-- ─────────────────────────────────────────────────────────────────────────────

create table public.memories (
  id              uuid primary key default uuid_generate_v4(),
  experience_id   uuid not null references public.experiences(id) on delete cascade,
  type            memory_type not null,
  title           text,
  description     text,
  media_url       text,
  unlock_date     timestamptz,
  created_by      uuid not null references public.users(id),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),

  constraint title_length check (char_length(title) <= 100),
  constraint description_length check (char_length(description) <= 1000)
);

create trigger memories_updated_at
  before update on public.memories
  for each row execute function handle_updated_at();

create index idx_memories_experience_id on public.memories(experience_id);
create index idx_memories_type on public.memories(type);
create index idx_memories_unlock_date on public.memories(unlock_date);
create index idx_memories_created_at on public.memories(created_at);

-- RLS
alter table public.memories enable row level security;

create policy "Experience members can view memories"
  on public.memories for select
  using (
    exists (
      select 1 from public.experiences e
      left join public.experience_members em on em.experience_id = e.id
      where e.id = memories.experience_id
        and (e.owner_id = auth.uid() or em.user_id = auth.uid())
    )
  );

create policy "Experience owners can manage memories"
  on public.memories for all
  using (
    exists (
      select 1 from public.experiences
      where id = memories.experience_id
        and owner_id = auth.uid()
    )
  );


-- ─────────────────────────────────────────────────────────────────────────────
-- TABLE: quizzes
-- Quiz definitions within an experience.
-- ─────────────────────────────────────────────────────────────────────────────

create table public.quizzes (
  id              uuid primary key default uuid_generate_v4(),
  experience_id   uuid not null references public.experiences(id) on delete cascade,
  title           text not null,
  description     text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create trigger quizzes_updated_at
  before update on public.quizzes
  for each row execute function handle_updated_at();

create index idx_quizzes_experience_id on public.quizzes(experience_id);

-- RLS
alter table public.quizzes enable row level security;

create policy "Experience members can view quizzes"
  on public.quizzes for select
  using (
    exists (
      select 1 from public.experiences e
      left join public.experience_members em on em.experience_id = e.id
      where e.id = quizzes.experience_id
        and (e.owner_id = auth.uid() or em.user_id = auth.uid())
    )
  );

create policy "Experience owners can manage quizzes"
  on public.quizzes for all
  using (
    exists (
      select 1 from public.experiences
      where id = quizzes.experience_id
        and owner_id = auth.uid()
    )
  );


-- ─────────────────────────────────────────────────────────────────────────────
-- TABLE: questions
-- Individual questions within a quiz.
-- ─────────────────────────────────────────────────────────────────────────────

create table public.questions (
  id          uuid primary key default uuid_generate_v4(),
  quiz_id     uuid not null references public.quizzes(id) on delete cascade,
  question    text not null,
  type        question_type not null default 'text',
  "order"     integer not null default 0,

  constraint question_length check (char_length(question) between 1 and 300)
);

create index idx_questions_quiz_id on public.questions(quiz_id);
create index idx_questions_order on public.questions("order");

-- RLS
alter table public.questions enable row level security;

create policy "Experience members can view questions"
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

create policy "Experience owners can manage questions"
  on public.questions for all
  using (
    exists (
      select 1 from public.quizzes q
      join public.experiences e on e.id = q.experience_id
      where q.id = questions.quiz_id
        and e.owner_id = auth.uid()
    )
  );



