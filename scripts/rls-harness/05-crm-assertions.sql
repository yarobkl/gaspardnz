-- Phase 12 — les vues CRM doivent unifier sans contourner la sécurité.

set client_min_messages = notice;

-- Jeu de données : un même contact, éclaté sur quatre tables.
insert into public.leads (id, email, full_name, phone, request_type, message, source, status, created_at)
values ('11111111-1111-1111-1111-111111111111', 'Claire.Martin@Example.com', 'Claire Martin',
        '0600000000', 'Mariage', 'Demande initiale', 'site', 'nouveau', now() - interval '30 days');
insert into public.leads (id, email, full_name, status, created_at)
values ('11111111-1111-1111-1111-111111111112', 'claire.martin@example.com', 'Claire M.',
        'qualifie', now() - interval '10 days');
insert into public.bookings (lead_id, email, title, notes, starts_at)
values ('11111111-1111-1111-1111-111111111111', null, 'Essayage', 'Salon principal', now() - interval '5 days');
insert into public.crm_notes (lead_id, body, created_by)
values ('11111111-1111-1111-1111-111111111111', 'Rappeler en fin de semaine', 'admin@test.local');
insert into public.email_messages (recipient, subject, status, sent_at)
values ('CLAIRE.MARTIN@example.com', 'Votre rendez-vous', 'sent', now() - interval '2 days');

-- 1. Regroupement malgré la casse et les doublons.
do $$
declare c record;
begin
  select * into c from public.crm_contacts where contact_email = 'claire.martin@example.com';
  if c is null then raise exception 'ECHEC — contact non regroupé'; end if;
  if c.lead_count <> 2 then raise exception 'ECHEC — % demande(s), 2 attendues', c.lead_count; end if;
  if c.booking_count <> 1 or c.note_count <> 1 or c.email_count <> 1 then
    raise exception 'ECHEC — agrégats : % réservation(s), % note(s), % email(s)',
      c.booking_count, c.note_count, c.email_count;
  end if;
  if c.full_name <> 'Claire M.' then
    raise exception 'ECHEC — nom le plus récent attendu, obtenu %', c.full_name;
  end if;
  if c.phone <> '0600000000' then
    raise exception 'ECHEC — téléphone perdu alors qu''il n''existe que sur l''ancienne fiche : %', c.phone;
  end if;
  if c.latest_status <> 'qualifie' then
    raise exception 'ECHEC — statut le plus récent attendu, obtenu %', c.latest_status;
  end if;
  raise notice '  OK    contact unifié : % / % / 2 demandes, 1 résa, 1 note, 1 email',
    c.full_name, c.phone;
end $$;

-- 2. L'historique est complet et ordonné.
do $$
declare n integer; kinds text;
begin
  select count(*), string_agg(distinct event_kind, ',' order by event_kind)
    into n, kinds
    from public.crm_timeline where contact_email = 'claire.martin@example.com';
  if n <> 5 then raise exception 'ECHEC — % évènement(s), 5 attendus', n; end if;
  if kinds <> 'booking,email,lead,note' then
    raise exception 'ECHEC — types d''évènements : %', kinds;
  end if;
  raise notice '  OK    historique unifié : % évènements (%)', n, kinds;
end $$;

-- 3. Une réservation sans email propre est rattachée via son lead.
do $$
declare n integer;
begin
  select count(*) into n from public.crm_timeline
   where contact_email = 'claire.martin@example.com' and event_kind = 'booking';
  if n <> 1 then raise exception 'ECHEC — réservation non rattachée par lead_id'; end if;
  raise notice '  OK    réservation sans email rattachée via lead_id';
end $$;

-- 4. LE POINT CRITIQUE : la vue ne doit pas contourner RLS.
--    Sans security_invoker, une vue s'exécute avec les droits de son
--    propriétaire et exposerait tout le CRM à n'importe qui.
do $$
declare n integer;
begin
  set local role authenticated;
  set local request.jwt.claim.email = 'inactif@test.local';   -- compte désactivé
  select count(*) into n from public.crm_contacts;
  reset role;
  if n <> 0 then
    raise exception 'ECHEC — un compte désactivé voit % contact(s) : la vue contourne RLS', n;
  end if;
  raise notice '  OK    compte désactivé : 0 contact visible (RLS appliquée dans la vue)';
end $$;

do $$
declare n integer;
begin
  set local role authenticated;
  set local request.jwt.claim.email = 'viewer@test.local';
  select count(*) into n from public.crm_contacts;
  reset role;
  if n < 1 then raise exception 'ECHEC — un viewer légitime ne voit aucun contact'; end if;
  raise notice '  OK    viewer légitime : % contact(s) visible(s)', n;
end $$;

-- 5. Les vues sont en lecture seule : aucune écriture, donc aucun contournement
--    des triggers d'audit.
do $$
begin
  set local role authenticated;
  set local request.jwt.claim.email = 'owner@test.local';
  begin
    insert into public.crm_contacts (contact_email) values ('injection@example.com');
    reset role;
    raise exception 'ECHEC — écriture possible dans une vue CRM';
  exception
    when sqlstate 'P0001' then raise;          -- notre propre ECHEC
    when others then
      reset role;
      raise notice '  OK    vue CRM en lecture seule (refus : %)', sqlerrm;
  end;
end $$;

-- 5 bis. Preuve que c'est bien `security_invoker` qui protège : la même vue
--        SANS cette option laisse fuiter tout le CRM.
do $$
declare n integer;
begin
  -- La contre-preuve doit viser une TABLE de base : une vue qui en enveloppe
  -- une autre déjà protégée hérite de sa protection.
  create view public.crm_contacts_sans_protection as
    select lower(email) as contact_email from public.leads where email is not null;
  execute 'grant select on public.crm_contacts_sans_protection to authenticated';

  set local role authenticated;
  set local request.jwt.claim.email = 'inactif@test.local';
  select count(*) into n from public.crm_contacts_sans_protection;
  reset role;

  drop view public.crm_contacts_sans_protection;

  if n = 0 then
    raise exception 'TEST NON CONCLUANT — la vue sans protection ne fuit pas, l''assertion ne prouve rien';
  end if;
  raise notice '  OK    contre-preuve : sans security_invoker, un compte désactivé verrait % contact(s)', n;
end $$;

-- 6. Aucune donnée n'a été déplacée : les tables sources sont intactes.
do $$
declare n integer;
begin
  select count(*) into n from public.leads where email ilike 'claire.martin@example.com';
  if n <> 2 then raise exception 'ECHEC — les lignes sources ont été modifiées (%)' , n; end if;
  raise notice '  OK    tables sources intactes : les vues n''ont rien déplacé';
end $$;

\echo ''
\echo 'CRM UNIFIÉ : toutes les assertions sont passées.'
