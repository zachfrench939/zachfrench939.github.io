-- Optional column so a signed-in journey can sync.
-- Run in the Supabase SQL editor. The game still works from this browser if you skip it.
alter table public.user_pack_state
  add column if not exists journey jsonb;
