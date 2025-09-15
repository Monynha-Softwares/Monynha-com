-- Migration: Recreate schema inferred from src/integrations/supabase/types.ts
-- NOTE: This migration assumes UUID primary keys stored as text (the TypeScript types use `string` for ids)
-- and uses timestamptz for created_at/updated_at fields. Adjust types if your original DB differed.

create extension if not exists "pgcrypto";

-- blog_posts
create table if not exists public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  excerpt text,
  content text not null,
  image_url text,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- homepage_features
create table if not exists public.homepage_features (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  icon text not null,
  url text not null,
  order_index integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- leads
create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
    email text not null,
    CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  message text not null,
  company text,
  project text,
  created_at timestamptz not null default now()
);

-- newsletter_subscribers
create table if not exists public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  active boolean not null default true,
  subscribed_at timestamptz not null default now()
);

-- profiles
create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id text not null unique,
  name text not null,
  email text not null,
  avatar_url text,
  role text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- repositories
create table if not exists public.repositories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null,
  github_url text not null,
  demo_url text,
  tags text[],
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- site_settings
create table if not exists public.site_settings (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  value jsonb not null,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Ativa RLS nas tabelas principais
alter table if exists public.blog_posts enable row level security;
alter table if exists public.homepage_features enable row level security;
alter table if exists public.leads enable row level security;
alter table if exists public.newsletter_subscribers enable row level security;
alter table if exists public.profiles enable row level security;
alter table if exists public.repositories enable row level security;
alter table if exists public.site_settings enable row level security;
alter table if exists public.solutions enable row level security;
alter table if exists public.team_members enable row level security;

-- Políticas mínimas para leitura pública
create policy if not exists "Public blog_posts are viewable by everyone" on public.blog_posts for select using (true);
create policy if not exists "Public homepage_features are viewable by everyone" on public.homepage_features for select using (true);
create policy if not exists "Public solutions are viewable by everyone" on public.solutions for select using (true);
create policy if not exists "Public repositories are viewable by everyone" on public.repositories for select using (true);
create policy if not exists "Public team_members are viewable by everyone" on public.team_members for select using (true);

-- solutions
create table if not exists public.solutions (
  id text primary key default uuid_generate_v4()::text,
  title text not null,
  slug text not null unique,
  description text not null,
  features jsonb,
  image_url text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- team_members
create table if not exists public.team_members (
  id text primary key default uuid_generate_v4()::text,
  name text not null,
  role text not null,
  bio text,
  image_url text,
  linkedin_url text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Indexes
create index if not exists idx_blog_posts_published on public.blog_posts (published);
create index if not exists idx_repositories_active on public.repositories (active);
create index if not exists idx_solutions_active on public.solutions (active);
