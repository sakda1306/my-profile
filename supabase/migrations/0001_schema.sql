-- Schema for the bilingual (TH/EN) profile site.

create type public.section_type as enum (
  'hero', 'skills', 'projects', 'certificates', 'latest_posts',
  'contact', 'rich_text', 'gallery', 'cards', 'timeline'
);
create type public.skill_category as enum ('language', 'framework', 'tool', 'ai_data', 'soft');
create type public.post_status as enum ('draft', 'published');

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Admin allow-list: users who may write.
create table public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade
);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.admins where user_id = (select auth.uid()));
$$;
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

-- Single-row profile.
create table public.profile (
  id boolean primary key default true check (id),
  full_name_th text not null default '',
  full_name_en text not null default '',
  headline_th text not null default '',
  headline_en text not null default '',
  bio_th jsonb,
  bio_en jsonb,
  university_th text not null default '',
  university_en text not null default '',
  avatar_path text,
  resume_path_th text,
  resume_path_en text,
  email text,
  location_th text not null default '',
  location_en text not null default '',
  links jsonb not null default '[]'::jsonb,
  github_username text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.sections (
  id uuid primary key default gen_random_uuid(),
  type public.section_type not null,
  slug text not null unique,
  title_th text not null default '',
  title_en text not null default '',
  subtitle_th text not null default '',
  subtitle_en text not null default '',
  body_th jsonb,
  body_en jsonb,
  settings jsonb not null default '{}'::jsonb,
  is_system boolean not null default false,
  sort_order int not null default 0,
  is_visible boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.section_items (
  id uuid primary key default gen_random_uuid(),
  section_id uuid not null references public.sections (id) on delete cascade,
  title_th text not null default '',
  title_en text not null default '',
  body_th text not null default '',
  body_en text not null default '',
  image_path text,
  link_url text,
  start_date date,
  end_date date,
  sort_order int not null default 0,
  is_visible boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index section_items_section_id_idx on public.section_items (section_id);

create table public.skills (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category public.skill_category not null,
  icon_slug text,
  icon_path text,
  note_th text not null default '',
  note_en text not null default '',
  sort_order int not null default 0,
  is_visible boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title_th text not null default '',
  title_en text not null default '',
  summary_th text not null default '',
  summary_en text not null default '',
  my_role_th text not null default '',
  my_role_en text not null default '',
  body_th jsonb,
  body_en jsonb,
  stack text[] not null default '{}',
  repo_url text,
  demo_url text,
  cover_path text,
  is_featured boolean not null default false,
  start_date date,
  end_date date,
  sort_order int not null default 0,
  is_visible boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.project_images (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  path text not null,
  caption_th text not null default '',
  caption_en text not null default '',
  sort_order int not null default 0,
  is_visible boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index project_images_project_id_idx on public.project_images (project_id);

create table public.certificates (
  id uuid primary key default gen_random_uuid(),
  title_th text not null default '',
  title_en text not null default '',
  issuer text not null default '',
  issued_on date,
  expires_on date,
  image_path text,
  file_path text,
  credential_url text,
  sort_order int not null default 0,
  is_visible boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title_th text not null default '',
  title_en text not null default '',
  excerpt_th text not null default '',
  excerpt_en text not null default '',
  content_th jsonb,
  content_en jsonb,
  cover_path text,
  tags text[] not null default '{}',
  status public.post_status not null default 'draft',
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- updated_at triggers
do $$
declare t text;
begin
  foreach t in array array[
    'profile', 'sections', 'section_items', 'skills', 'projects',
    'project_images', 'certificates', 'posts'
  ] loop
    execute format(
      'create trigger set_updated_at before update on public.%I
         for each row execute function public.set_updated_at()', t);
  end loop;
end $$;
