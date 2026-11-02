-- Account data for Solo Travel 365.
-- Run this in the Supabase SQL editor. It was not applied automatically.
-- The browser uses the publishable key only. These policies let a signed-in
-- user read and write their own rows and nobody else's.

create table if not exists public.user_collections (
  user_id uuid primary key references auth.users (id) on delete cascade,
  cards jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.user_pack_state (
  user_id uuid primary key references auth.users (id) on delete cascade,
  queue jsonb not null default '[]'::jsonb,
  unlimited boolean not null default false,
  cooldown_at timestamptz,
  last_card text,
  updated_at timestamptz not null default now()
);

create table if not exists public.user_preferences (
  user_id uuid primary key references auth.users (id) on delete cascade,
  marketing_opt_in boolean not null default false,
  age_confirmed boolean not null default false,
  terms_accepted_at timestamptz,
  updated_at timestamptz not null default now()
);

alter table public.user_collections enable row level security;
alter table public.user_pack_state enable row level security;
alter table public.user_preferences enable row level security;

drop policy if exists "user_collections_select_own" on public.user_collections;
drop policy if exists "user_collections_insert_own" on public.user_collections;
drop policy if exists "user_collections_update_own" on public.user_collections;
drop policy if exists "user_collections_delete_own" on public.user_collections;
create policy "user_collections_select_own" on public.user_collections for select to authenticated using (auth.uid() = user_id);
create policy "user_collections_insert_own" on public.user_collections for insert to authenticated with check (auth.uid() = user_id);
create policy "user_collections_update_own" on public.user_collections for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "user_collections_delete_own" on public.user_collections for delete to authenticated using (auth.uid() = user_id);

drop policy if exists "user_pack_state_select_own" on public.user_pack_state;
drop policy if exists "user_pack_state_insert_own" on public.user_pack_state;
drop policy if exists "user_pack_state_update_own" on public.user_pack_state;
drop policy if exists "user_pack_state_delete_own" on public.user_pack_state;
create policy "user_pack_state_select_own" on public.user_pack_state for select to authenticated using (auth.uid() = user_id);
create policy "user_pack_state_insert_own" on public.user_pack_state for insert to authenticated with check (auth.uid() = user_id);
create policy "user_pack_state_update_own" on public.user_pack_state for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "user_pack_state_delete_own" on public.user_pack_state for delete to authenticated using (auth.uid() = user_id);

drop policy if exists "user_preferences_select_own" on public.user_preferences;
drop policy if exists "user_preferences_insert_own" on public.user_preferences;
drop policy if exists "user_preferences_update_own" on public.user_preferences;
drop policy if exists "user_preferences_delete_own" on public.user_preferences;
create policy "user_preferences_select_own" on public.user_preferences for select to authenticated using (auth.uid() = user_id);
create policy "user_preferences_insert_own" on public.user_preferences for insert to authenticated with check (auth.uid() = user_id);
create policy "user_preferences_update_own" on public.user_preferences for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "user_preferences_delete_own" on public.user_preferences for delete to authenticated using (auth.uid() = user_id);

-- Deletes the signed-in user's rows only. It does not delete the auth user.
-- Removing the login itself needs a privileged call. See
-- supabase/functions/delete-account/index.ts.
create or replace function public.delete_my_data()
returns void
language plpgsql
security invoker
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;
  delete from public.user_collections where user_id = auth.uid();
  delete from public.user_pack_state where user_id = auth.uid();
  delete from public.user_preferences where user_id = auth.uid();
end;
$$;

revoke all on function public.delete_my_data() from public;
grant execute on function public.delete_my_data() to authenticated;
