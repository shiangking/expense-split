-- Trip state per authenticated user (anonymous or email). Run in Supabase SQL editor or via CLI.
-- Requires: Auth > Providers > Anonymous sign-ins (recommended) and/or Email OTP for cross-device sync.

create table if not exists public.expense_split_state (
  user_id uuid primary key references auth.users (id) on delete cascade,
  state jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create index if not exists expense_split_state_updated_at_idx on public.expense_split_state (updated_at desc);

alter table public.expense_split_state enable row level security;

create policy "expense_split_state_select_own"
  on public.expense_split_state for select
  using (auth.uid() = user_id);

create policy "expense_split_state_insert_own"
  on public.expense_split_state for insert
  with check (auth.uid() = user_id);

create policy "expense_split_state_update_own"
  on public.expense_split_state for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "expense_split_state_delete_own"
  on public.expense_split_state for delete
  using (auth.uid() = user_id);

-- Optional: enable replication for public.expense_split_state in
-- Dashboard → Database → Publications → supabase_realtime, for instant cross-tab updates.
