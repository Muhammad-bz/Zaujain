-- ─────────────────────────────────────────────────────────────────────────────
-- Zaujain Database Schema
-- Version: 1.0
--
-- Run this in your Supabase SQL editor to set up the complete schema.
-- Tables are created in dependency order (no forward references).
-- Row Level Security (RLS) is enabled on all user-owned tables.
-- ─────────────────────────────────────────────────────────────────────────────

-- Enable required extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";


-- ─────────────────────────────────────────────────────────────────────────────
-- ENUMS
-- ─────────────────────────────────────────────────────────────────────────────

create type experience_type as enum (
  'digital_gift',
  'time_capsule',
  'proposal',
  'anniversary',
  'birthday',
  'friendship',
  'graduation',
  'wedding',
  'ramadan',
  'eid',
  'christmas'
);

create type experience_status as enum (
  'draft',
  'published',
  'archived'
);

create type experience_member_role as enum (
  'owner',
  'recipient',
  'viewer'
);

create type memory_type as enum (
  'photo',
  'video',
  'letter',
  'voice_note',
  'drawing',
  'wallpaper'
);

create type activation_key_status as enum (
  'active',
  'redeemed',
  'expired',
  'revoked'
);

create type product_type as enum (
  'digital_gift',
  'time_capsule'
);

create type game_type as enum (
  'couple_quiz',
  'guess_my_answer',
  'this_or_that',
  'would_you_rather',
  'never_have_i_ever',
  'whos_more_likely',
  'love_bingo',
  'memory_challenge',
  'relationship_boundaries',
  'spin_the_wheel',
  'moon_match'
);

create type game_status as enum (
  'not_started',
  'in_progress',
  'completed'
);

create type question_type as enum (
  'text',
  'choice',
  'scale',
  'boolean'
);

create type notification_type as enum (
  'gift_opened',
  'new_memory',
  'time_capsule_unlock',
  'anniversary_reminder',
  'daily_streak',
  'achievement_unlocked',
  'system'
);

create type time_capsule_status as enum (
  'locked',
  'unlocked',
  'draft'
);

create type wallpaper_source_type as enum (
  'photo',
  'drawing',
  'quote',
  'memory'
);


-- ─────────────────────────────────────────────────────────────────────────────
-- HELPER FUNCTION: updated_at trigger
-- ─────────────────────────────────────────────────────────────────────────────

create or replace function handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;


-- ─────────────────────────────────────────────────────────────────────────────
-- TABLE: users
-- Extends Supabase auth.users with profile data
-- ─────────────────────────────────────────────────────────────────────────────

create table public.users (
  id          uuid primary key references auth.users(id) on delete cascade,
  name        text not null,
  username    text unique,
  email       text not null unique,
  avatar_url  text,
  bio         text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),

  -- Constraints
  constraint username_length check (char_length(username) between 3 and 30),
  constraint username_format check (username ~ '^[a-z0-9_]+$'),
  constraint bio_length check (char_length(bio) <= 200)
);

create trigger users_updated_at
  before update on public.users
  for each row execute function handle_updated_at();

-- Index for username lookups
create index idx_users_username on public.users(username);
create index idx_users_email on public.users(email);

-- RLS
alter table public.users enable row level security;

create policy "Users can view their own profile"
  on public.users for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.users for update
  using (auth.uid() = id);

-- Trigger to create user profile on signup
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.email
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();


-- ─────────────────────────────────────────────────────────────────────────────
-- TABLE: themes
-- Available visual themes (managed by admin)
-- ─────────────────────────────────────────────────────────────────────────────

create table public.themes (
  id                    uuid primary key default uuid_generate_v4(),
  name                  text not null unique,
  category              text not null default 'general',
  preview_image         text,
  configuration_json    jsonb not null default '{}',
  premium               boolean not null default false,
  active                boolean not null default true,
  created_at            timestamptz not null default now()
);

