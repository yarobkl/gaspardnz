-- Phase 11 — Journal d'audit écrit par le serveur.
--
-- Aligné sur le vrai schéma de production : activity_log.entity_id est TEXT,
-- pas UUID. Le journal accepte donc les UUID mais aussi les clés textuelles
-- (site_settings.key, provider, slug...) sans cast destructeur.
--
-- L'acteur vient du JWT ; le navigateur n'écrit jamais directement le journal.
-- Additive et idempotente. Ne réécrit aucune ligne existante.
-- Rollback : supabase/rollback/20260910120300_audit_log_server_side.down.sql
-- Prérequis : 20260910120000_rbac_role_functions.sql

create or replace function private.audit_is_sensitive(column_name text)
returns boolean
language sql
immutable
as $$
  select lower(column_name) ~ '(password|passwd|secret|token|api_key|apikey|private_key|credential|authorization|session|otp|hash|salt|signature|smtp)';
$$;

create or replace function private.audit_label(row_data jsonb)
returns text
language plpgsql
immutable
as $$
declare
  candidate text;
  col       text;
begin
  foreach col in array array['title','full_name','display_name','name','label','key','email','provider']
  loop
    if private.audit_is_sensitive(col) then continue; end if;
    candidate := nullif(trim(row_data ->> col), '');
    if candidate is not null then
      return left(candidate, 120);
    end if;
  end loop;
  return null;
end $$;

-- Noms des colonnes modifiées uniquement ; aucune valeur n'est copiée.
create or replace function private.audit_changed_columns(before_data jsonb, after_data jsonb)
returns text
language sql
immutable
as $$
  select nullif(string_agg(key, ', ' order by key), '')
  from jsonb_each(after_data)
  where before_data -> key is distinct from after_data -> key
    and key not in ('updated_at');
$$;

create or replace function private.audit_row_change()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  before_data jsonb := case when tg_op in ('UPDATE','DELETE') then to_jsonb(old) end;
  after_data  jsonb := case when tg_op in ('INSERT','UPDATE') then to_jsonb(new) end;
  subject     jsonb := coalesce(after_data, before_data);
  actor       text  := lower(nullif(auth.email(), ''));
  label       text  := private.audit_label(subject);
  changed     text;
  description text;
  subject_id  text;
begin
  if tg_op = 'UPDATE' then
    changed := private.audit_changed_columns(before_data, after_data);
    if changed is null then return new; end if;
  end if;

  description := coalesce(label, '(sans libellé)')
                 || case when changed is not null then ' — champs : ' || changed else '' end;

  -- activity_log.entity_id est text en production. On privilégie id, puis une
  -- clé métier stable lorsqu'une table (site_settings) n'a pas de colonne id.
  subject_id := coalesce(
    nullif(subject ->> 'id', ''),
    nullif(subject ->> 'key', ''),
    nullif(subject ->> 'slug', ''),
    nullif(subject ->> 'provider', '')
  );

  insert into public.activity_log (event_type, entity_type, entity_id, title, description, actor_email)
  values (
    tg_table_name || '_' || lower(tg_op),
    tg_table_name,
    subject_id,
    case tg_op
      when 'INSERT' then 'Création'
      when 'UPDATE' then 'Modification'
      when 'DELETE' then 'Suppression'
    end || ' — ' || tg_table_name,
    left(description, 500),
    coalesce(actor, '(hors session)')
  );

  return case when tg_op = 'DELETE' then old else new end;
end $$;

create or replace function private.audit_log_append_only()
returns trigger
language plpgsql
as $$
begin
  raise exception 'activity_log est en ajout seul : % interdit', tg_op
    using errcode = 'insufficient_privilege';
end $$;

do $$
declare t text;
begin
  if to_regclass('public.activity_log') is null then
    raise notice 'activity_log absente : audit non installé';
    return;
  end if;

  drop trigger if exists activity_log_append_only on public.activity_log;
  create trigger activity_log_append_only
    before update or delete on public.activity_log
    for each row execute function private.audit_log_append_only();

  -- Tables réellement modifiables par l'admin dans le schéma production.
  -- Les tables de télémétrie automatique (analytics_events, sessions,
  -- visitors, email_events, external_metric_snapshots) sont volontairement
  -- exclues pour éviter un journal bruyant alimenté par les synchronisations.
  foreach t in array array[
    'leads','bookings','customers','crm_notes','email_messages',
    'promotions','site_settings','site_content','admin_access','media_assets',
    'content_albums','packages','partners','partner_contacts','news_posts',
    'vip_clients','wedding_inspirations','style_month','integration_settings'
  ]
  loop
    if to_regclass('public.' || t) is null then
      raise notice 'table % absente, audit ignoré', t;
      continue;
    end if;
    execute format('drop trigger if exists %I on public.%I', 'audit_' || t, t);
    execute format(
      'create trigger %I after insert or update or delete on public.%I
         for each row execute function private.audit_row_change()',
      'audit_' || t, t);
  end loop;
end $$;

-- Le client ne doit jamais écrire/modifier/supprimer le journal.
do $$
begin
  if to_regclass('public.activity_log') is null then return; end if;

  drop policy if exists rbac_write_activity_log on public.activity_log;
  drop policy if exists rbac_update_activity_log on public.activity_log;
  drop policy if exists rbac_delete_activity_log on public.activity_log;
  drop policy if exists audit_no_client_insert on public.activity_log;
  drop policy if exists audit_no_client_update on public.activity_log;
  drop policy if exists audit_no_client_delete on public.activity_log;

  create policy audit_no_client_insert on public.activity_log
    as restrictive for insert to authenticated with check (false);
  create policy audit_no_client_update on public.activity_log
    as restrictive for update to authenticated using (false);
  create policy audit_no_client_delete on public.activity_log
    as restrictive for delete to authenticated using (false);
end $$;
