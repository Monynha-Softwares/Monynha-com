create table public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.blog_posts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  content text not null check (char_length(trim(content)) > 0),
  created_at timestamptz not null default now()
);

alter table public.comments
  add constraint comments_user_profile_fk
  foreign key (user_id)
  references public.profiles(user_id)
  on delete cascade;

create index if not exists comments_post_id_idx
  on public.comments (post_id, created_at desc);

create index if not exists comments_user_id_idx
  on public.comments (user_id);

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
with check (auth.uid() = user_id);
