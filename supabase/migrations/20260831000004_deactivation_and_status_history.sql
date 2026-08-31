-- ============================================
-- Deactivation and task status history
-- Added by the Phase 1 design, 31 August 2026.
-- Supports FR-046, FR-047 and FR-050.
-- ============================================

alter table profiles      add column deactivated_at timestamptz;
alter table task_messages add column status_to task_status;

create index profiles_deactivated_idx on profiles(deactivated_at)
  where deactivated_at is not null;

comment on column profiles.deactivated_at is
  'Null means active. Set stops sign-in and existing sessions, and starts the 90 day '
  'retention clock in FR-048. Nothing acts on that clock automatically in this release.';

comment on column task_messages.status_to is
  'Set means this row records a status change rather than a note.';

-- Is the current user an active, non-deactivated person?
create or replace function is_active()
returns boolean language sql security definer stable set search_path = public as $$
  select exists (
    select 1 from profiles
    where id = auth.uid() and deactivated_at is null
  );
$$;

-- A deactivated client keeps no read or write access, while their records
-- remain fully reachable by the team during the retention period (FR-047).
drop policy "read own properties"      on properties;
drop policy "read own documents"       on documents;
drop policy "upload to own property"   on documents;
drop policy "update own documents"     on documents;
drop policy "read own tasks"           on tasks;
drop policy "create own tasks"         on tasks;
drop policy "read messages on own tasks"  on task_messages;
drop policy "write messages on own tasks" on task_messages;
drop policy "read own service records" on service_records;

create policy "read own properties"
  on properties for select using (
    is_admin() or (is_active() and owner_id = auth.uid())
  );

create policy "read own documents"
  on documents for select using (
    is_admin() or (is_active() and property_id in (
      select id from properties where owner_id = auth.uid()
    ))
  );

create policy "upload to own property"
  on documents for insert with check (
    is_admin() or (is_active() and property_id in (
      select id from properties where owner_id = auth.uid()
    ))
  );

create policy "update own documents"
  on documents for update using (
    is_admin() or (is_active() and property_id in (
      select id from properties where owner_id = auth.uid()
    ))
  );

create policy "read own tasks"
  on tasks for select using (
    is_admin() or (is_active() and property_id in (
      select id from properties where owner_id = auth.uid()
    ))
  );

create policy "create own tasks"
  on tasks for insert with check (
    is_admin() or (is_active() and property_id in (
      select id from properties where owner_id = auth.uid()
    ))
  );

create policy "read messages on own tasks"
  on task_messages for select using (
    is_admin() or (is_active() and task_id in (
      select t.id from tasks t
      join properties p on p.id = t.property_id
      where p.owner_id = auth.uid()
    ))
  );

create policy "write messages on own tasks"
  on task_messages for insert with check (
    is_admin() or (is_active() and task_id in (
      select t.id from tasks t
      join properties p on p.id = t.property_id
      where p.owner_id = auth.uid()
    ))
  );

create policy "read own service records"
  on service_records for select using (
    is_admin() or (is_active() and property_id in (
      select id from properties where owner_id = auth.uid()
    ))
  );

-- Storage: a deactivated client reads no files either.
drop policy "read own files"   on storage.objects;
drop policy "upload own files" on storage.objects;

create policy "read own files"
  on storage.objects for select using (
    bucket_id = 'dar-files' and (
      is_admin() or (is_active() and (storage.foldername(name))[1] in (
        select id::text from properties where owner_id = auth.uid()
      ))
    )
  );

create policy "upload own files"
  on storage.objects for insert with check (
    bucket_id = 'dar-files' and (
      is_admin() or (is_active() and (storage.foldername(name))[1] in (
        select id::text from properties where owner_id = auth.uid()
      ))
    )
  );
