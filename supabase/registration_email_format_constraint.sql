-- Enforce stricter email format at database level (PostgreSQL/Supabase)
-- This prevents malformed emails like mail@org from being inserted.

-- 1) Add CHECK constraint (NOT VALID so it won't fail immediately on old rows)
alter table if exists public.registrations
  drop constraint if exists registrations_email_format_chk;

alter table if exists public.registrations
  add constraint registrations_email_format_chk
  check (email ~* '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]{2,}$')
  not valid;

-- 2) (Optional) validate after cleaning old invalid rows
-- alter table public.registrations validate constraint registrations_email_format_chk;

-- 3) (Optional) list existing invalid emails before validation
-- select id, email
-- from public.registrations
-- where email !~* '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]{2,}$';
