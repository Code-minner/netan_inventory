-- Run this in the SAME Supabase project your app keys point at.
-- If it errors, read the message. Do not ignore INSERT 0.

do $$
declare
  uid uuid;
begin
  if not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'team'
      and column_name = 'auth_user_id'
  ) then
    raise exception 'team.auth_user_id is missing. Run supabase/schema-auth.sql first.';
  end if;

  select id
    into uid
  from auth.users
  where lower(email) = 'boluwatifeagbo@gmail.com'
  limit 1;

  if uid is null then
    raise exception 'No Auth user for boluwatifeagbo@gmail.com. Go to Authentication → Users → Add user, turn Auto Confirm ON, set a password, then run this again.';
  end if;

  delete from public.team
  where lower(email) = 'boluwatifeagbo@gmail.com'
     or id = 'admin-bolu';

  insert into public.team (
    id, name, initials, email, role, joined, status, auth_user_id,
    notify_client, notify_payment, notify_service, notify_team, notify_system
  ) values (
    'admin-bolu',
    'Boluwatife Agbo',
    'BA',
    'boluwatifeagbo@gmail.com',
    'Superadmin',
    'Oct 12, 2026',
    'Active',
    uid,
    true, true, true, true, false
  );

  raise notice 'Admin row created and linked to Auth user %', uid;
end $$;

select id, email, role, status, auth_user_id
from public.team
where lower(email) = 'boluwatifeagbo@gmail.com';
