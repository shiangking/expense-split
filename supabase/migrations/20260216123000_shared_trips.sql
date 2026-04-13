-- One row per shared trip. Anyone with the trip UUID can read/write via RPC only (no login).
-- Run in Supabase SQL editor. Disable REST for `shared_trips` in Dashboard → API if you want the table hidden from PostgREST (optional).

create table if not exists public.shared_trips (
  id uuid primary key default gen_random_uuid(),
  state jsonb not null,
  updated_at timestamptz not null default now()
);

create index if not exists shared_trips_updated_at_idx on public.shared_trips (updated_at desc);

alter table public.shared_trips enable row level security;

-- Block direct table access; clients use RPCs only.
revoke all on public.shared_trips from public;
revoke all on public.shared_trips from anon, authenticated;

create or replace function public.create_shared_trip()
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  new_id uuid;
begin
  new_id := gen_random_uuid();
  insert into public.shared_trips (id, state, updated_at)
  values (
    new_id,
    '{"v":1,"themeKey":"japan","tab":"members","members":[],"expenses":[],"settledIds":[],"trackExpenseDates":true}'::jsonb,
    now()
  );
  return new_id;
end;
$$;

-- Returns { "state": {...}, "updated_at": "..." } or null if trip does not exist.
create or replace function public.get_shared_trip(trip_id uuid)
returns json
language sql
stable
security definer
set search_path = public
as $$
  select json_build_object(
    'state', t.state,
    'updated_at', t.updated_at
  )
  from public.shared_trips t
  where t.id = trip_id
$$;

create or replace function public.save_shared_trip(trip_id uuid, new_state jsonb)
returns timestamptz
language plpgsql
security definer
set search_path = public
as $$
declare
  t timestamptz;
begin
  update public.shared_trips
  set state = new_state, updated_at = now()
  where id = trip_id;
  if not found then
    raise exception 'Trip not found' using errcode = 'P0001';
  end if;
  select s.updated_at into t from public.shared_trips s where s.id = trip_id;
  return t;
end;
$$;

grant execute on function public.create_shared_trip() to anon, authenticated;
grant execute on function public.get_shared_trip(uuid) to anon, authenticated;
grant execute on function public.save_shared_trip(uuid, jsonb) to anon, authenticated;
