-- Account settings: clients can turn renewal reminder emails off. Default on, so
-- nothing changes for existing accounts. The team copy of each reminder still goes out.
alter table profiles
  add column email_reminders boolean not null default true;

comment on column profiles.email_reminders is
  'When false, the daily reminder job skips emailing this client. The team copy is unaffected.';
