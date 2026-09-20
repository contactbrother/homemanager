-- Phase 2: reminder log. One row per (item, offset) so the daily job never sends
-- the same reminder twice, and the team can see what went out.

create type public.reminder_channel as enum ('email', 'skipped');

create table public.reminders (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  item_kind text not null,          -- document_expiry | asset_warranty | asset_service
  item_id uuid not null,
  due_on date not null,
  offset_days smallint not null,    -- 30, 14, 3 or 0
  channel public.reminder_channel not null,
  recipient text,
  sent_at timestamptz not null default now(),
  unique (item_kind, item_id, due_on, offset_days)
);

create index reminders_property_idx on public.reminders(property_id, sent_at desc);

alter table public.reminders enable row level security;

-- Written only by the daily job (service role); readable by the team.
create policy "admin reads reminders"
  on public.reminders for select using (is_admin());
