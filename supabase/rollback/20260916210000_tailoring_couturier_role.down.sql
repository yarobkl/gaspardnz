-- Rollback de 20260916210000_tailoring_couturier_role.sql
--
-- LIMITE POSTGRESQL CONNUE : il n'existe pas d'ALTER TYPE ... DROP VALUE.
-- Retirer 'couturier' de l'enum admin_role demanderait de recréer le type
-- entièrement (migration destructive, hors du principe additif de ce
-- chantier). Ce rollback restaure donc le comportement précédent (plus
-- personne ne peut se voir attribuer ce rôle, ni en bénéficier) sans
-- supprimer la valeur d'enum elle-même — inoffensive si inutilisée.

do $$
begin
  if to_regclass('public.admin_access') is null then return; end if;
  alter table public.admin_access drop constraint if exists admin_access_role_known;
  alter table public.admin_access
    add constraint admin_access_role_known
    check (private.admin_role_rank(role::text) > 0)
    not valid;
end $$;

drop function if exists private.is_couturier();
