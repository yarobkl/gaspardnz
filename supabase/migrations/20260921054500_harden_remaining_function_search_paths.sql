-- Nettoyage sécurité — dernières fonctions signalées par l'avertisseur
-- "function_search_path_mutable" (6 restantes sur les 7 initiales, la 7e
-- ayant déjà été corrigée en remplaçant audit_label lors de la phase 15).
-- Aucune ne change de comportement : seul un search_path explicite est
-- ajouté, en défense en profondeur — aucune n'était en réalité exploitable,
-- chaque appel interne utilisant déjà des noms qualifiés par schéma.
--
-- Les migrations sources (20260910120000, 20260910120200, 20260910120300)
-- ont aussi été corrigées pour qu'une réinstallation depuis zéro parte
-- directement du bon état ; cette migration-ci corrige la base déjà
-- provisionnée, où ces fonctions existent déjà sans ce réglage.
-- Additive et idempotente.

create or replace function private.admin_role_rank(role_name text)
returns integer
language sql
immutable
set search_path = public, pg_temp
as $$
  select case lower(coalesce(role_name, ''))
           when 'owner'  then 4
           when 'admin'  then 3
           when 'editor' then 2
           when 'viewer' then 1
           else 0
         end;
$$;

create or replace function private.has_admin_role(min_role text)
returns boolean
language sql
stable
set search_path = public, pg_temp
as $$
  with ranks as (
    select
      private.admin_role_rank(private.current_admin_role()) as current_rank,
      private.admin_role_rank(min_role) as min_rank
  )
  select min_rank > 0 and current_rank >= min_rank
  from ranks;
$$;

create or replace function private.normalize_admin_email()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  new.email := lower(trim(new.email));
  return new;
end $$;

create or replace function private.audit_is_sensitive(column_name text)
returns boolean
language sql
immutable
set search_path = public, pg_temp
as $$
  select lower(column_name) ~ '(password|passwd|secret|token|api_key|apikey|private_key|credential|authorization|session|otp|hash|salt|signature|smtp)';
$$;

create or replace function private.audit_changed_columns(before_data jsonb, after_data jsonb)
returns text
language sql
immutable
set search_path = public, pg_temp
as $$
  select nullif(string_agg(key, ', ' order by key), '')
  from jsonb_each(after_data)
  where before_data -> key is distinct from after_data -> key
    and key not in ('updated_at');
$$;

create or replace function private.audit_log_append_only()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  raise exception 'activity_log est en ajout seul : % interdit', tg_op
    using errcode = 'insufficient_privilege';
end $$;
