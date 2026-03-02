-- Migration: admin moderation RPC for unpublishing profiles
-- Uses security definer to provide stable admin moderation behavior.

create or replace function public.admin_unpublish_profile(target_profile_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  if not public.is_admin(auth.uid()) then
    raise exception 'Forbidden';
  end if;

  update public.profiles
  set is_public_profile = false,
      updated_at = now()
  where id = target_profile_id
    and is_public_profile = true;

  return found;
end;
$$;

revoke all on function public.admin_unpublish_profile(uuid) from public;
grant execute on function public.admin_unpublish_profile(uuid) to authenticated;
