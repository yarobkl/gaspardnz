-- Rollback de 20260910120300_audit_log_server_side.sql
-- Retire uniquement les triggers/fonctions/policies ajoutés par la migration.
-- Les lignes déjà journalisées sont CONSERVÉES.
do $$
declare t text;
begin
  foreach t in array array[
    'leads','bookings','customers','crm_notes','email_messages',
    'promotions','site_settings','site_content','admin_access','media_assets',
    'content_albums','packages','partners','partner_contacts','news_posts',
    'vip_clients','wedding_inspirations','style_month','integration_settings'
  ]
  loop
    if to_regclass('public.' || t) is null then continue; end if;
    execute format('drop trigger if exists %I on public.%I', 'audit_' || t, t);
  end loop;
end $$;

drop trigger if exists activity_log_append_only on public.activity_log;
drop policy if exists audit_no_client_insert on public.activity_log;
drop policy if exists audit_no_client_update on public.activity_log;
drop policy if exists audit_no_client_delete on public.activity_log;
drop function if exists private.audit_log_append_only();
drop function if exists private.audit_row_change();
drop function if exists private.audit_changed_columns(jsonb, jsonb);
drop function if exists private.audit_label(jsonb);
drop function if exists private.audit_is_sensitive(text);
