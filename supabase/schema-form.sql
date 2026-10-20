-- Run after schema.sql. Adds client onboarding checkout fields + upload bucket.

alter table public.clients add column if not exists selected_services jsonb;
alter table public.clients add column if not exists timeline text;
alter table public.clients add column if not exists project_document_url text;
alter table public.clients add column if not exists about_project text;
alter table public.clients add column if not exists payment_percent integer;
alter table public.clients add column if not exists payment_proof_url text;
alter table public.clients add column if not exists order_total text;

alter table public.payments add column if not exists payment_percent integer;
alter table public.payments add column if not exists payment_proof_url text;

-- Public bucket for project docs + payment proofs (PNG/JPG)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'client-uploads',
  'client-uploads',
  true,
  5242880,
  array['image/png', 'image/jpeg', 'image/jpg', 'image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;
