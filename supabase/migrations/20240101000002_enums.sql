-- Migration: 0002_enums
-- Description: Create all custom enum types used across the schema
--
-- All enums are defined here in a single migration so tables that
-- depend on them can reference them without ordering concerns.

-- ── Experience ────────────────────────────────────────────────────────────────

create type public.experience_type as enum (
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

create type public.experience_status as enum (
  'draft',
  'published',
  'archived'
);

create type public.experience_member_role as enum (
  'owner',
  'recipient',
  'viewer'
);

-- ── Memory ────────────────────────────────────────────────────────────────────

create type public.memory_type as enum (
  'photo',
  'video',
  'letter',
  'voice_note',
  'drawing',
  'wallpaper'
);

-- ── Activation Keys ───────────────────────────────────────────────────────────

create type public.activation_key_status as enum (
  'active',
  'redeemed',
  'expired',
  'revoked'
);

create type public.product_type as enum (
  'digital_gift',
  'time_capsule'
);

-- ── Games ─────────────────────────────────────────────────────────────────────

create type public.game_type as enum (
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

create type public.game_status as enum (
  'not_started',
  'in_progress',
  'completed'
);

-- ── Quizzes ───────────────────────────────────────────────────────────────────

create type public.question_type as enum (
  'text',
  'choice',
  'scale',
  'boolean'
);

-- ── Notifications ─────────────────────────────────────────────────────────────

create type public.notification_type as enum (
  'gift_opened',
  'new_memory',
  'time_capsule_unlock',
  'anniversary_reminder',
  'daily_streak',
  'achievement_unlocked',
  'system'
);

-- ── Time Capsules ─────────────────────────────────────────────────────────────

create type public.time_capsule_status as enum (
  'locked',
  'unlocked',
  'draft'
);

-- ── Wallpapers ────────────────────────────────────────────────────────────────

create type public.wallpaper_source_type as enum (
  'photo',
  'drawing',
  'quote',
  'memory'
);
