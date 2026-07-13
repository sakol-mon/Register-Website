-- Allow duplicate email in registrations
-- Run in Supabase SQL Editor as project owner.

-- 1) Remove unique constraint/index on email if present
alter table if exists public.registrations
  drop constraint if exists registrations_email_key;

drop index if exists public.registrations_email_unique_idx;
drop index if exists public.registrations_email_key;

-- 2) Keep a non-unique index for faster lookups/filtering by email
create index if not exists registrations_email_idx
  on public.registrations (lower(email));
