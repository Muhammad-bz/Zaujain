-- Migration: 0003_functions_shared
-- Description: Shared trigger function for automatic updated_at timestamps
--
-- This function is attached as a BEFORE UPDATE trigger on every table
-- that has an updated_at column. Must be created before any tables
-- that reference it in their trigger definitions.

create or replace function public.handle_updated_at()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
