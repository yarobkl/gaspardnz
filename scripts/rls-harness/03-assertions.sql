-- Matrice de droits alignée sur le schéma/policies de production.

set client_min_messages = notice;

insert into auth.users (email) values
  ('owner@test.local'), ('admin@test.local'),
  ('editor@test.local'), ('viewer@test.local'), ('inactif@test.local')
on conflict (email) do nothing;

insert into public.admin_access (email, role, active) values
  ('owner@test.local',   'owner',  true),
  ('admin@test.local',   'admin',  true),
  ('editor@test.local',  'editor', true),
  ('viewer@test.local',  'viewer', true),
  ('inactif@test.local', 'owner',  false)
on conflict (email) do update set role = excluded.role, active = excluded.active;

insert into public.leads (email) values ('prospect@example.com');
insert into public.site_settings (key, value, is_public)
values ('theme', '"gold"'::jsonb, true)
on conflict (key) do nothing;
insert into public.packages (name, slug, published)
values ('Formule test', 'formule-test', true);

-- 'OK' = l'opération aboutit / voit au moins une ligne ; 'DENY' = refusée par
-- RLS ou sans effet.
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
    raise notice '  OK    % [%] -> %', rpad(label, 30), rpad(who, 20), outcome;
  else
    raise exception 'ECHEC % / % : obtenu %, attendu %', label, who, outcome, expected;
  end if;
end $$;

do $$
declare r record;
begin
  raise notice '';
  raise notice 'LECTURE CRM — viewer et plus';
  for r in select * from (values
      ('owner@test.local','OK'),('admin@test.local','OK'),
      ('editor@test.local','OK'),('viewer@test.local','OK'),
      ('inactif@test.local','DENY')) as t(who,exp)
  loop perform pg_temp.check_as('select leads', r.who, r.exp, 'read',
    'select count(*) from public.leads'); end loop;

  raise notice '';
  raise notice 'ECRITURE CRM — admin et owner uniquement';
  for r in select * from (values
      ('owner@test.local','OK'),('admin@test.local','OK'),
      ('editor@test.local','DENY'),('viewer@test.local','DENY'),
      ('inactif@test.local','DENY')) as t(who,exp)
  loop perform pg_temp.check_as('insert leads', r.who, r.exp, 'write',
    format('insert into public.leads (email) values (%L)', 'nouveau-' || split_part(r.who,'@',1) || '@example.com'));
  end loop;

  raise notice '';
  raise notice 'CONTENU — editor et plus peuvent écrire, viewer non';
  for r in select * from (values
      ('owner@test.local','OK'),('admin@test.local','OK'),
      ('editor@test.local','OK'),('viewer@test.local','DENY')) as t(who,exp)
  loop perform pg_temp.check_as('insert package', r.who, r.exp, 'write',
    format('insert into public.packages (name, slug) values (%L,%L)',
      'Package ' || r.who, 'pkg-' || split_part(r.who,'@',1)));
  end loop;

  raise notice '';
  raise notice 'PARAMETRES — admin et owner uniquement';
  for r in select * from (values
      ('owner@test.local','OK'),('admin@test.local','OK'),
      ('editor@test.local','DENY'),('viewer@test.local','DENY')) as t(who,exp)
  loop perform pg_temp.check_as('update site_settings', r.who, r.exp, 'write',
    'update public.site_settings set value = ''"noir"''::jsonb where key = ''theme'''); end loop;

  raise notice '';
  raise notice 'LECTURE admin_access — admin/owner voient autrui ; chacun voit sa ligne';
  for r in select * from (values
      ('owner@test.local','OK'),('admin@test.local','OK'),
      ('editor@test.local','DENY'),('viewer@test.local','DENY')) as t(who,exp)
  loop perform pg_temp.check_as('liste admin_access', r.who, r.exp, 'read',
    'select count(*) filter (where email <> lower(auth.email())) from public.admin_access'); end loop;

  for r in select * from (values
      ('viewer@test.local','OK'),('editor@test.local','OK')) as t(who,exp)
  loop perform pg_temp.check_as('propre ligne admin_access', r.who, r.exp, 'read',
    format('select count(*) from public.admin_access where email = %L', r.who)); end loop;

  raise notice '';
  raise notice 'GESTION admin_access — owner seulement';
  for r in select * from (values
      ('viewer@test.local','DENY'),('editor@test.local','DENY'),
      ('admin@test.local','DENY'),('owner@test.local','OK')) as t(who,exp)
  loop perform pg_temp.check_as('insert admin_access', r.who, r.exp, 'write',
    format('insert into public.admin_access (email, role, active) values (%L, ''viewer'', true)',
           'cree-par-' || split_part(r.who,'@',1) || '@test.local'));
  end loop;

  raise notice '';
  raise notice 'STORAGE site-media — editor et plus en écriture';
  for r in select * from (values
      ('owner@test.local','OK'),('admin@test.local','OK'),
      ('editor@test.local','OK'),('viewer@test.local','DENY')) as t(who,exp)
  loop perform pg_temp.check_as('insert site-media', r.who, r.exp, 'write',
    format('insert into storage.objects (bucket_id,name) values (''site-media'',%L)',
           'test/' || split_part(r.who,'@',1) || '.jpg'));
  end loop;

  raise notice '';
  raise notice 'activity_log — aucune écriture directe client';
  for r in select * from (values
      ('viewer@test.local','DENY'),('editor@test.local','DENY'),
      ('admin@test.local','DENY'),('owner@test.local','DENY')) as t(who,exp)
  loop perform pg_temp.check_as('insert activity_log', r.who, r.exp, 'write',
    'insert into public.activity_log (event_type,title,actor_email) values (''faux'',''Fausse trace'',''faux@x.fr'')'); end loop;
