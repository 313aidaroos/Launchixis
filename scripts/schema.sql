create table if not exists public.launches (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  one_liner text not null default '',
  domain text not null default '',
  repo text not null default '',
  vercel_project text not null default '',
  status text not null default 'not_started',
  notes text not null default '',
  items jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.launches enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'launches' and policyname = 'service_only'
  ) then
    -- no anon policies: service role bypasses RLS
    null;
  end if;
end $$;

create table if not exists public.support_tickets (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  subject text not null,
  message text not null,
  company_slug text not null default 'launchixis',
  source_inbox text not null default 'launchixis@apixis.dev',
  route_to text not null default 'awad@apixis.dev',
  status text not null default 'new',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.support_tickets enable row level security;
