-- GoldenBee Analytics seed data
-- Creates 5 beekeeper users (role=user), each with apiaries, hives, inspections, supers and harvests.
-- Default password for all seeded users: 123!abc

begin;

with seed_users as (
  select *
  from (
    values
      ('11111111-1111-4111-8111-111111111111'::uuid, 'beekeeper1@goldenbee.local', 'Иван Петров', 'Семеен пчелар от 8 години.', 'София', '+359 88 111 1111', true, true, true, true),
      ('22222222-2222-4222-8222-222222222222'::uuid, 'beekeeper2@goldenbee.local', 'Мария Георгиева', 'Подвижно пчеларство и липов мед.', 'Пловдив', '+359 88 222 2222', true, true, true, true),
      ('33333333-3333-4333-8333-333333333333'::uuid, 'beekeeper3@goldenbee.local', 'Николай Димов', 'Био подход и пролетни отводки.', 'Стара Загора', '+359 88 333 3333', true, true, true, false),
      ('44444444-4444-4444-8444-444444444444'::uuid, 'beekeeper4@goldenbee.local', 'Елена Тодорова', 'Пчелини в планински район.', 'Велико Търново', '+359 88 444 4444', true, true, false, true),
      ('55555555-5555-4555-8555-555555555555'::uuid, 'beekeeper5@goldenbee.local', 'Георги Стоянов', 'Малък личен пчелин.', 'Бургас', '+359 88 555 5555', false, true, true, true)
  ) as t(user_id, email, display_name, about, location_text, contacts, is_public_profile, show_location, show_hive_count, show_contacts)
),
password_hash as (
  select extensions.crypt('123!abc', extensions.gen_salt('bf', 10)) as encrypted_password
)
insert into auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  confirmation_token,
  recovery_token,
  email_change_token_new,
  email_change,
  email_change_token_current,
  reauthentication_token,
  phone_change,
  phone_change_token,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  is_sso_user,
  is_anonymous
)
select
  '00000000-0000-0000-0000-000000000000'::uuid,
  su.user_id,
  'authenticated',
  'authenticated',
  su.email,
  ph.encrypted_password,
  now(),
  '',
  '',
  '',
  '',
  '',
  '',
  '',
  '',
  '{"provider":"email","providers":["email"]}'::jsonb,
  jsonb_build_object('display_name', su.display_name),
  now(),
  now(),
  false,
  false
from seed_users su
cross join password_hash ph
on conflict (id) do update
set
  email = excluded.email,
  encrypted_password = excluded.encrypted_password,
  email_confirmed_at = excluded.email_confirmed_at,
  confirmation_token = excluded.confirmation_token,
  recovery_token = excluded.recovery_token,
  email_change_token_new = excluded.email_change_token_new,
  email_change = excluded.email_change,
  email_change_token_current = excluded.email_change_token_current,
  reauthentication_token = excluded.reauthentication_token,
  phone_change = excluded.phone_change,
  phone_change_token = excluded.phone_change_token,
  raw_app_meta_data = excluded.raw_app_meta_data,
  raw_user_meta_data = excluded.raw_user_meta_data,
  updated_at = now();

with seed_users as (
  select *
  from (
    values
      ('11111111-1111-4111-8111-111111111111'::uuid, 'beekeeper1@goldenbee.local', 'Иван Петров'),
      ('22222222-2222-4222-8222-222222222222'::uuid, 'beekeeper2@goldenbee.local', 'Мария Георгиева'),
      ('33333333-3333-4333-8333-333333333333'::uuid, 'beekeeper3@goldenbee.local', 'Николай Димов'),
      ('44444444-4444-4444-8444-444444444444'::uuid, 'beekeeper4@goldenbee.local', 'Елена Тодорова'),
      ('55555555-5555-4555-8555-555555555555'::uuid, 'beekeeper5@goldenbee.local', 'Георги Стоянов')
  ) as t(user_id, email, display_name)
)
insert into auth.identities (
  id,
  user_id,
  provider_id,
  provider,
  identity_data,
  last_sign_in_at,
  created_at,
  updated_at
)
select
  extensions.gen_random_uuid(),
  su.user_id,
  su.user_id::text,
  'email',
  jsonb_build_object(
    'sub', su.user_id::text,
    'email', su.email,
    'email_verified', true,
    'phone_verified', false
  ),
  now(),
  now(),
  now()
