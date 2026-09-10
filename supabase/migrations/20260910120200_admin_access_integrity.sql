-- Phase 10 — Intégrité de admin_access, côté serveur.
--
-- Aujourd'hui, deux règles ne vivent QUE dans le navigateur
-- (src/components/Admin/AdminUsers.jsx) :
--   1. « le dernier propriétaire ne peut pas être désactivé » ;
--   2. le rôle attribué provient d'un <select>, donc d'une valeur choisie par
--      le client, sans validation serveur.
-- Une requête directe vers l'API REST contourne les deux. On les déplace ici.
--
-- Additive : ajoute une contrainte de validation et un trigger. Ne supprime
-- rien, ne réécrit aucune donnée.
-- Rollback : supabase/rollback/20260910120200_*.sql

-- 1. Le rôle doit appartenir au modèle. `not valid` : les lignes existantes ne
--    sont pas revalidées, la migration ne peut donc pas échouer sur l'existant.
do $$
begin
  if to_regclass('public.admin_access') is null then return; end if;
  if not exists (
    select 1 from pg_constraint
    where conname = 'admin_access_role_known' and conrelid = 'public.admin_access'::regclass
  ) then
    alter table public.admin_access
      add constraint admin_access_role_known
      check (private.admin_role_rank(role) > 0) not valid;
  end if;
end $$;

-- 2. Il doit toujours rester au moins un propriétaire actif.
create or replace function private.enforce_last_owner()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  remaining integer;
begin
  -- Ne se déclenche que si la ligne cesse d'être un owner actif.
  if tg_op = 'UPDATE'
     and old.role = 'owner' and old.active
     and (new.role is distinct from 'owner' or not new.active) then
    select count(*) into remaining
      from public.admin_access
     where role = 'owner' and active and id <> old.id;
    if remaining = 0 then
      raise exception 'Le dernier propriétaire actif ne peut pas être retiré ou rétrogradé'
        using errcode = 'check_violation';
    end if;
  end if;

  if tg_op = 'DELETE' and old.role = 'owner' and old.active then
    select count(*) into remaining
      from public.admin_access
     where role = 'owner' and active and id <> old.id;
    if remaining = 0 then
      raise exception 'Le dernier propriétaire actif ne peut pas être supprimé'
        using errcode = 'check_violation';
    end if;
    return old;
  end if;

  return new;
end $$;

do $$
begin
  if to_regclass('public.admin_access') is null then return; end if;
  drop trigger if exists admin_access_last_owner on public.admin_access;
  create trigger admin_access_last_owner
    before update or delete on public.admin_access
    for each row execute function private.enforce_last_owner();
end $$;

-- 3. L'email est normalisé en minuscules : private.current_admin_role() compare
--    à lower(auth.email()), une casse divergente ferait perdre ses droits à un
--    administrateur légitime.
create or replace function private.normalize_admin_email()
returns trigger
language plpgsql
as $$
begin
  new.email := lower(trim(new.email));
  return new;
end $$;

do $$
begin
  if to_regclass('public.admin_access') is null then return; end if;
  drop trigger if exists admin_access_normalize_email on public.admin_access;
  create trigger admin_access_normalize_email
    before insert or update on public.admin_access
    for each row execute function private.normalize_admin_email();
end $$;
