alter table public.harvests
  add column if not exists calibration_estimated_kg numeric(10,2);
