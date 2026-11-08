-- Apply in Supabase SQL Editor. Uses only the anon/publishable key on the client.
create table if not exists public.workspaces (
 user_id uuid primary key references auth.users(id) on delete cascade,
 data jsonb not null check (jsonb_typeof(data) = 'object'),
 revision bigint not null default 1 check (revision > 0),
 updated_at timestamptz not null default now()
);
alter table public.workspaces enable row level security;
revoke all on public.workspaces from anon;
grant select, insert, update, delete on public.workspaces to authenticated;
create policy "Read own workspace" on public.workspaces for select to authenticated using ((select auth.uid()) = user_id);
create policy "Create own workspace" on public.workspaces for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Update own workspace" on public.workspaces for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "Delete own workspace" on public.workspaces for delete to authenticated using ((select auth.uid()) = user_id);
