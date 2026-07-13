-- ─────────────────────────────────────────────────────────────────────────────
-- Zaujain Database Schema — Part 2 of 6
-- Tables: users, themes
--
-- Run order: Part 1 → 2 → 3 → 4 → 5 → 6
-- Depends on: Part 1 (handle_updated_at function)
-- ─────────────────────────────────────────────────────────────────────────────


-- ─────────────────────────────────────────────────────────────────────────────
-- TABLE: users
-- Extends Supabase auth.users with profile data.
-- A row is created automatically via trigger on every new signup.
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

  constraint username_length check (char_length(username) between 3 and 30),
  constraint username_format check (username ~ '^[a-z0-9_]+$'),
  constraint bio_length check (char_length(bio) <= 200)
);

create trigger users_updated_at
  before update on public.users
  for each row execute function handle_updated_at();

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

-- Auto-create a profile row whenever a new auth user signs up
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
-- Available visual themes, seeded with the 12 built-in themes.
-- Managed by admin; readable by everyone.
-- ─────────────────────────────────────────────────────────────────────────────

create table public.themes (
  id                  uuid primary key default uuid_generate_v4(),
  name                text not null unique,
  category            text not null default 'general',
  preview_image       text,
  configuration_json  jsonb not null default '{}',
  premium             boolean not null default false,
  active              boolean not null default true,
  created_at          timestamptz not null default now()
);

-- Seed the 12 built-in themes
insert into public.themes (name, category, configuration_json, premium, active) values
  ('Default',        'general',   '{"motionPreset": "elegant"}',  false, true),
  ('Sakura',         'romantic',  '{"motionPreset": "gentle"}',   false, true),
  ('Galaxy',         'dreamy',    '{"motionPreset": "dramatic"}', false, true),
  ('Korean Journal', 'cozy',      '{"motionPreset": "gentle"}',   false, true),
  ('Luxury Paper',   'premium',   '{"motionPreset": "elegant"}',  false, true),
  ('Glass',          'modern',    '{"motionPreset": "elegant"}',  false, true),
  ('Minimal',        'clean',     '{"motionPreset": "gentle"}',   false, true),
  ('AMOLED',         'dark',      '{"motionPreset": "elegant"}',  false, true),
  ('Valentine''s',   'romantic',  '{"motionPreset": "playful"}',  false, true),
  ('Ramadan',        'spiritual', '{"motionPreset": "elegant"}',  false, true),
  ('Eid',            'festive',   '{"motionPreset": "playful"}',  false, true),
  ('Christmas',      'festive',   '{"motionPreset": "playful"}',  false, true);

-- RLS: active themes are public
alter table public.themes enable row level security;

create policy "Anyone can view active themes"
  on public.themes for select
  using (active = true);
