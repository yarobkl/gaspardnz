-- Rollback de 20260921054500_harden_remaining_function_search_paths.sql
--
-- Retire le search_path explicite ajouté sur ces 6 fonctions, revenant à
-- l'état signalé par l'avertisseur Supabase. Ne restaure rien d'autre :
-- aucune donnée ni comportement fonctionnel n'a changé dans la migration
-- d'origine. À n'utiliser qu'en cas de diagnostic exceptionnel — il n'y a
-- normalement aucune raison de vouloir revenir en arrière ici.

create or replace function private.admin_role_rank(role_name text)
returns integer
language sql
immutable
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
as $$
begin
  new.email := lower(trim(new.email));
  return new;
end $$;

create or replace function private.audit_is_sensitive(column_name text)
returns boolean
language sql
immutable
as $$
  select lower(column_name) ~ '(password|passwd|secret|token|api_key|apikey|private_key|credential|authorization|session|otp|hash|salt|signature|smtp)';
$$;

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

create or replace function private.audit_log_append_only()
returns trigger
language plpgsql
as $$
begin
  raise exception 'activity_log est en ajout seul : % interdit', tg_op
    using errcode = 'insufficient_privilege';
end $$;
