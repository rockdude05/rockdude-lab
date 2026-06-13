-- 회원 프로필 (auth.users 1:1). 코인 잔액은 Phase 2에서 coin_ledger와 함께 의미를 가짐.
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  coins integer not null default 0 check (coins >= 0),
  created_at timestamptz not null default now()
);

alter table profiles enable row level security;

-- 본인 행만 SELECT. INSERT/UPDATE 정책 없음 = anon/authed 직접 쓰기 불가(서버 service_role만).
drop policy if exists "own profile read" on profiles;
create policy "own profile read" on profiles
  for select using (auth.uid() = id);

-- 신규 가입 시 profiles 자동 생성 (auth.users insert 트리거)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
