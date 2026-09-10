-- Matrice de droits : ce que chaque rôle peut RÉELLEMENT faire une fois les
-- politiques RESTRICTIVES appliquées PAR-DESSUS la politique permissive
-- « tout admin peut tout » de la baseline.

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
insert into public.site_settings (key, value) values ('theme', '"gold"'::jsonb)
  on conflict (key) do nothing;

-- 'OK' = l'opération aboutit ; 'DENY' = refusée par RLS (erreur) ou sans effet
-- (aucune ligne visible / aucune ligne modifiée).
create or replace function pg_temp.check_as(
  label text, who text, expected text, kind text, sql text
) returns void language plpgsql as $$
declare
  n       bigint;
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
    when insufficient_privilege or check_violation then outcome := 'DENY';
  end;
  reset role;

  if outcome = expected then
    raise notice '  OK    % [%] -> %', rpad(label, 26), rpad(who, 20), outcome;
  else
    raise exception 'ECHEC % / % : obtenu %, attendu %', label, who, outcome, expected;
  end if;
end $$;

do $$
declare r record;
begin
  raise notice '';
  raise notice 'LECTURE leads — rôle minimal : viewer';
  for r in select * from (values
      ('owner@test.local','OK'),('admin@test.local','OK'),
      ('editor@test.local','OK'),('viewer@test.local','OK'),
      ('inactif@test.local','DENY')) as t(who,exp)
  loop perform pg_temp.check_as('select leads', r.who, r.exp, 'read',
    'select count(*) from public.leads'); end loop;

  raise notice '';
  raise notice 'ECRITURE leads — rôle minimal : editor';
  for r in select * from (values
      ('owner@test.local','OK'),('admin@test.local','OK'),
      ('editor@test.local','OK'),('viewer@test.local','DENY'),
      ('inactif@test.local','DENY')) as t(who,exp)
  loop perform pg_temp.check_as('insert leads', r.who, r.exp, 'write',
    'insert into public.leads (email) values (''nouveau@example.com'')'); end loop;

  raise notice '';
  raise notice 'MISE A JOUR site_settings — rôle minimal : admin';
  for r in select * from (values
      ('owner@test.local','OK'),('admin@test.local','OK'),
      ('editor@test.local','DENY'),('viewer@test.local','DENY')) as t(who,exp)
  loop perform pg_temp.check_as('update site_settings', r.who, r.exp, 'write',
    'update public.site_settings set value = ''"noir"''::jsonb where key = ''theme'''); end loop;

  raise notice '';
  raise notice 'SUPPRESSION leads — rôle minimal : editor';
  for r in select * from (values
      ('viewer@test.local','DENY'),('editor@test.local','OK')) as t(who,exp)
  loop perform pg_temp.check_as('delete leads', r.who, r.exp, 'write',
    'delete from public.leads where email = ''nouveau@example.com'''); end loop;

  raise notice '';
  raise notice 'LECTURE de la LISTE admin_access — rôle minimal : admin';
  -- Un viewer/editor ne voit que sa propre ligne : la liste complète (> 1) ne
  -- doit remonter que pour admin et owner.
  for r in select * from (values
      ('owner@test.local','OK'),('admin@test.local','OK'),
      ('editor@test.local','DENY'),('viewer@test.local','DENY')) as t(who,exp)
  loop perform pg_temp.check_as('liste admin_access', r.who, r.exp, 'read',
    'select count(*) filter (where email <> lower(auth.email())) from public.admin_access'); end loop;

  raise notice '';
  raise notice 'LECTURE DE SA PROPRE LIGNE admin_access — indispensable a la connexion';
  for r in select * from (values
      ('viewer@test.local','OK'),('editor@test.local','OK')) as t(who,exp)
  loop perform pg_temp.check_as('select propre ligne', r.who, r.exp, 'read',
    format('select count(*) from public.admin_access where email = %L', r.who)); end loop;

  raise notice '';
  raise notice 'LECTURE DE LA LIGNE D''UN AUTRE — doit rester refusee';
  for r in select * from (values
      ('viewer@test.local','DENY'),('editor@test.local','DENY')) as t(who,exp)
  loop perform pg_temp.check_as('select ligne d''autrui', r.who, r.exp, 'read',
    'select count(*) from public.admin_access where email = ''owner@test.local'''); end loop;

  raise notice '';
  raise notice 'ELEVATION DE PRIVILEGE — s''octroyer le rôle owner';
  for r in select * from (values
      ('viewer@test.local','DENY'),('editor@test.local','DENY'),
      ('admin@test.local','DENY'),('owner@test.local','OK')) as t(who,exp)
  loop perform pg_temp.check_as('insert admin_access owner', r.who, r.exp, 'write',
    format('insert into public.admin_access (email, role, active) values (%L, ''owner'', true)',
           'escalade-' || r.who)); end loop;

  raise notice '';
  raise notice 'ECRITURE activity_log depuis le navigateur — doit être refusée';
  for r in select * from (values
      ('viewer@test.local','DENY'),('editor@test.local','DENY'),
      ('admin@test.local','DENY')) as t(who,exp)
  loop perform pg_temp.check_as('insert activity_log', r.who, r.exp, 'write',
    'insert into public.activity_log (actor_email, event_type) values (''faux@x.fr'', ''connexion_falsifiee'')'); end loop;
end $$;

-- Le site vitrine ne doit PAS avoir été cassé.
do $$
declare n bigint;
begin
  set local role anon;
  select count(*) into n from public.site_settings;
  reset role;
  if n < 1 then raise exception 'ECHEC — lecture publique de site_settings cassée'; end if;
  raise notice '';
  raise notice '  OK    lecture publique site_settings (anon) : % ligne(s)', n;
end $$;

-- Protections d'intégrité (serveur, plus seulement le navigateur).
-- Le test d'élévation ci-dessus a créé un second propriétaire actif : on le
-- retire pour se retrouver réellement dans le cas « dernier propriétaire ».
delete from public.admin_access where email like 'escalade-%';

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

do $$
begin
  begin
    insert into public.admin_access (email, role) values ('bidon@test.local', 'superadmin');
    raise exception 'ECHEC — un rôle inconnu a été accepté';
  exception when check_violation then
    raise notice '  OK    rôle inconnu refusé';
  end;
end $$;

\echo ''
\echo 'MATRICE DE DROITS : toutes les assertions sont passées.'
