-- Démonstration du problème AVANT correctif.
--
-- Avec la seule politique permissive « est-ce un admin ? », le rôle stocké dans
-- admin_access n'a aucun effet : un compte `viewer` peut écrire partout et
-- s'octroyer le rôle `owner`. C'est ce que la phase 10 doit fermer.

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

  insert into public.admin_access (email, role, active)
    values ('viewer-devenu-owner@test.local', 'owner', true);
  get diagnostics n = row_count;
  if n = 0 then raise exception 'fixture inattendue'; end if;
  raise notice '  AVANT : un viewer a pu créer un compte OWNER (élévation de privilège)';

  reset role;
end $$;

-- On remet la base dans l'état attendu par la suite des tests.
delete from public.admin_access where email = 'viewer-devenu-owner@test.local';
delete from public.leads where email = 'ecrit-par-un-viewer@example.com';
