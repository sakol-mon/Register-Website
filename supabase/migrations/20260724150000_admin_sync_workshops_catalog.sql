create or replace function public.admin_sync_workshops_catalog(catalog jsonb)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if catalog is null or jsonb_typeof(catalog) <> 'array' then
    raise exception 'catalog must be a JSON array';
  end if;

  insert into public.workshops (code, title, topic_name, event_date, is_active)
  select
    item ->> 'code',
    item ->> 'title',
    item ->> 'topic_name',
    (item ->> 'event_date')::date,
    coalesce((item ->> 'is_active')::boolean, true)
  from jsonb_array_elements(catalog) as item
  where coalesce(item ->> 'code', '') <> ''
  on conflict (code) do update
  set title = excluded.title,
      topic_name = excluded.topic_name,
      event_date = excluded.event_date,
      is_active = excluded.is_active;
end;
$$;

insert into public.workshops (code, title, topic_name, event_date, is_active)
values
  ('NotebookLM',      'ครั้งที่ 1', 'NotebookLM',                     '2026-08-19', true),
  ('Claude',          'ครั้งที่ 2', 'Claude',                         '2026-09-02', true),
  ('Gemini',          'ครั้งที่ 3', 'Gemini',                         '2026-09-16', true),
  ('AI for Research', 'ครั้งที่ 4', 'Prism',                          '2026-09-30', true),
  ('Antigravity 2.0', 'ครั้งที่ 5', 'Antigravity 2.0',                '2026-10-14', true),
  ('n8n',             'ครั้งที่ 6', 'n8n',                            '2026-10-28', true),
  ('Scopus AI',       'ครั้งที่ 7', 'Scopus AI & Consensus & Elicit', '2026-11-11', true),
  ('Data Analysis',   'ครั้งที่ 8', 'Data Analysis with AI',          '2026-11-25', true)
on conflict (code) do update
set title = excluded.title,
    topic_name = excluded.topic_name,
    event_date = excluded.event_date,
    is_active = excluded.is_active;

grant execute on function public.admin_sync_workshops_catalog(jsonb) to anon, authenticated;