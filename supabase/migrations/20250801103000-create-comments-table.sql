create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.blog_posts(id) on delete cascade,
  author_id uuid not null references public.profiles(user_id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists comments_post_id_idx on public.comments(post_id);
create index if not exists comments_author_id_idx on public.comments(author_id);

alter table public.comments enable row level security;

drop policy if exists "comments_select_public" on public.comments;
create policy "comments_select_public" on public.comments
for select
  to anon, authenticated
  using (true);

drop policy if exists "comments_insert_authenticated" on public.comments;
create policy "comments_insert_authenticated" on public.comments
for insert
  to authenticated
  with check (auth.uid() = author_id);

create trigger update_comments_updated_at
  before update on public.comments
  for each row execute function public.update_updated_at_column();
