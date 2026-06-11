create table inquiries (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  type text not null check (type in ('try','idea','request','bug')),
  name text not null,
  contact text not null default '',
  body text not null,
  status text not null default 'new' check (status in ('new','review','building','done')),
  note text not null default ''
);
alter table inquiries enable row level security;
-- 📚 학습: RLS 켜고 정책 0개 = anon 키로는 아무것도 못 함. 서버의 service_role 키만 통과.
