-- Migration: allow public read access to profile photos only for public profiles

drop policy if exists "photos_public_select_for_public_profiles" on public.photos;
create policy "photos_public_select_for_public_profiles"
on public.photos
for select
to public
using (
  exists (
    select 1
    from public.profiles p
    where p.id = photos.profile_id
      and p.is_public_profile = true
  )
);

drop policy if exists "profile_photos_public_select_for_public_profiles" on storage.objects;
create policy "profile_photos_public_select_for_public_profiles"
on storage.objects
for select
to public
using (
  bucket_id = 'profile-photos'
  and exists (
    select 1
    from public.photos ph
    join public.profiles p on p.id = ph.profile_id
    where ph.bucket_id = storage.objects.bucket_id
      and ph.object_path = storage.objects.name
      and p.is_public_profile = true
  )
);
