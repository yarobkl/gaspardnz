-- Commandes sur-mesure : le couturier ne voit que ce qui le concerne.

set client_min_messages = notice;

insert into auth.users (email) values
  ('owner@test.local'), ('editor@test.local'), ('viewer@test.local'),
  ('couturier-a@test.local'), ('couturier-b@test.local')
on conflict (email) do nothing;

insert into public.admin_access (email, role, active) values
  ('owner@test.local',      'owner',  true),
  ('editor@test.local',     'editor', true),
  ('viewer@test.local',     'viewer', true),
  ('couturier-a@test.local','couturier', true),
  ('couturier-b@test.local','couturier', true)
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

-- 1. La création d'une commande est réservée au personnel (editor et plus).
do $$
declare r record;
begin
  raise notice '';
  raise notice 'CRÉATION d''une commande — editor et plus uniquement';
  for r in select * from (values
      ('owner@test.local','OK'),('editor@test.local','OK'),
      ('viewer@test.local','DENY'),('couturier-a@test.local','DENY')) as t(who,exp)
  loop perform pg_temp.check_as('insert commande', r.who, r.exp, 'write', format(
    'insert into public.tailoring_orders (client_name, tailor_email, measurements, created_by)
     values (''Client %s'', ''couturier-a@test.local'', ''{"tour_poitrine":102}''::jsonb, %L)',
    replace(r.who, '@', '-'), r.who)); end loop;
end $$;

-- Deux commandes réelles pour la suite : une pour chaque couturier.
insert into public.tailoring_orders (client_name, client_phone, tailor_email, measurements, notes, created_by)
values ('Client de A', '0600000001', 'couturier-a@test.local',
        '{"tour_poitrine":102,"tour_taille":88}'::jsonb, 'Costume trois pièces', 'owner@test.local');
insert into public.tailoring_orders (client_name, client_phone, tailor_email, measurements, notes, created_by)
values ('Client de B', '0600000002', 'couturier-b@test.local',
        '{"tour_poitrine":98,"tour_taille":84}'::jsonb, 'Smoking', 'owner@test.local');

-- 2. Numéro de commande généré, unique, au bon format.
do $$
declare n1 text; n2 text;
begin
  select order_number into n1 from public.tailoring_orders where client_name = 'Client de A';
  select order_number into n2 from public.tailoring_orders where client_name = 'Client de B';
  if n1 is null or n2 is null then raise exception 'ECHEC — numéro de commande non généré'; end if;
  if n1 = n2 then raise exception 'ECHEC — deux commandes partagent le même numéro : %', n1; end if;
  if n1 !~ '^CMD-\d{4}-\d{4}$' then raise exception 'ECHEC — format inattendu : %', n1; end if;
  raise notice '';
  raise notice '  OK    numéros générés et uniques : % / %', n1, n2;
end $$;

-- 3. Chaque couturier ne voit QUE sa propre commande.
do $$
declare r record;
begin
  raise notice '';
  raise notice 'LECTURE — un couturier ne voit que ses commandes assignées';
  for r in select * from (values
      ('couturier-a@test.local','OK'),('couturier-b@test.local','DENY')) as t(who,exp)
  loop perform pg_temp.check_as('select commande de A', r.who, r.exp, 'read',
    'select count(*) from public.tailoring_orders where client_name = ''Client de A'''); end loop;

  for r in select * from (values
      ('couturier-a@test.local','DENY'),('couturier-b@test.local','OK')) as t(who,exp)
  loop perform pg_temp.check_as('select commande de B', r.who, r.exp, 'read',
    'select count(*) from public.tailoring_orders where client_name = ''Client de B'''); end loop;

  raise notice '';
  raise notice 'LECTURE — le personnel voit toutes les commandes';
  for r in select * from (values
      ('owner@test.local','OK'),('editor@test.local','OK'),('viewer@test.local','DENY')) as t(who,exp)
  loop perform pg_temp.check_as('select toutes commandes', r.who, r.exp, 'read',
    'select count(*) from public.tailoring_orders'); end loop;
end $$;

-- 4. Un couturier peut faire avancer SA commande...
do $$
begin
  set local role authenticated;
  set local request.jwt.claim.email = 'couturier-a@test.local';
  update public.tailoring_orders set status = 'en_cours' where client_name = 'Client de A';
  reset role;
