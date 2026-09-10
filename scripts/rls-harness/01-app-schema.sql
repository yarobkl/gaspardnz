-- Schéma applicatif reconstruit d'après les appels réellement présents dans le
-- frontend (voir CLAUDE_HEAVY_PROGRESS.md, matrice des droits). Il ne prétend
-- pas être identique à la production : il sert à prouver le COMPORTEMENT des
-- politiques RLS, pas à reproduire les colonnes exactes.

create table if not exists public.admin_access (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  role text not null default 'viewer',
  display_name text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  email text, status text default 'new', created_at timestamptz default now()
);
create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  email text, status text default 'pending', created_at timestamptz default now()
);
create table if not exists public.crm_notes (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid, body text, created_at timestamptz default now()
);
create table if not exists public.site_settings (
  key text primary key, value jsonb
);
create table if not exists public.site_content (
  key text primary key, value jsonb
);
create table if not exists public.activity_log (
  id uuid primary key default gen_random_uuid(),
  event_type text, entity_type text, entity_id uuid,
  title text, description text,
  actor_email text, created_at timestamptz default now()
);

alter table public.admin_access  enable row level security;
alter table public.leads         enable row level security;
alter table public.bookings      enable row level security;
alter table public.crm_notes     enable row level security;
alter table public.site_settings enable row level security;
alter table public.site_content  enable row level security;
alter table public.activity_log  enable row level security;

grant select, insert, update, delete on all tables in schema public to authenticated;
grant select on public.site_settings, public.site_content to anon;
