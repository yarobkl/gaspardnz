-- GaspardNZ notifications: schema only. Apply after reviewing existing auth/roles.
create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  provider text not null check (provider in ('apns','onesignal')),
  provider_subscription_id text not null unique,
  platform text not null check (platform in ('ios','android','web')),
  marketing_opt_in boolean not null default false,
  consented_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint marketing_requires_consent check (not marketing_opt_in or (consented_at is not null and revoked_at is null))
);
create table if not exists public.notification_campaigns (
  id uuid primary key default gen_random_uuid(),
  category text not null check (category in ('arrivage','promotion','evenement','showroom','service','actualite','rappel','personnalise')),
  title text not null check (char_length(title) between 1 and 120),
  body text not null check (char_length(body) between 1 and 500),
  image_url text,
  target_url text,
  audience text not null default 'opted_in' check (audience in ('opted_in','individual')),
  target_user_id uuid references auth.users(id),
  status text not null default 'draft' check (status in ('draft','scheduled','sending','sent','failed','cancelled')),
  scheduled_at timestamptz,
  sent_at timestamptz,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  constraint private_campaign_target check ((audience = 'individual') = (target_user_id is not null))
);
create table if not exists public.notification_deliveries (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.notification_campaigns(id) on delete cascade,
  subscription_id uuid not null references public.push_subscriptions(id) on delete cascade,
  status text not null default 'queued' check (status in ('queued','sent','failed')),
  provider_message_id text,
  error_code text,
  attempted_at timestamptz,
  unique(campaign_id, subscription_id)
);
alter table public.push_subscriptions enable row level security;
alter table public.notification_campaigns enable row level security;
alter table public.notification_deliveries enable row level security;
-- No public policies: all access denied to anon/authenticated until secure server-side endpoints
-- and verified administrator role checks are implemented. Service role bypasses RLS.
create index if not exists push_subscriptions_marketing_idx on public.push_subscriptions(marketing_opt_in) where revoked_at is null;
create index if not exists notification_campaigns_schedule_idx on public.notification_campaigns(scheduled_at) where status = 'scheduled';