from seed_users su
on conflict (provider_id, provider) do update
set
  user_id = excluded.user_id,
  identity_data = excluded.identity_data,
  updated_at = now();

with seed_users as (
  select *
  from (
    values
      ('11111111-1111-4111-8111-111111111111'::uuid, 'Иван Петров', 'Семеен пчелар от 8 години.', 'София', '+359 88 111 1111', true, true, true, true),
      ('22222222-2222-4222-8222-222222222222'::uuid, 'Мария Георгиева', 'Подвижно пчеларство и липов мед.', 'Пловдив', '+359 88 222 2222', true, true, true, true),
      ('33333333-3333-4333-8333-333333333333'::uuid, 'Николай Димов', 'Био подход и пролетни отводки.', 'Стара Загора', '+359 88 333 3333', true, true, true, false),
      ('44444444-4444-4444-8444-444444444444'::uuid, 'Елена Тодорова', 'Пчелини в планински район.', 'Велико Търново', '+359 88 444 4444', true, true, false, true),
      ('55555555-5555-4555-8555-555555555555'::uuid, 'Георги Стоянов', 'Малък личен пчелин.', 'Бургас', '+359 88 555 5555', false, true, true, true)
  ) as t(user_id, display_name, about, location_text, contacts, is_public_profile, show_location, show_hive_count, show_contacts)
)
update public.profiles p
set
  display_name = su.display_name,
  about = su.about,
  location_text = su.location_text,
  contacts = su.contacts,
  is_public_profile = su.is_public_profile,
  show_location = su.show_location,
  show_hive_count = su.show_hive_count,
  show_contacts = su.show_contacts,
  updated_at = now()
from seed_users su
where p.id = su.user_id;

with seed_users as (
  select *
  from (
    values
      ('11111111-1111-4111-8111-111111111111'::uuid),
      ('22222222-2222-4222-8222-222222222222'::uuid),
      ('33333333-3333-4333-8333-333333333333'::uuid),
      ('44444444-4444-4444-8444-444444444444'::uuid),
      ('55555555-5555-4555-8555-555555555555'::uuid)
  ) as t(user_id)
)
insert into public.user_roles (user_id, role)
select su.user_id, 'user'::public.roles_enum
from seed_users su
on conflict (user_id) do update
set role = excluded.role;

-- Reset seeded domain data only for these users.
delete from public.apiaries
where owner_id in (
  '11111111-1111-4111-8111-111111111111'::uuid,
  '22222222-2222-4222-8222-222222222222'::uuid,
  '33333333-3333-4333-8333-333333333333'::uuid,
  '44444444-4444-4444-8444-444444444444'::uuid,
  '55555555-5555-4555-8555-555555555555'::uuid
);

insert into public.apiaries (id, owner_id, name, location_text, notes, created_at)
values
  ('a1111111-1111-4111-8111-111111111101'::uuid, '11111111-1111-4111-8111-111111111111'::uuid, 'София-Изток', 'Панчарево', 'Близо до акациев пояс.', now() - interval '120 days'),
  ('a1111111-1111-4111-8111-111111111102'::uuid, '11111111-1111-4111-8111-111111111111'::uuid, 'Искър', 'Долни Пасарел', 'Липа и билки.', now() - interval '95 days'),
  ('a2222222-2222-4222-8222-222222222101'::uuid, '22222222-2222-4222-8222-222222222222'::uuid, 'Тракия', 'Пловдив', 'Стационарен пчелин.', now() - interval '110 days'),
  ('a2222222-2222-4222-8222-222222222102'::uuid, '22222222-2222-4222-8222-222222222222'::uuid, 'Родопи', 'Брестовица', 'Подвижни семейства.', now() - interval '80 days'),
  ('a3333333-3333-4333-8333-333333333101'::uuid, '33333333-3333-4333-8333-333333333333'::uuid, 'Загоре', 'Стара Загора', 'Работа с биологични практики.', now() - interval '90 days'),
  ('a4444444-4444-4444-8444-444444444101'::uuid, '44444444-4444-4444-8444-444444444444'::uuid, 'Балкан-1', 'Дряново', 'Планинска паша.', now() - interval '150 days'),
  ('a4444444-4444-4444-8444-444444444102'::uuid, '44444444-4444-4444-8444-444444444444'::uuid, 'Балкан-2', 'Елена', 'Късна паша.', now() - interval '70 days'),
  ('a5555555-5555-4555-8555-555555555101'::uuid, '55555555-5555-4555-8555-555555555555'::uuid, 'Черноморски', 'Каблешково', 'Малък семеен пчелин.', now() - interval '65 days');

