-- Keep historic SMTP failures for auditability, but hide them from operational email views.
alter table public.email_messages
  add column if not exists archived_at timestamptz;

update public.email_messages
set archived_at = coalesce(archived_at, now()),
    updated_at = now()
where status in ('failed', 'bounced')
  and archived_at is null;
