drop trigger if exists trg_enforce_max_2_topics on public.registration_topics;

drop function if exists public.enforce_max_2_topics();