-- Seed default themes
insert into public.themes (name, category, configuration_json, premium, active) values
  ('Default',        'general',  '{"motionPreset": "elegant"}',  false, true),
  ('Sakura',         'romantic', '{"motionPreset": "gentle"}',   false, true),
  ('Galaxy',         'dreamy',   '{"motionPreset": "dramatic"}', false, true),
  ('Korean Journal', 'cozy',     '{"motionPreset": "gentle"}',   false, true),
  ('Luxury Paper',   'premium',  '{"motionPreset": "elegant"}',  false, true),
  ('Glass',          'modern',   '{"motionPreset": "elegant"}',  false, true),
  ('Minimal',        'clean',    '{"motionPreset": "gentle"}',   false, true),
  ('AMOLED',         'dark',     '{"motionPreset": "elegant"}',  false, true),
  ('Valentine''s',   'romantic', '{"motionPreset": "playful"}',  false, true),
  ('Ramadan',        'spiritual','{"motionPreset": "elegant"}',  false, true),
  ('Eid',            'festive',  '{"motionPreset": "playful"}',  false, true),
  ('Christmas',      'festive',  '{"motionPreset": "playful"}',  false, true);

-- Everyone can read active themes
alter table public.themes enable row level security;

create policy "Anyone can view active themes"
  on public.themes for select
  using (active = true);


-- ─────────────────────────────────────────────────────────────────────────────
-- TABLE: activation_keys
-- Keys purchased by customers to activate experiences
-- ─────────────────────────────────────────────────────────────────────────────

create table public.activation_keys (
  id            uuid primary key default uuid_generate_v4(),
  key           text not null unique,
  status        activation_key_status not null default 'active',
  product_type  product_type not null default 'digital_gift',
  created_by    uuid not null references public.users(id),
  redeemed_by   uuid references public.users(id),
  redeemed_at   timestamptz,
  expires_at    timestamptz,
  created_at    timestamptz not null default now(),

  -- A key can only be redeemed once
  constraint redeemed_consistency check (
    (redeemed_by is null and redeemed_at is null) or
    (redeemed_by is not null and redeemed_at is not null)
  )
);

create index idx_activation_keys_key on public.activation_keys(key);
create index idx_activation_keys_status on public.activation_keys(status);
create index idx_activation_keys_redeemed_by on public.activation_keys(redeemed_by);

-- RLS: Users can only see keys they redeemed
alter table public.activation_keys enable row level security;

create policy "Users can view their own redeemed keys"
  on public.activation_keys for select
  using (auth.uid() = redeemed_by);

create policy "Users can redeem active keys"
  on public.activation_keys for update
  using (status = 'active')
  with check (auth.uid() = redeemed_by);


-- ─────────────────────────────────────────────────────────────────────────────
-- TABLE: experiences
-- The core experience entity (gift, time capsule, etc.)
-- ─────────────────────────────────────────────────────────────────────────────

create table public.experiences (
  id                  uuid primary key default uuid_generate_v4(),
  activation_key_id   uuid not null references public.activation_keys(id),
  owner_id            uuid not null references public.users(id) on delete cascade,
  experience_type     experience_type not null default 'digital_gift',
  title               text not null,
  slug                text not null unique,
  theme_id            uuid references public.themes(id),
  cover_image         text,
  background_music    text,
  welcome_message     text,
  is_private          boolean not null default true,
  status              experience_status not null default 'draft',
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),

  -- Constraints
  constraint title_length check (char_length(title) between 2 and 80),
  constraint slug_length check (char_length(slug) between 3 and 60),
  constraint slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint welcome_message_length check (char_length(welcome_message) <= 500)
);

create trigger experiences_updated_at
  before update on public.experiences
  for each row execute function handle_updated_at();

create index idx_experiences_owner_id on public.experiences(owner_id);
create index idx_experiences_slug on public.experiences(slug);
create index idx_experiences_status on public.experiences(status);
create index idx_experiences_type on public.experiences(experience_type);

-- RLS
alter table public.experiences enable row level security;

create policy "Owners can manage their experiences"
  on public.experiences for all
  using (auth.uid() = owner_id);

create policy "Members can view shared experiences"
  on public.experiences for select
  using (
    exists (
      select 1 from public.experience_members
      where experience_id = experiences.id
      and user_id = auth.uid()
    )
  );

create policy "Anyone can view published public experiences by slug"
  on public.experiences for select
  using (status = 'published' and is_private = false);


-- ─────────────────────────────────────────────────────────────────────────────
-- TABLE: experience_members
-- Controls who can access a given experience
-- ─────────────────────────────────────────────────────────────────────────────

