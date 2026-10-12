-- Run this once in Supabase: SQL Editor → New query → paste → Run
-- DATABASE_URL is not required. The app uses the service role key.

create table if not exists public.clients (
  id text primary key,
  name text not null,
  email text not null,
  phone text not null,
  initials text not null,
  services_count integer not null default 1,
  duration text not null default '1 Month',
  date text not null,
  status text not null default 'Ongoing' check (status in ('Ended', 'Ongoing')),
  form_token text not null unique,
  form_status text not null default 'pending' check (form_status in ('pending', 'completed')),
  company text,
  service_type text,
  notes text,
  project_name text,
  project_description text,
  budget text,
  goals text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.payments (
  id text primary key,
  client_id text references public.clients (id) on delete set null,
  name text not null,
  initials text not null,
  services_count integer not null default 1,
  amount text not null,
  paid_amount text not null,
  paid_date text not null,
  status text not null default 'Not Completed' check (status in ('Completed', 'Not Completed')),
  created_at timestamptz not null default now()
);

create table if not exists public.team (
  id text primary key,
  name text not null,
  initials text not null,
  email text not null unique,
  role text not null default 'Admin',
  joined text not null,
  status text not null default 'Invited' check (status in ('Active', 'Ended', 'Invited')),
  auth_user_id uuid,
  invite_token text,
  invite_expires_at timestamptz,
  reset_token text,
  reset_expires_at timestamptz,
  avatar_url text,
  notify_client boolean not null default true,
  notify_payment boolean not null default true,
  notify_service boolean not null default true,
  notify_team boolean not null default true,
  notify_system boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.notifications (
  id text primary key,
  text text not null,
  time text not null,
  unread boolean not null default true,
  date_group text not null,
  created_at timestamptz not null default now()
);

create index if not exists clients_created_at_idx on public.clients (created_at desc);
create index if not exists clients_form_token_idx on public.clients (form_token);
create index if not exists payments_created_at_idx on public.payments (created_at desc);
create index if not exists team_created_at_idx on public.team (created_at desc);
create unique index if not exists team_invite_token_idx
  on public.team (invite_token)
  where invite_token is not null;
create unique index if not exists team_reset_token_idx
  on public.team (reset_token)
  where reset_token is not null;
create index if not exists notifications_created_at_idx on public.notifications (created_at desc);

alter table public.clients enable row level security;
alter table public.payments enable row level security;
alter table public.team enable row level security;
alter table public.notifications enable row level security;

-- No anon policies: the Next.js API uses the service role key, which bypasses RLS.
