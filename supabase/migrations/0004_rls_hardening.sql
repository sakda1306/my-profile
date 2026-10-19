-- I1: protect system sections from being unprotected, retyped or created via the API.
create or replace function public.guard_system_sections()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  -- service_role (seed scripts, test fixtures) and direct DB sessions (no JWT role) are trusted.
  if coalesce((select auth.role()), '') not in ('anon', 'authenticated') then
    return new;
  end if;

  if tg_op = 'INSERT' then
    if new.is_system then
      raise exception 'cannot create a system section';
    end if;
  else
    if new.is_system is distinct from old.is_system then
      raise exception 'cannot change is_system';
    end if;
    if old.is_system and new.type is distinct from old.type then
      raise exception 'cannot change the type of a system section';
    end if;
  end if;
  return new;
end;
$$;

create trigger guard_system_sections
  before insert or update on public.sections
  for each row execute function public.guard_system_sections();

-- I2: storage needs SELECT for admins so remove/upsert/move work.
create policy "media admin select" on storage.objects
  for select to authenticated using (bucket_id = 'media' and public.is_admin());

-- I3: child rows are public only when the parent is visible too.
drop policy "project_images public read" on public.project_images;
create policy "project_images public read" on public.project_images
  for select to anon, authenticated using (
    is_visible
    and exists (select 1 from public.projects p where p.id = project_id and p.is_visible)
  );

drop policy "section_items public read" on public.section_items;
create policy "section_items public read" on public.section_items
  for select to anon, authenticated using (
    is_visible
    and exists (select 1 from public.sections s where s.id = section_id and s.is_visible)
  );
