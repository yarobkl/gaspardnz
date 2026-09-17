-- Phase 15 — Commandes sur-mesure (mesures client → couturier).
--
-- Un client de Gaspard doit recevoir un costume sur-mesure : Gaspard prend
-- les mesures, crée une commande numérotée, l'assigne à un couturier. Le
-- couturier ne voit que ses propres commandes assignées, jamais celles des
-- autres couturiers ni rien d'autre de l'administration.
--
-- Additive et idempotente. Aucune donnée existante touchée.
-- Rollback : supabase/rollback/20260916210100_*.sql
-- Prérequis : 20260916210000_tailoring_couturier_role.sql,
--             20260910120000_rbac_role_functions.sql,
--             20260910120300_audit_log_server_side.sql

create table if not exists public.tailoring_orders (
  id uuid primary key default gen_random_uuid(),
  order_number text unique,
  client_name text not null,
  client_phone text,
  client_email text,
  lead_id uuid references public.leads(id) on delete set null,
  tailor_email text,
  status text not null default 'nouvelle' check (status in ('nouvelle', 'en_cours', 'terminee')),
  measurements jsonb not null default '{}'::jsonb,
  notes text,
  tailor_notes text,
  created_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  started_at timestamptz,
  completed_at timestamptz
);

alter table public.tailoring_orders enable row level security;

-- Les politiques RLS ci-dessous ne s'appliquent qu'APRÈS ces privilèges de
-- base : GRANT ... ON ALL TABLES IN SCHEMA (exécuté une fois, au démarrage)
-- ne couvre pas une table créée plus tard par une migration. Sans ce GRANT
-- explicite, toute requête échoue AVANT même d'atteindre RLS.
-- Pas de DELETE : cohérent avec l'absence de toute politique de suppression
-- plus bas — deux couches indépendantes protègent l'historique des commandes.
grant select, insert, update on public.tailoring_orders to authenticated;

-- Numéro de commande lisible et unique : CMD-2026-0001. Généré côté serveur,
-- jamais laissé au client — un numéro dupliqué ou absent serait le genre
-- d'erreur qui casse la confiance entre les deux parties.
create sequence if not exists public.tailoring_order_number_seq;
grant usage, select on public.tailoring_order_number_seq to authenticated;

create or replace function private.generate_tailoring_order_number()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  if new.order_number is null then
    new.order_number := 'CMD-' || to_char(now(), 'YYYY') || '-'
      || lpad(nextval('public.tailoring_order_number_seq')::text, 4, '0');
  end if;
  new.tailor_email := lower(nullif(trim(new.tailor_email), ''));
  new.client_email := lower(nullif(trim(new.client_email), ''));

  -- Horodatage automatique des transitions de statut : personne n'a besoin
  -- de remplir une date à la main, le changement de statut suffit.
  if tg_op = 'UPDATE' then
    if new.status = 'en_cours' and old.status <> 'en_cours' and new.started_at is null then
      new.started_at := now();
    end if;
    if new.status = 'terminee' and old.status <> 'terminee' and new.completed_at is null then
      new.completed_at := now();
    end if;
  end if;
  new.updated_at := now();
  return new;
end $$;

drop trigger if exists tailoring_orders_before_write on public.tailoring_orders;
create trigger tailoring_orders_before_write
  before insert or update on public.tailoring_orders
  for each row execute function private.generate_tailoring_order_number();

-- Défense en profondeur : un couturier peut faire avancer SES commandes
-- (statut, ses propres notes), mais jamais toucher aux mesures, aux
-- coordonnées client ou réassigner la commande — même si l'interface qui
-- l'empêche déjà côté écran était contournée.
create or replace function private.protect_tailoring_order_fields()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if private.is_couturier() then
    new.order_number  := old.order_number;
    new.client_name   := old.client_name;
    new.client_phone  := old.client_phone;
    new.client_email  := old.client_email;
    new.lead_id        := old.lead_id;
    new.tailor_email  := old.tailor_email;
    new.measurements  := old.measurements;
    new.notes         := old.notes;
    new.created_by    := old.created_by;
    new.created_at    := old.created_at;
  end if;
  return new;
end $$;

drop trigger if exists tailoring_orders_protect_fields on public.tailoring_orders;
create trigger tailoring_orders_protect_fields
  before update on public.tailoring_orders
  for each row execute function private.protect_tailoring_order_fields();

-- Personnel de la maison (editor et plus) : gestion complète, sauf la
-- suppression — aucune politique de delete n'est créée pour personne, "toutes
-- les commandes doivent être sauvegardées dans l'historique" exclut d'en
-- perdre par erreur depuis l'interface.
drop policy if exists tailoring_orders_staff_select on public.tailoring_orders;
create policy tailoring_orders_staff_select on public.tailoring_orders
  for select to authenticated using (private.has_admin_role('editor'));

drop policy if exists tailoring_orders_staff_insert on public.tailoring_orders;
create policy tailoring_orders_staff_insert on public.tailoring_orders
  for insert to authenticated with check (private.has_admin_role('editor'));

drop policy if exists tailoring_orders_staff_update on public.tailoring_orders;
create policy tailoring_orders_staff_update on public.tailoring_orders
  for update to authenticated using (private.has_admin_role('editor')) with check (private.has_admin_role('editor'));

-- Couturier : uniquement ses commandes assignées.
drop policy if exists tailoring_orders_couturier_select on public.tailoring_orders;
create policy tailoring_orders_couturier_select on public.tailoring_orders
  for select to authenticated
  using (private.is_couturier() and lower(tailor_email) = lower(coalesce(auth.jwt()->>'email', '')));

drop policy if exists tailoring_orders_couturier_update on public.tailoring_orders;
create policy tailoring_orders_couturier_update on public.tailoring_orders
  for update to authenticated
  using (private.is_couturier() and lower(tailor_email) = lower(coalesce(auth.jwt()->>'email', '')))
  with check (private.is_couturier() and lower(tailor_email) = lower(coalesce(auth.jwt()->>'email', '')));

-- Le libellé d'audit (private.audit_label) ne connaissait pas ces colonnes :
-- sans ça, chaque trace de commande afficherait "(sans libellé)".
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
  foreach col in array array['order_number','client_name','title','full_name','display_name','name','label','key','email','provider']
  loop
    if private.audit_is_sensitive(col) then continue; end if;
    candidate := nullif(trim(row_data ->> col), '');
    if candidate is not null then
      return left(candidate, 120);
    end if;
  end loop;
  return null;
end $$;

-- Chaque commande créée, modifiée ou dont le statut change laisse une trace
-- non falsifiable (voir phase 11) : qui a fait quoi, jamais choisi par le
-- client.
drop trigger if exists audit_tailoring_orders on public.tailoring_orders;
create trigger audit_tailoring_orders
  after insert or update or delete on public.tailoring_orders
  for each row execute function private.audit_row_change();
