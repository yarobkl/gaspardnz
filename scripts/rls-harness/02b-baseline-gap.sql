-- Démonstration du problème AVANT correctif avec la baseline RLS réelle.
--
-- La production protège déjà admin_access : seul un owner peut gérer les
-- comptes. La faille n'est donc PAS une auto-promotion viewer -> owner.
-- Le vrai problème est que private.is_admin() traite viewer/editor/admin/owner
-- de la même façon sur les autres tables et sur le bucket site-media.

set client_min_messages = notice;

insert into auth.users (email) values ('viewer@test.local') on conflict (email) do nothing;
insert into public.admin_access (email, role, active)
  values ('viewer@test.local', 'viewer', true)
  on conflict (email) do update set role = 'viewer', active = true;

do $$
declare n integer;
begin
  set local role authenticated;
  set local request.jwt.claim.email = 'viewer@test.local';

  insert into public.leads (email) values ('ecrit-par-un-viewer@example.com');
  get diagnostics n = row_count;
  if n = 0 then raise exception 'fixture inattendue'; end if;
  raise notice '  AVANT : un viewer a pu écrire dans leads';

  insert into public.media_assets (section_key, public_url, title)
    values ('test', 'https://example.invalid/test.jpg', 'écrit par viewer');
  get diagnostics n = row_count;
  if n = 0 then raise exception 'fixture inattendue'; end if;
  raise notice '  AVANT : un viewer a pu écrire dans media_assets';

  insert into storage.objects (bucket_id, name)
    values ('site-media', 'viewer/attaque.jpg');
  get diagnostics n = row_count;
  if n = 0 then raise exception 'fixture inattendue'; end if;
  raise notice '  AVANT : un viewer a pu écrire dans le bucket site-media';

  -- Contrôle important : admin_access était déjà protégé en production.
  begin
    insert into public.admin_access (email, role, active)
      values ('viewer-devenu-owner@test.local', 'owner', true);
    raise exception 'FIXTURE FAUSSE — le viewer a pu écrire admin_access alors que la production le refuse';
  exception
    when insufficient_privilege or check_violation then
      raise notice '  AVANT : admin_access reste correctement réservé au owner';
  end;

  reset role;
end $$;

-- Nettoyage de la fixture en superuser avant d'appliquer les migrations.
delete from public.leads where email = 'ecrit-par-un-viewer@example.com';
delete from public.media_assets where title = 'écrit par viewer';
delete from storage.objects where name = 'viewer/attaque.jpg';
