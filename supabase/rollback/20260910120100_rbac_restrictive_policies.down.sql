-- Rollback de 20260910120100_rbac_restrictive_policies.sql
-- Supprime uniquement les politiques créées par cette migration : les
-- politiques préexistantes ne sont pas touchées, l'accès revient donc
-- exactement à son état antérieur.
do $$
declare t text;
begin
  foreach t in array array['leads','bookings','crm_notes','site_settings',
                           'site_content','activity_log','admin_access']
  loop
    if to_regclass('public.' || t) is null then continue; end if;
    execute format('drop policy if exists %I on public.%I', 'rbac_read_'   || t, t);
    execute format('drop policy if exists %I on public.%I', 'rbac_write_'  || t, t);
    execute format('drop policy if exists %I on public.%I', 'rbac_update_' || t, t);
    execute format('drop policy if exists %I on public.%I', 'rbac_delete_' || t, t);
  end loop;
end $$;