end $$;

do $$
declare started timestamptz; st text;
begin
  select status, started_at into st, started from public.tailoring_orders where client_name = 'Client de A';
  if st <> 'en_cours' then raise exception 'ECHEC — statut non mis à jour : %', st; end if;
  if started is null then raise exception 'ECHEC — started_at non horodaté automatiquement'; end if;
  raise notice '';
  raise notice '  OK    couturier fait avancer sa commande, started_at horodaté automatiquement';
end $$;

-- ...mais JAMAIS celle d'un autre couturier.
do $$
declare n integer;
begin
  set local role authenticated;
  set local request.jwt.claim.email = 'couturier-b@test.local';
  update public.tailoring_orders set status = 'terminee' where client_name = 'Client de A';
  get diagnostics n = row_count;
  reset role;
  if n <> 0 then raise exception 'ECHEC — un couturier a modifié la commande d''un autre'; end if;
  raise notice '  OK    un couturier ne peut pas toucher la commande d''un autre';
end $$;

-- 5. Un couturier ne peut PAS modifier les mesures, les coordonnées client, ni
--    réassigner la commande — même en l'incluant explicitement dans sa propre
--    requête UPDATE. Le trigger doit silencieusement les restaurer.
do $$
declare mesures jsonb; nom text; assign text;
begin
  set local role authenticated;
  set local request.jwt.claim.email = 'couturier-a@test.local';
  update public.tailoring_orders
    set measurements = '{"tour_poitrine":999}'::jsonb,
        client_name = 'Nom falsifié',
        tailor_email = 'couturier-b@test.local',
        tailor_notes = 'Ajustement au niveau des épaules'
    where client_name = 'Client de A';
  reset role;

  select measurements, client_name, tailor_email into mesures, nom, assign
    from public.tailoring_orders where tailor_notes = 'Ajustement au niveau des épaules';

  if mesures->>'tour_poitrine' <> '102' then
    raise exception 'ECHEC — les mesures ont pu être modifiées par le couturier : %', mesures;
  end if;
  if nom <> 'Client de A' then raise exception 'ECHEC — le nom du client a pu être modifié : %', nom; end if;
  if assign <> 'couturier-a@test.local' then raise exception 'ECHEC — la commande a pu être réassignée : %', assign; end if;
  raise notice '';
  raise notice '  OK    mesures, client et affectation protégés — seule tailor_notes a changé';
end $$;

-- 6. Personne ne peut supprimer une commande (aucune politique delete).
do $$
declare n integer;
begin
  set local role authenticated;
  set local request.jwt.claim.email = 'owner@test.local';
  begin
    delete from public.tailoring_orders where client_name = 'Client de B';
    reset role;
    raise exception 'ECHEC — une commande a pu être supprimée, y compris par le propriétaire';
  exception when insufficient_privilege then
    reset role;
    raise notice '';
    raise notice '  OK    suppression refusée pour tout le monde, propriétaire inclus';
  end;
end $$;

-- 7. Passage à "terminee" horodate completed_at, et laisse une trace d'audit
--    non falsifiable attribuée au bon acteur.
do $$
begin
  set local role authenticated;
  set local request.jwt.claim.email = 'couturier-b@test.local';
  update public.tailoring_orders set status = 'terminee' where client_name = 'Client de B';
  reset role;
end $$;

do $$
declare completed timestamptz; logged text; descr text;
begin
  select completed_at into completed from public.tailoring_orders where client_name = 'Client de B';
  if completed is null then raise exception 'ECHEC — completed_at non horodaté'; end if;

  -- La description liste les NOMS des champs changés, jamais leur valeur
  -- (choix délibéré de l'audit, pour ne jamais journaliser une donnée
  -- sensible) : on vérifie donc que "status" y figure, pas "terminee".
  select actor_email, description into logged, descr from public.activity_log
   where entity_type = 'tailoring_orders' and description like '%status%'
   order by created_at desc limit 1;
  if logged is distinct from 'couturier-b@test.local' then
    raise exception 'ECHEC — acteur non journalisé correctement : % (trace : %)', logged, descr;
  end if;
  raise notice '';
  raise notice '  OK    completed_at horodaté, validation journalisée pour % (%)', logged, descr;
end $$;

\echo ''
\echo 'COMMANDES SUR-MESURE : toutes les assertions sont passées.'
