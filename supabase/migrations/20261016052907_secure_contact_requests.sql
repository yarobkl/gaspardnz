-- Additive only: historical leads, bookings and analytics are never rewritten.
begin;
create table if not exists public.commercial_exclusions (
 lead_id uuid primary key references public.leads(id), reason text not null,
 created_at timestamptz not null default now()
);
alter table public.commercial_exclusions enable row level security;
revoke all on public.commercial_exclusions from anon, authenticated;
grant select on public.commercial_exclusions to authenticated;
grant all on public.commercial_exclusions to service_role;
drop policy if exists commercial_exclusions_admin on public.commercial_exclusions;
create policy commercial_exclusions_admin on public.commercial_exclusions for select to authenticated using (private.is_admin());
insert into public.commercial_exclusions(lead_id,reason)
select id, 'Prospect de test exclu du bilan commercial — mission du 16/10/2026'
from public.leads where id in (
 '491d4ef9-033b-4b1b-a499-63e94b961b37','cc3353de-93fb-4b99-bc80-3e5cb5952333',
 'ff97e39a-6d62-46dd-a2c1-dfc1c5a569eb','0ff52205-b8d4-428f-bd79-800b1136d7b1','a90d4abb-4e63-4919-94ea-05da1498164f') on conflict(lead_id) do nothing;
create table if not exists public.contact_requests (
 id uuid primary key, lead_id uuid not null references public.leads(id),
 fingerprint text not null, created_at timestamptz not null default now()
);
create index if not exists contact_requests_fingerprint_date on public.contact_requests(fingerprint,created_at desc);
create table if not exists public.contact_intents (
 id uuid primary key default gen_random_uuid(), request_id uuid not null references public.contact_requests(id),
 lead_id uuid not null references public.leads(id), channel text not null check(channel in ('whatsapp','calendly')),
 created_at timestamptz not null default now(), unique(request_id,channel)
);
alter table public.contact_requests enable row level security;
alter table public.contact_intents enable row level security;
revoke all on public.contact_requests, public.contact_intents from anon, authenticated;
grant select on public.contact_requests, public.contact_intents to authenticated;
grant all on public.contact_requests, public.contact_intents to service_role;
drop policy if exists contact_requests_admin on public.contact_requests;
create policy contact_requests_admin on public.contact_requests for select to authenticated using (private.is_admin());
drop policy if exists contact_intents_admin on public.contact_intents;
create policy contact_intents_admin on public.contact_intents for select to authenticated using (private.is_admin());
-- Invoker + service_role-only execution. Anonymous clients cannot choose lead IDs.
create or replace function public.save_contact_intent(p_id uuid,p_fingerprint text,p_name text,p_phone text,p_project text,p_description text,p_channel text,p_visitor uuid default null)
returns void language plpgsql security invoker set search_path = '' as $$
declare request public.contact_requests; existing_lead uuid; tracked_visitor uuid;
begin
 if p_id is null or p_fingerprint !~ '^[0-9a-f]{64}$' or length(trim(p_name)) not between 1 and 100
 or p_phone !~ '^\+[1-9][0-9]{6,14}$' or length(trim(p_project)) not between 1 and 120
 or length(p_description)>1000 or p_channel not in ('whatsapp','calendly') then raise exception 'Invalid contact'; end if;
 -- Serialize retries, including concurrent requests, in one transaction.
 perform pg_advisory_xact_lock(hashtextextended(p_id::text,0));
 perform pg_advisory_xact_lock(hashtextextended(p_fingerprint,1));
 select * into request from public.contact_requests where id=p_id;
 if found then
   if request.fingerprint<>p_fingerprint then raise exception 'Request already used'; end if;
   existing_lead:=request.lead_id;
 else
   select lead_id into existing_lead from public.contact_requests where fingerprint=p_fingerprint and created_at>now()-interval '24 hours' order by created_at desc limit 1;
   if existing_lead is null then
     select id into tracked_visitor from public.visitors where id=p_visitor;
     insert into public.leads(full_name,phone,request_type,message,source,channel,visitor_id,metadata)
     values(trim(p_name),p_phone,trim(p_project),nullif(trim(p_description),''),'site','contact_form',tracked_visitor,jsonb_build_object('privacy_notice','contact-v1')) returning id into existing_lead;
   end if;
   insert into public.contact_requests(id,lead_id,fingerprint) values(p_id,existing_lead,p_fingerprint);
 end if;
 insert into public.contact_intents(request_id,lead_id,channel) values(p_id,existing_lead,p_channel) on conflict(request_id,channel) do nothing;
end $$;
revoke all on function public.save_contact_intent(uuid,text,text,text,text,text,text,uuid) from public,anon,authenticated;
grant execute on function public.save_contact_intent(uuid,text,text,text,text,text,text,uuid) to service_role;
commit;
