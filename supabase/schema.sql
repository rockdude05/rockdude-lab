create table inquiries (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  -- 'idea'는 레거시(현재 UI 미제공, 'review'로 대체) — 무중단 위해 제약에 잔존 허용. (0004 참조)
  type text not null check (type in ('try','idea','review','request','bug')),
  name text not null,
  contact text not null default '',
  body text not null,
  status text not null default 'new' check (status in ('new','review','building','done')),
  note text not null default ''
);
alter table inquiries enable row level security;
-- 📚 학습: RLS 켜고 정책 0개 = anon 키로는 아무것도 못 함. 서버의 service_role 키만 통과.
