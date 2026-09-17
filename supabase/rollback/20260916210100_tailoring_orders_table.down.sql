-- Rollback de 20260916210100_tailoring_orders_table.sql
-- Retire triggers, policies et fonctions ajoutés. Les commandes déjà
-- enregistrées sont CONSERVÉES : un rollback ne doit jamais effacer
-- l'historique des commandes clients.

drop trigger if exists audit_tailoring_orders on public.tailoring_orders;
drop trigger if exists tailoring_orders_protect_fields on public.tailoring_orders;
drop trigger if exists tailoring_orders_before_write on public.tailoring_orders;

drop policy if exists tailoring_orders_staff_select on public.tailoring_orders;
drop policy if exists tailoring_orders_staff_insert on public.tailoring_orders;
drop policy if exists tailoring_orders_staff_update on public.tailoring_orders;
drop policy if exists tailoring_orders_couturier_select on public.tailoring_orders;
drop policy if exists tailoring_orders_couturier_update on public.tailoring_orders;

drop function if exists private.protect_tailoring_order_fields();
drop function if exists private.generate_tailoring_order_number();

-- audit_label revient à sa version précédente (sans order_number/client_name).
-- Ne casse rien : c'est juste un libellé d'affichage dans le journal.
create or replace function private.audit_label(row_data jsonb)
returns text
language plpgsql
immutable
as $$
declare
  candidate text;
  col       text;
begin
  foreach col in array array['title','full_name','display_name','name','label','key','email','provider']
  loop
    if private.audit_is_sensitive(col) then continue; end if;
    candidate := nullif(trim(row_data ->> col), '');
    if candidate is not null then
      return left(candidate, 120);
    end if;
  end loop;
  return null;
end $$;

-- La table elle-même n'est PAS supprimée par ce rollback : elle contient
-- potentiellement des commandes clients réelles. Une suppression de table
-- est une décision manuelle, jamais un rollback automatique.
