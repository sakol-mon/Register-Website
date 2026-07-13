-- Clear registration data for testing (keep workshops)
-- Run in Supabase SQL Editor.

begin;

-- Safety: avoid waiting forever if another transaction holds locks
set local lock_timeout = '5s';
set local statement_timeout = '30s';

-- Truncate related tables in one statement to satisfy FK dependencies
truncate table public.registration_topics, public.registrations restart identity;

commit;

-- Verification
select 'registrations' as table_name, count(*) as remaining_rows from public.registrations
union all
select 'registration_topics' as table_name, count(*) as remaining_rows from public.registration_topics;

-- Optional: clear workshops too (uncomment only when needed)
-- truncate table public.workshops restart identity;
