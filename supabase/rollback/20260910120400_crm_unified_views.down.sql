-- Rollback de 20260910120400_crm_unified_views.sql
-- Ne supprime que des vues : aucune donnée n'a été déplacée, il n'y a donc
-- rien à restaurer.
drop view if exists public.crm_contacts;
drop view if exists public.crm_timeline;
