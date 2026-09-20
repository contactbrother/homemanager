-- Phase 1: the home record. Property profile, assets register, vendors, and
-- documents that can attach to an asset. Enum additions come first because a new
-- enum value cannot be used in the same transaction that adds it.

-- Document types that a Dubai villa actually carries.
alter type public.document_type add value if not exists 'title_deed';
alter type public.document_type add value if not exists 'dewa';
alter type public.document_type add value if not exists 'tenancy_contract';
alter type public.document_type add value if not exists 'service_contract';
alter type public.document_type add value if not exists 'school';
alter type public.document_type add value if not exists 'mortgage';
alter type public.document_type add value if not exists 'receipt';

create type public.asset_category as enum (
  'ac', 'water_heater', 'pool', 'garden', 'appliance', 'vehicle', 'security', 'other'
);

create type public.vendor_category as enum (
  'ac', 'plumbing', 'electrical', 'pool', 'garden', 'pest', 'cleaning',
  'appliance', 'vehicle', 'general'
);

-- Property profile
alter table public.properties
  add column bedrooms smallint,
  add column villa_number text,
  add column access_notes text,
  add column key_holders text,
  add column emergency_contacts text,
  add column updated_at timestamptz not null default now();

create trigger properties_touch_updated_at
  before update on public.properties
  for each row execute function public.touch_updated_at();

-- Vendors: one list for the whole service, maintained by the team.
create table public.vendors (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category public.vendor_category not null default 'general',
  phone text,
  email text,
  rate_notes text,
  notes text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger vendors_touch_updated_at
  before update on public.vendors
  for each row execute function public.touch_updated_at();

-- Assets: the things in a home that break, expire or need servicing.
create table public.assets (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  category public.asset_category not null default 'other',
  name text not null,
  brand text,
  model text,
  serial_no text,
  location text,
  installed_on date,
  warranty_until date,
  service_interval_months smallint,
  last_serviced_on date,
  vendor_id uuid references public.vendors(id) on delete set null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index assets_property_idx on public.assets(property_id);

create trigger assets_touch_updated_at
  before update on public.assets
  for each row execute function public.touch_updated_at();

alter table public.documents
  add column asset_id uuid references public.assets(id) on delete set null;

create index documents_asset_idx on public.documents(asset_id);

-- Row level security. Same shape as documents: the owner of the property, or the team.
alter table public.vendors enable row level security;
alter table public.assets  enable row level security;

create policy "signed in read active vendors"
  on public.vendors for select using (auth.uid() is not null and (is_active or is_admin()));
create policy "admin writes vendors"
  on public.vendors for insert with check (is_admin());
create policy "admin updates vendors"
  on public.vendors for update using (is_admin());
create policy "admin deletes vendors"
  on public.vendors for delete using (is_admin());

create policy "read own assets"
  on public.assets for select using (
    is_admin() or property_id in (select id from public.properties where owner_id = auth.uid())
  );
create policy "add to own property"
  on public.assets for insert with check (
    is_admin() or property_id in (select id from public.properties where owner_id = auth.uid())
  );
create policy "update own assets"
  on public.assets for update using (
    is_admin() or property_id in (select id from public.properties where owner_id = auth.uid())
  );
create policy "admin deletes assets"
  on public.assets for delete using (is_admin());
