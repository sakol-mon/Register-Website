do $$
begin
  if not exists (
    select 1 from pg_type where typnamespace = 'public'::regnamespace and typname = 'registration_status'
  ) then
    create type public.registration_status as enum ('Participant', 'Waiting', 'skip');
  end if;
end $$;

create or replace function public.assign_registration_topic_status()
returns trigger
language plpgsql
as $$
declare
  active_count integer;
begin
  if new.status = 'skip' then
    return new;
  end if;

  select count(*)
  into active_count
  from public.registration_topics
  where workshop_id = new.workshop_id
    and status in ('Participant', 'Waiting');

  if active_count >= 40 then
    new.status = 'Waiting';
  else
    new.status = 'Participant';
  end if;

  return new;
end;
$$;

create table if not exists public.admin_users (
  username text primary key,
  password_hash text not null,
  updated_at timestamp with time zone default now() not null
);

create or replace function public.set_admin_user_password(target_username text, plain_password text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.admin_users (username, password_hash, updated_at)
  values (target_username, extensions.crypt(plain_password, extensions.gen_salt('bf')), now())
  on conflict (username)
  do update set password_hash = extensions.crypt(plain_password, extensions.gen_salt('bf')), updated_at = now();
end;
$$;

create or replace function public.admin_login(input_username text, input_password text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  stored_hash text;
begin
  select password_hash
  into stored_hash
  from public.admin_users
  where username = input_username;

  if stored_hash is null then
    return false;
  end if;

  return stored_hash = extensions.crypt(input_password, stored_hash);
end;
$$;

create or replace function public.admin_change_password(input_username text, current_password text, new_password text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.admin_login(input_username, current_password) then
    return false;
  end if;

  perform public.set_admin_user_password(input_username, new_password);
  return true;
end;
$$;

select public.set_admin_user_password('admin', 'admin')
where not exists (
  select 1 from public.admin_users where username = 'admin'
);

drop trigger if exists trg_assign_registration_topic_status on public.registration_topics;
create trigger trg_assign_registration_topic_status
before insert on public.registration_topics
for each row execute function public.assign_registration_topic_status();

alter table public.registration_topics
  add column if not exists status public.registration_status not null default 'Participant';

update public.registration_topics
set status = 'Participant'
where status is null;

grant select, update on table public.workshops to anon, authenticated;
grant select on table public.registrations to anon, authenticated;
grant select, update on table public.registration_topics to anon, authenticated;
grant execute on function public.admin_login(text, text) to anon, authenticated;
grant execute on function public.admin_change_password(text, text, text) to anon, authenticated;

drop policy if exists workshops_update_public on public.workshops;
create policy workshops_update_public
on public.workshops
for update
to anon, authenticated
using (true)
with check (true);

drop policy if exists registrations_select_public on public.registrations;
create policy registrations_select_public
on public.registrations
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.registration_topics
    where registration_topics.registration_id = registrations.id
      and registration_topics.status in ('Participant', 'Waiting')
  )
);

drop policy if exists registration_topics_select_public on public.registration_topics;
create policy registration_topics_select_public
on public.registration_topics
for select
to anon, authenticated
using (status in ('Participant', 'Waiting'));

drop policy if exists registration_topics_update_public on public.registration_topics;
create policy registration_topics_update_public
on public.registration_topics
for update
to anon, authenticated
using (true)
with check (status in ('Participant', 'Waiting', 'skip'));

drop policy if exists workshops_select_active on public.workshops;
create policy workshops_select_active
on public.workshops
for select
to anon, authenticated
using (true);