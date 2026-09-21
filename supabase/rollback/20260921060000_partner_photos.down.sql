-- Rollback de 20260921060000_partner_photos.sql
--
-- partner_photos est une table CRÉÉE par cette migration : la supprimer
-- perd toute photo importée depuis sa mise en service — comme pour toute
-- table introduite par une migration qu'on annule. audit_label revient à
-- sa liste de colonnes précédente (sans "caption").

drop trigger if exists audit_partner_photos on public.partner_photos;
drop trigger if exists partner_photos_updated_at on public.partner_photos;
drop function if exists private.touch_partner_photos_updated_at();

drop table if exists public.partner_photos;

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
