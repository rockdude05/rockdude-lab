-- Phase 3: 코인 실행 (agent_runs + create_run/create_revision). apply_coin_delta(0002) 재사용.
create table if not exists agent_runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  agent text not null check (agent in ('study-notes','homework-solver','course-analyzer')),
  cost integer not null default 0,        -- 총 청구 코인(base+가산). 무료 재요청=0.
  page_count integer not null default 0,  -- 제출 시 가중 카운트(이미지×2)
  status text not null default 'queued'
    check (status in ('queued','running','review','done','failed','refunded')),
  files jsonb not null default '[]',       -- [{path,name,size,role}]
  inputs jsonb not null default '{}',      -- 텍스트 필드 {concept|scope|note: 값}
  note text not null default '',
  parent_run_id uuid references agent_runs(id) on delete set null,  -- 재요청 부모
  revision_note text,                      -- 재요청 사항(정조준 grounding)
  result_path text,                        -- run-results 버킷 path
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists agent_runs_user_idx on agent_runs(user_id, created_at desc);
create index if not exists agent_runs_queue_idx on agent_runs(status) where status = 'queued';

alter table agent_runs enable row level security;
drop policy if exists "own runs read" on agent_runs;
create policy "own runs read" on agent_runs for select using (auth.uid() = user_id);
-- 쓰기 정책 없음 = service_role 서버 경로만. 코인·실행 위변조 방지.

-- updated_at 자동 갱신
create or replace function touch_updated_at() returns trigger
language plpgsql set search_path = public as $$
begin new.updated_at = now(); return new; end $$;
drop trigger if exists agent_runs_touch on agent_runs;
create trigger agent_runs_touch before update on agent_runs
  for each row execute function touch_updated_at();

-- 원자 실행 생성: run insert + 잔액확인·차감(apply_coin_delta) 한 트랜잭션(=함수). 잔액부족 시 raise → 롤백(orphan 없음).
create or replace function create_run(
  p_user_id uuid, p_agent text, p_cost integer, p_page_count integer,
  p_inputs jsonb, p_note text
) returns uuid
language plpgsql security definer set search_path = public as $$
declare new_id uuid;
begin
  insert into agent_runs(user_id, agent, cost, page_count, inputs, note)
    values (p_user_id, p_agent, p_cost, p_page_count, coalesce(p_inputs,'{}'::jsonb), coalesce(p_note,''))
    returning id into new_id;
  -- apply_coin_delta가 잔액가드(부족 시 raise insufficient_coins) + ledger 기록(ref=run.id)
  perform apply_coin_delta(p_user_id, -p_cost, 'run:'||p_agent, new_id);
  return new_id;
end $$;

-- 무료 재요청(원본당 1회): 부모 done & 자식 없음 확인 후 cost 0 run 생성. 부모 files/inputs 상속.
create or replace function create_revision(
  p_user_id uuid, p_parent uuid, p_revision_note text
) returns uuid
language plpgsql security definer set search_path = public as $$
declare r agent_runs; new_id uuid; child_cnt integer;
begin
  select * into r from agent_runs where id = p_parent for update;
  if not found or r.user_id <> p_user_id then raise exception 'not_owner'; end if;
  if r.status <> 'done' then raise exception 'parent_not_done'; end if;
  if r.parent_run_id is not null then raise exception 'already_revision'; end if;
  select count(*) into child_cnt from agent_runs where parent_run_id = p_parent;
  if child_cnt > 0 then raise exception 'revision_used'; end if;
  insert into agent_runs(user_id, agent, cost, page_count, files, inputs, note, parent_run_id, revision_note)
    values (r.user_id, r.agent, 0, r.page_count, r.files, r.inputs, r.note, r.id, p_revision_note)
    returning id into new_id;
  return new_id;
end $$;
