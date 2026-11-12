-- Run in Supabase SQL Editor after the base schema.
-- Stores Superadmin branding, bank details, and service catalog.

create table if not exists public.app_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.app_settings enable row level security;

-- No anon policies: the Next.js API uses the service role key.
