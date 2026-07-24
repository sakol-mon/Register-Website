create or replace function public.admin_update_registration_topic_statuses(updates jsonb)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  item jsonb;
  next_status public.registration_status;
begin
  if updates is null or jsonb_typeof(updates) <> 'array' then
    raise exception 'updates must be a JSON array';
  end if;

  for item in select * from jsonb_array_elements(updates)
  loop
    next_status := (item ->> 'status')::public.registration_status;

    update public.registration_topics
    set status = next_status
    where registration_id = (item ->> 'registration_id')::uuid
      and workshop_id = (item ->> 'workshop_id')::uuid;
  end loop;
end;
$$;

grant execute on function public.admin_update_registration_topic_statuses(jsonb) to anon, authenticated;
