-- Re-enable RLS for registration flow and recreate policies.
-- Run in Supabase SQL Editor as project owner.

-- 1) Turn RLS back on
alter table if exists public.registrations enable row level security;
alter table if exists public.workshops enable row level security;
alter table if exists public.registration_topics enable row level security;

-- 2) Keep required table privileges for anon/authenticated
grant usage on schema public to anon, authenticated;
grant insert on table public.registrations to anon, authenticated;
grant select on table public.workshops to anon, authenticated;
grant insert on table public.registration_topics to anon, authenticated;

-- 3) Remove old policies to avoid conflicts
DO $$
DECLARE p record;
BEGIN
  FOR p IN
    SELECT policyname
    FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'registrations'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.registrations', p.policyname);
  END LOOP;

  FOR p IN
    SELECT policyname
    FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'workshops'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.workshops', p.policyname);
  END LOOP;

  FOR p IN
    SELECT policyname
    FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'registration_topics'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.registration_topics', p.policyname);
  END LOOP;
END $$;

-- 4) Recreate minimal policies for current public form behavior
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

-- 5) Optional verification query (run separately if needed)
-- select schemaname, tablename, policyname, cmd, roles
-- from pg_policies
-- where schemaname = 'public'
--   and tablename in ('registrations', 'workshops', 'registration_topics')
-- order by tablename, policyname;