insert into public.hives (id, apiary_id, owner_id, code, notes, created_at)
values
  ('b1111111-1111-4111-8111-111111111201'::uuid, 'a1111111-1111-4111-8111-111111111101'::uuid, '11111111-1111-4111-8111-111111111111'::uuid, 'BG-SF-001', 'Силно семейство.', now() - interval '110 days'),
  ('b1111111-1111-4111-8111-111111111202'::uuid, 'a1111111-1111-4111-8111-111111111101'::uuid, '11111111-1111-4111-8111-111111111111'::uuid, 'BG-SF-002', 'Наблюдение за рояване.', now() - interval '105 days'),
  ('b1111111-1111-4111-8111-111111111203'::uuid, 'a1111111-1111-4111-8111-111111111102'::uuid, '11111111-1111-4111-8111-111111111111'::uuid, 'BG-SF-003', 'Нова майка 2025.', now() - interval '90 days'),

  ('b2222222-2222-4222-8222-222222222201'::uuid, 'a2222222-2222-4222-8222-222222222101'::uuid, '22222222-2222-4222-8222-222222222222'::uuid, 'BG-PL-001', 'Подхранван през февруари.', now() - interval '100 days'),
  ('b2222222-2222-4222-8222-222222222202'::uuid, 'a2222222-2222-4222-8222-222222222101'::uuid, '22222222-2222-4222-8222-222222222222'::uuid, 'BG-PL-002', 'Спокойно семейство.', now() - interval '96 days'),
  ('b2222222-2222-4222-8222-222222222203'::uuid, 'a2222222-2222-4222-8222-222222222102'::uuid, '22222222-2222-4222-8222-222222222222'::uuid, 'BG-PL-003', 'Отводка от юни.', now() - interval '74 days'),

  ('b3333333-3333-4333-8333-333333333201'::uuid, 'a3333333-3333-4333-8333-333333333101'::uuid, '33333333-3333-4333-8333-333333333333'::uuid, 'BG-SZ-001', 'Проверка на яйца.', now() - interval '84 days'),
  ('b3333333-3333-4333-8333-333333333202'::uuid, 'a3333333-3333-4333-8333-333333333101'::uuid, '33333333-3333-4333-8333-333333333333'::uuid, 'BG-SZ-002', 'Слаба майка.', now() - interval '83 days'),

  ('b4444444-4444-4444-8444-444444444201'::uuid, 'a4444444-4444-4444-8444-444444444101'::uuid, '44444444-4444-4444-8444-444444444444'::uuid, 'BG-VT-001', 'Планински мед.', now() - interval '140 days'),
  ('b4444444-4444-4444-8444-444444444202'::uuid, 'a4444444-4444-4444-8444-444444444101'::uuid, '44444444-4444-4444-8444-444444444444'::uuid, 'BG-VT-002', 'Добавена рамка.', now() - interval '132 days'),
  ('b4444444-4444-4444-8444-444444444203'::uuid, 'a4444444-4444-4444-8444-444444444102'::uuid, '44444444-4444-4444-8444-444444444444'::uuid, 'BG-VT-003', 'Проверка за влага.', now() - interval '60 days'),

  ('b5555555-5555-4555-8555-555555555201'::uuid, 'a5555555-5555-4555-8555-555555555101'::uuid, '55555555-5555-4555-8555-555555555555'::uuid, 'BG-BS-001', 'Нов кошер.', now() - interval '62 days'),
  ('b5555555-5555-4555-8555-555555555202'::uuid, 'a5555555-5555-4555-8555-555555555101'::uuid, '55555555-5555-4555-8555-555555555555'::uuid, 'BG-BS-002', 'Стабилно семейство.', now() - interval '59 days');

