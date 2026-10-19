-- Home page poster: a dedicated hero image (falls back to avatar) and an editable badge ("S RANK").
alter table public.profile
  add column hero_image_path text,
  add column hero_badge_th text not null default '',
  add column hero_badge_en text not null default '';
