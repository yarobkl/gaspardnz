-- Disponibilités publiques du showroom et quota quotidien.
-- Les demandes restent en attente : Gaspard confirme manuellement.

create table if not exists public.booking_availability (
  id uuid primary key default gen_random_uuid(),
  service_date date not null unique,
  is_open boolean not null default true,
  max_clients integer not null default 1 check (max_clients between 1 and 100),
  slots text[] not null default array['10:00','12:00','14:00','16:00','18:00']::text[],
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.booking_availability enable row level security;

drop policy if exists "Public can read open showroom availability" on public.booking_availability;
create policy "Public can read open showroom availability"
  on public.booking_availability for select to anon, authenticated
  using (is_open = true and service_date >= current_date);

create or replace function public.create_booking_request(
  p_full_name text,
  p_email text,
  p_phone text,
  p_project text,
  p_need text,
  p_service_date date,
  p_slot text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_availability public.booking_availability%rowtype;
  v_count integer;
  v_lead_id uuid;
  v_booking_id uuid;
  v_starts_at timestamptz;
begin
  if nullif(trim(p_full_name), '') is null or nullif(trim(p_email), '') is null then
    return jsonb_build_object('ok', false, 'error', 'Nom et email obligatoires');
  end if;

  select * into v_availability
  from public.booking_availability
  where service_date = p_service_date and is_open = true
  for update;

  if not found then
    return jsonb_build_object('ok', false, 'error', 'Ce jour n’est plus disponible');
  end if;

  if not (p_slot = any(v_availability.slots)) then
    return jsonb_build_object('ok', false, 'error', 'Ce créneau n’est plus disponible');
  end if;

  select count(*) into v_count
  from public.bookings
  where starts_at >= (p_service_date::text || ' 00:00:00 Europe/Paris')::timestamptz
    and starts_at < ((p_service_date + 1)::text || ' 00:00:00 Europe/Paris')::timestamptz
    and status in ('requested', 'confirmed');

  if v_count >= v_availability.max_clients then
    return jsonb_build_object('ok', false, 'error', 'Cette journée est complète');
  end if;

  v_starts_at := ((p_service_date::text || ' ' || p_slot || ':00')::timestamp at time zone 'Europe/Paris');

  insert into public.leads (full_name, email, phone, request_type, message, source, channel, status, metadata)
  values (
    left(trim(p_full_name), 200), lower(trim(p_email)), nullif(left(trim(p_phone), 80), ''),
    'Rendez-vous showroom',
    left(concat_ws(' — ', nullif(trim(p_project), ''), nullif(trim(p_need), '')), 2000),
    'GaspardNZ application', 'booking', 'appointment',
    jsonb_build_object('requested_date', p_service_date, 'requested_slot', p_slot)
  ) returning id into v_lead_id;

  insert into public.bookings (lead_id, provider, status, starts_at, ends_at, title, notes, source, metadata)
  values (
    v_lead_id, 'gaspardnz', 'requested', v_starts_at, v_starts_at + interval '1 hour',
    'Demande showroom — ' || left(trim(p_full_name), 160),
    left(concat_ws(' — ', nullif(trim(p_project), ''), nullif(trim(p_need), '')), 2000),
    'App / site', jsonb_build_object('requested_slot', p_slot)
  ) returning id into v_booking_id;

  return jsonb_build_object('ok', true, 'booking_id', v_booking_id, 'lead_id', v_lead_id);
exception when others then
  return jsonb_build_object('ok', false, 'error', 'Impossible d’enregistrer la demande pour le moment');
end;
$$;

revoke all on function public.create_booking_request(text, text, text, text, text, date, text) from public;
grant execute on function public.create_booking_request(text, text, text, text, text, date, text) to service_role;

comment on table public.booking_availability is 'Créneaux et capacité quotidienne du showroom GaspardNZ.';
