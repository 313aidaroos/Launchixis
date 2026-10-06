-- Additive migration: existing family launches remain admin-only (owner_id NULL).
alter table public.launches add column if not exists owner_id uuid references auth.users(id);
alter table public.launches add column if not exists version integer not null default 1;
create unique index if not exists launches_one_customer_workspace on public.launches(owner_id) where owner_id is not null;
alter table public.launches enable row level security;
-- All access goes through authenticated server routes; never expose records via the Data API.
revoke all on public.launches, public.support_tickets from anon, authenticated;
grant all on public.launches, public.support_tickets to service_role;

create table if not exists public.launch_orders (
  id uuid primary key,
  user_id uuid not null references auth.users(id),
  attempt_id uuid not null,
  product_key text not null check (product_key = 'launchixis.template.checklist'),
  status text not null default 'pending' check (status in ('pending','captured','released')),
  reservation_id text,
  receipt_id text,
  content text not null check (length(content) > 100),
  template_version integer not null,
  created_at timestamptz not null default now(),
  unique(user_id, attempt_id)
);
create unique index if not exists launch_orders_one_active_purchase on public.launch_orders(user_id, product_key) where status in ('pending','captured');
alter table public.launch_orders enable row level security;
revoke all on public.launch_orders from public, anon, authenticated;
grant all on public.launch_orders to service_role;

create table if not exists public.request_limits (
  key text primary key,
  hits integer not null,
  expires_at timestamptz not null
);
create index if not exists request_limits_expiry on public.request_limits(expires_at);
alter table public.request_limits enable row level security;
revoke all on public.request_limits from public, anon, authenticated;
grant all on public.request_limits to service_role;

-- Atomic across all server instances. IP addresses are hashed before reaching this table.
create or replace function public.consume_rate_limit(p_key text, p_limit integer, p_window_seconds integer)
returns boolean language plpgsql security invoker set search_path = '' as $$
declare v_hits integer;
begin
  if p_limit < 1 or p_window_seconds < 1 or length(p_key) != 64 then
    raise exception 'invalid rate limit';
  end if;
  delete from public.request_limits where expires_at < now() - interval '1 day';
  insert into public.request_limits as limits(key,hits,expires_at)
    values(p_key,1,now()+make_interval(secs=>p_window_seconds))
    on conflict(key) do update set
      hits = case when limits.expires_at <= now() then 1 else least(limits.hits+1, p_limit+1) end,
      expires_at = case when limits.expires_at <= now() then now()+make_interval(secs=>p_window_seconds) else limits.expires_at end
    returning hits into v_hits;
  return v_hits <= p_limit;
end;
$$;
revoke all on function public.consume_rate_limit(text,integer,integer) from public, anon, authenticated;
grant execute on function public.consume_rate_limit(text,integer,integer) to service_role;
