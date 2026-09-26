-- Phase B: unread tracking and live conversations.
-- One row per person per request, holding when they last opened it. Each person sees
-- and writes only their own rows.
create table task_reads (
  user_id uuid not null references profiles(id) on delete cascade,
  task_id uuid not null references tasks(id) on delete cascade,
  last_read_at timestamptz not null default now(),
  primary key (user_id, task_id)
);

alter table task_reads enable row level security;

create policy "read own read markers" on task_reads
  for select using (user_id = auth.uid());
create policy "add own read markers" on task_reads
  for insert with check (user_id = auth.uid() and task_id in (select id from tasks));
create policy "update own read markers" on task_reads
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Unread counts and last activity per request, for the signed-in person. Security
-- invoker, so the existing policies decide which requests and messages are counted.
create or replace function my_task_activity()
returns table (task_id uuid, unread integer, last_message_at timestamptz, last_read_at timestamptz)
language sql stable security invoker set search_path = public as $$
  select
    t.id,
    (count(m.id) filter (
      where m.author_id <> auth.uid()
        and m.created_at > coalesce(r.last_read_at, '-infinity'::timestamptz)
    ))::integer,
    max(m.created_at),
    r.last_read_at
  from tasks t
  left join task_messages m on m.task_id = t.id
  left join task_reads r on r.task_id = t.id and r.user_id = auth.uid()
  group by t.id, r.last_read_at;
$$;

grant execute on function my_task_activity() to authenticated;

-- Start everyone at "all caught up", so the new badges do not light up for history.
insert into task_reads (user_id, task_id, last_read_at)
select p.owner_id, t.id, now()
from tasks t join properties p on p.id = t.property_id
on conflict do nothing;

-- Live updates for request messages. Row level security still decides who receives what.
alter publication supabase_realtime add table task_messages;
