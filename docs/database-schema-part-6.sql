-- ─────────────────────────────────────────────────────────────────────────────
-- Zaujain Database Schema — Part 6 of 7
-- Tables: time_capsules, notifications, achievements, user_achievements
--
-- Run order: Part 1 → 2 → 3 → 4 → 5 → 6 → 7
-- Depends on: Part 1 (enums), Part 2 (users),
--             Part 3 (experiences, experience_members)
-- ─────────────────────────────────────────────────────────────────────────────


-- ─────────────────────────────────────────────────────────────────────────────
-- TABLE: time_capsules
-- Locked capsules with a future unlock date.
-- Recipients cannot see contents until the unlock date passes.
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

-- Owners can always see and manage their capsules
create policy "Owners can manage their capsules"
  on public.time_capsules for all
  using (
    exists (
      select 1 from public.experiences
      where id = time_capsules.experience_id
        and owner_id = auth.uid()
    )
  );

-- Members can only see unlocked capsules
create policy "Members can view unlocked capsules"
  on public.time_capsules for select
  using (
    status = 'unlocked'
    and exists (
      select 1 from public.experience_members
      where experience_id = time_capsules.experience_id
        and user_id = auth.uid()
    )
  );


-- ─────────────────────────────────────────────────────────────────────────────
-- TABLE: notifications
-- In-app notifications sent to individual users.
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
-- Available achievements, seeded with the 9 built-in ones.
-- Managed by admin; readable by everyone.
-- ─────────────────────────────────────────────────────────────────────────────

create table public.achievements (
  id            uuid primary key default uuid_generate_v4(),
  title         text not null unique,
  description   text not null,
  icon          text not null,
  reward        text
);

insert into public.achievements (title, description, icon, reward) values
  ('First Gift',           'Created your first Zaujain gift',             '🎁', null),
  ('Memory Keeper',        'Added 10 memories to your gift',              '📸', null),
  ('Game Night',           'Played your first couple game',               '🎮', null),
  ('Artist',               'Created your first Love Canvas drawing',      '🎨', null),
  ('Time Traveler',        'Created a Time Capsule',                      '⏳', null),
  ('Streak Starter',       'Visited your gift 7 days in a row',           '🔥', null),
  ('Memory Master',        'Added 50 memories across all experiences',    '⭐', null),
  ('Perfect Match',        'Got 100% on a couple quiz',                   '💯', null),
  ('Conversation Starter', 'Completed all 10 games in an experience',     '💬', null);

alter table public.achievements enable row level security;

create policy "Anyone can view achievements"
  on public.achievements for select
  using (true);


-- ─────────────────────────────────────────────────────────────────────────────
-- TABLE: user_achievements
-- Tracks which achievements each user has unlocked.
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
