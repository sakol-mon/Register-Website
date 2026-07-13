-- Emergency fallback: disable RLS for public registration flow.
-- Use this if policy-based setup still fails.
-- Run in Supabase SQL Editor as project owner.

alter table if exists public.registrations disable row level security;
alter table if exists public.registration_topics disable row level security;
alter table if exists public.workshops disable row level security;

grant usage on schema public to anon, authenticated;
grant select, insert on public.registrations to anon, authenticated;
grant select on public.workshops to anon, authenticated;
grant insert on public.registration_topics to anon, authenticated;

-- Ensure workshops exist
insert into public.workshops (code, title, topic_name, event_date)
values
  ('NotebookLM',      'ครั้งที่ 1', 'NotebookLM',                     '2026-08-19'),
  ('Claude',          'ครั้งที่ 2', 'Claude',                         '2026-09-02'),
  ('Gemini',          'ครั้งที่ 3', 'Gemini',                         '2026-09-16'),
  ('AI for Research', 'ครั้งที่ 4', 'AI for Research',                '2026-09-30'),
  ('Antigravity 2.0', 'ครั้งที่ 5', 'Antigravity 2.0',                '2026-10-14'),
  ('n8n',             'ครั้งที่ 6', 'n8n',                            '2026-10-28'),
  ('Scopus AI',       'ครั้งที่ 7', 'Scopus AI & Consensus & Elicit', '2026-11-11'),
  ('Data Analysis',   'ครั้งที่ 8', 'Data Analysis with AI',          '2026-11-25')
on conflict (code) do nothing;
