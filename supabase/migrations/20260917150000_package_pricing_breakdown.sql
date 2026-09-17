-- Phase 16 — Détail des formules éditable depuis l'admin.
--
-- Le détail des formules (postes, prix, sous-totaux) était codé en dur dans
-- FormulesSection.jsx : seul un développeur pouvait le changer, et un champ
-- "Prix" existait déjà dans l'admin sans être connecté à ce détail — un
-- changement là-bas aurait affiché un total différent de la somme réelle.
--
-- Ici : chaque formule (packages) peut avoir des menus (package_groups, ex.
-- "Look Mairie") contenant des articles (package_items, ex. "Costume" à
-- 449€). Le sous-total et le total ne sont JAMAIS stockés : ils se calculent
-- toujours en sommant les articles, côté client (admin et site public), donc
-- aucune incohérence n'est possible entre le résumé et le détail.
--
-- Une formule supprimée par erreur doit pouvoir être restaurée : suppression
-- douce via packages.deleted_at, jamais de DELETE depuis l'interface.
--
-- Additive et idempotente. Aucune donnée existante touchée : le backfill des
-- deux formules déjà en ligne (Prestige, Gaspard NZ) ne s'exécute que si
-- elles n'ont pas déjà de menus, donc rejouable sans dupliquer.
-- Rollback : supabase/rollback/20260917150000_*.sql
-- Prérequis : 20260910120000_rbac_role_functions.sql,
--             20260910120300_audit_log_server_side.sql

alter table public.packages add column if not exists deleted_at timestamptz;

-- Une formule mise à la corbeille ne doit plus apparaître côté public, même
-- si elle est restée "published" (on ne force pas l'utilisateur à dépublier
-- avant de supprimer : les deux réglages sont indépendants).
drop policy if exists packages_public_read on public.packages;
create policy packages_public_read on public.packages
  as permissive for select to anon, authenticated
  using ((published = true and deleted_at is null) or private.is_admin());

