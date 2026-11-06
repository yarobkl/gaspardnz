-- Server-side only. No browser/client table permissions.
create table if not exists public.notification_test_pairings (
  code_hash text primary key,
  expires_at timestamptz not null,
  used_at timestamptz
);
create table if not exists public.notification_test_devices (
  id text primary key,
  device_token text not null,
  updated_at timestamptz not null default now()
);
alter table public.notification_test_pairings enable row level security;
alter table public.notification_test_devices enable row level security;
revoke all on public.notification_test_pairings from anon, authenticated;
revoke all on public.notification_test_devices from anon, authenticated;
