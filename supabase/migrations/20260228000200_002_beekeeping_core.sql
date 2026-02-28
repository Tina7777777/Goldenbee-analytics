-- Migration 002: Core beekeeping tables
-- This migration creates inspections, supers, super_snapshots,
-- harvests, harvest_items, and apiary_events.

-- =============================
-- Tables
-- =============================

create table public.inspections (
  id uuid primary key default extensions.gen_random_uuid(),
  hive_id uuid not null references public.hives (id) on delete cascade,
  owner_id uuid not null references auth.users (id) on delete cascade,
  inspected_at timestamptz not null default now(),
  brood_frames int,
  honey_pollen_frames int,
  foundation_frames int,
  total_frames int,
  eggs_present boolean,
  queen_seen boolean,
  queen_marked boolean,
  queen_mark_color public.queen_mark_color_enum default 'unknown',
  cups_status public.cups_status_enum default 'none',
  queen_cells_status public.queen_cells_status_enum default 'none',
  queen_cells_day text,
  swarming_state public.swarming_state_enum default 'none',
  notes text,
  important boolean not null default false
);

create table public.supers (
  id uuid primary key default extensions.gen_random_uuid(),
  hive_id uuid not null references public.hives (id) on delete cascade,
  owner_id uuid not null references auth.users (id) on delete cascade,
  position int not null,
  installed_at timestamptz not null default now(),
  removed_at timestamptz,
  notes text,
  constraint supers_position_check check (position between 1 and 5)
);

create table public.super_snapshots (
  id uuid primary key default extensions.gen_random_uuid(),
  super_id uuid not null references public.supers (id) on delete cascade,
  owner_id uuid not null references auth.users (id) on delete cascade,
  snapshot_at timestamptz not null default now(),
  honey_fullness numeric(5,2),
  notes text,
  constraint super_snapshots_honey_fullness_check check (
    honey_fullness is null or (honey_fullness >= 0 and honey_fullness <= 200)
  )
);

create table public.harvests (
  id uuid primary key default extensions.gen_random_uuid(),
  hive_id uuid not null references public.hives (id) on delete cascade,
  owner_id uuid not null references auth.users (id) on delete cascade,
  harvested_at timestamptz not null default now(),
  notes text,
  actual_kg_total numeric(10,2)
);

create table public.harvest_items (
  id uuid primary key default extensions.gen_random_uuid(),
  harvest_id uuid not null references public.harvests (id) on delete cascade,
  super_id uuid references public.supers (id) on delete set null,
  owner_id uuid not null references auth.users (id) on delete cascade,
  frames_count int not null,
  fill_level public.frame_fill_level_enum not null,
  estimated_kg numeric(10,2),
  notes text,
  constraint harvest_items_frames_count_check check (frames_count > 0)
);

create table public.apiary_events (
  id uuid primary key default extensions.gen_random_uuid(),
  apiary_id uuid not null references public.apiaries (id) on delete cascade,
  owner_id uuid not null references auth.users (id) on delete cascade,
  event_type public.apiary_event_type_enum not null,
  occurred_at timestamptz not null default now(),
  hive_range_from text,
  hive_range_to text,
  product text,
  dosage_or_amount text,
  notes text
);

-- =============================
-- Indexes
-- =============================

create index inspections_hive_id_inspected_at_idx
  on public.inspections (hive_id, inspected_at desc);

create index super_snapshots_super_id_snapshot_at_idx
  on public.super_snapshots (super_id, snapshot_at desc);

create index harvests_hive_id_harvested_at_idx
  on public.harvests (hive_id, harvested_at desc);

create index apiary_events_apiary_id_occurred_at_idx
  on public.apiary_events (apiary_id, occurred_at desc);

-- =============================
-- RLS
-- =============================

alter table public.inspections enable row level security;
alter table public.supers enable row level security;
alter table public.super_snapshots enable row level security;
alter table public.harvests enable row level security;
alter table public.harvest_items enable row level security;
alter table public.apiary_events enable row level security;

create policy "inspections_owner_crud"
on public.inspections
for all
to authenticated
using (auth.uid() = owner_id)
with check (auth.uid() = owner_id);

create policy "supers_owner_crud"
on public.supers
for all
to authenticated
using (auth.uid() = owner_id)
with check (auth.uid() = owner_id);

create policy "super_snapshots_owner_crud"
on public.super_snapshots
for all
to authenticated
using (auth.uid() = owner_id)
with check (auth.uid() = owner_id);

create policy "harvests_owner_crud"
on public.harvests
for all
to authenticated
using (auth.uid() = owner_id)
with check (auth.uid() = owner_id);

create policy "harvest_items_owner_crud"
on public.harvest_items
for all
to authenticated
using (auth.uid() = owner_id)
with check (auth.uid() = owner_id);

create policy "apiary_events_owner_crud"
on public.apiary_events
for all
to authenticated
using (auth.uid() = owner_id)
with check (auth.uid() = owner_id);