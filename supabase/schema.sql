-- ================================================================
-- ARTFOLIO — Database Schema
-- Run this once in Supabase SQL Editor
-- ================================================================

-- Artists
create table if not exists artists (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  theme text not null default 'classic',
  settings jsonb not null default '{}',
  created_at timestamptz default now()
);

-- Artist languages
create table if not exists artist_languages (
  id uuid primary key default gen_random_uuid(),
  artist_id uuid references artists on delete cascade,
  code text not null,
  label text not null,
  active boolean not null default true,
  position int not null default 0,
  unique(artist_id, code)
);

-- Pages
create table if not exists pages (
  id uuid primary key default gen_random_uuid(),
  artist_id uuid references artists on delete cascade,
  title jsonb not null default '{}',
  slug jsonb not null default '{}',
  type text not null default 'custom',
  menu_position int not null default 99,
  show_in_menu boolean not null default true,
  published boolean not null default false,
  seo_title jsonb,
  seo_description jsonb,
  seo_image text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Blocks
create table if not exists blocks (
  id uuid primary key default gen_random_uuid(),
  page_id uuid references pages on delete cascade,
  type text not null,
  position int not null default 0,
  content jsonb not null default '{}',
  published boolean not null default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Concerts
create table if not exists concerts (
  id uuid primary key default gen_random_uuid(),
  artist_id uuid references artists on delete cascade,
  title jsonb not null default '{}',
  date date not null,
  time time,
  venue jsonb not null default '{}',
  city jsonb not null default '{}',
  country text,
  ticket_url text,
  description jsonb,
  image text,
  gallery text[] not null default '{}',
  featured boolean not null default false,
  published boolean not null default true,
  ical_uid text unique not null default gen_random_uuid()::text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Repertoire
create table if not exists repertoire (
  id uuid primary key default gen_random_uuid(),
  artist_id uuid references artists on delete cascade,
  composer jsonb not null default '{}',
  works jsonb not null default '[]',
  tab text not null default 'solo',
  position int not null default 0
);

-- Projects
create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  artist_id uuid references artists on delete cascade,
  title jsonb not null default '{}',
  slug text not null,
  description jsonb not null default '{}',
  content jsonb not null default '{}',
  cover_image text,
  published boolean not null default false,
  position int not null default 0,
  created_at timestamptz default now(),
  unique(artist_id, slug)
);

-- Media
create table if not exists media (
  id uuid primary key default gen_random_uuid(),
  artist_id uuid references artists on delete cascade,
  url text not null,
  thumbnail_url text,
  filename text not null,
  size int not null default 0,
  width int,
  height int,
  alt jsonb not null default '{}',
  created_at timestamptz default now()
);

-- Contact submissions
create table if not exists contact_submissions (
  id uuid primary key default gen_random_uuid(),
  artist_id uuid references artists on delete cascade,
  name text not null,
  email text not null,
  message text,
  subject text,
  read boolean not null default false,
  created_at timestamptz default now()
);

-- Newsletter subscribers
create table if not exists newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  artist_id uuid references artists on delete cascade,
  email text not null,
  name text,
  source text,
  created_at timestamptz default now(),
  unique(artist_id, email)
);

-- Activity log
create table if not exists activity_log (
  id uuid primary key default gen_random_uuid(),
  artist_id uuid references artists on delete cascade,
  user_id uuid references auth.users on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  old_data jsonb,
  new_data jsonb,
  created_at timestamptz default now()
);

-- Content versions
create table if not exists content_versions (
  id uuid primary key default gen_random_uuid(),
  artist_id uuid references artists on delete cascade,
  user_id uuid references auth.users on delete set null,
  entity_type text not null,
  entity_id uuid not null,
  data jsonb not null,
  label text,
  created_at timestamptz default now()
);

-- ================================================================
-- Row Level Security
-- ================================================================

alter table artists enable row level security;
alter table artist_languages enable row level security;
alter table pages enable row level security;
alter table blocks enable row level security;
alter table concerts enable row level security;
alter table repertoire enable row level security;
alter table projects enable row level security;
alter table media enable row level security;
alter table contact_submissions enable row level security;
alter table newsletter_subscribers enable row level security;
alter table activity_log enable row level security;
alter table content_versions enable row level security;

-- Public read for published content
create policy "public_read_artists" on artists for select using (true);
create policy "public_read_pages" on pages for select using (published = true);
create policy "public_read_blocks" on blocks for select using (published = true);
create policy "public_read_concerts" on concerts for select using (published = true);
create policy "public_read_repertoire" on repertoire for select using (true);
create policy "public_read_projects" on projects for select using (published = true);
create policy "public_read_languages" on artist_languages for select using (active = true);

-- Public insert for contact/newsletter
create policy "public_insert_contact" on contact_submissions for insert with check (true);
create policy "public_insert_newsletter" on newsletter_subscribers for insert with check (true);

-- Admin full access (via service role or auth check)
create policy "admin_all_artists" on artists for all using (true) with check (true);
create policy "admin_all_pages" on pages for all using (true) with check (true);
create policy "admin_all_blocks" on blocks for all using (true) with check (true);
create policy "admin_all_concerts" on concerts for all using (true) with check (true);
create policy "admin_all_repertoire" on repertoire for all using (true) with check (true);
create policy "admin_all_projects" on projects for all using (true) with check (true);
create policy "admin_all_media" on media for all using (true) with check (true);
create policy "admin_all_contact" on contact_submissions for all using (true) with check (true);
create policy "admin_all_newsletter" on newsletter_subscribers for all using (true) with check (true);
create policy "admin_all_languages" on artist_languages for all using (true) with check (true);
create policy "admin_all_log" on activity_log for all using (true) with check (true);
create policy "admin_all_versions" on content_versions for all using (true) with check (true);

-- ================================================================
-- Seed: Natalia artist entry
-- ================================================================

insert into artists (name, slug, theme, settings)
values ('Natalia Uchitel', 'natalia-uchitel', 'classic', '{}')
on conflict (slug) do nothing;

insert into artist_languages (artist_id, code, label, active, position)
select id, 'de', 'Deutsch', true, 0 from artists where slug = 'natalia-uchitel'
on conflict (artist_id, code) do nothing;

insert into artist_languages (artist_id, code, label, active, position)
select id, 'en', 'English', true, 1 from artists where slug = 'natalia-uchitel'
on conflict (artist_id, code) do nothing;

insert into artist_languages (artist_id, code, label, active, position)
select id, 'ru', 'Русский', true, 2 from artists where slug = 'natalia-uchitel'
on conflict (artist_id, code) do nothing;
