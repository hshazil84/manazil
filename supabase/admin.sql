-- Manazil admin: tables and access rules for www.manazilapp.com/admin.
--
-- Run once in the Supabase dashboard: SQL Editor > New query > paste > Run.
-- It is safe to run again. Run occasions.sql and hijri_months.sql first (they
-- already exist if the app is set up).
--
-- AFTER running it:
--   1. Authentication > Users > Add user > "Create new user" with your email and
--      a strong password (tick "Auto confirm user").
--   2. Copy that user's UID and run:
--        insert into public.admins (user_id) values ('PASTE-UID-HERE');
--   3. Sign in at www.manazilapp.com/admin.
-- Anyone else who signs up is not an admin and can change nothing.

-- ---------------------------------------------------------------- admins

create table if not exists public.admins (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.admins enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

drop policy if exists "Admins can see themselves" on public.admins;
create policy "Admins can see themselves" on public.admins
  for select to authenticated using (user_id = auth.uid());

-- ------------------------------------------- occasions + Hijri months (existing)
-- The app keeps reading only active rows with the anon key. Admins also see
-- inactive rows and can add, change and delete.

drop policy if exists "Admins manage occasions" on public.occasions;
create policy "Admins manage occasions" on public.occasions
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Admins manage hijri months" on public.hijri_months;
create policy "Admins manage hijri months" on public.hijri_months
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ------------------------------------------------------------ site settings
-- Small named settings for the website: the announcement banner and store links.

create table if not exists public.site_settings (
  key        text primary key,
  value      jsonb not null,
  updated_at timestamptz not null default now()
);
alter table public.site_settings enable row level security;

drop policy if exists "Anyone can read site settings" on public.site_settings;
create policy "Anyone can read site settings" on public.site_settings
  for select to anon, authenticated using (true);
drop policy if exists "Admins manage site settings" on public.site_settings;
create policy "Admins manage site settings" on public.site_settings
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

insert into public.site_settings (key, value) values
  ('banner',      '{"enabled": false, "text": "", "link_label": "", "link_url": ""}'),
  ('store_links', '{"ios": "", "android": ""}')
on conflict (key) do nothing;

-- --------------------------------------------------------------------- FAQ
-- When this table has no active rows the website shows its built-in FAQ.

create table if not exists public.faqs (
  id         uuid primary key default gen_random_uuid(),
  position   int  not null default 0,
  question   text not null,
  answer     text not null,
  active     boolean not null default true,
  created_at timestamptz not null default now()
);
alter table public.faqs enable row level security;

drop policy if exists "Anyone can read active faqs" on public.faqs;
create policy "Anyone can read active faqs" on public.faqs
  for select to anon, authenticated using (active);
drop policy if exists "Admins manage faqs" on public.faqs;
create policy "Admins manage faqs" on public.faqs
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ------------------------------------------------------------ daily content
-- Pins a specific verse, hadith or dua of the day for a date. A date with no
-- row here keeps using the app's normal daily rotation.
-- show_on is the calendar date on the phone (Maldives dates, in practice).

create table if not exists public.daily_content (
  id          uuid primary key default gen_random_uuid(),
  show_on     date not null,
  kind        text not null check (kind in ('verse', 'hadith', 'dua')),
  -- verse
  surah       int,
  ayah        int,
  -- hadith: its id in the app's daily_hadith.json
  hadith_id   text,
  -- dua: chapter id and position inside the chapter in hisn.json
  dua_chapter int,
  dua_index   int,
  note        text,
  created_at  timestamptz not null default now(),
  unique (show_on, kind),
  constraint daily_content_shape check (
    (kind = 'verse'  and surah between 1 and 114 and ayah >= 1
       and hadith_id is null and dua_chapter is null and dua_index is null)
 or (kind = 'hadith' and hadith_id is not null and length(hadith_id) > 0
       and surah is null and ayah is null and dua_chapter is null and dua_index is null)
 or (kind = 'dua'    and dua_chapter >= 1 and dua_index >= 0
       and surah is null and ayah is null and hadith_id is null)
  )
);
create index if not exists daily_content_show_on_idx on public.daily_content (show_on);
alter table public.daily_content enable row level security;

drop policy if exists "Anyone can read daily content" on public.daily_content;
create policy "Anyone can read daily content" on public.daily_content
  for select to anon, authenticated using (true);
drop policy if exists "Admins manage daily content" on public.daily_content;
create policy "Admins manage daily content" on public.daily_content
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ------------------------------------------------------------ Verse Finder log
-- One row per recording sent to the transcribe function: when, how big, whether
-- it worked, and the text that was recognised. No audio is stored. The function
-- writes rows with the service role; only admins can read or delete them.

create table if not exists public.finder_logs (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  ok          boolean not null,
  model       text,
  audio_bytes int,
  audio_type  text,
  duration_ms int,
  recognised  text,
  error       text
);
create index if not exists finder_logs_created_at_idx on public.finder_logs (created_at desc);
alter table public.finder_logs enable row level security;

drop policy if exists "Admins read finder logs" on public.finder_logs;
create policy "Admins read finder logs" on public.finder_logs
  for select to authenticated using (public.is_admin());
drop policy if exists "Admins delete finder logs" on public.finder_logs;
create policy "Admins delete finder logs" on public.finder_logs
  for delete to authenticated using (public.is_admin());

-- Optional: delete log rows older than 30 days every night (needs the pg_cron
-- extension: Database > Extensions > pg_cron).
-- select cron.schedule('finder-logs-30d', '15 21 * * *',
--   $$ delete from public.finder_logs where created_at < now() - interval '30 days' $$);
