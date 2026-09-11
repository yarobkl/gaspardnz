-- Rollback de 20260910120000_rbac_role_functions.sql
-- À n'exécuter qu'APRÈS le rollback des politiques qui en dépendent.
drop function if exists private.has_admin_role(text);
drop function if exists private.current_admin_role();
drop function if exists private.admin_role_rank(text);