insert into public.inspections (
  hive_id,
  owner_id,
  inspected_at,
  brood_frames,
  honey_pollen_frames,
  total_frames,
  eggs_present,
  queen_seen,
  swarming_state,
  notes,
  important
)
values
  ('b1111111-1111-4111-8111-111111111201'::uuid, '11111111-1111-4111-8111-111111111111'::uuid, now() - interval '12 days', 5, 3, 10, true, true, 'none', 'Добро развитие.', false),
  ('b1111111-1111-4111-8111-111111111202'::uuid, '11111111-1111-4111-8111-111111111111'::uuid, now() - interval '9 days', 4, 4, 10, true, false, 'suspected', 'Наблюдение за роеви чашки.', true),
  ('b1111111-1111-4111-8111-111111111203'::uuid, '11111111-1111-4111-8111-111111111111'::uuid, now() - interval '7 days', 6, 2, 10, true, true, 'none', 'Майка маркирана.', false),

  ('b2222222-2222-4222-8222-222222222201'::uuid, '22222222-2222-4222-8222-222222222222'::uuid, now() - interval '11 days', 5, 3, 10, true, true, 'none', 'Нормално състояние.', false),
  ('b2222222-2222-4222-8222-222222222202'::uuid, '22222222-2222-4222-8222-222222222222'::uuid, now() - interval '8 days', 3, 4, 10, true, false, 'suspected', 'Липсва прясно яйценосене.', true),
  ('b2222222-2222-4222-8222-222222222203'::uuid, '22222222-2222-4222-8222-222222222222'::uuid, now() - interval '6 days', 4, 3, 10, true, true, 'none', 'Семейството се стабилизира.', false),

  ('b3333333-3333-4333-8333-333333333201'::uuid, '33333333-3333-4333-8333-333333333333'::uuid, now() - interval '10 days', 5, 2, 10, true, true, 'none', 'Силен старт.', false),
  ('b3333333-3333-4333-8333-333333333202'::uuid, '33333333-3333-4333-8333-333333333333'::uuid, now() - interval '5 days', 2, 5, 10, false, false, 'split', 'Подготовка за обединяване.', true),

  ('b4444444-4444-4444-8444-444444444201'::uuid, '44444444-4444-4444-8444-444444444444'::uuid, now() - interval '14 days', 6, 3, 11, true, true, 'none', 'Много добро състояние.', false),
  ('b4444444-4444-4444-8444-444444444202'::uuid, '44444444-4444-4444-8444-444444444444'::uuid, now() - interval '9 days', 4, 3, 10, true, true, 'none', 'Без забележки.', false),
  ('b4444444-4444-4444-8444-444444444203'::uuid, '44444444-4444-4444-8444-444444444444'::uuid, now() - interval '4 days', 3, 4, 10, true, true, 'suspected', 'Нужна е ранна проверка.', true),

  ('b5555555-5555-4555-8555-555555555201'::uuid, '55555555-5555-4555-8555-555555555555'::uuid, now() - interval '7 days', 4, 3, 10, true, true, 'none', 'Добро развитие.', false),
  ('b5555555-5555-4555-8555-555555555202'::uuid, '55555555-5555-4555-8555-555555555555'::uuid, now() - interval '3 days', 3, 4, 10, true, true, 'none', 'Наблюдение след подхранване.', false);

insert into public.supers (id, hive_id, owner_id, position, installed_at, notes)
values
  ('c1111111-1111-4111-8111-111111111301'::uuid, 'b1111111-1111-4111-8111-111111111201'::uuid, '11111111-1111-4111-8111-111111111111'::uuid, 1, now() - interval '30 days', 'Първи магазин.'),
  ('c1111111-1111-4111-8111-111111111302'::uuid, 'b1111111-1111-4111-8111-111111111202'::uuid, '11111111-1111-4111-8111-111111111111'::uuid, 1, now() - interval '26 days', 'След ранна акация.'),
  ('c2222222-2222-4222-8222-222222222301'::uuid, 'b2222222-2222-4222-8222-222222222201'::uuid, '22222222-2222-4222-8222-222222222222'::uuid, 1, now() - interval '28 days', 'Първи магазин.'),
  ('c2222222-2222-4222-8222-222222222302'::uuid, 'b2222222-2222-4222-8222-222222222203'::uuid, '22222222-2222-4222-8222-222222222222'::uuid, 1, now() - interval '18 days', 'Липа.'),
  ('c3333333-3333-4333-8333-333333333301'::uuid, 'b3333333-3333-4333-8333-333333333201'::uuid, '33333333-3333-4333-8333-333333333333'::uuid, 1, now() - interval '22 days', 'Сезонен магазин.'),
  ('c4444444-4444-4444-8444-444444444301'::uuid, 'b4444444-4444-4444-8444-444444444201'::uuid, '44444444-4444-4444-8444-444444444444'::uuid, 1, now() - interval '35 days', 'Планинска паша.'),
  ('c4444444-4444-4444-8444-444444444302'::uuid, 'b4444444-4444-4444-8444-444444444202'::uuid, '44444444-4444-4444-8444-444444444444'::uuid, 1, now() - interval '20 days', 'Втори поток.'),
  ('c5555555-5555-4555-8555-555555555301'::uuid, 'b5555555-5555-4555-8555-555555555201'::uuid, '55555555-5555-4555-8555-555555555555'::uuid, 1, now() - interval '16 days', 'Черноморска паша.');

