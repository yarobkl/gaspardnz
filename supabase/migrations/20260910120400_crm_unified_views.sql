-- Phase 12 — CRM unifié, par des VUES.
--
-- Constat : les données d'un même contact sont déjà présentes, mais éclatées.
--   leads      ← le formulaire du site
--   bookings   ← réservations, reliées par bookings.lead_id (FK réelle)
--   crm_notes  ← notes internes, reliées par crm_notes.lead_id
--   email_messages ← emails, reliés à RIEN : seulement une adresse `recipient`
--   vip_clients    ← malgré son nom, ce n'est PAS du CRM : ce sont des contenus
--                    de vitrine (album, photo_url, sort_order), pas des clients
--
-- Choix : unifier par des VUES en lecture seule, pas par une migration de
-- données. Aucune ligne n'est déplacée, fusionnée ni supprimée — donc rien
-- n'est perdu si le regroupement se révèle imparfait, et le rollback est un
-- simple `drop view`. Le rapprochement se fait sur l'email normalisé, seul
-- identifiant réellement commun aux quatre tables.
--
-- Additive et idempotente. Rollback : supabase/rollback/20260910120400_*.sql

-- security_invoker = true est ESSENTIEL : sans lui, une vue s'exécute avec les
-- droits de son propriétaire et CONTOURNE les politiques RLS des tables
-- sous-jacentes. La vue deviendrait alors une porte dérobée sur tout le CRM.
-- Disponible depuis PostgreSQL 15 ; la production est en 17.

create or replace view public.crm_timeline
with (security_invoker = true) as
  select
    lower(l.email)                as contact_email,
    'lead'::text                  as event_kind,
    l.created_at                  as occurred_at,
    coalesce(l.request_type, 'Demande') as title,
    nullif(l.message, '')         as detail,
    l.id                          as source_id,
    'leads'::text                 as source_table
  from public.leads l
  where l.email is not null

  union all

  select
    lower(coalesce(b.email, l.email)),
    'booking',
    coalesce(b.starts_at, b.created_at),
    coalesce(b.title, 'Réservation'),
    nullif(b.notes, ''),
    b.id,
    'bookings'
  from public.bookings b
  left join public.leads l on l.id = b.lead_id
  where coalesce(b.email, l.email) is not null

  union all

  select
    lower(l.email),
    'note',
    n.created_at,
    'Note interne',
    nullif(n.body, ''),
    n.id,
    'crm_notes'
  from public.crm_notes n
  join public.leads l on l.id = n.lead_id
  where l.email is not null

  union all

  select
    lower(e.recipient),
    'email',
    coalesce(e.sent_at, e.queued_at, e.created_at),
    coalesce(e.subject, 'Email'),
    e.status,
    e.id,
    'email_messages'
  from public.email_messages e
  where e.recipient is not null;

comment on view public.crm_timeline is
  'Historique unifié par contact (email normalisé). Lecture seule, RLS appliquée via security_invoker.';

create or replace view public.crm_contacts
with (security_invoker = true) as
  with identite as (
    select
      lower(l.email) as contact_email,
      -- Le nom et le téléphone les plus récemment renseignés font foi.
      (array_agg(l.full_name order by l.created_at desc)
         filter (where nullif(l.full_name, '') is not null))[1] as full_name,
      (array_agg(l.phone order by l.created_at desc)
         filter (where nullif(l.phone, '') is not null))[1]     as phone,
      (array_agg(l.status order by l.created_at desc)
         filter (where l.status is not null))[1]                as latest_status,
      (array_agg(l.source order by l.created_at desc)
         filter (where l.source is not null))[1]                as latest_source,
      count(*)                as lead_count,
      min(l.created_at)       as first_seen_at
    from public.leads l
    where l.email is not null
    group by lower(l.email)
  ),
  activite as (
    select
      contact_email,
      max(occurred_at)                                       as last_activity_at,
      count(*) filter (where event_kind = 'booking')          as booking_count,
      count(*) filter (where event_kind = 'note')             as note_count,
      count(*) filter (where event_kind = 'email')            as email_count
    from public.crm_timeline
    group by contact_email
  )
  select
    coalesce(i.contact_email, a.contact_email) as contact_email,
    i.full_name,
    i.phone,
    i.latest_status,
    i.latest_source,
    coalesce(i.lead_count, 0)    as lead_count,
    coalesce(a.booking_count, 0) as booking_count,
    coalesce(a.note_count, 0)    as note_count,
    coalesce(a.email_count, 0)   as email_count,
    coalesce(i.first_seen_at, a.last_activity_at) as first_seen_at,
    a.last_activity_at
  from identite i
  full outer join activite a on a.contact_email = i.contact_email;

comment on view public.crm_contacts is
  'Un contact par email normalisé, agrégeant leads, réservations, notes et emails. Lecture seule.';

-- Ces vues sont en LECTURE SEULE : aucun droit d'écriture n'est accordé.
-- Les écritures continuent de passer par les tables, donc par leurs politiques
-- RLS et par les triggers d'audit.
revoke all on public.crm_contacts from anon, authenticated;
revoke all on public.crm_timeline from anon, authenticated;
grant select on public.crm_contacts to authenticated;
grant select on public.crm_timeline to authenticated;
