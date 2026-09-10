-- HYPOTHÈSE DE DÉPART, VOLONTAIREMENT PESSIMISTE.
--
-- WORK_PROGRESS.md indique que les 29 tables ont RLS activé, mais le détail des
-- politiques n'a pas pu être relu depuis ce conteneur (aucun accès base).
-- On reproduit donc le cas le plus défavorable et le plus probable au vu du
-- code : une politique PERMISSIVE unique « est-ce un admin ? », sans distinction
-- de rôle. C'est précisément ce que la phase 10 doit corriger.

create or replace function private.is_admin() returns boolean
language sql stable security definer set search_path = public, pg_temp as $$
  select exists (
    select 1 from public.admin_access a
    where a.email = auth.email() and a.active
  );
$$;

do $$
declare t text;
begin
  foreach t in array array['admin_access','leads','bookings','crm_notes',
                           'site_settings','site_content','activity_log']
  loop
    execute format('drop policy if exists %I on public.%I', t || '_admin_all', t);
    execute format(
      'create policy %I on public.%I as permissive for all to authenticated
         using (private.is_admin()) with check (private.is_admin())',
      t || '_admin_all', t);
  end loop;
end $$;

-- Lecture publique du contenu du site (site vitrine).
drop policy if exists site_settings_public_read on public.site_settings;
create policy site_settings_public_read on public.site_settings
  as permissive for select to anon using (true);
drop policy if exists site_content_public_read on public.site_content;
create policy site_content_public_read on public.site_content
  as permissive for select to anon using (true);
