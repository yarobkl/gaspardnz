-- Cal.com -> GNZ CRM. This migration must be applied before enabling the webhook.
-- No client-readable policies or app-to-booking association are created here.
create table if not exists public.cal_verified_booking_events (
  booking_uid text primary key,
  last_event_at timestamptz not null,
  last_trigger text not null,
  last_status text not null check (last_status in ('requested', 'confirmed', 'cancelled')),
  received_at timestamptz not null default now(),
  constraint cal_booking_uid_format check (booking_uid ~ '^[a-zA-Z0-9_-]{1,128}$')
);

alter table public.cal_verified_booking_events enable row level security;
revoke all on public.cal_verified_booking_events from anon, authenticated;

-- Called only by the signed Vercel webhook with the Supabase service role.
-- A single row lock makes duplicate/reordered deliveries idempotent even when
-- two webhook instances run concurrently. The CRM record and cursor commit
-- together or not at all.
create or replace function public.apply_verified_cal_booking(
  p_booking_uid text,
  p_trigger text,
  p_occurred_at timestamptz,
  p_status text,
  p_start_at timestamptz,
  p_end_at timestamptz,
  p_service text,
  p_email text,
  p_name text
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_ingested_uid text;
  v_lead_id uuid;
  v_booking_id uuid;
  v_title text;
begin
  if p_booking_uid is null or p_booking_uid !~ '^[a-zA-Z0-9_-]{1,128}$'
    or p_occurred_at is null or p_status not in ('requested','confirmed','cancelled')
    or p_trigger not in ('BOOKING_CREATED','BOOKING_CONFIRMED','BOOKING_REQUESTED','BOOKING_RESCHEDULED','BOOKING_CANCELLED','BOOKING_REJECTED')
  then
    raise exception 'Invalid Cal.com booking event' using errcode = '22023';
  end if;
  if p_status <> 'cancelled' and (p_start_at is null or p_end_at is null or p_end_at <= p_start_at) then
    raise exception 'Invalid appointment interval' using errcode = '22023';
  end if;

  insert into public.cal_verified_booking_events (booking_uid, last_event_at, last_trigger, last_status)
  values (p_booking_uid, p_occurred_at, p_trigger, p_status)
  on conflict (booking_uid) do update
    set last_event_at = excluded.last_event_at,
        last_trigger = excluded.last_trigger,
        last_status = excluded.last_status,
        received_at = now()
    where public.cal_verified_booking_events.last_event_at < excluded.last_event_at
  returning booking_uid into v_ingested_uid;
  if v_ingested_uid is null then
    -- Duplicate or older events cannot overwrite newer appointments.
    -- INSERT/UPSERT holds a row lock until the CRM update commits.
    return jsonb_build_object('applied', false);
  end if;

  v_title := 'GNZ PARIS — ' || left(coalesce(nullif(trim(p_service), ''), 'Conseil en image'), 100);
  select id, lead_id into v_booking_id, v_lead_id
  from public.bookings where provider = 'calcom' and external_id = p_booking_uid
  for update;

  if v_lead_id is null and p_email is not null and
      p_email ~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' then
    select id into v_lead_id from public.leads
    where lower(email) = lower(left(p_email, 320))
    order by created_at desc limit 1;
    if v_lead_id is null and p_status <> 'cancelled' then
      insert into public.leads (full_name, email, request_type, source, channel, status, metadata)
      values (nullif(left(trim(p_name), 160), ''), lower(left(p_email, 320)),
              'Rendez-vous Cal.com', 'Cal.com', 'booking', 'appointment',
              jsonb_build_object('provider', 'calcom'))
      returning id into v_lead_id;
    end if;
  end if;

  if v_booking_id is not null then
    update public.bookings
    set status = p_status,
        starts_at = coalesce(p_start_at, starts_at),
        ends_at = coalesce(p_end_at, ends_at),
        title = v_title,
        lead_id = coalesce(lead_id, v_lead_id),
        metadata = coalesce(metadata, '{}'::jsonb) || jsonb_build_object(
          'cal_event_at', p_occurred_at, 'cal_trigger', p_trigger),
        updated_at = now()
    where id = v_booking_id;
  elsif p_status <> 'cancelled' then
    insert into public.bookings (
      lead_id, provider, external_id, status, starts_at, ends_at, title, source, metadata
    ) values (
      v_lead_id, 'calcom', p_booking_uid, p_status, p_start_at, p_end_at,
      v_title, 'Cal.com', jsonb_build_object('cal_event_at', p_occurred_at, 'cal_trigger', p_trigger)
    ) returning id into v_booking_id;
  end if;

  return jsonb_build_object('applied', true, 'booking_recorded', v_booking_id is not null);
end;
$$;

revoke all on function public.apply_verified_cal_booking(text,text,timestamptz,text,timestamptz,timestamptz,text,text,text) from public, anon, authenticated;
grant execute on function public.apply_verified_cal_booking(text,text,timestamptz,text,timestamptz,timestamptz,text,text,text) to service_role;
