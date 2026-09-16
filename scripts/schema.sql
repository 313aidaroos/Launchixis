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
