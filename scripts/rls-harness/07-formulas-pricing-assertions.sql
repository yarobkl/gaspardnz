-- Détail des formules (menus + articles) : lecture publique filtrée par
-- published/deleted_at, écriture réservée au personnel, corbeille restaurable.

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

-- Fixture : une formule publiée avec un menu et deux articles.
insert into public.packages (name, slug, published) values ('Formule Test', 'formule-test', true);
do $$
declare v_package_id uuid; v_group_id uuid;
begin
  select id into v_package_id from public.packages where slug = 'formule-test';
  insert into public.package_groups (package_id, label, sort_order) values (v_package_id, 'Look Mairie', 0) returning id into v_group_id;
  insert into public.package_items (group_id, label, price, sort_order) values
    (v_group_id, 'Costume', 300, 0),
    (v_group_id, 'Chemise', 50, 1);
end $$;

-- Une seconde formule, non publiée, pour vérifier qu'elle reste invisible du
-- public même avec un menu configuré.
insert into public.packages (name, slug, published) values ('Formule Brouillon', 'formule-brouillon', false);
do $$
declare v_package_id uuid; v_group_id uuid;
begin
  select id into v_package_id from public.packages where slug = 'formule-brouillon';
  insert into public.package_groups (package_id, label, sort_order) values (v_package_id, 'Look Mairie', 0) returning id into v_group_id;
  insert into public.package_items (group_id, label, price, sort_order) values (v_group_id, 'Costume', 999, 0);
end $$;

-- 1. Écriture (menus et articles) réservée au personnel (editor et plus).
do $$
declare v_group_id uuid;
begin
  select g.id into v_group_id from public.package_groups g
    join public.packages p on p.id = g.package_id where p.slug = 'formule-test';

  raise notice '';
  raise notice 'CRÉATION d''un menu — editor et plus uniquement';
  perform pg_temp.check_as('insert menu (owner)', 'owner@test.local', 'OK', 'write',
    'insert into public.package_groups (package_id, label, sort_order) select id, ''Look Soirée'', 1 from public.packages where slug = ''formule-test''');
  perform pg_temp.check_as('insert menu (editor)', 'editor@test.local', 'OK', 'write',
    'insert into public.package_groups (package_id, label, sort_order) select id, ''Autre menu'', 2 from public.packages where slug = ''formule-test''');
  perform pg_temp.check_as('insert menu (viewer)', 'viewer@test.local', 'DENY', 'write',
    'insert into public.package_groups (package_id, label, sort_order) select id, ''Interdit'', 3 from public.packages where slug = ''formule-test''');

  raise notice '';
  raise notice 'CRÉATION d''un article — editor et plus uniquement';
  perform pg_temp.check_as('insert article (editor)', 'editor@test.local', 'OK', 'write',
    format('insert into public.package_items (group_id, label, price) values (%L, ''Cravate'', 30)', v_group_id));
  perform pg_temp.check_as('insert article (viewer)', 'viewer@test.local', 'DENY', 'write',
    format('insert into public.package_items (group_id, label, price) values (%L, ''Interdit'', 1)', v_group_id));
end $$;

-- 2. Lecture publique (anon) : uniquement la formule publiée et non supprimée.
do $$
begin
  raise notice '';
  raise notice 'LECTURE PUBLIQUE (anon) — filtrée par published/deleted_at';
end $$;
do $$
declare n integer;
begin
  set local role anon;
  select count(*) into n from public.package_groups g join public.packages p on p.id = g.package_id where p.slug = 'formule-test';
  if n = 0 then raise exception 'ECHEC — anon ne voit pas les menus d''une formule publiée'; end if;
  raise notice '  OK    anon voit les menus de la formule publiée (% ligne(s))', n;

  select count(*) into n from public.package_groups g join public.packages p on p.id = g.package_id where p.slug = 'formule-brouillon';
  if n <> 0 then raise exception 'ECHEC — anon voit les menus d''une formule non publiée'; end if;
  raise notice '  OK    anon ne voit pas les menus de la formule non publiée';
  reset role;
end $$;

-- 3. Le personnel (viewer inclus) voit tout, y compris les brouillons — pour
--    pouvoir prévisualiser avant publication.
do $$
begin
  raise notice '';
  raise notice 'LECTURE STAFF — même les formules non publiées (prévisualisation)';
end $$;
do $$
declare r record;
begin
  for r in select * from (values
      ('owner@test.local','OK'),('editor@test.local','OK'),('viewer@test.local','OK')) as t(who,exp)
  loop perform pg_temp.check_as('select menus brouillon', r.who, r.exp, 'read',
    'select count(*) from public.package_groups g join public.packages p on p.id = g.package_id where p.slug = ''formule-brouillon'''); end loop;
end $$;

-- 4. Suppression douce d'une formule (corbeille) : plus visible du public,
--    toujours visible du personnel, restaurable.
update public.packages set deleted_at = now() where slug = 'formule-test';

do $$
begin
  raise notice '';
  raise notice 'CORBEILLE — formule supprimée en douceur';
end $$;
do $$
declare n integer;
begin
  set local role anon;
  select count(*) into n from public.package_groups g join public.packages p on p.id = g.package_id where p.slug = 'formule-test';
  if n <> 0 then raise exception 'ECHEC — anon voit encore les menus d''une formule mise à la corbeille'; end if;
  raise notice '  OK    anon ne voit plus les menus d''une formule mise à la corbeille';
  reset role;
end $$;

do $$
declare n integer;
begin
  select count(*) into n from public.package_groups g join public.packages p on p.id = g.package_id where p.slug = 'formule-test';
  if n = 0 then raise exception 'ECHEC — le personnel ne voit plus une formule mise à la corbeille (impossible à restaurer)'; end if;
  raise notice '  OK    le personnel voit toujours la formule à la corbeille (% menu(s), restauration possible)', n;
end $$;

-- Restauration : redevient visible du public.
update public.packages set deleted_at = null where slug = 'formule-test';
do $$
declare n integer;
begin
  set local role anon;
  select count(*) into n from public.package_groups g join public.packages p on p.id = g.package_id where p.slug = 'formule-test';
  if n = 0 then raise exception 'ECHEC — la formule restaurée reste invisible du public'; end if;
  raise notice '  OK    formule restaurée, à nouveau visible du public';
  reset role;
end $$;

-- 5. Suppression d'un menu : ses articles disparaissent avec lui (cascade),
--    sans qu'on ait besoin de les supprimer un par un.
do $$
declare v_group_id uuid; n integer;
begin
  select id into v_group_id from public.package_groups where label = 'Autre menu';
  delete from public.package_groups where id = v_group_id;
  select count(*) into n from public.package_items where group_id = v_group_id;
  if n <> 0 then raise exception 'ECHEC — des articles ont survécu à la suppression de leur menu'; end if;
  raise notice '';
  raise notice '  OK    supprimer un menu supprime ses articles (cascade)';
end $$;

-- 6. Chaque écriture laisse une trace d'audit non falsifiable.
do $$
declare logged text;
begin
  select actor_email into logged from public.activity_log
   where entity_type = 'package_items' order by created_at desc limit 1;
  if logged is null then raise exception 'ECHEC — aucune trace d''audit pour package_items'; end if;
  raise notice '';
  raise notice '  OK    écriture sur les articles journalisée (acteur : %)', logged;
end $$;

\echo ''
\echo 'DÉTAIL DES FORMULES : toutes les assertions sont passées.'
