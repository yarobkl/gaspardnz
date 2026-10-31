-- CRM marketing qualification fields. Public customer journey is unchanged.
alter table public.leads add column if not exists marketing_consent boolean not null default false;
alter table public.leads add column if not exists marketing_consent_at timestamptz;
alter table public.leads add column if not exists tags text[] not null default '{}';
alter table public.leads add column if not exists last_contacted_at timestamptz;
alter table public.leads add column if not exists next_follow_up_at timestamptz;

comment on column public.leads.marketing_consent is 'Consentement explicite pour les communications marketing';
comment on column public.leads.tags is 'Etiquettes CRM pour segmentation et suivi';
