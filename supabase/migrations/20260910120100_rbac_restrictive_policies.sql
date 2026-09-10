-- Phase 10 — RBAC : politiques RESTRICTIVES alignées sur la production.
--
-- Les politiques existantes de GaspardNZ sont majoritairement PERMISSIVES et
-- reposent sur private.is_admin(). Elles restent intactes. Les politiques
-- ci-dessous s'ajoutent en ET afin qu'un compte admin actif ne puisse pas
-- dépasser son rôle (viewer < editor < admin < owner).
--
-- Important pour les contenus publics : un utilisateur authenticated qui n'est
-- PAS un compte admin ne doit pas perdre la lecture d'une ligne publique. Les
-- restrictions de SELECT laissent donc passer current_admin_role() IS NULL ;
-- la politique publique existante reste alors l'autorité. Pour un vrai compte
-- admin, la hiérarchie RBAC s'applique.
--
-- Rollback : supabase/rollback/20260910120100_rbac_restrictive_policies.down.sql
-- Prérequis : 20260910120000_rbac_role_functions.sql

do $$
declare
  spec record;
begin
  for spec in
    select * from (values
      -- table                         rôle mini écriture   rôle mini lecture
      ('activity_log',                  null::text,          'viewer'),
      ('analytics_events',              null::text,          'viewer'),
      ('audit_log',                     null::text,          'admin'),
      ('bookings',                      'admin',             'viewer'),
      ('content_albums',                'editor',            'viewer'),
      ('crm_notes',                     'admin',             'viewer'),
      ('customers',                     'admin',             'viewer'),
      ('email_events',                  null::text,          'viewer'),
      ('email_messages',                'admin',             'viewer'),
      ('external_metric_snapshots',     'admin',             'viewer'),
      ('integration_settings',          'admin',             'viewer'),
      ('leads',                         'admin',             'viewer'),
      ('media_assets',                  'editor',            'viewer'),
      ('news_posts',                    'editor',            'viewer'),
      ('packages',                      'editor',            'viewer'),
      ('partner_contacts',              'admin',             'viewer'),
      ('partners',                      'editor',            'viewer'),
      ('promotions',                    'editor',            'viewer'),
      ('sessions',                      null::text,          'viewer'),
      ('site_content',                  'editor',            'viewer'),
      ('site_settings',                 'admin',             'viewer'),
      ('style_month',                   'editor',            'viewer'),
      ('vip_clients',                   'editor',            'viewer'),
      ('visitors',                      null::text,          'viewer'),
      ('wedding_inspirations',          'editor',            'viewer')
    ) as t(table_name, write_role, read_role)
  loop
    if to_regclass('public.' || spec.table_name) is null then
      raise notice 'table publique % absente, ignorée', spec.table_name;
      continue;
    end if;

    execute format('drop policy if exists %I on public.%I',
                   'rbac_read_' || spec.table_name, spec.table_name);
    execute format(
      'create policy %I on public.%I as restrictive for select to authenticated
         using (private.current_admin_role() is null or private.has_admin_role(%L))',
      'rbac_read_' || spec.table_name, spec.table_name, spec.read_role);

    if spec.write_role is not null then
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
    end if;
  end loop;
end $$;

-- admin_access : chaque compte actif peut lire sa propre ligne pour établir son
-- profil. La liste complète est réservée à admin/owner ; toute écriture à owner.
do $$
begin
  if to_regclass('public.admin_access') is null then
    raise notice 'table admin_access absente, ignorée';
    return;
  end if;

  drop policy if exists rbac_read_admin_access on public.admin_access;
  create policy rbac_read_admin_access on public.admin_access
    as restrictive for select to authenticated
    using (
      private.has_admin_role('admin')
      or lower(email) = lower(coalesce(auth.jwt()->>'email', ''))
    );

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

-- Storage : le bucket site-media est public en lecture, mais son écriture est
-- une opération éditoriale. Les anciennes policies utilisaient is_admin(), ce
-- qui permettait à un viewer de téléverser/supprimer des fichiers via REST.
do $$
begin
  if to_regclass('storage.objects') is null then
    raise notice 'storage.objects absente, règles site-media ignorées';
    return;
  end if;

  drop policy if exists rbac_write_site_media on storage.objects;
  create policy rbac_write_site_media on storage.objects
    as restrictive for insert to authenticated
    with check (bucket_id <> 'site-media' or private.has_admin_role('editor'));

  drop policy if exists rbac_update_site_media on storage.objects;
  create policy rbac_update_site_media on storage.objects
    as restrictive for update to authenticated
    using (bucket_id <> 'site-media' or private.has_admin_role('editor'))
    with check (bucket_id <> 'site-media' or private.has_admin_role('editor'));

  drop policy if exists rbac_delete_site_media on storage.objects;
  create policy rbac_delete_site_media on storage.objects
    as restrictive for delete to authenticated
    using (bucket_id <> 'site-media' or private.has_admin_role('editor'));
end $$;
