-- ═══════════════════════════════════════════════
-- TUSENBRUK — Database Schema
-- Run this in Supabase SQL Editor to set up tables.
-- ═══════════════════════════════════════════════

-- Authors (pen names)
create table if not exists public.authors (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  bio text,
  location text,
  avatar_letter char(1),
  avatar_color text default '#2d5a7b',
  created_at timestamptz default now()
);

-- Posts
create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  excerpt text,
  body text,
  category text not null check (category in ('watches','cars','pens','cameras','boats')),
  author_id uuid references public.authors(id) on delete set null,
  published boolean default false,
  published_at timestamptz,
  reading_time int default 4,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Indexes
create index if not exists idx_posts_slug on public.posts(slug);
create index if not exists idx_posts_category on public.posts(category);
create index if not exists idx_posts_published on public.posts(published, published_at desc);
create index if not exists idx_authors_slug on public.authors(slug);

-- Row Level Security
alter table public.authors enable row level security;
alter table public.posts enable row level security;

-- Public read access
create policy "Authors are viewable by everyone"
  on public.authors for select using (true);

create policy "Published posts are viewable by everyone"
  on public.posts for select using (published = true);

-- Authenticated write access (for admin)
create policy "Authenticated users can insert authors"
  on public.authors for insert with check (auth.role() = 'authenticated');

create policy "Authenticated users can update authors"
  on public.authors for update using (auth.role() = 'authenticated');

create policy "Authenticated users can manage posts"
  on public.posts for all using (auth.role() = 'authenticated');

-- Shop Items (affiliate links)
create table if not exists public.shop_items (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  note text,
  category text not null check (category in ('watches','cars','pens','cameras','boats')),
  price text,
  url text not null,
  active boolean default true,
  sort_order int default 0,
  created_at timestamptz default now()
);

create index if not exists idx_shop_items_category on public.shop_items(category);
alter table public.shop_items enable row level security;

create policy "Shop items are viewable by everyone"
  on public.shop_items for select using (true);

create policy "Anyone can manage shop items"
  on public.shop_items for all using (true);
