-- Migration: 0004_tables_core
-- Description: Create users and themes tables
--
-- These two tables have no foreign key dependencies on other
-- application tables (users references only auth.users).
-- All other tables depend on one or both of these.

-- ── Table: users ──────────────────────────────────────────────────────────────
-- Extends Supabase auth.users with public profile data.
-- Populated automatically via the handle_new_user trigger (migration 0007).

create table public.users (
  id          uuid        primary key references auth.users(id) on delete cascade,
  name        text        not null,
  username    text        unique,
  email       text        not null unique,
  avatar_url  text,
  bio         text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),

  constraint users_username_length check (char_length(username) between 3 and 30),
  constraint users_username_format check (username ~ '^[a-z0-9_]+$'),
  constraint users_bio_length      check (char_length(bio) <= 200)
);

create trigger users_updated_at
  before update on public.users
  for each row execute function public.handle_updated_at();

alter table public.users enable row level security;

create policy "users_select_own"
  on public.users for select
  using (auth.uid() = id);

create policy "users_update_own"
  on public.users for update
  using (auth.uid() = id);


-- ── Table: themes ─────────────────────────────────────────────────────────────
-- Available visual themes. Seeded in migration 0009_seed.
-- Managed by admin via service role; readable by everyone.

create table public.themes (
  id                  uuid    primary key default uuid_generate_v4(),
  name                text    not null unique,
  category            text    not null default 'general',
  preview_image       text,
  configuration_json  jsonb   not null default '{}',
  premium             boolean not null default false,
  active              boolean not null default true,
  created_at          timestamptz not null default now()
);

alter table public.themes enable row level security;

create policy "themes_select_active"
  on public.themes for select
  using (active = true);