insert into public.super_snapshots (super_id, owner_id, snapshot_at, honey_fullness, notes)
values
  ('c1111111-1111-4111-8111-111111111301'::uuid, '11111111-1111-4111-8111-111111111111'::uuid, now() - interval '10 days', 68, 'Добро запълване.'),
  ('c1111111-1111-4111-8111-111111111302'::uuid, '11111111-1111-4111-8111-111111111111'::uuid, now() - interval '8 days', 54, 'Нужда от още време.'),
  ('c2222222-2222-4222-8222-222222222301'::uuid, '22222222-2222-4222-8222-222222222222'::uuid, now() - interval '9 days', 72, 'Много добър вход.'),
  ('c2222222-2222-4222-8222-222222222302'::uuid, '22222222-2222-4222-8222-222222222222'::uuid, now() - interval '6 days', 49, 'Средно запълване.'),
  ('c3333333-3333-4333-8333-333333333301'::uuid, '33333333-3333-4333-8333-333333333333'::uuid, now() - interval '7 days', 58, 'Стабилен растеж.'),
  ('c4444444-4444-4444-8444-444444444301'::uuid, '44444444-4444-4444-8444-444444444444'::uuid, now() - interval '11 days', 81, 'Отлично запечатване.'),
  ('c4444444-4444-4444-8444-444444444302'::uuid, '44444444-4444-4444-8444-444444444444'::uuid, now() - interval '5 days', 63, 'Добра динамика.'),
  ('c5555555-5555-4555-8555-555555555301'::uuid, '55555555-5555-4555-8555-555555555555'::uuid, now() - interval '4 days', 44, 'Начално натрупване.');

insert into public.harvests (id, hive_id, owner_id, harvested_at, notes, actual_kg_total)
values
  ('d1111111-1111-4111-8111-111111111401'::uuid, 'b1111111-1111-4111-8111-111111111201'::uuid, '11111111-1111-4111-8111-111111111111'::uuid, now() - interval '2 days', 'Летен добив.', 14.2),
  ('d1111111-1111-4111-8111-111111111402'::uuid, 'b1111111-1111-4111-8111-111111111203'::uuid, '11111111-1111-4111-8111-111111111111'::uuid, now() - interval '1 day', 'Малък добив.', 7.8),
  ('d2222222-2222-4222-8222-222222222401'::uuid, 'b2222222-2222-4222-8222-222222222201'::uuid, '22222222-2222-4222-8222-222222222222'::uuid, now() - interval '3 days', 'Основен добив.', 12.9),
  ('d3333333-3333-4333-8333-333333333401'::uuid, 'b3333333-3333-4333-8333-333333333201'::uuid, '33333333-3333-4333-8333-333333333333'::uuid, now() - interval '5 days', 'Пробен добив.', 6.4),
  ('d4444444-4444-4444-8444-444444444401'::uuid, 'b4444444-4444-4444-8444-444444444201'::uuid, '44444444-4444-4444-8444-444444444444'::uuid, now() - interval '2 days', 'Планински мед.', 15.7),
  ('d5555555-5555-4555-8555-555555555401'::uuid, 'b5555555-5555-4555-8555-555555555201'::uuid, '55555555-5555-4555-8555-555555555555'::uuid, now() - interval '1 day', 'Лек добив.', 5.1);

