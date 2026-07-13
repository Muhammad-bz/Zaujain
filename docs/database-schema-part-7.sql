-- ─────────────────────────────────────────────────────────────────────────────
-- Zaujain Database Schema — Part 7 of 7
-- Tables: streaks, wallpapers, admin_logs
-- Functions: redeem_activation_key, get_experience_by_slug
--
-- Run order: Part 1 → 2 → 3 → 4 → 5 → 6 → 7
-- Depends on: All previous parts
-- ─────────────────────────────────────────────────────────────────────────────


-- ─────────────────────────────────────────────────────────────────────────────
-- TABLE: streaks
-- Tracks daily engagement streaks per experience.
-- One row per experience; updated whenever a member visits.
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
-- Generated wallpapers from photos, drawings, or quotes.
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
-- Immutable audit trail of admin actions.
-- No RLS policies — only accessible via the service role key.
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

alter table public.admin_logs enable row level security;
-- No public policies — only the service role key can read or write this table.


-- ─────────────────────────────────────────────────────────────────────────────
-- FUNCTION: redeem_activation_key
-- Atomically validates and redeems an activation key.
-- Uses FOR UPDATE to prevent race conditions on concurrent redemptions.
-- Called server-side only — never from the client directly.
-- ─────────────────────────────────────────────────────────────────────────────

create or replace function redeem_activation_key(
  p_key     text,
  p_user_id uuid
)
returns jsonb as $$
declare
  v_key_record public.activation_keys%rowtype;
begin
  -- Lock the row to prevent concurrent redemptions of the same key
  select * into v_key_record
  from public.activation_keys
  where key = upper(trim(p_key))
  for update;

  if not found then
    return jsonb_build_object('success', false, 'error', 'Invalid activation key. Please check and try again.');
  end if;

  if v_key_record.status != 'active' then
    if v_key_record.status = 'redeemed' then
      return jsonb_build_object('success', false, 'error', 'This key has already been used.');
    elsif v_key_record.status = 'expired' then
      return jsonb_build_object('success', false, 'error', 'This key has expired.');
    else
      return jsonb_build_object('success', false, 'error', 'This key is no longer valid.');
    end if;
  end if;

  -- Check expiry date independently of status
  if v_key_record.expires_at is not null and v_key_record.expires_at < now() then
    update public.activation_keys set status = 'expired' where id = v_key_record.id;
    return jsonb_build_object('success', false, 'error', 'This key has expired.');
  end if;

  update public.activation_keys
  set
    status      = 'redeemed',
    redeemed_by = p_user_id,
    redeemed_at = now()
  where id = v_key_record.id;

  return jsonb_build_object(
    'success',      true,
    'key_id',       v_key_record.id,
    'product_type', v_key_record.product_type
  );
end;
$$ language plpgsql security definer;


-- ─────────────────────────────────────────────────────────────────────────────
-- FUNCTION: get_experience_by_slug
-- Looks up an experience by slug and enforces access control.
-- Returns the experience ID on success so the caller can fetch full
-- data via RLS-protected queries.
-- ─────────────────────────────────────────────────────────────────────────────

create or replace function get_experience_by_slug(p_slug text)
returns jsonb as $$
declare
  v_experience public.experiences%rowtype;
  v_user_id    uuid;
begin
  v_user_id := auth.uid();

  select * into v_experience
  from public.experiences
  where slug = p_slug;

  if not found then
    return jsonb_build_object('success', false, 'error', 'Experience not found.');
  end if;

  -- Private experiences require authentication and membership
  if v_experience.is_private then
    if v_user_id is null then
      return jsonb_build_object('success', false, 'error', 'Please sign in to view this gift.');
    end if;

    if v_experience.owner_id != v_user_id then
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
