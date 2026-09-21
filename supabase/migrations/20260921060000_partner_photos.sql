-- Phase 17 — Photos de prestations par partenaire.
--
-- Chaque partenaire n'avait qu'un seul logo. Pour montrer concrètement le
-- travail d'un prestataire (ex. un pâtissier : photos de gâteaux déjà
-- réalisés), il faut plusieurs photos par partenaire, pas une seule image.
--
-- Cette migration prépare uniquement la structure et l'admin : aucun
-- affichage public n'est branché ici (demande explicite — la galerie reste
-- invisible du site tant que le contenu n'est pas prêt et validé). La
-- politique de lecture publique est ajoutée dès maintenant, gated par
-- partners.published, pour ne pas avoir à retoucher la sécurité plus tard
-- au moment de brancher l'affichage.
--
-- Additive et idempotente. Aucune donnée existante touchée.
-- Rollback : supabase/rollback/20260921060000_*.sql
-- Prérequis : 20260910120000_rbac_role_functions.sql,
--             20260910120300_audit_log_server_side.sql

create table if not exists public.partner_photos (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid not null references public.partners(id) on delete cascade,
  photo_url text not null,
  caption text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists partner_photos_partner_id_idx on public.partner_photos(partner_id);

alter table public.partner_photos enable row level security;

-- Suppression d'une photo individuelle : sans conséquence (il suffit de la
-- réimporter), contrairement à une formule entière — pas de corbeille ici,
-- une suppression normale suffit.
grant select, insert, update, delete on public.partner_photos to authenticated;
grant select on public.partner_photos to anon;

drop policy if exists partner_photos_public_read on public.partner_photos;
create policy partner_photos_public_read on public.partner_photos
  for select to anon
  using (exists (
    select 1 from public.partners p where p.id = partner_photos.partner_id and p.published = true
  ));

drop policy if exists partner_photos_staff_select on public.partner_photos;
create policy partner_photos_staff_select on public.partner_photos
  for select to authenticated using (private.has_admin_role('viewer'));

drop policy if exists partner_photos_staff_insert on public.partner_photos;
create policy partner_photos_staff_insert on public.partner_photos
  for insert to authenticated with check (private.has_admin_role('editor'));

drop policy if exists partner_photos_staff_update on public.partner_photos;
create policy partner_photos_staff_update on public.partner_photos
  for update to authenticated using (private.has_admin_role('editor')) with check (private.has_admin_role('editor'));

drop policy if exists partner_photos_staff_delete on public.partner_photos;
create policy partner_photos_staff_delete on public.partner_photos
  for delete to authenticated using (private.has_admin_role('editor'));

-- Fonction dédiée plutôt que public.set_updated_at() (déjà utilisée par
-- packages/partners) : ce harnais local ne reconstruit pas cette fonction
-- historique, une dépendance dessus casserait le rejeu local sans rien
-- apporter — le comportement est strictement identique.
create or replace function private.touch_partner_photos_updated_at()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  new.updated_at := now();
  return new;
end $$;

drop trigger if exists partner_photos_updated_at on public.partner_photos;
create trigger partner_photos_updated_at
  before update on public.partner_photos
  for each row execute function private.touch_partner_photos_updated_at();

drop trigger if exists audit_partner_photos on public.partner_photos;
create trigger audit_partner_photos
  after insert or update or delete on public.partner_photos
  for each row execute function private.audit_row_change();

-- "caption" n'était pas reconnu par le libellé d'audit ("(sans libellé)" par
-- défaut) : ajouté à la liste déjà utilisée pour packages/formules.
create or replace function private.audit_label(row_data jsonb)
returns text
language plpgsql
immutable
set search_path = public, pg_temp
as $$
declare
  candidate text;
  col       text;
begin
  foreach col in array array['order_number','client_name','caption','title','full_name','display_name','name','label','key','email','provider']
  loop
    if private.audit_is_sensitive(col) then continue; end if;
    candidate := nullif(trim(row_data ->> col), '');
    if candidate is not null then
      return left(candidate, 120);
    end if;
  end loop;
  return null;
end $$;
