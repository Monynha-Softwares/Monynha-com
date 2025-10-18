-- Sync Payload admin users when profile roles change
create extension if not exists pg_net with schema extensions;

create table if not exists public.payload_admin_sync_settings (
  id integer primary key check (id = 1),
  webhook_url text,
  secret text,
  updated_at timestamptz not null default now()
);

insert into public.payload_admin_sync_settings (id)
values (1)
on conflict (id) do nothing;

create or replace function public.sync_payload_admin()
returns trigger
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  settings record;
  payload jsonb;
begin
  select webhook_url, secret
  into settings
  from public.payload_admin_sync_settings
  where id = 1;

  if settings.webhook_url is null or settings.webhook_url = '' then
    if tg_op = 'DELETE' then
      return old;
    end if;
    return new;
  end if;

  if tg_op = 'INSERT' and new.role = 'admin' then
    payload := jsonb_build_object(
      'action', 'promote',
      'profile', jsonb_build_object(
        'id', new.id,
        'user_id', new.user_id,
        'email', new.email,
        'name', new.name,
        'role', new.role
      )
    );
  elsif tg_op = 'UPDATE' then
    if new.role = 'admin' and (old.role is distinct from new.role) then
      payload := jsonb_build_object(
        'action', 'promote',
        'profile', jsonb_build_object(
          'id', new.id,
          'user_id', new.user_id,
          'email', new.email,
          'name', new.name,
          'role', new.role
        )
      );
    elsif old.role = 'admin' and new.role <> 'admin' then
      payload := jsonb_build_object(
        'action', 'demote',
        'profile', jsonb_build_object(
          'id', old.id,
          'user_id', old.user_id,
          'email', old.email,
          'name', old.name,
          'role', old.role
        )
      );
    end if;
  elsif tg_op = 'DELETE' and old.role = 'admin' then
    payload := jsonb_build_object(
      'action', 'demote',
      'profile', jsonb_build_object(
        'id', old.id,
        'user_id', old.user_id,
        'email', old.email,
        'name', old.name,
        'role', old.role
      )
    );
  end if;

  if payload is null then
    if tg_op = 'DELETE' then
      return old;
    end if;
    return new;
  end if;

  begin
    perform
      net.http_post(
        settings.webhook_url,
        jsonb_strip_nulls(
          jsonb_build_object(
            'content-type', 'application/json',
            'x-admin-sync-secret', settings.secret
          )
        ),
        payload::text
      );
  exception
    when others then
      raise notice 'Failed to notify Payload admin sync for profile %: %', coalesce(new.id, old.id), sqlerrm;
  end;

  if tg_op = 'DELETE' then
    return old;
  end if;

  return new;
end;
$$;

drop trigger if exists trigger_profiles_admin_sync on public.profiles;
drop trigger if exists trigger_profiles_admin_sync_delete on public.profiles;

create trigger trigger_profiles_admin_sync
after insert or update on public.profiles
for each row execute function public.sync_payload_admin();

create trigger trigger_profiles_admin_sync_delete
after delete on public.profiles
for each row execute function public.sync_payload_admin();

create or replace function public.get_admin_dashboard_data()
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  is_admin boolean;
  leads_data jsonb;
  subscribers_data jsonb;
begin
  select role = 'admin'
  into is_admin
  from public.profiles
  where user_id = auth.uid();

  if not coalesce(is_admin, false) then
    raise exception 'insufficient_privilege'
      using errcode = '42501',
            message = 'Only admins can access this resource.';
  end if;

  select coalesce(jsonb_agg(to_jsonb(l) order by l.created_at desc), '[]'::jsonb)
  into leads_data
  from public.leads l;

  select coalesce(jsonb_agg(to_jsonb(s) order by s.subscribed_at desc), '[]'::jsonb)
  into subscribers_data
  from public.newsletter_subscribers s;

  return jsonb_build_object(
    'leads', leads_data,
    'newsletter_subscribers', subscribers_data
  );
end;
$$;
