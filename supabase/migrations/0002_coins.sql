-- 코인 원장 (모든 변동 = 감사추적; profiles.coins는 성능 캐시)
create table if not exists coin_ledger (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  delta integer not null,
  reason text not null,                 -- 'topup' | 'run:study-notes' | 'refund' | 'adjust'
  ref_id uuid,                          -- coin_topup_requests.id / agent_runs.id 등
  created_at timestamptz not null default now()
);
alter table coin_ledger enable row level security;
drop policy if exists "own ledger read" on coin_ledger;
create policy "own ledger read" on coin_ledger for select using (auth.uid() = user_id);

-- 충전 신청 (수동 충전: 송금 후 신청 → 관리자 확인 지급)
create table if not exists coin_topup_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  amount_won integer not null check (amount_won > 0),
  coins integer not null check (coins > 0),
  depositor text not null,
  status text not null default 'pending' check (status in ('pending','done','rejected')),
  created_at timestamptz not null default now(),
  processed_at timestamptz
);
alter table coin_topup_requests enable row level security;
drop policy if exists "own topup read" on coin_topup_requests;
create policy "own topup read" on coin_topup_requests for select using (auth.uid() = user_id);

-- 원자적 코인 변동 — 잔액가드(음수 방지) + 원장·캐시 동시 갱신. service_role(서버)만 호출.
create or replace function apply_coin_delta(
  p_user_id uuid, p_delta integer, p_reason text, p_ref_id uuid default null
) returns integer
language plpgsql security definer set search_path = public
as $$
declare cur integer;
begin
  select coins into cur from profiles where id = p_user_id for update; -- 행 잠금(동시성)
  if cur is null then raise exception 'user_not_found'; end if;
  if cur + p_delta < 0 then raise exception 'insufficient_coins'; end if;
  update profiles set coins = cur + p_delta where id = p_user_id;
  insert into coin_ledger(user_id, delta, reason, ref_id)
    values (p_user_id, p_delta, p_reason, p_ref_id);
  return cur + p_delta;
end;
$$;

-- 충전 승인 — 신청 done 표시 + 코인 지급(원자적). 중복 지급 방지.
create or replace function approve_topup(p_request_id uuid)
returns integer
language plpgsql security definer set search_path = public
as $$
declare r coin_topup_requests; bal integer;
begin
  select * into r from coin_topup_requests where id = p_request_id for update;
  if r.id is null then raise exception 'request_not_found'; end if;
  if r.status <> 'pending' then raise exception 'already_processed'; end if;
  bal := apply_coin_delta(r.user_id, r.coins, 'topup', r.id);
  update coin_topup_requests set status = 'done', processed_at = now() where id = p_request_id;
  return bal;
end;
$$;
