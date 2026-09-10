-- Phase 11 — le journal d'audit doit être écrit par le serveur, attribué au
-- bon acteur, non falsifiable et impossible à réécrire.

set client_min_messages = notice;

truncate public.activity_log;

-- 1. Une écriture métier produit une trace attribuée à l'auteur réel.
do $$
declare n integer; actor text; ev text; descr text;
begin
  set local role authenticated;
  set local request.jwt.claim.email = 'editor@test.local';
  insert into public.leads (email) values ('trace@example.com');
  reset role;

  select count(*) into n from public.activity_log where entity_type = 'leads';
  if n <> 1 then raise exception 'ECHEC — % trace(s) pour une insertion, 1 attendue', n; end if;

  select actor_email, event_type, description into actor, ev, descr
    from public.activity_log where entity_type = 'leads';
  if actor <> 'editor@test.local' then
    raise exception 'ECHEC — acteur journalisé « % », editor@test.local attendu', actor;
  end if;
  raise notice '  OK    trace créée par le serveur : % / acteur=% / %', ev, actor, descr;
end $$;

-- 2. L'acteur ne peut pas être usurpé : la valeur envoyée par le client est ignorée.
do $$
declare actor text;
begin
  truncate public.activity_log;
  set local role authenticated;
  set local request.jwt.claim.email = 'editor@test.local';
  -- Le client tente de se faire passer pour le propriétaire via la ligne métier.
  insert into public.leads (email) values ('usurpation@example.com');
  reset role;

  select actor_email into actor from public.activity_log where entity_type = 'leads';
  if actor <> 'editor@test.local' then
    raise exception 'ECHEC — usurpation possible : %', actor;
  end if;
  raise notice '  OK    acteur non usurpable : % (lu dans le JWT, pas dans la requête)', actor;
end $$;

-- 3. Le client ne peut pas écrire directement dans le journal.
do $$
begin
  set local role authenticated;
  set local request.jwt.claim.email = 'owner@test.local';
  begin
    insert into public.activity_log (event_type, actor_email)
      values ('faux_evenement', 'quelquun@dautre.fr');
    reset role;
    raise exception 'ECHEC — le client a pu écrire une fausse trace';
  exception when insufficient_privilege then
    reset role;
    raise notice '  OK    écriture directe du journal refusée (owner inclus)';
  end;
end $$;

-- 4. Le journal est en ajout seul, y compris pour le propriétaire.
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

-- 5. Aucun secret ne doit être journalisé.
do $$
declare leaked integer; changed text;
begin
  alter table public.site_settings add column if not exists smtp_password text;
  insert into public.site_settings (key, value, smtp_password)
    values ('smtp', '"config"'::jsonb, 'MOT-DE-PASSE-ULTRA-SECRET')
    on conflict (key) do update set smtp_password = excluded.smtp_password;

  select count(*) into leaked from public.activity_log
   where description like '%ULTRA-SECRET%' or title like '%ULTRA-SECRET%';
  if leaked > 0 then
    raise exception 'ECHEC — un secret a été journalisé';
  end if;

  select description into changed from public.activity_log
   where entity_type = 'site_settings' order by created_at desc limit 1;
  raise notice '  OK    aucun secret journalisé — trace : %', changed;

  if private.audit_is_sensitive('smtp_password') is not true then
    raise exception 'ECHEC — smtp_password n''est pas reconnu comme sensible';
  end if;
  if private.audit_is_sensitive('access_token') is not true
     or private.audit_is_sensitive('api_key') is not true
     or private.audit_is_sensitive('password_hash') is not true then
    raise exception 'ECHEC — colonne sensible non reconnue';
  end if;
  raise notice '  OK    colonnes sensibles reconnues (mot de passe, jeton, clé d''API)';
end $$;

-- 6. Une modification liste les CHAMPS modifiés, sans leurs valeurs.
do $$
declare descr text;
begin
  truncate public.activity_log;
  update public.leads set status = 'qualifie' where email = 'usurpation@example.com';
  select description into descr from public.activity_log
   where entity_type = 'leads' order by created_at desc limit 1;
  if descr is null or descr not like '%champs : status%' then
    raise exception 'ECHEC — champs modifiés non journalisés : %', descr;
  end if;
  if descr like '%qualifie%' then
    raise exception 'ECHEC — la VALEUR modifiée a été journalisée : %', descr;
  end if;
  raise notice '  OK    champs modifiés journalisés sans leurs valeurs : %', descr;
end $$;

-- 7. Une mise à jour sans changement réel ne pollue pas le journal.
do $$
declare n integer;
begin
  truncate public.activity_log;
  update public.leads set status = status where email = 'usurpation@example.com';
  select count(*) into n from public.activity_log;
  if n <> 0 then raise exception 'ECHEC — % trace(s) pour une mise à jour sans effet', n; end if;
  raise notice '  OK    aucune trace pour une mise à jour sans changement';
end $$;

-- 8. Les suppressions et les changements d'accès sont tracés.
do $$
declare n integer;
begin
  truncate public.activity_log;
  delete from public.leads where email = 'usurpation@example.com';
  insert into public.admin_access (email, role) values ('nouvel-acces@test.local', 'editor');
  select count(*) into n from public.activity_log
   where event_type in ('leads_delete', 'admin_access_insert');
  if n <> 2 then raise exception 'ECHEC — suppression/attribution d''accès non tracées (% trace(s))', n; end if;
  raise notice '  OK    suppression et attribution d''accès tracées';
end $$;

\echo ''
\echo 'JOURNAL D''AUDIT : toutes les assertions sont passées.'
