-- ─────────────────────────────────────────────────────────────────────────────
-- Zaujain Database Schema — Part 1 of 6
-- Extensions, Enums, and Shared Functions
--
-- Run order: Part 1 → 2 → 3 → 4 → 5 → 6
-- This part must be run first. All other parts depend on these enums.
-- ─────────────────────────────────────────────────────────────────────────────


-- ─────────────────────────────────────────────────────────────────────────────
-- EXTENSIONS
-- ─────────────────────────────────────────────────────────────────────────────

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
-- SHARED FUNCTION: updated_at trigger
-- Used by every table that has an updated_at column.
-- ─────────────────────────────────────────────────────────────────────────────

create or replace function handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;
