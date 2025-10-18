-- Ensure required extensions are available.
create extension if not exists "pgcrypto" with schema public;
create extension if not exists "pg_net" with schema extensions;

-- Add gradient support to solutions synchronized from Payload.
alter table public.solutions
  add column if not exists gradient text;

update public.solutions
set gradient = coalesce(nullif(gradient, ''), 'from-brand-purple to-brand-blue');

alter table public.solutions
  alter column gradient set default 'from-brand-purple to-brand-blue';

alter table public.solutions
  alter column gradient set not null;

comment on column public.solutions.gradient is
  'Tailwind gradient class applied to solution cards.';

-- Configuration table for notifying frontend build hooks when content changes.
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

alter table public.content_sync_webhook_config enable row level security;

create policy if not exists "Service role manages content sync webhooks"
  on public.content_sync_webhook_config
  for all
  to service_role
  using (true)
  with check (true);

create or replace function public.touch_content_sync_webhook_config_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists content_sync_webhook_config_updated_at
  on public.content_sync_webhook_config;

create trigger content_sync_webhook_config_updated_at
  before update on public.content_sync_webhook_config
  for each row
  execute function public.touch_content_sync_webhook_config_updated_at();

-- Trigger function that dispatches HTTP webhooks when content tables change.
create or replace function public.dispatch_content_sync()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  cfg record;
  payload jsonb;
  headers jsonb;
begin
  payload := jsonb_build_object(
    'event', tg_op,
    'schema', tg_table_schema,
    'table', tg_table_name,
    'record', coalesce(to_jsonb(new), to_jsonb(old)),
    'old_record', case when tg_op = 'UPDATE' then to_jsonb(old) else null end,
    'triggered_at', timezone('utc', now())
  );

  for cfg in
    select target, url, secret
    from public.content_sync_webhook_config
    where enabled is true
      and url is not null
      and url <> ''
  loop
    headers := jsonb_build_object('Content-Type', 'application/json');

    if cfg.secret is not null and cfg.secret <> '' then
      headers := headers || jsonb_build_object('Authorization', 'Bearer ' || cfg.secret);
    end if;

    begin
      perform net.http_post(
        url := cfg.url,
        headers := headers,
        body := (payload || jsonb_build_object('target', cfg.target))::text,
        timeout_milliseconds := 5000
      );
    exception
      when others then
        raise notice 'Content sync webhook failed for %: %', cfg.url, sqlerrm;
    end;
  end loop;

  if tg_op = 'DELETE' then
    return old;
  end if;

  return new;
end;
$$;

-- Attach webhook notifications to content tables managed via Payload.
drop trigger if exists notify_content_sync_on_solutions on public.solutions;
create trigger notify_content_sync_on_solutions
  after insert or update or delete on public.solutions
  for each row execute function public.dispatch_content_sync();

drop trigger if exists notify_content_sync_on_homepage_features on public.homepage_features;
create trigger notify_content_sync_on_homepage_features
  after insert or update or delete on public.homepage_features
  for each row execute function public.dispatch_content_sync();

drop trigger if exists notify_content_sync_on_repositories on public.repositories;
create trigger notify_content_sync_on_repositories
  after insert or update or delete on public.repositories
  for each row execute function public.dispatch_content_sync();

drop trigger if exists notify_content_sync_on_team_members on public.team_members;
create trigger notify_content_sync_on_team_members
  after insert or update or delete on public.team_members
  for each row execute function public.dispatch_content_sync();

drop trigger if exists notify_content_sync_on_site_settings on public.site_settings;
create trigger notify_content_sync_on_site_settings
  after insert or update or delete on public.site_settings
  for each row execute function public.dispatch_content_sync();

drop trigger if exists notify_content_sync_on_blog_posts on public.blog_posts;
create trigger notify_content_sync_on_blog_posts
  after insert or update or delete on public.blog_posts
  for each row execute function public.dispatch_content_sync();

-- Seed localized copy overrides that Payload editors can manage.
insert into public.site_settings (key, value, description, updated_at)
values (
  'localized_copy',
  '{
    "en": {
      "index.hero.headline": "Building the <0/><1>Future with Technology</1>",
      "index.hero.description": "Democratizing innovation through inclusive, accessible solutions that empower diverse communities and promote social equity.",
      "index.hero.cta": "Start Your Project",
      "index.hero.viewSolutions": "View Solutions",
      "index.solutions.emptyTitle": "We're setting up new solutions",
      "index.solutions.emptyDescription": "Check back soon for our latest launches or reach out to craft something custom.",
      "index.solutions.contactCta": "Talk to our team",
      "solutionsPage.emptyTitle": "No solutions published yet",
      "solutionsPage.emptyDescription": "Our team is curating the next generation of offerings. Reach out and we’ll build a solution tailored to you.",
      "solutionsPage.contactCta": "Start a project",
      "contact.info.emailUs": "Email us",
      "contact.info.sendEmail": "Send a message anytime"
    },
    "pt-BR": {
      "index.hero.headline": "Construindo o <0/><1>Futuro com Tecnologia</1>",
      "index.hero.description": "Democratizamos a inovação com soluções inclusivas e acessíveis que fortalecem comunidades diversas e promovem equidade social.",
      "index.hero.cta": "Inicie seu projeto",
      "index.hero.viewSolutions": "Ver soluções",
      "index.solutions.emptyTitle": "Estamos preparando novas soluções",
      "index.solutions.emptyDescription": "Volte em breve para conhecer nossos lançamentos ou fale conosco para criar algo sob medida.",
      "index.solutions.contactCta": "Fale com nossa equipe",
      "solutionsPage.emptyTitle": "Nenhuma solução publicada ainda",
      "solutionsPage.emptyDescription": "Nossa equipe está preparando a próxima geração de ofertas. Entre em contato e construiremos uma solução sob medida para você.",
      "solutionsPage.contactCta": "Iniciar um projeto",
      "contact.info.emailUs": "Envie um e-mail",
      "contact.info.sendEmail": "Envie uma mensagem a qualquer momento"
    }
  }'::jsonb,
  'Localized i18n overrides for SPA-facing copy managed via Payload',
  timezone('utc', now())
)
on conflict (key) do update
  set value = excluded.value,
      description = excluded.description,
      updated_at = excluded.updated_at;
