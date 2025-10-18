-- Provision/deprovision Payload CMS admins when Supabase profiles change role.
create extension if not exists "pg_net" with schema extensions;

alter table public.profiles
  add column if not exists payload_user_id integer;

comment on column public.profiles.payload_user_id is
  'Identifier of the linked Payload CMS user created for admin access.';

create table if not exists public.payload_admin_sync_config (
  id integer primary key check (id = 1),
  webhook_url text not null,
  webhook_secret text not null,
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.payload_admin_sync_config enable row level security;

create policy "Only service role manages payload sync config"
  on public.payload_admin_sync_config
  for all
  to service_role
  using (true)
  with check (true);

create or replace function public.touch_payload_admin_sync_config_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists payload_admin_sync_config_updated_at
  on public.payload_admin_sync_config;

create trigger payload_admin_sync_config_updated_at
  before update on public.payload_admin_sync_config
  for each row
  execute function public.touch_payload_admin_sync_config_updated_at();

create or replace function public.invoke_payload_admin_sync()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  cfg record;
  body jsonb;
  previous_role text := coalesce(old.role, '');
  current_role text := coalesce(new.role, '');
  should_notify boolean := false;
begin
  if tg_op = 'UPDATE' then
    if previous_role = current_role then
      return new;
    end if;

    should_notify := (previous_role = 'admin' or current_role = 'admin');
  else
    should_notify := (current_role = 'admin');
  end if;

  if not should_notify then
    return new;
  end if;

  select webhook_url, webhook_secret
    into cfg
    from public.payload_admin_sync_config
    where enabled is true
    order by updated_at desc
    limit 1;

  if not found or cfg.webhook_url is null or cfg.webhook_url = '' then
    return new;
  end if;

  body := jsonb_build_object(
    'event', tg_op,
    'profile', row_to_json(new),
    'previous_profile', case when tg_op = 'UPDATE' then row_to_json(old) else null end
  );

  begin
    perform net.http_post(
      url := cfg.webhook_url,
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || cfg.webhook_secret
      ),
      body := body::text
    );
  exception
    when others then
      raise notice 'Payload admin sync webhook failed: %', sqlerrm;
  end;

  return new;
end;
$$;

drop trigger if exists on_profile_role_change on public.profiles;

create trigger on_profile_role_change
  after update of role on public.profiles
  for each row
  execute function public.invoke_payload_admin_sync();

create or replace function public.get_admin_dashboard_data()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  is_admin boolean := false;
  leads_data jsonb := '[]'::jsonb;
  subscribers_data jsonb := '[]'::jsonb;
begin
  select role = 'admin'
    into is_admin
    from public.profiles
    where user_id = auth.uid();

  if not coalesce(is_admin, false) then
    raise exception 'Access denied' using errcode = '42501';
  end if;

  select coalesce(jsonb_agg(to_jsonb(l) order by l.created_at desc), '[]'::jsonb)
    into leads_data
    from public.leads l;

  select coalesce(jsonb_agg(to_jsonb(n) order by n.subscribed_at desc), '[]'::jsonb)
    into subscribers_data
    from public.newsletter_subscribers n;

  return jsonb_build_object(
    'leads', leads_data,
    'newsletter_subscribers', subscribers_data
  );
end;
$$;

grant execute on function public.get_admin_dashboard_data() to authenticated;
grant execute on function public.get_admin_dashboard_data() to service_role;
