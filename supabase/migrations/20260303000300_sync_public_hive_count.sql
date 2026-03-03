-- Migration: keep profiles.public_hive_count in sync with hives table

create or replace function public.refresh_profile_public_hive_count(target_profile_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.profiles p
  set public_hive_count = (
        select count(*)::int
        from public.hives h
        where h.owner_id = target_profile_id
      ),
      updated_at = now()
  where p.id = target_profile_id;
end;
$$;

create or replace function public.handle_hives_public_hive_count_sync()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    perform public.refresh_profile_public_hive_count(new.owner_id);
    return new;
  end if;

  if tg_op = 'DELETE' then
    perform public.refresh_profile_public_hive_count(old.owner_id);
    return old;
  end if;

  if tg_op = 'UPDATE' then
    if new.owner_id is distinct from old.owner_id then
      perform public.refresh_profile_public_hive_count(old.owner_id);
      perform public.refresh_profile_public_hive_count(new.owner_id);
    else
      perform public.refresh_profile_public_hive_count(new.owner_id);
    end if;

    return new;
  end if;

  return null;
end;
$$;

drop trigger if exists hives_public_hive_count_sync on public.hives;
create trigger hives_public_hive_count_sync
after insert or update or delete on public.hives
for each row execute function public.handle_hives_public_hive_count_sync();

update public.profiles p
set public_hive_count = counts.hive_count,
    updated_at = now()
from (
  select p2.id as profile_id, count(h.id)::int as hive_count
  from public.profiles p2
  left join public.hives h on h.owner_id = p2.id
  group by p2.id
) as counts
where p.id = counts.profile_id;
