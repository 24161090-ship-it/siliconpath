-- Run after 001_workspace.sql. Additive migration: existing learning data is retained.
create table if not exists public.runner_jobs (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 exercise_id text not null,
 created_at timestamptz not null default now()
);
create index if not exists runner_jobs_user_date on public.runner_jobs(user_id,created_at desc);
alter table public.runner_jobs enable row level security;
revoke all on public.runner_jobs from anon, authenticated;
grant select on public.runner_jobs to authenticated;
create policy "Read own runner usage" on public.runner_jobs for select to authenticated using ((select auth.uid())=user_id);

create or replace function public.reserve_simulation(p_exercise text)
returns uuid language plpgsql security definer set search_path=public,pg_temp as $$
declare v_user uuid:=auth.uid(); v_id uuid;
begin
 if v_user is null then raise exception 'Authentication required'; end if;
 if length(p_exercise)>100 or p_exercise !~ '^[a-z0-9-]+$' then raise exception 'Invalid exercise'; end if;
 -- One transaction-wide lock protects both per-user and project-wide quotas.
 perform pg_advisory_xact_lock(72419011);
 if exists(select 1 from public.runner_jobs where user_id=v_user and created_at>now()-interval '45 seconds') then
  raise exception 'Wait 45 seconds between simulation requests';
 end if;
 if (select count(*) from public.runner_jobs where user_id=v_user and created_at>=date_trunc('day',now()))>=20 then
  raise exception 'Daily limit reached: 20 simulations per account';
 end if;
 if (select count(*) from public.runner_jobs where created_at>=date_trunc('day',now()))>=100 then
  raise exception 'Project daily simulation quota reached';
 end if;
 insert into public.runner_jobs(user_id,exercise_id) values(v_user,p_exercise) returning id into v_id;
 return v_id;
end $$;
revoke all on function public.reserve_simulation(text) from public,anon;
grant execute on function public.reserve_simulation(text) to authenticated;
