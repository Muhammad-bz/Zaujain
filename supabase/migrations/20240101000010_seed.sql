-- Migration: 0010_seed
-- Description: Seed initial data for themes and achievements
--
-- Seed data lives in a migration (not a separate seed file) so that
-- `supabase db push` and `supabase migration up` both apply it automatically.
-- This ensures staging and production always have the same baseline data.
--
-- Safe to re-run: INSERT ... ON CONFLICT DO NOTHING prevents duplicates.

-- ── Themes ────────────────────────────────────────────────────────────────────

insert into public.themes (name, category, configuration_json, premium, active)
values
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
  ('Christmas',      'festive',   '{"motionPreset": "playful"}',  false, true)
on conflict (name) do nothing;


-- ── Achievements ──────────────────────────────────────────────────────────────

insert into public.achievements (title, description, icon, reward)
values
  ('First Gift',           'Created your first Zaujain gift',             '🎁', null),
  ('Memory Keeper',        'Added 10 memories to your gift',              '📸', null),
  ('Game Night',           'Played your first couple game',               '🎮', null),
  ('Artist',               'Created your first Love Canvas drawing',      '🎨', null),
  ('Time Traveler',        'Created a Time Capsule',                      '⏳', null),
  ('Streak Starter',       'Visited your gift 7 days in a row',           '🔥', null),
  ('Memory Master',        'Added 50 memories across all experiences',    '⭐', null),
  ('Perfect Match',        'Got 100% on a couple quiz',                   '💯', null),
  ('Conversation Starter', 'Completed all 10 games in an experience',     '💬', null)
on conflict (title) do nothing;
