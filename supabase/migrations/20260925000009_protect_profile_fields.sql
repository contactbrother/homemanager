-- Security: a signed-in client could previously change their own role to admin, or
-- clear their own deactivation, because "update own profile" covers every column.
-- Only the team (or the service role and database owner) may change these fields.
-- Clients keep editing their name, phone and reminder setting.
-- Security invoker, so current_user is the caller's role rather than the owner.
create or replace function protect_profile_fields()
returns trigger language plpgsql security invoker set search_path = public as $$
begin
  if current_user in ('authenticated', 'anon') and not is_admin() then
    if new.role is distinct from old.role
       or new.deactivated_at is distinct from old.deactivated_at
       or new.id is distinct from old.id
       or new.created_at is distinct from old.created_at then
      raise exception 'Only the Dar team can change this.' using errcode = '42501';
    end if;
  end if;
  return new;
end $$;

create trigger protect_profile_fields
  before update on profiles
  for each row execute function protect_profile_fields();
