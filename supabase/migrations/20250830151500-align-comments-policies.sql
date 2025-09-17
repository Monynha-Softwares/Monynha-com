begin;

alter table public.comments enable row level security;

drop policy if exists "Anyone can read comments" on public.comments;
drop policy if exists "Authenticated users can add comments" on public.comments;
drop policy if exists "Authors can remove their comments" on public.comments;
drop policy if exists "Admins can manage all comments" on public.comments;

drop function if exists public.get_comment_authors(uuid[]);

create policy "Anyone can read comments"
  on public.comments
  for select
  to anon, authenticated
  using (true);

create policy "Authenticated users can add comments"
  on public.comments
  for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "Authors can remove their comments"
  on public.comments
  for delete
  to authenticated
  using (user_id = auth.uid());

create policy "Admins can manage all comments"
  on public.comments
  for all
  to authenticated
  using (public.is_admin(auth.uid()));

create or replace function public.get_comment_authors(user_ids uuid[])
returns table (user_id uuid, name text, avatar_url text)
language plpgsql
security definer
set search_path = public
as $$
begin
  if array_length(user_ids, 1) is null then
    return;
  end if;

  return query
  select p.user_id, p.name, p.avatar_url
  from public.profiles p
  where p.user_id = any(user_ids);
end;
$$;

grant execute on function public.get_comment_authors to anon, authenticated;

commit;
