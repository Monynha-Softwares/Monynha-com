create table if not exists public.content_sync_webhook_config (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  target text not null check (target in ('spa', 'next')),
  url text not null,
  secret text,
  enabled boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create policy "Service role manages content sync webhooks"
  on public.content_sync_webhook_config
  for all
  to service_role
  using (true)
  with check (true);

ALTER TABLE public.content_sync_webhook_config ENABLE ROW LEVEL SECURITY;
