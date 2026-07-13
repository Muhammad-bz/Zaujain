-- Migration: 0007_tables_social
-- Description: Achievements, streaks, wallpapers, and admin audit log
--
-- Tables: achievements, user_achievements, streaks, wallpapers, admin_logs
--
-- Depends on: users (0004), experiences + experience_members (0005)

-- ── Table: achievements ───────────────────────────────────────────────────────
-- Available achievements. Seeded in migration 0010_seed.
-- Managed by admin via service role; readable by everyone.

create table public.achievements (
  id          uuid  primary key default uuid_generate_v4(),
  title       text  not null unique,
  description text  not null,
  icon        text  not null,
  reward      text
);

alter table public.achievements enable row level security;

create policy "achievements_select_all"
  on public.achievements for select
  using (true);


-- ── Table: user_achievements ──────────────────────────────────────────────────
-- Junction table tracking which achievements a user has unlocked.

create table public.user_achievements (
  id              uuid        primary key default uuid_generate_v4(),
  user_id         uuid        not null references public.users(id) on delete cascade,
  achievement_id  uuid        not null references public.achievements(id),
  unlocked_at     timestamptz not null default now(),

  unique (user_id, achievement_id)
);

alter table public.user_achievements enable row level security;

create policy "user_achievements_select_own"
  on public.user_achievements for select
  using (auth.uid() = user_id);


-- ── Table: streaks ────────────────────────────────────────────────────────────
-- One row per experience. Tracks daily engagement streaks.
-- experience_id has a UNIQUE constraint, which already creates a unique index.
-- No separate index is created in 0008 for this column.

create table public.streaks (
  id              uuid        primary key default uuid_generate_v4(),
  experience_id   uuid        not null unique references public.experiences(id) on delete cascade,
  current_streak  integer     not null default 0,
  longest_streak  integer     not null default 0,
  last_active     timestamptz not null default now()
);

alter table public.streaks enable row level security;

-- Single FOR ALL policy covers SELECT, INSERT, UPDATE, DELETE.
-- The previously present streaks_select_member was fully redundant with this policy.
create policy "streaks_all_member"
  on public.streaks for all
  using (
    exists (
      select 1 from public.experiences e
      left join public.experience_members em on em.experience_id = e.id
      where e.id = streaks.experience_id
        and (e.owner_id = auth.uid() or em.user_id = auth.uid())
    )
  )
  with check (
    exists (
      select 1 from public.experiences e
      left join public.experience_members em on em.experience_id = e.id
      where e.id = streaks.experience_id
        and (e.owner_id = auth.uid() or em.user_id = auth.uid())
    )
  );


-- ── Table: wallpapers ─────────────────────────────────────────────────────────
-- Generated wallpapers from photos, drawings, or quotes.

create table public.wallpapers (
  id              uuid                          primary key default uuid_generate_v4(),
  experience_id   uuid                          not null references public.experiences(id) on delete cascade,
  image_url       text                          not null,
  source_type     public.wallpaper_source_type  not null default 'photo',
  created_at      timestamptz                   not null default now(),
  updated_at      timestamptz                   not null default now()
);

create trigger wallpapers_updated_at
  before update on public.wallpapers
  for each row execute function public.handle_updated_at();

alter table public.wallpapers enable row level security;

create policy "wallpapers_select_member"
  on public.wallpapers for select
  using (
    exists (
      select 1 from public.experiences e
      left join public.experience_members em on em.experience_id = e.id
      where e.id = wallpapers.experience_id
        and (e.owner_id = auth.uid() or em.user_id = auth.uid())
    )
  );

create policy "wallpapers_all_owner"
  on public.wallpapers for all
  using (
    exists (
      select 1 from public.experiences
      where id = wallpapers.experience_id
        and owner_id = auth.uid()
    )
  );


-- ── Table: admin_logs ─────────────────────────────────────────────────────────
-- Immutable audit trail of admin actions.
-- No RLS select/insert policies — accessible only via service role key.

create table public.admin_logs (
  id          uuid        primary key default uuid_generate_v4(),
  admin_id    uuid        not null references public.users(id),
  action      text        not null,
  target      text,
  created_at  timestamptz not null default now()
);

-- RLS is enabled but no policies are created.
-- Only server-side code using the service role key can read or write this table.
alter table public.admin_logs enable row level security;
