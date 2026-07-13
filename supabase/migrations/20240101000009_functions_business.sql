-- Migration: 0009_functions_business
-- Description: Business logic functions and their associated triggers
--
-- Functions defined here:
--   handle_new_user()           → auto-creates public.users row on auth signup
--   redeem_activation_key()     → atomically validates and redeems a key
--   get_experience_by_slug()    → looks up an experience with access control
--
-- All tables these functions reference must already exist (migrations 0004–0007).

-- ── Function + Trigger: handle_new_user ───────────────────────────────────────
-- Fires after every insert into auth.users.
-- Creates a matching row in public.users with the user's name and email.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.email
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- ── Function: redeem_activation_key ───────────────────────────────────────────
-- Atomically validates and redeems an activation key.
-- Uses FOR UPDATE to prevent concurrent redemptions of the same key.
-- Called server-side only via a Supabase RPC — never directly from the client.
--
-- Returns jsonb:
--   { success: true,  key_id: uuid, product_type: text }
--   { success: false, error: text }

create or replace function public.redeem_activation_key(
  p_key     text,
  p_user_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_key_record public.activation_keys%rowtype;
begin
  -- Lock the row to prevent concurrent redemptions of the same key
  select * into v_key_record
  from public.activation_keys
  where key = upper(trim(p_key))
  for update;

  if not found then
    return jsonb_build_object(
      'success', false,
      'error',   'Invalid activation key. Please check and try again.'
    );
  end if;

  -- Check status
  if v_key_record.status != 'active' then
    return jsonb_build_object(
      'success', false,
      'error', case v_key_record.status
        when 'redeemed' then 'This key has already been used.'
        when 'expired'  then 'This key has expired.'
        else                 'This key is no longer valid.'
      end
    );
  end if;

  -- Check expiry date (catches keys that expired but weren't marked yet)
  if v_key_record.expires_at is not null and v_key_record.expires_at < now() then
    update public.activation_keys
    set status = 'expired'
    where id = v_key_record.id;

    return jsonb_build_object('success', false, 'error', 'This key has expired.');
  end if;

  -- Redeem
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
$$;


-- ── Function: get_experience_by_slug ──────────────────────────────────────────
-- Resolves a slug to an experience ID, enforcing access control.
-- Private experiences require authentication and membership.
-- Returns the experience ID so the caller can load full data via RLS.
--
-- Returns jsonb:
--   { success: true,  experience_id: uuid }
--   { success: false, error: text }

create or replace function public.get_experience_by_slug(p_slug text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
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

  -- Private experiences: require sign-in and membership
  if v_experience.is_private then
    if v_user_id is null then
      return jsonb_build_object(
        'success', false,
        'error',   'Please sign in to view this gift.'
      );
    end if;

    if v_experience.owner_id != v_user_id then
      if not exists (
        select 1 from public.experience_members
        where experience_id = v_experience.id
          and user_id = v_user_id
      ) then
        return jsonb_build_object(
          'success', false,
          'error',   'You do not have access to this gift.'
        );
      end if;
    end if;
  end if;

  return jsonb_build_object('success', true, 'experience_id', v_experience.id);
end;
$$;
