-- Weekly GaspardNZ editorial autopublishing.
-- The scheduler token is generated in Vault and never committed in plaintext.
create extension if not exists pg_cron with schema pg_catalog;
create extension if not exists pg_net with schema extensions;

alter table public.notification_campaigns
  add column if not exists news_post_id uuid references public.news_posts(id) on delete set null;
create unique index if not exists notification_campaigns_news_post_id_unique
  on public.notification_campaigns (news_post_id);

create or replace function public.verify_editorial_scheduler_token(p_token text)
returns boolean
language sql stable security definer set search_path = ''
as $fn$
  select exists (
    select 1 from vault.decrypted_secrets
    where name = 'gaspardnz_editorial_scheduler_token'
      and decrypted_secret = p_token
      and p_token is not null
  )
$fn$;
revoke all on function public.verify_editorial_scheduler_token(text) from public, anon, authenticated;
grant execute on function public.verify_editorial_scheduler_token(text) to service_role;

do $setup$
begin
  if not exists (
    select 1 from vault.secrets where name = 'gaspardnz_editorial_scheduler_token'
  ) then
    perform vault.create_secret(
      replace(gen_random_uuid()::text, '-', '') || replace(gen_random_uuid()::text, '-', ''),
      'gaspardnz_editorial_scheduler_token',
      'Secret de déclenchement du calendrier éditorial GaspardNZ'
    );
  end if;
end
$setup$;

select cron.schedule(
  'gaspardnz-publish-scheduled-news',
  '*/5 * * * *',
  $job$
    select net.http_post(
      url := 'https://imvjudhhtcdmtyhfhksm.supabase.co/functions/v1/publish-scheduled-news',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'x-editorial-scheduler-token', (
          select decrypted_secret from vault.decrypted_secrets
          where name = 'gaspardnz_editorial_scheduler_token' limit 1
        )
      ),
      body := '{}'::jsonb,
      timeout_milliseconds := 20000
    ) as request_id;
  $job$
);
