-- Rollback de 20260917150000_package_pricing_breakdown.sql
--
-- package_groups et package_items sont des tables CRÉÉES par cette migration :
-- les supprimer perd tout menu/article saisi depuis leur mise en service,
-- comme pour toute table introduite par une migration qu'on annule. Aucune
-- donnée de "packages" (les formules elles-mêmes) n'est touchée : seule la
-- colonne deleted_at disparaît, et packages_public_read reprend sa forme
-- d'avant (ne filtrait pas deleted_at, qui n'existait pas).

drop trigger if exists audit_package_items on public.package_items;
drop trigger if exists audit_package_groups on public.package_groups;
drop trigger if exists package_items_updated_at on public.package_items;
drop trigger if exists package_groups_updated_at on public.package_groups;
drop function if exists private.touch_package_pricing_updated_at();

drop table if exists public.package_items;
drop table if exists public.package_groups;

drop policy if exists packages_public_read on public.packages;
create policy packages_public_read on public.packages
  as permissive for select to anon, authenticated
  using (published = true or private.is_admin());

alter table public.packages drop column if exists deleted_at;