create table public.experience_members (
  id              uuid primary key default uuid_generate_v4(),
  experience_id   uuid not null references public.experiences(id) on delete cascade,
  user_id         uuid not null references public.users(id) on delete cascade,
  role            experience_member_role not null default 'recipient',
  joined_at       timestamptz not null default now(),

  -- Each user can only be a member once per experience
  unique (experience_id, user_id)
);

create index idx_experience_members_experience_id on public.experience_members(experience_id);
create index idx_experience_members_user_id on public.experience_members(user_id);

-- RLS
alter table public.experience_members enable row level security;

create policy "Owners can manage members"
  on public.experience_members for all
  using (
    exists (
      select 1 from public.experiences
      where id = experience_id
      and owner_id = auth.uid()
    )
  );

create policy "Members can view their own membership"
  on public.experience_members for select
  using (auth.uid() = user_id);


-- ─────────────────────────────────────────────────────────────────────────────
-- TABLE: memories
-- Individual memory items within an experience
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
-- Quiz definitions within an experience
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
-- Questions within a quiz
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


-- ─────────────────────────────────────────────────────────────────────────────
-- TABLE: answers
-- User answers to quiz questions
-- ─────────────────────────────────────────────────────────────────────────────

create table public.answers (
  id            uuid primary key default uuid_generate_v4(),
  question_id   uuid not null references public.questions(id) on delete cascade,
  user_id       uuid not null references public.users(id) on delete cascade,
  answer        text not null,
  answered_at   timestamptz not null default now(),

  -- Each user can only answer each question once
  unique (question_id, user_id),

  constraint answer_length check (char_length(answer) <= 500)
);

create index idx_answers_question_id on public.answers(question_id);
create index idx_answers_user_id on public.answers(user_id);

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
-- Game sessions within an experience
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
-- Love Canvas drawings
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
    auth.uid() = artist_id and
    exists (
      select 1 from public.experiences e
      left join public.experience_members em on em.experience_id = e.id
      where e.id = drawings.experience_id
      and (e.owner_id = auth.uid() or em.user_id = auth.uid())
    )
  );


-- ─────────────────────────────────────────────────────────────────────────────
-- TABLE: time_capsules
-- Locked capsules with a future unlock date
-- ─────────────────────────────────────────────────────────────────────────────

create table public.time_capsules (
  id              uuid primary key default uuid_generate_v4(),
  experience_id   uuid not null references public.experiences(id) on delete cascade,
  unlock_date     timestamptz not null,
  title           text not null,
  message         text,
  status          time_capsule_status not null default 'draft',
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),

  constraint title_length check (char_length(title) between 2 and 100),
  constraint message_length check (char_length(message) <= 2000)
);

create trigger time_capsules_updated_at
  before update on public.time_capsules
  for each row execute function handle_updated_at();

create index idx_time_capsules_experience_id on public.time_capsules(experience_id);
create index idx_time_capsules_unlock_date on public.time_capsules(unlock_date);
create index idx_time_capsules_status on public.time_capsules(status);

alter table public.time_capsules enable row level security;

create policy "Experience members can view unlocked capsules"
  on public.time_capsules for select
  using (
    exists (
      select 1 from public.experiences e
      left join public.experience_members em on em.experience_id = e.id
      where e.id = time_capsules.experience_id
      and (e.owner_id = auth.uid() or em.user_id = auth.uid())
    )
    and (status = 'unlocked' or
      exists (
        select 1 from public.experiences
        where id = time_capsules.experience_id
        and owner_id = auth.uid()
      )
    )
  );

create policy "Owners can manage their capsules"
  on public.time_capsules for all
  using (
    exists (
      select 1 from public.experiences
      where id = time_capsules.experience_id
      and owner_id = auth.uid()
    )
  );


-- ─────────────────────────────────────────────────────────────────────────────
-- TABLE: notifications
-- In-app notifications for users
-- ─────────────────────────────────────────────────────────────────────────────

create table public.notifications (
  id        uuid primary key default uuid_generate_v4(),
  user_id   uuid not null references public.users(id) on delete cascade,
  title     text not null,
  message   text not null,
  type      notification_type not null default 'system',
  read      boolean not null default false,
  sent_at   timestamptz not null default now(),

  constraint title_length check (char_length(title) <= 100),
  constraint message_length check (char_length(message) <= 500)
);

