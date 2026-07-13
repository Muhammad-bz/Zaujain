-- Migration: 0008_indexes
-- Description: Performance indexes across all tables
--
-- Grouped here (after all tables exist) so indexes can be
-- reviewed, tuned, and added to without touching table definitions.
-- All indexes use the prefix idx_<table>_<column(s)>.

-- ── users ─────────────────────────────────────────────────────────────────────
create index idx_users_username  on public.users(username);
create index idx_users_email     on public.users(email);

-- ── activation_keys ───────────────────────────────────────────────────────────
create index idx_activation_keys_key          on public.activation_keys(key);
create index idx_activation_keys_status       on public.activation_keys(status);
create index idx_activation_keys_redeemed_by  on public.activation_keys(redeemed_by);

-- ── experiences ───────────────────────────────────────────────────────────────
create index idx_experiences_owner_id  on public.experiences(owner_id);
create index idx_experiences_slug      on public.experiences(slug);
create index idx_experiences_status    on public.experiences(status);
create index idx_experiences_type      on public.experiences(experience_type);

-- ── experience_members ────────────────────────────────────────────────────────
create index idx_experience_members_experience_id  on public.experience_members(experience_id);
create index idx_experience_members_user_id        on public.experience_members(user_id);

-- ── memories ──────────────────────────────────────────────────────────────────
create index idx_memories_experience_id  on public.memories(experience_id);
create index idx_memories_type           on public.memories(type);
create index idx_memories_unlock_date    on public.memories(unlock_date);
create index idx_memories_created_at     on public.memories(created_at);

-- ── quizzes ───────────────────────────────────────────────────────────────────
create index idx_quizzes_experience_id  on public.quizzes(experience_id);

-- ── questions ─────────────────────────────────────────────────────────────────
create index idx_questions_quiz_id  on public.questions(quiz_id);
create index idx_questions_order    on public.questions("order");

-- ── answers ───────────────────────────────────────────────────────────────────
create index idx_answers_question_id  on public.answers(question_id);
create index idx_answers_user_id      on public.answers(user_id);

-- ── games ─────────────────────────────────────────────────────────────────────
create index idx_games_experience_id  on public.games(experience_id);
create index idx_games_type           on public.games(game_type);

-- ── drawings ──────────────────────────────────────────────────────────────────
create index idx_drawings_experience_id  on public.drawings(experience_id);
create index idx_drawings_artist_id      on public.drawings(artist_id);

-- ── time_capsules ─────────────────────────────────────────────────────────────
create index idx_time_capsules_experience_id  on public.time_capsules(experience_id);
create index idx_time_capsules_unlock_date    on public.time_capsules(unlock_date);
create index idx_time_capsules_status         on public.time_capsules(status);

-- ── notifications ─────────────────────────────────────────────────────────────
create index idx_notifications_user_id   on public.notifications(user_id);
create index idx_notifications_read      on public.notifications(read);
create index idx_notifications_sent_at   on public.notifications(sent_at desc);

-- ── user_achievements ─────────────────────────────────────────────────────────
create index idx_user_achievements_user_id  on public.user_achievements(user_id);

-- ── streaks ───────────────────────────────────────────────────────────────────
create index idx_streaks_experience_id  on public.streaks(experience_id);

-- ── wallpapers ────────────────────────────────────────────────────────────────
create index idx_wallpapers_experience_id  on public.wallpapers(experience_id);

-- ── admin_logs ────────────────────────────────────────────────────────────────
create index idx_admin_logs_admin_id    on public.admin_logs(admin_id);
create index idx_admin_logs_created_at  on public.admin_logs(created_at desc);