create table if not exists public.package_groups (
  id uuid primary key default gen_random_uuid(),
  package_id uuid not null references public.packages(id) on delete cascade,
  label text not null,
  tag text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.package_items (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.package_groups(id) on delete cascade,
  label text not null,
  price numeric,
  price_is_from boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists package_groups_package_id_idx on public.package_groups(package_id);
create index if not exists package_items_group_id_idx on public.package_items(group_id);

alter table public.package_groups enable row level security;
alter table public.package_items enable row level security;

-- Le personnel (editor et plus) gère tout, y compris la suppression d'un
-- menu ou d'un article isolé (peu coûteux à retaper) — seule la suppression
-- d'une FORMULE ENTIÈRE passe par la corbeille (packages.deleted_at), gérée
-- côté application, pas par une politique RLS.
grant select, insert, update, delete on public.package_groups to authenticated;
grant select, insert, update, delete on public.package_items to authenticated;
grant select on public.package_groups to anon;
grant select on public.package_items to anon;

drop policy if exists package_groups_public_read on public.package_groups;
create policy package_groups_public_read on public.package_groups
  for select to anon
  using (exists (
    select 1 from public.packages p
    where p.id = package_groups.package_id and p.published = true and p.deleted_at is null
  ));

drop policy if exists package_groups_staff_select on public.package_groups;
create policy package_groups_staff_select on public.package_groups
  for select to authenticated using (private.has_admin_role('viewer'));

drop policy if exists package_groups_staff_insert on public.package_groups;
create policy package_groups_staff_insert on public.package_groups
  for insert to authenticated with check (private.has_admin_role('editor'));

drop policy if exists package_groups_staff_update on public.package_groups;
create policy package_groups_staff_update on public.package_groups
  for update to authenticated using (private.has_admin_role('editor')) with check (private.has_admin_role('editor'));

drop policy if exists package_groups_staff_delete on public.package_groups;
create policy package_groups_staff_delete on public.package_groups
  for delete to authenticated using (private.has_admin_role('editor'));

drop policy if exists package_items_public_read on public.package_items;
create policy package_items_public_read on public.package_items
  for select to anon
  using (exists (
    select 1 from public.package_groups g
    join public.packages p on p.id = g.package_id
    where g.id = package_items.group_id and p.published = true and p.deleted_at is null
  ));

drop policy if exists package_items_staff_select on public.package_items;
create policy package_items_staff_select on public.package_items
  for select to authenticated using (private.has_admin_role('viewer'));

drop policy if exists package_items_staff_insert on public.package_items;
create policy package_items_staff_insert on public.package_items
  for insert to authenticated with check (private.has_admin_role('editor'));

drop policy if exists package_items_staff_update on public.package_items;
create policy package_items_staff_update on public.package_items
  for update to authenticated using (private.has_admin_role('editor')) with check (private.has_admin_role('editor'));

drop policy if exists package_items_staff_delete on public.package_items;
create policy package_items_staff_delete on public.package_items
  for delete to authenticated using (private.has_admin_role('editor'));

-- Fonction dédiée (pas de partage avec set_updated_at() déjà utilisée par
-- packages ailleurs) : aucun risque de changer un comportement existant.
create or replace function private.touch_package_pricing_updated_at()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  new.updated_at := now();
  return new;
end $$;

drop trigger if exists package_groups_updated_at on public.package_groups;
create trigger package_groups_updated_at
  before update on public.package_groups
  for each row execute function private.touch_package_pricing_updated_at();

drop trigger if exists package_items_updated_at on public.package_items;
create trigger package_items_updated_at
  before update on public.package_items
  for each row execute function private.touch_package_pricing_updated_at();

-- Traçabilité (qui a changé quel prix, quand), comme le reste de l'admin
-- depuis la phase 11. private.audit_label() reconnaît déjà la colonne
-- "label", aucune modification nécessaire de son côté.
drop trigger if exists audit_package_groups on public.package_groups;
create trigger audit_package_groups
  after insert or update or delete on public.package_groups
  for each row execute function private.audit_row_change();

drop trigger if exists audit_package_items on public.package_items;
create trigger audit_package_items
  after insert or update or delete on public.package_items
  for each row execute function private.audit_row_change();

-- Reprise des deux formules déjà en ligne, pour que la bascule vers cette
-- nouvelle structure n'affiche RIEN de différent sur le site au moment du
-- déploiement. Ne s'exécute que si la formule existe et n'a pas déjà de
-- menus (idempotent, ne duplique jamais).
do $$
declare
  v_package_id uuid;
  v_mairie_id uuid;
  v_soiree_id uuid;
begin
  select id into v_package_id from public.packages where slug = 'prestige';
  if v_package_id is not null and not exists (select 1 from public.package_groups where package_id = v_package_id) then
    insert into public.package_groups (package_id, label, tag, sort_order) values (v_package_id, 'Look Mairie', null, 0) returning id into v_mairie_id;
    insert into public.package_items (group_id, label, price, price_is_from, sort_order) values
      (v_mairie_id, 'Costume coupe droite, croisé ou trois pièces', 449, false, 0),
      (v_mairie_id, 'Chemise', 69, false, 1),
      (v_mairie_id, 'Cravate', 35, false, 2),
      (v_mairie_id, 'Boutons de manchettes', 29, false, 3),
      (v_mairie_id, 'Chaussettes fil d''Écosse', 19, false, 4),
      (v_mairie_id, 'Chaussures (option)', 315, true, 5);

    insert into public.package_groups (package_id, label, tag, sort_order) values (v_package_id, 'Look Soirée', 'Smoking', 1) returning id into v_soiree_id;
    insert into public.package_items (group_id, label, price, price_is_from, sort_order) values
      (v_soiree_id, 'Ensemble smoking', 600, false, 0),
      (v_soiree_id, 'Nœud papillon', 49, false, 1),
      (v_soiree_id, 'Chemise plastron col cassé', 149, false, 2),
      (v_soiree_id, 'Boutons de manchettes', 29, false, 3),
      (v_soiree_id, 'Chaussettes fil d''Écosse', 19, false, 4);
  end if;

  select id into v_package_id from public.packages where slug = 'gnz-signature';
  if v_package_id is not null and not exists (select 1 from public.package_groups where package_id = v_package_id) then
    insert into public.package_groups (package_id, label, tag, sort_order) values (v_package_id, 'Look Mairie', null, 0) returning id into v_mairie_id;
    insert into public.package_items (group_id, label, price, price_is_from, sort_order) values
      (v_mairie_id, 'Costume coupe droite, croisé ou trois pièces', 349, false, 0),
      (v_mairie_id, 'Chemise', 60, false, 1),
      (v_mairie_id, 'Cravate', 30, false, 2),
      (v_mairie_id, 'Boutons de manchettes', 20, false, 3),
      (v_mairie_id, 'Chaussettes fil d''Écosse', 19, false, 4),
      (v_mairie_id, 'Chaussures (option)', 315, true, 5);

    insert into public.package_groups (package_id, label, tag, sort_order) values (v_package_id, 'Look Soirée', 'Smoking', 1) returning id into v_soiree_id;
    insert into public.package_items (group_id, label, price, price_is_from, sort_order) values
      (v_soiree_id, 'Ensemble smoking', 449, false, 0),
      (v_soiree_id, 'Nœud papillon', 29, false, 1),
      (v_soiree_id, 'Chemise plastron col cassé', 99, false, 2),
      (v_soiree_id, 'Boutons de manchettes', 20, false, 3),
      (v_soiree_id, 'Chaussettes fil d''Écosse', 15, false, 4);
  end if;
end $$;
