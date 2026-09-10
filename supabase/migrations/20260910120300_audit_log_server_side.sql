-- Phase 11 — Journal d'audit écrit par le serveur.
--
-- Aujourd'hui, activity_log est alimenté par DEUX appels depuis le navigateur
-- (src/services/adminData.js), et aucun des deux ne renseigne `actor_email` :
-- le journal ne dit donc pas qui a agi, et son contenu est entièrement choisi
-- par le client — donc falsifiable, et donc sans valeur de preuve. La plupart
-- des opérations sensibles (réservations, paramètres, médias, accès) n'y
-- laissent aucune trace.
--
-- Cette migration déplace l'écriture côté serveur, via des triggers. L'acteur
-- est lu dans le JWT, jamais dans la requête.
--
-- Additive et idempotente. Ne réécrit aucune ligne existante.
-- Rollback : supabase/rollback/20260910120300_*.sql
-- Prérequis : 20260910120000_rbac_role_functions.sql

-- Colonnes dont la valeur ne doit JAMAIS être journalisée.
create or replace function private.audit_is_sensitive(column_name text)
returns boolean
language sql
immutable
as $$
  select lower(column_name) ~ '(password|passwd|secret|token|api_key|apikey|private_key|credential|authorization|session|otp|hash|salt|signature|smtp)';
$$;

-- Libellé lisible d'une ligne, pris dans une liste blanche de colonnes et
-- tronqué. Ne retourne jamais la valeur d'une colonne sensible.
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

-- Noms des colonnes modifiées. Des NOMS uniquement, jamais de valeurs : un
-- diff de valeurs finirait par journaliser des données personnelles ou un
-- secret le jour où une colonne sensible est ajoutée.
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

-- Trigger générique. SECURITY DEFINER : l'écriture du journal doit aboutir même
-- quand les politiques RLS interdisent au client d'écrire dans activity_log —
-- c'est précisément ce qui rend le journal non falsifiable.
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
begin
  if tg_op = 'UPDATE' then
    changed := private.audit_changed_columns(before_data, after_data);
    -- Une mise à jour qui ne change rien n'a pas à être journalisée.
    if changed is null then return new; end if;
  end if;

  description := coalesce(label, '(sans libellé)')
                 || case when changed is not null then ' — champs : ' || changed else '' end;

  insert into public.activity_log (event_type, entity_type, entity_id, title, description, actor_email)
  values (
    tg_table_name || '_' || lower(tg_op),
    tg_table_name,
    nullif(subject ->> 'id', '')::uuid,
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

-- Le journal est en AJOUT SEUL : une trace qu'on peut réécrire ne prouve rien.
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

  foreach t in array array['leads','bookings','promotions','site_settings',
                           'site_content','admin_access','media_assets',
                           'content_albums','crm_notes']
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

-- Le client ne doit plus jamais écrire dans le journal : seuls les triggers le
-- font. Politique restrictive à `false` — elle ne peut que fermer.
do $$
begin
  if to_regclass('public.activity_log') is null then return; end if;
  drop policy if exists rbac_write_activity_log  on public.activity_log;
  drop policy if exists rbac_update_activity_log on public.activity_log;
  drop policy if exists rbac_delete_activity_log on public.activity_log;

  create policy audit_no_client_insert on public.activity_log
    as restrictive for insert to authenticated with check (false);
  create policy audit_no_client_update on public.activity_log
    as restrictive for update to authenticated using (false);
  create policy audit_no_client_delete on public.activity_log
    as restrictive for delete to authenticated using (false);
exception when duplicate_object then
  null;
end $$;
