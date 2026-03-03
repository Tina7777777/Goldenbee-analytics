-- Migration: profile photos table + Supabase Storage policies

create table if not exists public.photos (
  id uuid primary key default extensions.gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  bucket_id text not null default 'profile-photos',
  object_path text not null,
  mime_type text,
  size_bytes bigint,
  created_at timestamptz not null default now()
);

create index if not exists photos_owner_created_at_idx
  on public.photos (owner_id, created_at desc);

create index if not exists photos_profile_created_at_idx
  on public.photos (profile_id, created_at desc);

alter table public.photos enable row level security;

drop policy if exists "photos_owner_crud" on public.photos;
create policy "photos_owner_crud"
on public.photos
for all
to authenticated
using (auth.uid() = owner_id)
with check (auth.uid() = owner_id);

insert into storage.buckets (id, name, public)
values ('profile-photos', 'profile-photos', false)
on conflict (id) do nothing;

drop policy if exists "profile_photos_owner_select" on storage.objects;
create policy "profile_photos_owner_select"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'profile-photos'
  and auth.uid() is not null
  and owner = auth.uid()
);

drop policy if exists "profile_photos_owner_insert" on storage.objects;
create policy "profile_photos_owner_insert"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'profile-photos'
  and auth.uid() is not null
  and owner = auth.uid()
);

drop policy if exists "profile_photos_owner_update" on storage.objects;
create policy "profile_photos_owner_update"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'profile-photos'
  and auth.uid() is not null
  and owner = auth.uid()
)
with check (
  bucket_id = 'profile-photos'
  and auth.uid() is not null
  and owner = auth.uid()
);

drop policy if exists "profile_photos_owner_delete" on storage.objects;
create policy "profile_photos_owner_delete"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'profile-photos'
  and auth.uid() is not null
  and owner = auth.uid()
);