create index idx_notifications_user_id on public.notifications(user_id);
create index idx_notifications_read on public.notifications(read);
create index idx_notifications_sent_at on public.notifications(sent_at desc);

alter table public.notifications enable row level security;

create policy "Users can view their own notifications"
  on public.notifications for select
  using (auth.uid() = user_id);

create policy "Users can mark their notifications as read"
  on public.notifications for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);


-- ─────────────────────────────────────────────────────────────────────────────
-- TABLE: achievements
-- Available achievements (managed by admin)
-- ─────────────────────────────────────────────────────────────────────────────

create table public.achievements (
  id            uuid primary key default uuid_generate_v4(),
  title         text not null unique,
  description   text not null,
  icon          text not null,
  reward        text
);

-- Seed initial achievements
insert into public.achievements (title, description, icon, reward) values
  ('First Gift',       'Created your first Zaujain gift',             '🎁', null),
  ('Memory Keeper',    'Added 10 memories to your gift',              '📸', null),
  ('Game Night',       'Played your first couple game',               '🎮', null),
  ('Artist',           'Created your first Love Canvas drawing',      '🎨', null),
  ('Time Traveler',    'Created a Time Capsule',                      '⏳', null),
  ('Streak Starter',   'Visited your gift 7 days in a row',           '🔥', null),
  ('Memory Master',    'Added 50 memories across all experiences',    '⭐', null),
  ('Perfect Match',    'Got 100% on a couple quiz',                   '💯', null),
  ('Conversation Starter', 'Completed all 10 games in an experience', '💬', null);

alter table public.achievements enable row level security;

create policy "Anyone can view achievements"
  on public.achievements for select
  using (true);


-- ─────────────────────────────────────────────────────────────────────────────
-- TABLE: user_achievements
-- Tracks which achievements each user has unlocked
-- ─────────────────────────────────────────────────────────────────────────────

create table public.user_achievements (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid not null references public.users(id) on delete cascade,
  achievement_id  uuid not null references public.achievements(id),
  unlocked_at     timestamptz not null default now(),

  unique (user_id, achievement_id)
);

create index idx_user_achievements_user_id on public.user_achievements(user_id);

alter table public.user_achievements enable row level security;

create policy "Users can view their own achievements"
  on public.user_achievements for select
  using (auth.uid() = user_id);


-- ─────────────────────────────────────────────────────────────────────────────
-- TABLE: streaks
-- Tracks daily engagement streaks per experience
-- ─────────────────────────────────────────────────────────────────────────────

create table public.streaks (
  id              uuid primary key default uuid_generate_v4(),
  experience_id   uuid not null references public.experiences(id) on delete cascade unique,
  current_streak  integer not null default 0,
  longest_streak  integer not null default 0,
  last_active     timestamptz not null default now()
);

create index idx_streaks_experience_id on public.streaks(experience_id);

alter table public.streaks enable row level security;

create policy "Experience members can view streaks"
  on public.streaks for select
  using (
    exists (
      select 1 from public.experiences e
      left join public.experience_members em on em.experience_id = e.id
      where e.id = streaks.experience_id
      and (e.owner_id = auth.uid() or em.user_id = auth.uid())
    )
  );

create policy "Experience members can update streaks"
  on public.streaks for all
  using (
    exists (
      select 1 from public.experiences e
      left join public.experience_members em on em.experience_id = e.id
      where e.id = streaks.experience_id
      and (e.owner_id = auth.uid() or em.user_id = auth.uid())
    )
  );


-- ─────────────────────────────────────────────────────────────────────────────
-- TABLE: wallpapers
-- Generated wallpapers from photos, drawings, or quotes
-- ─────────────────────────────────────────────────────────────────────────────

