-- Task priority. Clients set it when they ask; the team may change it at triage.
-- Column is created with a default so every existing row reads as normal.

create type public.task_priority as enum ('low', 'normal', 'high', 'emergency');

alter table public.tasks
  add column priority public.task_priority not null default 'normal';

-- Queue ordering: open tasks by priority, then most recently touched.
create index tasks_priority_updated_idx
  on public.tasks (priority, updated_at desc);
