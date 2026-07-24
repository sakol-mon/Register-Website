create or replace function public.admin_list_registration_topics_all()
returns table(registration_id uuid, workshop_id uuid, status public.registration_status)
language sql
security definer
set search_path = public
as $$
  select registration_id, workshop_id, status
  from public.registration_topics;
$$;

grant execute on function public.admin_list_registration_topics_all() to anon, authenticated;
