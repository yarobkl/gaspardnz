-- Phase 15 — Rôle « couturier » (partenaire externe, accès restreint).
--
-- Un couturier sur-mesure n'est pas « un rôle plus faible » dans la hiérarchie
-- owner > admin > editor > viewer : c'est un rôle À PART, qui ne doit voir
-- QUE ses commandes assignées, rien d'autre de l'administration. On le fixe
-- volontairement à un rang de 0 (comme un rôle inconnu) pour qu'il ne
-- satisfasse AUCUNE porte private.has_admin_role('viewer'|'editor'|...) :
-- la visibilité de son propre espace se fait par une vérification dédiée
-- (private.is_couturier()), pas par la hiérarchie linéaire existante.
--
-- Additive et idempotente. N'altère aucune donnée, aucun rôle existant.
-- Rollback : supabase/rollback/20260916210000_*.sql

-- 1. La colonne role est un ENUM natif en production (public.admin_role) :
--    une nouvelle valeur doit d'abord y être ajoutée avant de pouvoir être
--    insérée dans admin_access. ADD VALUE IF NOT EXISTS est idempotent.
--    Ce fichier ne CAST jamais le littéral 'couturier' vers l'enum
--    (comparaisons uniquement en ::text) : la restriction Postgres qui
--    interdit d'utiliser une valeur fraîchement ajoutée dans la MÊME
--    transaction ne s'applique donc jamais ici.
do $$
begin
  if exists (select 1 from pg_type where typname = 'admin_role') then
    alter type public.admin_role add value if not exists 'couturier';
  end if;
end $$;

-- 2. La contrainte existante (admin_access_role_known) exigeait
--    admin_role_rank(role) > 0, ce qui aurait rejeté 'couturier' (rang 0
--    volontaire, voir plus haut). On la remplace par une liste de rôles
--    connus explicite, découplée du rang.
do $$
begin
  if to_regclass('public.admin_access') is null then return; end if;
  alter table public.admin_access drop constraint if exists admin_access_role_known;
  alter table public.admin_access
    add constraint admin_access_role_known
    check (role::text = any (array['owner','admin','editor','viewer','couturier']))
    not valid;
end $$;

-- 3. Vrai si l'appelant est un couturier actif. SECURITY DEFINER pour la même
--    raison que private.current_admin_role() : éviter la récursion RLS.
create or replace function private.is_couturier()
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1 from public.admin_access a
    where a.active = true
      and lower(a.email) = lower(coalesce(auth.jwt()->>'email', ''))
      and a.role::text = 'couturier'
  );
$$;

revoke all on function private.is_couturier() from public, anon;
grant execute on function private.is_couturier() to authenticated;
