-- ─────────────────────────────────────────────────────────────
-- לוח השעם הדיגיטלי — Supabase Schema
-- Run this in your Supabase SQL Editor
-- ─────────────────────────────────────────────────────────────

-- Enable UUID extension (usually pre-enabled on Supabase)
create extension if not exists "pgcrypto";

-- ─── Sessions ────────────────────────────────────────────────
create table public.sessions (
  id          uuid primary key default gen_random_uuid(),
  slug        text unique not null,
  title       text not null default 'לוח השעם הדיגיטלי',
  is_locked   boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ─── Notes ───────────────────────────────────────────────────
create table public.notes (
  id          uuid primary key default gen_random_uuid(),
  session_id  uuid not null references public.sessions(id) on delete cascade,
  type        text not null check (type in ('visible', 'hidden')),
  content     text not null check (char_length(content) <= 150),
  status      text not null default 'closed' check (status in ('closed', 'revealed')),
  position_x  numeric,
  position_y  numeric,
  rotation    numeric,
  color       text,
  pin         text,
  created_at  timestamptz not null default now(),
  revealed_at timestamptz
);

-- ─── Indexes ─────────────────────────────────────────────────
create index notes_session_id_idx on public.notes(session_id);
create index notes_status_idx on public.notes(status);
create index notes_type_idx on public.notes(type);

-- ─── Updated_at trigger ──────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger sessions_updated_at
  before update on public.sessions
  for each row execute function public.set_updated_at();

-- ─── Replica identity (required for DELETE realtime events) ──
alter table public.notes replica identity full;
alter table public.sessions replica identity full;

-- ─── Row Level Security ───────────────────────────────────────
-- NOTE: These are open policies suitable for a workshop app
-- where the board URL acts as the soft admin link.
-- For production with auth, restrict these policies.

alter table public.sessions enable row level security;
alter table public.notes enable row level security;

-- Sessions: anyone can read, insert, update
create policy "sessions_select" on public.sessions
  for select using (true);

create policy "sessions_insert" on public.sessions
  for insert with check (true);

create policy "sessions_update" on public.sessions
  for update using (true) with check (true);

-- Notes: anyone can read, insert, update
create policy "notes_select" on public.notes
  for select using (true);

create policy "notes_insert" on public.notes
  for insert with check (true);

create policy "notes_update" on public.notes
  for update using (true) with check (true);

create policy "notes_delete" on public.notes
  for delete using (true);

-- ─── Realtime publication ─────────────────────────────────────
-- Add both tables to the supabase_realtime publication
-- (this is usually managed via the Supabase Dashboard → Database → Replication,
--  but you can also run it here if the publication exists)
alter publication supabase_realtime add table public.sessions;
alter publication supabase_realtime add table public.notes;
