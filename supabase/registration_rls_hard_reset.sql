-- Run in Supabase SQL Editor (as project owner)
-- This script removes all existing RLS policies for the 3 tables,
-- then creates a known-good public policy set for form submission.

grant usage on schema public to anon, authenticated;

grant insert on table public.registrations to anon, authenticated;
grant select on table public.workshops to anon, authenticated;
grant insert on table public.registration_topics to anon, authenticated;

alter table public.registrations enable row level security;
alter table public.workshops enable row level security;
alter table public.registration_topics enable row level security;

do $$
declare p record;
begin
  for p in select policyname from pg_policies where schemaname = 'public' and tablename = 'registrations' loop
    execute format('drop policy if exists %I on public.registrations', p.policyname);
  end loop;

  for p in select policyname from pg_policies where schemaname = 'public' and tablename = 'workshops' loop
    execute format('drop policy if exists %I on public.workshops', p.policyname);
  end loop;

  for p in select policyname from pg_policies where schemaname = 'public' and tablename = 'registration_topics' loop
    execute format('drop policy if exists %I on public.registration_topics', p.policyname);
  end loop;
end $$;

create policy registrations_insert_public
on public.registrations
for insert
to anon, authenticated
with check (true);

create policy workshops_select_active
on public.workshops
for select
to anon, authenticated
using (is_active = true);

create policy registration_topics_insert_public
on public.registration_topics
for insert
to anon, authenticated
with check (true);

insert into public.workshops (code, title, topic_name, event_date)
values
  ('NotebookLM',      'ครั้งที่ 1', 'NotebookLM',                     '2026-08-19'),
  ('Claude',          'ครั้งที่ 2', 'Claude',                         '2026-09-02'),
  ('Gemini',          'ครั้งที่ 3', 'Gemini',                         '2026-09-16'),
  ('AI for Research', 'ครั้งที่ 4', 'Prism',                          '2026-09-30'),
  ('Antigravity 2.0', 'ครั้งที่ 5', 'Antigravity 2.0',                '2026-10-14'),
  ('n8n',             'ครั้งที่ 6', 'n8n',                            '2026-10-28'),
  ('Scopus AI',       'ครั้งที่ 7', 'Scopus AI & Consensus & Elicit', '2026-11-11'),
  ('Data Analysis',   'ครั้งที่ 8', 'Data Analysis with AI',          '2026-11-25')
on conflict (code) do nothing;
