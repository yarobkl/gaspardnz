-- Rollback of 20261030183000_archive_legacy_email_failures.sql.
-- Restores legacy failed/bounced messages to operational views.
-- No email message or delivery history is deleted.
begin;
update public.email_messages
set archived_at = null,
    updated_at = now()
where status in ('failed', 'bounced')
  and archived_at is not null;
-- Keep archived_at column: later migrations or admin workflows may rely on it.
commit;