end $$;

-- Le site public reste lisible pour anon.
do $$
declare n bigint;
begin
  set local role anon;
  select count(*) into n from public.site_settings where is_public;
  reset role;
  if n < 1 then raise exception 'ECHEC — lecture publique de site_settings cassée'; end if;
  raise notice '  OK    lecture publique site_settings (anon)';
end $$;

-- Un utilisateur authenticated mais NON admin conserve la lecture des contenus
-- publics ; les policies RBAC ne doivent pas transformer l'authentification en
-- régression d'accès au site vitrine.
do $$
declare n bigint;
begin
  set local role authenticated;
  set local request.jwt.claim.email = 'simple-utilisateur@test.local';
  select count(*) into n from public.packages where published;
  reset role;
  if n < 1 then raise exception 'ECHEC — contenu public masqué aux authenticated non-admin'; end if;
  raise notice '  OK    contenu public conservé pour authenticated non-admin';
end $$;

-- Dernier owner : protection serveur.
delete from public.admin_access where email like 'cree-par-%';
do $$
declare owners integer;
begin
  select count(*) into owners from public.admin_access where role = 'owner' and active;
  if owners <> 1 then
    raise exception 'FIXTURE INVALIDE — % propriétaire(s) actif(s), 1 attendu', owners;
  end if;
  begin
    update public.admin_access set active = false where email = 'owner@test.local';
    raise exception 'ECHEC — le dernier propriétaire a pu être désactivé';
  exception when check_violation then
    raise notice '  OK    dernier propriétaire actif : désactivation refusée';
  end;
end $$;

-- Normalisation email.
do $$
declare stored text;
begin
  insert into public.admin_access (email, role) values ('  MiXeD@Test.Local  ', 'viewer');
  select email into stored from public.admin_access where email like '%mixed%';
  if stored is distinct from 'mixed@test.local' then
    raise exception 'ECHEC — email non normalisé : %', stored;
  end if;
  raise notice '  OK    email normalisé : %', stored;
end $$;

-- L'enum production refuse un rôle inconnu avant même la contrainte de rang.
do $$
begin
  begin
    execute $$insert into public.admin_access (email, role) values ('bidon@test.local', 'superadmin')$$;
    raise exception 'ECHEC — un rôle inconnu a été accepté';
  exception when invalid_text_representation or check_violation then
    raise notice '  OK    rôle inconnu refusé';
  end;
end $$;

\echo ''
\echo 'MATRICE DE DROITS : toutes les assertions sont passées.'
