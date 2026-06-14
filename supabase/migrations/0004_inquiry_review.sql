-- 0004: 문의 유형 'idea'(아이디어) → 'review'(리뷰).
-- 기존 idea 행 0건 확인(try:14, bug:5). 무중단 전략 = CHECK 제약을 '확장'만 하고 축소 생략:
--   'review'를 허용에 추가하고 'idea'는 레거시로 잔존 허용(현재 UI 미제공) → 배포 윈도우 무중단.
-- 라이브 적용은 Supabase Management API(POST /database/query)로 수행됨.

alter table inquiries drop constraint if exists inquiries_type_check;
alter table inquiries
  add constraint inquiries_type_check
  check (type in ('try','idea','review','request','bug'));

-- (선택) 향후 'idea' 완전 제거 시 — 잔여 idea 백필 후 축소:
--   update inquiries set type='review' where type='idea';
--   alter table inquiries drop constraint inquiries_type_check;
--   alter table inquiries add constraint inquiries_type_check check (type in ('try','review','request','bug'));
