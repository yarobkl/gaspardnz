-- Rollback de 20260910120200_admin_access_integrity.sql
drop trigger if exists admin_access_last_owner on public.admin_access;
drop trigger if exists admin_access_normalize_email on public.admin_access;
drop function if exists private.enforce_last_owner();
drop function if exists private.normalize_admin_email();
alter table public.admin_access drop constraint if exists admin_access_role_known;
