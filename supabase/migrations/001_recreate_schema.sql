-- Migration: Recreate schema inferred from src/integrations/supabase/types.ts
-- NOTE: This migration assumes UUID primary keys stored as text (the TypeScript types use `string` for ids)
-- and uses timestamptz for created_at/updated_at fields. Adjust types if your original DB differed.

create extension if not exists "uuid-ossp";

-- blog_posts
create table if not exists public.blog_posts (
  id text primary key default uuid_generate_v4()::text,
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
  id text primary key default uuid_generate_v4()::text,
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
  id text primary key default uuid_generate_v4()::text,
  name text not null,
  email text not null,
  message text not null,
  company text,
  project text,
  created_at timestamptz not null default now()
);

-- newsletter_subscribers
create table if not exists public.newsletter_subscribers (
  id text primary key default uuid_generate_v4()::text,
  email text not null unique,
  active boolean not null default true,
  subscribed_at timestamptz not null default now()
);

-- profiles
create table if not exists public.profiles (
  id text primary key default uuid_generate_v4()::text,
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
  id text primary key default uuid_generate_v4()::text,
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
  id text primary key default uuid_generate_v4()::text,
  key text not null unique,
  value jsonb not null,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

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
