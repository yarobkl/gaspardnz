-- Photos de prestations par partenaire : écriture réservée au personnel,
-- lecture publique filtrée par partners.published, cascade à la suppression
-- du partenaire.

set client_min_messages = notice;

insert into auth.users (email) values
  ('owner@test.local'), ('editor@test.local'), ('viewer@test.local')
on conflict (email) do nothing;

insert into public.admin_access (email, role, active) values
  ('owner@test.local',  'owner',  true),
  ('editor@test.local', 'editor', true),
  ('viewer@test.local', 'viewer', true)
on conflict (email) do update set role = excluded.role, active = excluded.active;

create or replace function pg_temp.check_as(
  label text, who text, expected text, kind text, sql text
) returns void language plpgsql as $$
declare
  n bigint;
  outcome text;
begin
  begin
    execute 'set local role authenticated';
    execute format('set local request.jwt.claim.email = %L', who);
    if kind = 'read' then
      execute sql into n;
    else
      execute sql;
      get diagnostics n = row_count;
    end if;
    outcome := case when n > 0 then 'OK' else 'DENY' end;
  exception
    when insufficient_privilege or check_violation or invalid_text_representation then
      outcome := 'DENY';
  end;
  reset role;

  if outcome = expected then
    raise notice '  OK    % [%] -> %', rpad(label, 34), rpad(who, 22), outcome;
  else
    raise exception 'ECHEC % / % : obtenu %, attendu %', label, who, outcome, expected;
  end if;
end $$;

-- Fixture : un partenaire publié avec une photo, un partenaire non publié avec une photo.
insert into public.partners (name, slug, published) values ('Pâtissier Test', 'patissier-test', true);
insert into public.partners (name, slug, published) values ('Traiteur Brouillon', 'traiteur-brouillon', false);
do $$
declare v_partner_id uuid;
begin
  select id into v_partner_id from public.partners where slug = 'patissier-test';
  insert into public.partner_photos (partner_id, photo_url, caption, sort_order) values
    (v_partner_id, 'https://example.test/gateau-1.jpg', 'Pièce montée mariage', 0),
    (v_partner_id, 'https://example.test/gateau-2.jpg', 'Wedding cake trois étages', 1);

  select id into v_partner_id from public.partners where slug = 'traiteur-brouillon';
  insert into public.partner_photos (partner_id, photo_url, sort_order) values
    (v_partner_id, 'https://example.test/buffet-1.jpg', 0);
end $$;

-- 1. Écriture réservée au personnel (editor et plus).
do $$
declare v_partner_id uuid;
begin
  select id into v_partner_id from public.partners where slug = 'patissier-test';
  raise notice '';
  raise notice 'CRÉATION d''une photo — editor et plus uniquement';
  perform pg_temp.check_as('insert photo (owner)', 'owner@test.local', 'OK', 'write',
    format('insert into public.partner_photos (partner_id, photo_url) values (%L, ''https://example.test/gateau-owner.jpg'')', v_partner_id));
  perform pg_temp.check_as('insert photo (editor)', 'editor@test.local', 'OK', 'write',
    format('insert into public.partner_photos (partner_id, photo_url) values (%L, ''https://example.test/gateau-editor.jpg'')', v_partner_id));
  perform pg_temp.check_as('insert photo (viewer)', 'viewer@test.local', 'DENY', 'write',
    format('insert into public.partner_photos (partner_id, photo_url) values (%L, ''https://example.test/interdit.jpg'')', v_partner_id));
end $$;

-- 2. Lecture publique (anon) : uniquement les photos d'un partenaire publié.
do $$
declare n integer;
begin
  raise notice '';
  raise notice 'LECTURE PUBLIQUE (anon) — filtrée par partners.published';
  set local role anon;
  select count(*) into n from public.partner_photos pp join public.partners p on p.id = pp.partner_id where p.slug = 'patissier-test';
  if n = 0 then raise exception 'ECHEC — anon ne voit pas les photos d''un partenaire publié'; end if;
  raise notice '  OK    anon voit les photos du partenaire publié (% ligne(s))', n;

  select count(*) into n from public.partner_photos pp join public.partners p on p.id = pp.partner_id where p.slug = 'traiteur-brouillon';
  if n <> 0 then raise exception 'ECHEC — anon voit les photos d''un partenaire non publié'; end if;
  raise notice '  OK    anon ne voit pas les photos du partenaire non publié';
  reset role;
end $$;

-- 3. Le personnel voit tout, y compris les partenaires non publiés (prévisualisation).
do $$
declare r record;
begin
  raise notice '';
  raise notice 'LECTURE STAFF — même un partenaire non publié';
  for r in select * from (values
      ('owner@test.local','OK'),('editor@test.local','OK'),('viewer@test.local','OK')) as t(who,exp)
  loop perform pg_temp.check_as('select photos brouillon', r.who, r.exp, 'read',
    'select count(*) from public.partner_photos pp join public.partners p on p.id = pp.partner_id where p.slug = ''traiteur-brouillon'''); end loop;
end $$;

-- 4. Retirer une photo est une suppression normale (pas de corbeille pour un
--    élément isolé, contrairement à une formule entière).
do $$
declare v_photo_id uuid; n integer;
begin
  select id into v_photo_id from public.partner_photos where photo_url = 'https://example.test/gateau-1.jpg';
  set local role authenticated;
  set local request.jwt.claim.email = 'editor@test.local';
  delete from public.partner_photos where id = v_photo_id;
  get diagnostics n = row_count;
  reset role;
  if n <> 1 then raise exception 'ECHEC — un editor ne peut pas retirer une photo'; end if;
  raise notice '';
  raise notice '  OK    un editor peut retirer une photo isolée';
end $$;

-- 5. Supprimer le partenaire supprime ses photos (cascade) — pas d'orphelins.
do $$
declare v_partner_id uuid; n integer;
begin
  select id into v_partner_id from public.partners where slug = 'patissier-test';
  delete from public.partners where id = v_partner_id;
  select count(*) into n from public.partner_photos where partner_id = v_partner_id;
  if n <> 0 then raise exception 'ECHEC — des photos ont survécu à la suppression de leur partenaire'; end if;
  raise notice '';
  raise notice '  OK    supprimer un partenaire supprime ses photos (cascade)';
end $$;

-- 6. Chaque écriture laisse une trace d'audit, avec un libellé lisible
--    ("caption" désormais reconnu).
do $$
declare logged text; descr text;
begin
  select actor_email, description into logged, descr from public.activity_log
   where entity_type = 'partner_photos' order by created_at desc limit 1;
  if logged is null then raise exception 'ECHEC — aucune trace d''audit pour partner_photos'; end if;
  raise notice '';
  raise notice '  OK    écriture sur les photos journalisée (acteur : %, %)', logged, descr;
end $$;

\echo ''
\echo 'PHOTOS DE PRESTATIONS : toutes les assertions sont passées.'
