-- Run this if you already ran schema.sql once.
-- Adds the columns needed for admin login, invites, and password reset.

alter table public.team add column if not exists auth_user_id uuid;
alter table public.team add column if not exists invite_token text;
alter table public.team add column if not exists invite_expires_at timestamptz;
alter table public.team add column if not exists reset_token text;
alter table public.team add column if not exists reset_expires_at timestamptz;
alter table public.team add column if not exists avatar_url text;
alter table public.team add column if not exists notify_client boolean not null default true;
alter table public.team add column if not exists notify_payment boolean not null default true;
alter table public.team add column if not exists notify_service boolean not null default true;
alter table public.team add column if not exists notify_team boolean not null default true;
alter table public.team add column if not exists notify_system boolean not null default false;

create unique index if not exists team_invite_token_idx
  on public.team (invite_token)
  where invite_token is not null;

create unique index if not exists team_reset_token_idx
  on public.team (reset_token)
  where reset_token is not null;
