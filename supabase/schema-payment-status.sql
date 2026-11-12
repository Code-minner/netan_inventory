-- Run in Supabase SQL Editor after the base schema.
-- Adds Pending payment status and migrates legacy "Not Completed" rows.

alter table public.payments drop constraint if exists payments_status_check;

alter table public.payments
  add constraint payments_status_check
  check (status in ('Completed', 'Pending', 'Not Completed'));

update public.payments
set status = 'Pending'
where status = 'Not Completed';

alter table public.payments drop constraint if exists payments_status_check;

alter table public.payments
  add constraint payments_status_check
  check (status in ('Completed', 'Pending'));

alter table public.payments
  alter column status set default 'Pending';
