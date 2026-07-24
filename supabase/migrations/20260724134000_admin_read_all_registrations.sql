create or replace function public.admin_list_registrations_all()
returns table(id uuid, full_name text, email text)
language sql
security definer
set search_path = public
as $$
  select id, full_name, email
  from public.registrations
  order by full_name asc;
$$;

grant execute on function public.admin_list_registrations_all() to anon, authenticated;
