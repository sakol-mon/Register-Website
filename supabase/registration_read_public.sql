-- Allow public reading of attendee registrations for the attendees page.
-- Run this after enabling RLS for the registration tables.

grant usage on schema public to anon, authenticated;
grant select on table public.registrations to anon, authenticated;
grant select on table public.registration_topics to anon, authenticated;

drop policy if exists registration_topics_select_public on public.registration_topics;
create policy registration_topics_select_public
on public.registration_topics
for select
to anon, authenticated
using (true);

drop policy if exists registrations_select_public on public.registrations;
create policy registrations_select_public
on public.registrations
for select
to anon, authenticated
using (true);