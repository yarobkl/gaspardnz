-- Phase 11 — journal d'audit serveur : acteur, intégrité, types production.

set client_min_messages = notice;

truncate public.activity_log;

-- 1. Une écriture métier autorisée produit une trace attribuée au JWT réel.
do $$
declare n integer; actor text; ev text; descr text; entity text;
begin
  set local role authenticated;
  set local request.jwt.claim.email = 'admin@test.local';
  insert into public.leads (email) values ('trace@example.com');
  reset role;

  select count(*) into n from public.activity_log where entity_type = 'leads';
  if n <> 1 then raise exception 'ECHEC — % trace(s) pour une insertion, 1 attendue', n; end if;

  select actor_email, event_type, description, entity_id into actor, ev, descr, entity
    from public.activity_log where entity_type = 'leads';
  if actor <> 'admin@test.local' then
    raise exception 'ECHEC — acteur journalisé « % », admin@test.local attendu', actor;
  end if;
  if entity is null or entity = '' then
    raise exception 'ECHEC — entity_id absent';
  end if;
  raise notice '  OK    trace serveur : % / acteur=% / entity_id=%', ev, actor, entity;
end $$;

-- 2. L'acteur ne peut pas être usurpé.
do $$
declare actor text;
begin
  truncate public.activity_log;
  set local role authenticated;
  set local request.jwt.claim.email = 'admin@test.local';
  insert into public.leads (email) values ('usurpation@example.com');
  reset role;

  select actor_email into actor from public.activity_log where entity_type = 'leads';
  if actor <> 'admin@test.local' then
    raise exception 'ECHEC — usurpation possible : %', actor;
  end if;
  raise notice '  OK    acteur non usurpable : %', actor;
end $$;

-- 3. Même owner ne peut pas écrire directement dans activity_log.
do $$
begin
  set local role authenticated;
  set local request.jwt.claim.email = 'owner@test.local';
  begin
    insert into public.activity_log (event_type, title, actor_email)
      values ('faux_evenement', 'Fausse trace', 'quelquun@dautre.fr');
    reset role;
    raise exception 'ECHEC — le client a pu écrire une fausse trace';
  exception when insufficient_privilege then
    reset role;
    raise notice '  OK    écriture directe du journal refusée (owner inclus)';
  end;
end $$;

-- 4. Ajout seul, y compris pour le propriétaire de la table.
do $$
begin
  begin
    update public.activity_log set description = 'reecrit';
    raise exception 'ECHEC — une trace a pu être réécrite';
  exception when insufficient_privilege then
    raise notice '  OK    réécriture du journal refusée';
  end;
  begin
    delete from public.activity_log;
    raise exception 'ECHEC — une trace a pu être supprimée';
  exception when insufficient_privilege then
    raise notice '  OK    suppression du journal refusée';
  end;
end $$;

-- 5. Aucun secret dans description/title.
do $$
declare leaked integer; changed text;
begin
  alter table public.site_settings add column if not exists smtp_password text;
  insert into public.site_settings (key, value, smtp_password)
    values ('smtp', '"config"'::jsonb, 'MOT-DE-PASSE-ULTRA-SECRET')
    on conflict (key) do update set smtp_password = excluded.smtp_password;

  select count(*) into leaked from public.activity_log
   where description like '%ULTRA-SECRET%' or title like '%ULTRA-SECRET%';
  if leaked > 0 then raise exception 'ECHEC — un secret a été journalisé'; end if;

  select description into changed from public.activity_log
   where entity_type = 'site_settings' order by created_at desc limit 1;
  if changed is null then raise exception 'ECHEC — site_settings non auditée'; end if;

  if private.audit_is_sensitive('smtp_password') is not true
     or private.audit_is_sensitive('access_token') is not true
     or private.audit_is_sensitive('api_key') is not true
     or private.audit_is_sensitive('password_hash') is not true then
    raise exception 'ECHEC — colonne sensible non reconnue';
  end if;
  raise notice '  OK    secrets filtrés — trace : %', changed;
end $$;

-- 6. Une modification liste seulement les NOMS des champs modifiés.
do $$
declare descr text;
begin
  truncate public.activity_log;
  update public.leads set status = 'qualified' where email = 'usurpation@example.com';
  select description into descr from public.activity_log
   where entity_type = 'leads' order by created_at desc limit 1;
  if descr is null or descr not like '%champs : status%' then
    raise exception 'ECHEC — champs modifiés non journalisés : %', descr;
  end if;
  if descr like '%qualified%' then
    raise exception 'ECHEC — la VALEUR modifiée a été journalisée : %', descr;
  end if;
  raise notice '  OK    champs modifiés sans valeurs : %', descr;
end $$;

-- 7. Mise à jour sans changement : aucune trace.
do $$
declare n integer;
begin
  truncate public.activity_log;
  update public.leads set status = status where email = 'usurpation@example.com';
  select count(*) into n from public.activity_log;
  if n <> 0 then raise exception 'ECHEC — % trace(s) pour une mise à jour sans effet', n; end if;
  raise notice '  OK    aucune trace pour une mise à jour sans changement';
end $$;

-- 8. Suppression + changement d'accès tracés.
do $$
declare n integer;
begin
  truncate public.activity_log;
  delete from public.leads where email = 'usurpation@example.com';
  insert into public.admin_access (email, role) values ('nouvel-acces@test.local', 'editor');
  select count(*) into n from public.activity_log
   where event_type in ('leads_delete', 'admin_access_insert');
  if n <> 2 then raise exception 'ECHEC — suppression/accès non tracés (% trace(s))', n; end if;
  raise notice '  OK    suppression et attribution d''accès tracées';
end $$;

-- 9. Clé métier textuelle : site_settings n'a pas d'id, entity_id doit être key.
do $$
declare entity text;
begin
  truncate public.activity_log;
  update public.site_settings set value = '"bronze"'::jsonb where key = 'theme';
  select entity_id into entity from public.activity_log
   where entity_type = 'site_settings' order by created_at desc limit 1;
  if entity is distinct from 'theme' then
    raise exception 'ECHEC — entity_id site_settings = %, theme attendu', entity;
  end if;
  raise notice '  OK    entity_id textuel conservé : %', entity;
end $$;

\echo ''
\echo 'JOURNAL D''AUDIT : toutes les assertions sont passées.'
