-- ============================================
-- Dar schema
-- ============================================

create type user_role as enum ('client', 'admin');

create type document_type as enum (
  'amc', 'ejari', 'insurance', 'visa', 'emirates_id',
  'passport', 'vehicle', 'utility', 'warranty', 'other'
);

create type task_status as enum (
  'received', 'in_progress', 'waiting_on_client', 'done', 'cancelled'
);

-- Profiles: one per auth user
create table profiles (
  id uuid primary key references auth.users on delete cascade,
  full_name text,
  phone text,
  role user_role not null default 'client',
  created_at timestamptz not null default now()
);

-- Properties
create table properties (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references profiles(id) on delete cascade,
  name text not null,
  community text,
  address text,
  photo_path text,
  created_at timestamptz not null default now()
);

create index properties_owner_idx on properties(owner_id);

-- Documents
create table documents (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references properties(id) on delete cascade,
  uploaded_by uuid not null references profiles(id),
  title text not null,
  doc_type document_type not null default 'other',
  file_path text not null,
  file_size bigint,
  mime_type text,
  expires_on date,
  notes text,
  created_at timestamptz not null default now()
);

create index documents_property_idx on documents(property_id);
create index documents_expiry_idx on documents(expires_on) where expires_on is not null;

-- Tasks
create table tasks (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references properties(id) on delete cascade,
  created_by uuid not null references profiles(id),
  title text not null,
  body text,
  voice_path text,
  status task_status not null default 'received',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index tasks_property_idx on tasks(property_id);
create index tasks_status_idx on tasks(status);

-- Task messages
create table task_messages (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references tasks(id) on delete cascade,
  author_id uuid not null references profiles(id),
  body text,
  voice_path text,
  created_at timestamptz not null default now()
);

create index task_messages_task_idx on task_messages(task_id);

-- Service records (schema only in MVP)
create table service_records (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references properties(id) on delete cascade,
  performed_on date not null,
  vendor_name text,
  summary text not null,
  cost_aed numeric(10,2),
  created_at timestamptz not null default now()
);

create index service_records_property_idx on service_records(property_id);

-- Keep tasks.updated_at current
create or replace function touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

create trigger tasks_touch_updated_at
  before update on tasks
  for each row execute function touch_updated_at();

-- Create a profile automatically on sign up
create or replace function handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
