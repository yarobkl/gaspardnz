-- Phase 10 — RBAC : fonctions de rôle.
--
-- Additive et idempotente. N'altère aucune table, ne supprime aucune politique,
-- ne modifie aucune donnée. Rollback : supabase/rollback/20260910120000_*.sql
--
-- Modèle de rôles (rangs croissants) :
--   viewer(1) < editor(2) < admin(3) < owner(4)

create schema if not exists private;

-- Sans USAGE sur le schéma, `authenticated` ne peut pas résoudre le nom des
-- fonctions appelées dans les politiques RLS : toutes les vérifications
-- échoueraient et l'administration deviendrait inaccessible. Le schéma
-- `private` n'est pas exposé par PostgREST, ces fonctions restent donc
-- inatteignables depuis l'API.
grant usage on schema private to authenticated;

-- Rang numérique d'un rôle. Un rôle inconnu ou nul vaut 0 : aucun droit.
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

-- Rôle de l'appelant, déduit de son email JWT et de admin_access.active.
-- SECURITY DEFINER : la lecture de admin_access ne doit pas dépendre des
-- politiques RLS de admin_access, sous peine de récursion infinie.
create or replace function private.current_admin_role()
returns text
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select a.role
  from public.admin_access a
  where a.email = lower(auth.email())
    and a.active
  limit 1;
$$;

-- Vrai si l'appelant possède AU MOINS le rôle demandé.
create or replace function private.has_admin_role(min_role text)
returns boolean
language sql
stable
as $$
  select private.admin_role_rank(private.current_admin_role())
         >= private.admin_role_rank(min_role);
$$;

revoke all on function private.admin_role_rank(text)   from public, anon;
revoke all on function private.current_admin_role()    from public, anon;
revoke all on function private.has_admin_role(text)    from public, anon;
grant execute on function private.admin_role_rank(text) to authenticated;
grant execute on function private.current_admin_role()  to authenticated;
grant execute on function private.has_admin_role(text)  to authenticated;
