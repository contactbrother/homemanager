-- ============================================
-- Row level security
-- ============================================

alter table profiles        enable row level security;
alter table properties      enable row level security;
alter table documents       enable row level security;
alter table tasks           enable row level security;
alter table task_messages   enable row level security;
alter table service_records enable row level security;

-- Helper: is the current user an admin
create or replace function is_admin()
returns boolean language sql security definer stable set search_path = public as $$
  select exists (
    select 1 from profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- Profiles
create policy "read own profile"
  on profiles for select using (id = auth.uid() or is_admin());

create policy "update own profile"
  on profiles for update using (id = auth.uid() or is_admin());

-- Properties
create policy "read own properties"
  on properties for select using (owner_id = auth.uid() or is_admin());

create policy "admin writes properties"
  on properties for insert with check (is_admin());

create policy "admin updates properties"
  on properties for update using (is_admin());

create policy "admin deletes properties"
  on properties for delete using (is_admin());

-- Documents
create policy "read own documents"
  on documents for select using (
    is_admin() or property_id in (
      select id from properties where owner_id = auth.uid()
    )
  );

create policy "upload to own property"
  on documents for insert with check (
    is_admin() or property_id in (
      select id from properties where owner_id = auth.uid()
    )
  );

create policy "update own documents"
  on documents for update using (
    is_admin() or property_id in (
      select id from properties where owner_id = auth.uid()
    )
  );

-- Deletion is a team action only. Clients upload but never delete.
-- Deliberate divergence from section 3.2 of the build plan, which allowed a
-- client to delete a document on their own property. Withdrawn 31 August 2026.
create policy "admin deletes documents"
  on documents for delete using (is_admin());

-- Tasks
create policy "read own tasks"
  on tasks for select using (
    is_admin() or property_id in (
      select id from properties where owner_id = auth.uid()
    )
  );

create policy "create own tasks"
  on tasks for insert with check (
    is_admin() or property_id in (
      select id from properties where owner_id = auth.uid()
    )
  );

create policy "admin updates tasks"
  on tasks for update using (is_admin());

-- Task messages
create policy "read messages on own tasks"
  on task_messages for select using (
    is_admin() or task_id in (
      select t.id from tasks t
      join properties p on p.id = t.property_id
      where p.owner_id = auth.uid()
    )
  );

create policy "write messages on own tasks"
  on task_messages for insert with check (
    is_admin() or task_id in (
      select t.id from tasks t
      join properties p on p.id = t.property_id
      where p.owner_id = auth.uid()
    )
  );

-- Service records
create policy "read own service records"
  on service_records for select using (
    is_admin() or property_id in (
      select id from properties where owner_id = auth.uid()
    )
  );

create policy "admin writes service records"
  on service_records for all using (is_admin()) with check (is_admin());
