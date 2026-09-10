-- Rollback de 20260910120100_rbac_restrictive_policies.sql
-- Supprime uniquement les politiques créées par cette migration, dans public
-- ET storage. Les politiques préexistantes restent intactes.
do $$
declare p record;
begin
  for p in
    select schemaname, tablename, policyname
    from pg_policies
    where policyname ~ '^rbac_(read|write|update|delete)_'
      and schemaname in ('public', 'storage')
  loop
    execute format('drop policy if exists %I on %I.%I', p.policyname, p.schemaname, p.tablename);
  end loop;
end $$;
