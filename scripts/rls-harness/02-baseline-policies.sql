-- Baseline RLS de GaspardNZ reproduite depuis le catalogue PostgreSQL de
-- production en LECTURE SEULE le 2026-09-10.
--
-- Le but n'est plus de simuler une hypothèse pessimiste : le harness rejoue les
-- familles de policies réellement présentes avant les migrations RBAC.

create or replace function private.admin_role_for_current_user()
returns public.admin_role
language sql
stable
security definer
set search_path = public, private
as $$
  select a.role
  from public.admin_access a
  where a.active = true
    and lower(a.email) = lower(coalesce(auth.jwt()->>'email',''))
  limit 1;
$$;

create or replace function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public, private
as $$
  select exists (
    select 1
    from public.admin_access a
    where a.active = true
      and lower(a.email) = lower(coalesce(auth.jwt()->>'email',''))
  );
$$;

-- Lecture admin uniquement.
create policy activity_admin_read on public.activity_log
  as permissive for select to authenticated using (private.is_admin());
create policy analytics_admin_read on public.analytics_events
  as permissive for select to authenticated using (private.is_admin());
create policy audit_admin_read on public.audit_log
  as permissive for select to authenticated using (private.is_admin());
create policy email_events_admin_read on public.email_events
  as permissive for select to authenticated using (private.is_admin());
create policy sessions_admin_read on public.sessions
  as permissive for select to authenticated using (private.is_admin());
create policy visitors_admin_read on public.visitors
  as permissive for select to authenticated using (private.is_admin());

-- admin_access : modèle réellement présent avant durcissement.
create policy admin_access_owner_manage on public.admin_access
  as permissive for all to authenticated
  using (private.admin_role_for_current_user() = 'owner'::public.admin_role)
  with check (private.admin_role_for_current_user() = 'owner'::public.admin_role);
create policy admin_access_self_read on public.admin_access
  as permissive for select to authenticated using (private.is_admin());

-- Tables métier administrables : toute personne présente et active dans
-- admin_access était auparavant traitée comme « admin » sans distinction de rôle.
do $$
declare t text;
begin
  foreach t in array array[
    'bookings','content_albums','crm_notes','customers','email_messages',
    'external_metric_snapshots','integration_settings','leads','media_assets',
    'news_posts','packages','partner_contacts','partners','promotions',
    'site_content','site_settings','style_month','vip_clients','wedding_inspirations'
  ]
  loop
    execute format(
      'create policy %I on public.%I as permissive for all to authenticated using (private.is_admin()) with check (private.is_admin())',
      case t
        when 'content_albums' then 'content_albums_admin_manage'
        when 'external_metric_snapshots' then 'external_metrics_admin_manage'
        when 'media_assets' then 'media_admin_manage'
        when 'news_posts' then 'news_admin_manage'
        when 'vip_clients' then 'vip_admin_manage'
        when 'wedding_inspirations' then 'wedding_admin_manage'
        else t || '_admin_manage'
      end,
      t
    );
  end loop;
end $$;

-- Contenus publics : les policies existantes sont valables pour anon ET
-- authenticated. Elles permettent les lignes publiées (ou toute ligne pour un
-- admin actif).
create policy content_albums_public_read on public.content_albums
  as permissive for select to anon, authenticated
  using (published = true or private.is_admin());
create policy media_public_read on public.media_assets
  as permissive for select to anon, authenticated
  using (published = true or private.is_admin());
create policy news_public_read on public.news_posts
  as permissive for select to anon, authenticated
  using (published = true or private.is_admin());
create policy packages_public_read on public.packages
  as permissive for select to anon, authenticated
  using (published = true or private.is_admin());
create policy partners_public_read on public.partners
  as permissive for select to anon, authenticated
  using (published = true or private.is_admin());
create policy promotions_public_read on public.promotions
  as permissive for select to anon, authenticated
  using (published = true or private.is_admin());
create policy site_content_public_read on public.site_content
  as permissive for select to anon, authenticated
  using (published = true or private.is_admin());
create policy site_settings_public_read on public.site_settings
  as permissive for select to anon, authenticated
  using (is_public = true or private.is_admin());
create policy style_month_public_read on public.style_month
  as permissive for select to anon, authenticated
  using (published = true or private.is_admin());
create policy vip_public_read on public.vip_clients
  as permissive for select to anon, authenticated
  using (published = true or private.is_admin());
create policy wedding_public_read on public.wedding_inspirations
  as permissive for select to anon, authenticated
  using (published = true or private.is_admin());

-- Tables qui ne doivent jamais être exposées au client.
create policy integration_credentials_client_deny on public.integration_credentials
  as permissive for all to anon, authenticated using (false) with check (false);
create policy oauth_states_client_deny on public.oauth_states
  as permissive for all to anon, authenticated using (false) with check (false);
create policy public_rate_limits_deny_all on public.public_rate_limits
  as permissive for all to anon, authenticated using (false) with check (false);

-- Bucket site-media : lecture publique, écriture historiquement ouverte à tout
-- compte actif admin_access via private.is_admin().
create policy site_media_public_read on storage.objects
  as permissive for select to anon, authenticated
  using (bucket_id = 'site-media');
create policy site_media_admin_insert on storage.objects
  as permissive for insert to authenticated
  with check (bucket_id = 'site-media' and private.is_admin());
create policy site_media_admin_update on storage.objects
  as permissive for update to authenticated
  using (bucket_id = 'site-media' and private.is_admin())
  with check (bucket_id = 'site-media' and private.is_admin());
create policy site_media_admin_delete on storage.objects
  as permissive for delete to authenticated
  using (bucket_id = 'site-media' and private.is_admin());