insert into public.harvest_items (harvest_id, super_id, owner_id, frames_count, fill_level, estimated_kg, notes)
values
  ('d1111111-1111-4111-8111-111111111401'::uuid, 'c1111111-1111-4111-8111-111111111301'::uuid, '11111111-1111-4111-8111-111111111111'::uuid, 8, 'very_full', 13.6, 'Запечатани рамки.'),
  ('d1111111-1111-4111-8111-111111111402'::uuid, 'c1111111-1111-4111-8111-111111111302'::uuid, '11111111-1111-4111-8111-111111111111'::uuid, 5, 'full', 8.2, 'Частично запечатани.'),
  ('d2222222-2222-4222-8222-222222222401'::uuid, 'c2222222-2222-4222-8222-222222222301'::uuid, '22222222-2222-4222-8222-222222222222'::uuid, 7, 'full', 12.1, 'Добра хомогенност.'),
  ('d3333333-3333-4333-8333-333333333401'::uuid, 'c3333333-3333-4333-8333-333333333301'::uuid, '33333333-3333-4333-8333-333333333333'::uuid, 4, 'medium', 6.0, 'Пробна партида.'),
  ('d4444444-4444-4444-8444-444444444401'::uuid, 'c4444444-4444-4444-8444-444444444301'::uuid, '44444444-4444-4444-8444-444444444444'::uuid, 9, 'very_full', 15.0, 'Плътно запълване.'),
  ('d5555555-5555-4555-8555-555555555401'::uuid, 'c5555555-5555-4555-8555-555555555301'::uuid, '55555555-5555-4555-8555-555555555555'::uuid, 3, 'medium', 4.8, 'Начален сезон.');

insert into public.apiary_events (apiary_id, owner_id, event_type, occurred_at, product, dosage_or_amount, notes)
values
  ('a1111111-1111-4111-8111-111111111101'::uuid, '11111111-1111-4111-8111-111111111111'::uuid, 'feeding', now() - interval '15 days', 'Сироп 1:1', '2 л', 'Стимулиращо подхранване.'),
  ('a1111111-1111-4111-8111-111111111102'::uuid, '11111111-1111-4111-8111-111111111111'::uuid, 'treatment', now() - interval '40 days', 'Оксалова киселина', 'По схема', 'Есенна профилактика.'),
  ('a2222222-2222-4222-8222-222222222101'::uuid, '22222222-2222-4222-8222-222222222222'::uuid, 'feeding', now() - interval '12 days', 'Сироп 1:1', '1.5 л', 'Подкрепящо хранене.'),
  ('a2222222-2222-4222-8222-222222222102'::uuid, '22222222-2222-4222-8222-222222222222'::uuid, 'other', now() - interval '20 days', null, null, 'Преместени 2 семейства.'),
  ('a3333333-3333-4333-8333-333333333101'::uuid, '33333333-3333-4333-8333-333333333333'::uuid, 'treatment', now() - interval '25 days', 'Био препарат', 'Съгласно етикета', 'Контрол на вароа.'),
  ('a4444444-4444-4444-8444-444444444101'::uuid, '44444444-4444-4444-8444-444444444444'::uuid, 'feeding', now() - interval '13 days', 'Канди', '700 г', 'При захлаждане.'),
  ('a4444444-4444-4444-8444-444444444102'::uuid, '44444444-4444-4444-8444-444444444444'::uuid, 'other', now() - interval '9 days', null, null, 'Подмяна на дъна.'),
  ('a5555555-5555-4555-8555-555555555101'::uuid, '55555555-5555-4555-8555-555555555555'::uuid, 'feeding', now() - interval '6 days', 'Сироп 1:1', '1 л', 'След преглед.');

update public.profiles p
set
  public_hive_count = hive_counts.hive_count,
  updated_at = now()
from (
  select h.owner_id, count(*)::int as hive_count
  from public.hives h
  group by h.owner_id
) as hive_counts
where p.id = hive_counts.owner_id
  and p.id in (
    '11111111-1111-4111-8111-111111111111'::uuid,
    '22222222-2222-4222-8222-222222222222'::uuid,
    '33333333-3333-4333-8333-333333333333'::uuid,
    '44444444-4444-4444-8444-444444444444'::uuid,
    '55555555-5555-4555-8555-555555555555'::uuid
  );

commit;