create table public.wallpapers (
  id              uuid primary key default uuid_generate_v4(),
  experience_id   uuid not null references public.experiences(id) on delete cascade,
  image_url       text not null,
  source_type     wallpaper_source_type not null default 'photo',
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create trigger wallpapers_updated_at
  before update on public.wallpapers
  for each row execute function handle_updated_at();

create index idx_wallpapers_experience_id on public.wallpapers(experience_id);

alter table public.wallpapers enable row level security;

create policy "Experience members can view wallpapers"
  on public.wallpapers for select
  using (
    exists (
      select 1 from public.experiences e
      left join public.experience_members em on em.experience_id = e.id
      where e.id = wallpapers.experience_id
      and (e.owner_id = auth.uid() or em.user_id = auth.uid())
    )
  );

create policy "Experience owners can manage wallpapers"
  on public.wallpapers for all
  using (
    exists (
      select 1 from public.experiences
      where id = wallpapers.experience_id
      and owner_id = auth.uid()
    )
  );


-- ─────────────────────────────────────────────────────────────────────────────
-- TABLE: admin_logs
-- Immutable audit trail of admin actions
-- ─────────────────────────────────────────────────────────────────────────────

create table public.admin_logs (
  id          uuid primary key default uuid_generate_v4(),
  admin_id    uuid not null references public.users(id),
  action      text not null,
  target      text,
  created_at  timestamptz not null default now()
);

create index idx_admin_logs_admin_id on public.admin_logs(admin_id);
create index idx_admin_logs_created_at on public.admin_logs(created_at desc);

-- Admin logs are NOT exposed via RLS — access only via service role
alter table public.admin_logs enable row level security;

-- No public policies — only the service role key (server-side admin code) can access


-- ─────────────────────────────────────────────────────────────────────────────
-- FUNCTION: Redeem an activation key
-- Called server-side when a user redeems their key
-- ─────────────────────────────────────────────────────────────────────────────

create or replace function redeem_activation_key(
  p_key text,
  p_user_id uuid
)
returns jsonb as $$
declare
  v_key_record public.activation_keys%rowtype;
begin
  -- Lock the row to prevent race conditions
  select * into v_key_record
  from public.activation_keys
  where key = upper(trim(p_key))
  for update;

  -- Validate key exists
  if not found then
    return jsonb_build_object('success', false, 'error', 'Invalid activation key. Please check and try again.');
  end if;

  -- Validate key is active
  if v_key_record.status != 'active' then
    if v_key_record.status = 'redeemed' then
      return jsonb_build_object('success', false, 'error', 'This key has already been used.');
    elsif v_key_record.status = 'expired' then
      return jsonb_build_object('success', false, 'error', 'This key has expired.');
    else
      return jsonb_build_object('success', false, 'error', 'This key is no longer valid.');
    end if;
  end if;

  -- Check expiry
  if v_key_record.expires_at is not null and v_key_record.expires_at < now() then
    update public.activation_keys set status = 'expired' where id = v_key_record.id;
    return jsonb_build_object('success', false, 'error', 'This key has expired.');
  end if;

  -- Redeem the key
  update public.activation_keys
  set
    status = 'redeemed',
    redeemed_by = p_user_id,
    redeemed_at = now()
  where id = v_key_record.id;

  return jsonb_build_object(
    'success', true,
    'key_id', v_key_record.id,
    'product_type', v_key_record.product_type
  );
end;
$$ language plpgsql security definer;


-- ─────────────────────────────────────────────────────────────────────────────
-- FUNCTION: Get experience by slug (with access check)
-- ─────────────────────────────────────────────────────────────────────────────

create or replace function get_experience_by_slug(p_slug text)
returns jsonb as $$
declare
  v_experience public.experiences%rowtype;
  v_user_id uuid;
begin
  v_user_id := auth.uid();

  select * into v_experience
  from public.experiences
  where slug = p_slug;

  if not found then
    return jsonb_build_object('success', false, 'error', 'Experience not found.');
  end if;

  -- Check access
  if v_experience.is_private then
    if v_user_id is null then
      return jsonb_build_object('success', false, 'error', 'Please sign in to view this gift.');
    end if;

    if v_experience.owner_id != v_user_id then
      -- Check membership
      if not exists (
        select 1 from public.experience_members
        where experience_id = v_experience.id
        and user_id = v_user_id
      ) then
        return jsonb_build_object('success', false, 'error', 'You do not have access to this gift.');
      end if;
    end if;
  end if;

  return jsonb_build_object('success', true, 'experience_id', v_experience.id);
end;
$$ language plpgsql security definer;
