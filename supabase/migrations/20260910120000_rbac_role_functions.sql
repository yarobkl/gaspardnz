-- Phase 10 — RBAC : fonctions de rôle.
--
-- Aligné sur le schéma Supabase de production (PostgreSQL 17) :
-- public.admin_access.role est un enum public.admin_role. Les fonctions de
-- politique travaillent volontairement en text après cast explicite afin de
-- rester simples à appeler depuis les policies et de ne jamais dépendre d'un
-- cast implicite enum -> text.
--
-- Additive et idempotente. N'altère aucune donnée.
-- Rollback : supabase/rollback/20260910120000_*.sql

create schema if not exists private;
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

-- Rôle de l'appelant, déduit uniquement du JWT Supabase et d'admin_access.
-- SECURITY DEFINER évite la récursion RLS lors de la lecture d'admin_access.
create or replace function private.current_admin_role()
returns text
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select a.role::text
  from public.admin_access a
  where a.active = true
    and lower(a.email) = lower(coalesce(auth.jwt()->>'email', ''))
  limit 1;
$$;

-- Vrai si l'appelant possède AU MOINS le rôle demandé.
-- Un rôle demandé inconnu ne doit jamais devenir une permission implicite :
-- min_rank = 0 retourne explicitement false.
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

revoke all on function private.admin_role_rank(text) from public, anon;
revoke all on function private.current_admin_role() from public, anon;
revoke all on function private.has_admin_role(text) from public, anon;
grant execute on function private.admin_role_rank(text) to authenticated;
grant execute on function private.current_admin_role() to authenticated;
grant execute on function private.has_admin_role(text) to authenticated;
