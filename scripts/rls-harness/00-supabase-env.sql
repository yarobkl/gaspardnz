-- Reconstruction locale MINIMALE de l'environnement Supabase, pour tester les
-- politiques RLS hors production. Ce fichier n'est PAS une migration : il ne
-- doit jamais être appliqué sur le projet Supabase.

create schema if not exists auth;
create schema if not exists private;

do $$ begin create role anon nologin; exception when duplicate_object then null; end $$;
do $$ begin create role authenticated nologin; exception when duplicate_object then null; end $$;
do $$ begin create role service_role nologin bypassrls; exception when duplicate_object then null; end $$;

grant usage on schema public to anon, authenticated, service_role;
grant usage on schema auth to anon, authenticated, service_role;

-- auth.users : réduit aux colonnes utilisées par l'application.
create table if not exists auth.users (
  id uuid primary key default gen_random_uuid(),
  email text unique
);

-- Équivalents locaux des helpers Supabase, lus depuis les claims JWT simulés.
create or replace function auth.uid() returns uuid language sql stable as $$
  select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid;
$$;

create or replace function auth.email() returns text language sql stable as $$
  select nullif(current_setting('request.jwt.claim.email', true), '');
$$;
