-- Rollback de 20260910120100_rbac_restrictive_policies.sql
-- Supprime uniquement les politiques créées par cette migration : les
-- politiques préexistantes ne sont pas touchées, l'accès revient donc
-- exactement à son état antérieur.
--
-- La liste est DÉDUITE du catalogue plutôt que recopiée : une liste recopiée
-- finit toujours par diverger de la migration (c'est arrivé avec email_messages).
do $$
declare p record;
begin
  for p in
    select schemaname, tablename, policyname
    from pg_policies
    where schemaname = 'public'
      and policyname ~ '^rbac_(read|write|update|delete)_'
  loop
    execute format('drop policy if exists %I on %I.%I', p.policyname, p.schemaname, p.tablename);
  end loop;
end $$;
