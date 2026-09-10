-- Phase 10 — RBAC : application des rôles via politiques RESTRICTIVES.
--
-- Pourquoi restrictives et non permissives :
-- les politiques PERMISSIVES se combinent en OU. Ajouter une politique
-- permissive « il faut être editor » à côté d'une politique existante
-- « il faut être admin » n'interdit RIEN : la première suffit toujours.
-- Les politiques RESTRICTIVES se combinent en ET : elles ne peuvent que
-- restreindre. Cette migration RESSERRE donc l'accès sans avoir à supprimer
-- ni même à connaître les politiques déjà en place — ce qui la rend sûre,
-- additive et réversible.
--
-- Rollback : supabase/rollback/20260910120100_*.sql (drop des politiques créées ici)
-- Prérequis : 20260910120000_rbac_role_functions.sql

do $$
declare
  spec record;
begin
  for spec in
    select * from (values
      -- table,            rôle mini écriture, rôle mini lecture
      ('leads',            'editor', 'viewer'),
      ('bookings',         'editor', 'viewer'),
      ('crm_notes',        'editor', 'viewer'),
      ('email_messages',   'admin',  'viewer'),
      ('site_settings',    'admin',  'viewer'),
      ('site_content',     'editor', 'viewer'),
      ('activity_log',     'owner',  'admin')
    ) as t(table_name, write_role, read_role)
  loop
    if to_regclass('public.' || spec.table_name) is null then
      raise notice 'table publique % absente, ignorée', spec.table_name;
      continue;
    end if;

    -- Lecture : rôle minimal requis. `anon` n'est pas visé par ces politiques,
    -- la lecture publique du site vitrine reste donc inchangée.
    execute format('drop policy if exists %I on public.%I',
                   'rbac_read_' || spec.table_name, spec.table_name);
    execute format(
      'create policy %I on public.%I as restrictive for select to authenticated
         using (private.has_admin_role(%L))',
      'rbac_read_' || spec.table_name, spec.table_name, spec.read_role);

    -- Écritures : un rang strictement plus élevé.
    execute format('drop policy if exists %I on public.%I',
                   'rbac_write_' || spec.table_name, spec.table_name);
    execute format(
      'create policy %I on public.%I as restrictive for insert to authenticated
         with check (private.has_admin_role(%L))',
      'rbac_write_' || spec.table_name, spec.table_name, spec.write_role);

    execute format('drop policy if exists %I on public.%I',
                   'rbac_update_' || spec.table_name, spec.table_name);
    execute format(
      'create policy %I on public.%I as restrictive for update to authenticated
         using (private.has_admin_role(%L)) with check (private.has_admin_role(%L))',
      'rbac_update_' || spec.table_name, spec.table_name, spec.write_role, spec.write_role);

    execute format('drop policy if exists %I on public.%I',
                   'rbac_delete_' || spec.table_name, spec.table_name);
    execute format(
      'create policy %I on public.%I as restrictive for delete to authenticated
         using (private.has_admin_role(%L))',
      'rbac_delete_' || spec.table_name, spec.table_name, spec.write_role);
  end loop;
end $$;

-- admin_access : la gestion des accès est réservée aux rôles élevés.
-- Lecture : admin et plus. Écriture : owner uniquement.
do $$
begin
  if to_regclass('public.admin_access') is null then
    raise notice 'table admin_access absente, ignorée';
    return;
  end if;

  -- Lecture : la liste complète est réservée aux rôles admin et plus.
  -- MAIS chaque compte doit pouvoir lire SA PROPRE ligne : la connexion elle-même
  -- en dépend (getAccessProfile lit admin_access pour établir le profil). Sans
  -- cette exception, les rôles viewer et editor ne pourraient plus se connecter
  -- du tout.
  drop policy if exists rbac_read_admin_access on public.admin_access;
  create policy rbac_read_admin_access on public.admin_access
    as restrictive for select to authenticated
    using (private.has_admin_role('admin') or email = lower(auth.email()));

  drop policy if exists rbac_write_admin_access on public.admin_access;
  create policy rbac_write_admin_access on public.admin_access
    as restrictive for insert to authenticated
    with check (private.has_admin_role('owner'));

  drop policy if exists rbac_update_admin_access on public.admin_access;
  create policy rbac_update_admin_access on public.admin_access
    as restrictive for update to authenticated
    using (private.has_admin_role('owner'))
    with check (private.has_admin_role('owner'));

  drop policy if exists rbac_delete_admin_access on public.admin_access;
  create policy rbac_delete_admin_access on public.admin_access
    as restrictive for delete to authenticated
    using (private.has_admin_role('owner'));
end $$;
