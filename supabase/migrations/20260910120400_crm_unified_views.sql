-- Phase 12 — CRM unifié par vues, aligné sur le schéma Supabase production.
--
-- Relations réelles utilisées :
--   customers.lead_id
--   bookings.customer_id / bookings.lead_id
--   crm_notes.customer_id / crm_notes.lead_id
--   email_messages.booking_id / email_messages.lead_id
--
-- Contrairement à l'ancienne version, aucune colonne bookings.email n'est
-- supposée. L'email est résolu depuis customers/leads, avec recipient comme
-- dernier recours pour les emails. Aucune donnée n'est déplacée ou supprimée.
--
-- security_invoker = true est obligatoire : les policies RLS des tables
-- sources restent l'autorité.

create or replace view public.crm_timeline
with (security_invoker = true) as
  -- Demandes / leads.
  select
    lower(nullif(trim(l.email), ''))                         as contact_email,
    null::uuid                                                as customer_id,
    l.id                                                      as lead_id,
    'lead'::text                                              as event_kind,
    l.created_at                                              as occurred_at,
    coalesce(nullif(l.request_type, ''), 'Demande')::text     as title,
    nullif(l.message, '')::text                               as detail,
    l.id::text                                                as source_id,
    'leads'::text                                             as source_table
  from public.leads l
  where nullif(trim(l.email), '') is not null

  union all

  -- Conversion en client.
  select
    lower(nullif(trim(c.email), ''))                          as contact_email,
    c.id                                                      as customer_id,
    c.lead_id                                                 as lead_id,
    'customer'::text                                          as event_kind,
    c.created_at                                              as occurred_at,
    'Client créé'::text                                       as title,
    nullif(c.notes, '')::text                                 as detail,
    c.id::text                                                as source_id,
    'customers'::text                                         as source_table
  from public.customers c
  where nullif(trim(c.email), '') is not null

  union all

  -- Réservations : l'email n'existe PAS sur bookings en production.
  select
    lower(nullif(trim(coalesce(c.email, l.email)), ''))       as contact_email,
    b.customer_id                                             as customer_id,
    coalesce(b.lead_id, c.lead_id)                            as lead_id,
    'booking'::text                                           as event_kind,
    coalesce(b.starts_at, b.created_at)                       as occurred_at,
    coalesce(nullif(b.title, ''), 'Réservation')::text        as title,
    nullif(b.notes, '')::text                                 as detail,
    b.id::text                                                as source_id,
    'bookings'::text                                          as source_table
  from public.bookings b
  left join public.customers c on c.id = b.customer_id
  left join public.leads l on l.id = coalesce(b.lead_id, c.lead_id)
  where nullif(trim(coalesce(c.email, l.email)), '') is not null

  union all

  -- Notes CRM : priorité à customer_id, puis lead_id.
  select
    lower(nullif(trim(coalesce(c.email, l.email)), ''))       as contact_email,
    n.customer_id                                             as customer_id,
    coalesce(n.lead_id, c.lead_id)                            as lead_id,
    'note'::text                                              as event_kind,
    n.created_at                                              as occurred_at,
    'Note interne'::text                                      as title,
    nullif(n.body, '')::text                                  as detail,
    n.id::text                                                as source_id,
    'crm_notes'::text                                         as source_table
  from public.crm_notes n
  left join public.customers c on c.id = n.customer_id
  left join public.leads l on l.id = coalesce(n.lead_id, c.lead_id)
  where nullif(trim(coalesce(c.email, l.email)), '') is not null

  union all

  -- Emails : suivre d'abord les FK réelles, recipient reste le fallback.
  select
    lower(nullif(trim(coalesce(c.email, ld.email, lb.email, e.recipient)), '')) as contact_email,
    b.customer_id                                             as customer_id,
    coalesce(e.lead_id, b.lead_id, c.lead_id)                as lead_id,
    'email'::text                                             as event_kind,
    coalesce(e.sent_at, e.queued_at, e.created_at)            as occurred_at,
    coalesce(nullif(e.subject, ''), 'Email')::text            as title,
    e.status::text                                            as detail,
    e.id::text                                                as source_id,
    'email_messages'::text                                    as source_table
  from public.email_messages e
  left join public.bookings b on b.id = e.booking_id
  left join public.customers c on c.id = b.customer_id
  left join public.leads ld on ld.id = e.lead_id
  left join public.leads lb on lb.id = coalesce(b.lead_id, c.lead_id)
  where nullif(trim(coalesce(c.email, ld.email, lb.email, e.recipient)), '') is not null;

comment on view public.crm_timeline is
  'Historique CRM unifié via FK réelles et email normalisé. Lecture seule ; RLS héritée via security_invoker.';

create or replace view public.crm_contacts
with (security_invoker = true) as
  with identities as (
    select
      lower(nullif(trim(l.email), '')) as contact_email,
      nullif(l.full_name, '')::text     as full_name,
      nullif(l.phone, '')::text         as phone,
      l.status::text                    as status,
      l.source::text                    as source,
      l.created_at                      as seen_at,
      l.id                              as lead_id,
      null::uuid                        as customer_id
    from public.leads l
    where nullif(trim(l.email), '') is not null

    union all

    select
      lower(nullif(trim(c.email), '')) as contact_email,
      nullif(c.full_name, '')::text    as full_name,
      nullif(c.phone, '')::text        as phone,
      'client'::text                   as status,
      c.source::text                   as source,
      c.created_at                     as seen_at,
      c.lead_id                        as lead_id,
      c.id                             as customer_id
    from public.customers c
    where nullif(trim(c.email), '') is not null
  ),
  identity_summary as (
    select
      contact_email,
      (array_agg(full_name order by seen_at desc)
        filter (where full_name is not null))[1]              as full_name,
      (array_agg(phone order by seen_at desc)
        filter (where phone is not null))[1]                  as phone,
      (array_agg(status order by seen_at desc)
        filter (where status is not null))[1]                 as latest_status,
      (array_agg(source order by seen_at desc)
        filter (where source is not null))[1]                 as latest_source,
      count(distinct lead_id)                                 as lead_count,
      count(distinct customer_id)                             as customer_count,
      min(seen_at)                                            as first_seen_at
    from identities
    group by contact_email
  ),
  activity as (
    select
      contact_email,
      min(occurred_at)                                        as first_activity_at,
      max(occurred_at)                                        as last_activity_at,
      count(*) filter (where event_kind = 'booking')          as booking_count,
      count(*) filter (where event_kind = 'note')             as note_count,
      count(*) filter (where event_kind = 'email')            as email_count
    from public.crm_timeline
    group by contact_email
  )
  select
    coalesce(i.contact_email, a.contact_email)                as contact_email,
    i.full_name,
    i.phone,
    i.latest_status,
    i.latest_source,
    coalesce(i.lead_count, 0)                                 as lead_count,
    coalesce(i.customer_count, 0)                             as customer_count,
    coalesce(a.booking_count, 0)                              as booking_count,
    coalesce(a.note_count, 0)                                 as note_count,
    coalesce(a.email_count, 0)                                as email_count,
    coalesce(i.first_seen_at, a.first_activity_at)            as first_seen_at,
    a.last_activity_at
  from identity_summary i
  full outer join activity a on a.contact_email = i.contact_email;

comment on view public.crm_contacts is
  'Un contact par email normalisé, utilisant les relations leads/customers/bookings/notes/emails de production.';

revoke all on public.crm_contacts from anon, authenticated;
revoke all on public.crm_timeline from anon, authenticated;
grant select on public.crm_contacts to authenticated;
grant select on public.crm_timeline to authenticated;
