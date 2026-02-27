-- GoldenBee Analytics initial schema
-- This migration is intended for a fresh Supabase project.

-- Ensure pgcrypto is available for UUID generation.
create extension if not exists pgcrypto with schema extensions;

-- =============================
-- Enums
-- =============================
create type public.roles_enum as enum ('user', 'admin');

create type public.queen_mark_color_enum as enum (
  'white',
  'yellow',
  'red',
  'green',
  'blue',
  'unknown'
);

create type public.cups_status_enum as enum ('none', 'present', 'charged');

create type public.queen_cells_status_enum as enum ('none', 'open', 'capped');

create type public.swarming_state_enum as enum ('none', 'suspected', 'swarmed', 'split');

create type public.apiary_event_type_enum as enum ('feeding', 'treatment', 'other');

create type public.frame_fill_level_enum as enum (
  'very_full',
  'full',
  'medium',
  'low',
  'almost_empty'
);

-- =============================
-- Tables
-- =============================
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  about text,
  location_text text,
  contacts text,
  public_hive_count int,
  is_public_profile boolean not null default false,
  show_location boolean not null default false,
  show_hive_count boolean not null default false,
  show_contacts boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.user_roles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  role public.roles_enum not null default 'user',
  created_at timestamptz not null default now()
);

create table public.apiaries (
  id uuid primary key default extensions.gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  location_text text,
  notes text,
  created_at timestamptz not null default now()
);

create table public.hives (
  id uuid primary key default extensions.gen_random_uuid(),
  apiary_id uuid not null references public.apiaries (id) on delete cascade,
  owner_id uuid not null references auth.users (id) on delete cascade,
  code text not null,
  notes text,
  created_at timestamptz not null default now(),
  unique (owner_id, code)
);

-- =============================
-- Auth helper: admin check
-- =============================
create or replace function public.is_admin(uid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles ur
    where ur.user_id = uid
      and ur.role = 'admin'
  );
$$;

-- =============================
-- Trigger: auto profile + role on signup
-- =============================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id)
  values (new.id)
  on conflict (id) do nothing;

  insert into public.user_roles (user_id, role)
  values (new.id, 'user')
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- =============================
-- RLS
-- =============================
alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.apiaries enable row level security;
alter table public.hives enable row level security;

-- profiles policies
create policy "profiles_owner_select"
on public.profiles
for select
using (auth.uid() = id);

create policy "profiles_owner_update"
on public.profiles
for update
using (auth.uid() = id)
with check (auth.uid() = id);

create policy "profiles_owner_insert"
on public.profiles
for insert
with check (auth.uid() = id);

create policy "profiles_public_select"
on public.profiles
for select
using (is_public_profile = true);

-- user_roles policies
create policy "user_roles_owner_select"
on public.user_roles
for select
using (auth.uid() = user_id);

create policy "user_roles_admin_select_all"
on public.user_roles
for select
using (public.is_admin(auth.uid()));

-- apiaries policies
create policy "apiaries_owner_select"
on public.apiaries
for select
using (auth.uid() = owner_id);

create policy "apiaries_owner_insert"
on public.apiaries
for insert
with check (auth.uid() = owner_id);

create policy "apiaries_owner_update"
on public.apiaries
for update
using (auth.uid() = owner_id)
with check (auth.uid() = owner_id);

create policy "apiaries_owner_delete"
on public.apiaries
for delete
using (auth.uid() = owner_id);

-- hives policies
create policy "hives_owner_select"
on public.hives
for select
using (auth.uid() = owner_id);

create policy "hives_owner_insert"
on public.hives
for insert
with check (auth.uid() = owner_id);

create policy "hives_owner_update"
on public.hives
for update
using (auth.uid() = owner_id)
with check (auth.uid() = owner_id);

create policy "hives_owner_delete"
on public.hives
for delete
using (auth.uid() = owner_id);