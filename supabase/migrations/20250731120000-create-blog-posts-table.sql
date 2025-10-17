create table if not exists public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  excerpt text,
  image_url text,
  content text not null,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.blog_posts enable row level security;

drop policy if exists "blog_posts_select_public" on public.blog_posts;
create policy "blog_posts_select_public" on public.blog_posts
for select
to anon, public
using (true);

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'blog_posts'
      and column_name = 'id'
      and data_type <> 'uuid'
  ) then
    alter table public.blog_posts drop constraint if exists blog_posts_pkey;
    alter table public.blog_posts rename column id to legacy_id;

    alter table public.blog_posts
      add column id uuid default gen_random_uuid();

    update public.blog_posts
    set id = gen_random_uuid()
    where id is null;

    alter table public.blog_posts
      alter column id set not null;

    alter table public.blog_posts
      add constraint blog_posts_pkey primary key (id);

    if exists (
      select 1
      from information_schema.columns
      where table_schema = 'public'
        and table_name = 'comments'
        and column_name = 'post_id'
    ) then
      alter table public.comments drop constraint if exists comments_post_id_fkey;

      update public.comments c
      set post_id = bp.id
      from public.blog_posts bp
      where c.post_id::text = bp.legacy_id;

      alter table public.comments
        add constraint comments_post_id_fkey
        foreign key (post_id)
        references public.blog_posts(id)
        on delete cascade;
    end if;

    alter table public.blog_posts drop column legacy_id;
  end if;
end $$;
