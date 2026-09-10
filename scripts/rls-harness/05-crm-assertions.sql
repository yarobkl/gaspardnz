-- Phase 12 — vues CRM alignées sur les FK réelles de production.

set client_min_messages = notice;

-- Un même contact éclaté entre leads -> customer -> booking/note/email.
insert into public.leads (id, email, full_name, phone, request_type, message, source, status, created_at)
values ('11111111-1111-1111-1111-111111111111', 'Claire.Martin@Example.com', 'Claire Martin',
        '0600000000', 'Mariage', 'Demande initiale', 'site', 'new', now() - interval '30 days');
insert into public.leads (id, email, full_name, status, created_at)
values ('11111111-1111-1111-1111-111111111112', 'claire.martin@example.com', 'Claire M.',
        'qualified', now() - interval '10 days');

insert into public.customers (id, lead_id, email, full_name, source, created_at)
values ('22222222-2222-2222-2222-222222222222',
        '11111111-1111-1111-1111-111111111112',
        'CLAIRE.MARTIN@example.com', 'Claire Cliente', 'crm', now() - interval '7 days');

insert into public.bookings (id, customer_id, title, notes, starts_at, status)
values ('33333333-3333-3333-3333-333333333333',
        '22222222-2222-2222-2222-222222222222',
        'Essayage', 'Salon principal', now() - interval '5 days', 'confirmed');

insert into public.crm_notes (customer_id, body, created_by, created_at)
values ('22222222-2222-2222-2222-222222222222',
        'Rappeler en fin de semaine', 'admin@test.local', now() - interval '4 days');

insert into public.email_messages (booking_id, recipient, subject, status, sent_at, queued_at)
values ('33333333-3333-3333-3333-333333333333',
        'autre-casse@EXAMPLE.com', 'Votre rendez-vous', 'sent', now() - interval '2 days', now() - interval '2 days');

-- 1. Identité unifiée : 2 leads + 1 customer, téléphone historique conservé.
do $$
declare c record;
begin
  select * into c from public.crm_contacts where contact_email = 'claire.martin@example.com';
  if c is null then raise exception 'ECHEC — contact non regroupé'; end if;
  if c.lead_count <> 2 then raise exception 'ECHEC — % lead(s), 2 attendus', c.lead_count; end if;
  if c.customer_count <> 1 then raise exception 'ECHEC — % customer(s), 1 attendu', c.customer_count; end if;
  if c.booking_count <> 1 or c.note_count <> 1 or c.email_count <> 1 then
    raise exception 'ECHEC — agrégats : % réservation(s), % note(s), % email(s)',
      c.booking_count, c.note_count, c.email_count;
  end if;
  if c.full_name <> 'Claire Cliente' then
    raise exception 'ECHEC — identité customer la plus récente attendue, obtenu %', c.full_name;
  end if;
  if c.phone <> '0600000000' then
    raise exception 'ECHEC — téléphone historique perdu : %', c.phone;
  end if;
  if c.latest_status <> 'client' then
    raise exception 'ECHEC — statut client attendu, obtenu %', c.latest_status;
  end if;
  raise notice '  OK    contact unifié : % / % / 2 leads / 1 client', c.full_name, c.phone;
end $$;

-- 2. Historique complet : 2 leads + customer + booking + note + email = 6.
do $$
declare n integer; kinds text;
begin
  select count(*), string_agg(distinct event_kind, ',' order by event_kind)
    into n, kinds
    from public.crm_timeline where contact_email = 'claire.martin@example.com';
  if n <> 6 then raise exception 'ECHEC — % évènement(s), 6 attendus', n; end if;
  if kinds <> 'booking,customer,email,lead,note' then
    raise exception 'ECHEC — types d''évènements : %', kinds;
  end if;
  raise notice '  OK    historique unifié : % évènements (%)', n, kinds;
end $$;

-- 3. La réservation n'a PAS d'email propre : rattachement par customer_id.
do $$
declare n integer;
begin
  select count(*) into n from public.crm_timeline
   where contact_email = 'claire.martin@example.com' and event_kind = 'booking';
  if n <> 1 then raise exception 'ECHEC — réservation non rattachée via customer_id'; end if;
  raise notice '  OK    réservation rattachée via customer_id';
end $$;

-- 4. L'email a un recipient différent, mais booking_id doit l'attacher au bon contact.
do $$
declare n integer;
begin
  select count(*) into n from public.crm_timeline
   where contact_email = 'claire.martin@example.com' and event_kind = 'email';
  if n <> 1 then raise exception 'ECHEC — email non rattaché via booking_id'; end if;
  raise notice '  OK    email rattaché via booking_id avant fallback recipient';
end $$;

-- 5. security_invoker : compte inactif ne voit rien, viewer actif voit le CRM.
do $$
declare n integer;
begin
  set local role authenticated;
  set local request.jwt.claim.email = 'inactif@test.local';
  select count(*) into n from public.crm_contacts;
  reset role;
  if n <> 0 then
    raise exception 'ECHEC — compte désactivé voit % contact(s)', n;
  end if;
  raise notice '  OK    compte désactivé : 0 contact';
end $$;

do $$
declare n integer;
begin
  set local role authenticated;
  set local request.jwt.claim.email = 'viewer@test.local';
  select count(*) into n from public.crm_contacts;
  reset role;
  if n < 1 then raise exception 'ECHEC — viewer légitime ne voit aucun contact'; end if;
  raise notice '  OK    viewer légitime : % contact(s)', n;
end $$;

-- 6. Vues en lecture seule.
do $$
begin
  set local role authenticated;
  set local request.jwt.claim.email = 'owner@test.local';
  begin
    insert into public.crm_contacts (contact_email) values ('injection@example.com');
    reset role;
    raise exception 'ECHEC — écriture possible dans une vue CRM';
  exception
    when sqlstate 'P0001' then raise;
    when others then
      reset role;
      raise notice '  OK    vue CRM en lecture seule (refus : %)', sqlerrm;
  end;
end $$;

-- 7. Contre-preuve : une vue de table SANS security_invoker contourne RLS sous
-- PostgreSQL par défaut et ne doit pas servir de base à l'architecture.
do $$
declare n integer;
begin
  create view public.crm_contacts_sans_protection as
    select lower(email) as contact_email from public.leads where email is not null;
  execute 'grant select on public.crm_contacts_sans_protection to authenticated';

  set local role authenticated;
  set local request.jwt.claim.email = 'inactif@test.local';
  select count(*) into n from public.crm_contacts_sans_protection;
  reset role;
  drop view public.crm_contacts_sans_protection;

  if n = 0 then
    raise exception 'TEST NON CONCLUANT — la vue sans protection ne fuit pas';
  end if;
  raise notice '  OK    contre-preuve : sans security_invoker, fuite de % contact(s)', n;
end $$;

-- 8. Les tables sources restent intactes.
do $$
declare n integer;
begin
  select count(*) into n from public.leads where lower(email) = 'claire.martin@example.com';
  if n <> 2 then raise exception 'ECHEC — lignes leads modifiées (%)', n; end if;
  select count(*) into n from public.customers where lower(email) = 'claire.martin@example.com';
  if n <> 1 then raise exception 'ECHEC — ligne customer modifiée (%)', n; end if;
  raise notice '  OK    tables sources intactes';
end $$;

\echo ''
\echo 'CRM UNIFIÉ : toutes les assertions sont passées.'
