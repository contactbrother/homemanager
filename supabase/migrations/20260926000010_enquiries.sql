-- Website enquiries. Visitors never read or write the table directly: they call
-- submit_enquiry(), which validates, rate-limits and inserts. The team reads them.
create table enquiries (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null check (char_length(name) between 1 and 120),
  phone text check (char_length(phone) <= 40),
  email text check (char_length(email) <= 200),
  community text check (char_length(community) <= 80),
  service text check (char_length(service) <= 80),
  message text check (char_length(message) <= 2000),
  source_path text check (char_length(source_path) <= 200),
  ip_hash text check (char_length(ip_hash) <= 80),
  status text not null default 'new' check (status in ('new', 'contacted', 'closed')),
  constraint enquiry_has_contact check (coalesce(phone, '') <> '' or coalesce(email, '') <> '')
);

create index enquiries_created_idx on enquiries (created_at desc);
create index enquiries_ip_idx on enquiries (ip_hash, created_at);

alter table enquiries enable row level security;

create policy "team reads enquiries" on enquiries for select using (is_admin());
create policy "team updates enquiries" on enquiries for update using (is_admin());

create or replace function submit_enquiry(
  p_name text,
  p_phone text,
  p_email text,
  p_community text,
  p_service text,
  p_message text,
  p_source_path text,
  p_ip_hash text
) returns void
language plpgsql security definer set search_path = public as $$
begin
  if coalesce(trim(p_name), '') = '' then
    raise exception 'Please tell us your name.' using errcode = '22023';
  end if;
  if coalesce(trim(p_phone), '') = '' and coalesce(trim(p_email), '') = '' then
    raise exception 'Please give a phone number or an email address.' using errcode = '22023';
  end if;
  -- At most five from one connection an hour, and fifty in total an hour.
  if (select count(*) from enquiries where ip_hash = p_ip_hash and created_at > now() - interval '1 hour') >= 5
     or (select count(*) from enquiries where created_at > now() - interval '1 hour') >= 50 then
    raise exception 'Too many enquiries just now. Please message us on WhatsApp instead.' using errcode = '54000';
  end if;

  insert into enquiries (name, phone, email, community, service, message, source_path, ip_hash)
  values (
    left(trim(p_name), 120),
    nullif(left(trim(coalesce(p_phone, '')), 40), ''),
    nullif(left(lower(trim(coalesce(p_email, ''))), 200), ''),
    nullif(left(trim(coalesce(p_community, '')), 80), ''),
    nullif(left(trim(coalesce(p_service, '')), 80), ''),
    nullif(left(trim(coalesce(p_message, '')), 2000), ''),
    nullif(left(coalesce(p_source_path, ''), 200), ''),
    nullif(left(coalesce(p_ip_hash, ''), 80), '')
  );
end $$;

revoke all on function submit_enquiry(text, text, text, text, text, text, text, text) from public;
grant execute on function submit_enquiry(text, text, text, text, text, text, text, text) to anon, authenticated;
