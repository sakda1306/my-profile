-- Row level security: anon reads visible rows, admins do everything.
-- Policies are split per command (no FOR ALL) so select policies do not overlap writes.

alter table public.admins enable row level security;
alter table public.profile enable row level security;
alter table public.sections enable row level security;
alter table public.section_items enable row level security;
alter table public.skills enable row level security;
alter table public.projects enable row level security;
alter table public.project_images enable row level security;
alter table public.certificates enable row level security;
alter table public.posts enable row level security;

-- admins: a user can read only their own row; no write policies at all.
create policy "admins read own row" on public.admins
  for select to authenticated using (user_id = (select auth.uid()));

-- profile: single row, always public to read.
create policy "profile public read" on public.profile
  for select to anon, authenticated using (true);
create policy "profile admin insert" on public.profile
  for insert to authenticated with check (public.is_admin());
create policy "profile admin update" on public.profile
  for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "profile admin delete" on public.profile
  for delete to authenticated using (public.is_admin());

-- Tables with is_visible.
do $$
declare t text;
begin
  foreach t in array array[
    'sections', 'section_items', 'skills', 'projects', 'project_images', 'certificates'
  ] loop
    execute format('create policy %I on public.%I for select to anon, authenticated using (is_visible)',
      t || ' public read', t);
    execute format('create policy %I on public.%I for select to authenticated using (public.is_admin())',
      t || ' admin read', t);
    execute format('create policy %I on public.%I for insert to authenticated with check (public.is_admin())',
      t || ' admin insert', t);
    execute format('create policy %I on public.%I for update to authenticated using (public.is_admin()) with check (public.is_admin())',
      t || ' admin update', t);
    if t <> 'sections' then
      execute format('create policy %I on public.%I for delete to authenticated using (public.is_admin())',
        t || ' admin delete', t);
    end if;
  end loop;
end $$;

-- System sections cannot be deleted.
create policy "sections admin delete" on public.sections
  for delete to authenticated using (public.is_admin() and not is_system);

-- posts: published only for the public.
create policy "posts public read" on public.posts
  for select to anon, authenticated using (status = 'published');
create policy "posts admin read" on public.posts
  for select to authenticated using (public.is_admin());
create policy "posts admin insert" on public.posts
  for insert to authenticated with check (public.is_admin());
create policy "posts admin update" on public.posts
  for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "posts admin delete" on public.posts
  for delete to authenticated using (public.is_admin());
