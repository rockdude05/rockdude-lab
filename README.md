# Rockdude Lab — 쇼케이스 사이트

**Rockdude Lab**은 rockdude0512의 공부 AI 에이전트들을 소개하고 사용 문의를 받는 쇼케이스 사이트입니다.
에이전트 코드 자체는 비공개이며, 이 저장소는 사이트 코드만 포함합니다.
배포 주소: [rockdude0512.vercel.app](https://rockdude0512.vercel.app)

---

## 기술 스택

| 레이어 | 선택 |
|---|---|
| 프레임워크 | Next.js 16 (App Router, TypeScript strict) |
| 스타일 | Tailwind CSS v4 |
| 애니메이션 | Framer Motion 12, GSAP ScrollTrigger |
| 데이터베이스 | Supabase (Postgres + RLS) |
| 배포 | Vercel |
| 테스트 | Vitest (`npm test`, 10개 유닛 테스트) |

---

## 로컬 개발

```bash
npm install
```

`.env.local` 파일을 생성하고 아래 6개 키를 채웁니다.

| 키 | 설명 |
|---|---|
| `SUPABASE_URL` | Supabase 프로젝트 URL |
| `SUPABASE_SERVICE_ROLE_KEY` | RLS를 우회하는 서비스 롤 키 (서버 전용) |
| `TELEGRAM_BOT_TOKEN` | 문의 알림을 보낼 Telegram 봇 토큰 |
| `TELEGRAM_CHAT_ID` | 알림을 수신할 채팅방 ID |
| `ADMIN_PASSWORD` | `/admin` 로그인 비밀번호 |
| `ADMIN_SECRET` | HMAC 쿠키 서명용 랜덤 문자열 (32자 이상 권장) |

```bash
npm run dev   # http://localhost:3000
npm test      # Vitest 유닛 테스트
```

---

## 새 에이전트 추가 절차 (5분)

① `public/agents/{id}/card.png` 를 추가합니다. 히어로 섹션에 라이브 데모 칩을 띄우려면 `result.png` 도 함께 추가합니다.

② `content/agents.ts` 의 `AGENTS` 배열에 항목 1개를 추가합니다.

```ts
{
  id: "my-agent",            // public/agents/{id}/ 경로와 일치
  name: "my-agent",          // 표시 이름
  category: "공부",          // AgentCategory union — 카테고리 2종 이상이면 그리드 필터 탭 자동 등장
  tagline: "한 줄 소개",
  description: "상세 설명",
  accent: "blue",            // "blue" | "green" | "orange" | "purple"
  image: "/agents/my-agent/card.png",
  status: "live",            // "live" | "beta"
  demo: {                    // 선택 — 있으면 히어로 칩 자동 등장
    command: "/my-agent 예시 명령",
    steps: [
      { label: "단계 설명", delayMs: 900 },
    ],
    resultImage: "/agents/my-agent/result.png",
    resultCaption: "결과 캡션",
  },
},
```

③ `git push` 하면 Vercel이 자동으로 배포합니다. 코드는 수정할 것이 없습니다.

> **자동 동작 요약**
> - `category` 가 2종 이상 → 에이전트 그리드 필터 탭 자동 등장
> - `demo` 필드 존재 → 히어로 섹션 칩 자동 등장

---

## 문의 수신 흐름

```
사용자 폼 제출
  → POST /api/inquiry
      ├─ Zod 스키마 검증
      ├─ honeypot 감지 시 silent 200 (봇에게 신호 없음)
      ├─ in-memory 레이트 리밋 (5회 / 10분)
      ├─ Supabase inquiries 테이블 INSERT
      └─ Telegram 즉시 알림 (best-effort, 실패해도 DB 저장은 보장)

관리자 → /admin (HMAC 쿠키 세션)
  → 문의 목록 조회
  → 상태 변경: new → review → building → done
```

Supabase `inquiries` 테이블은 RLS 정책 없이 service_role 키만 접근 가능합니다 (`supabase/schema.sql` 참고).

---

## 학습 포인트 인덱스

소스 곳곳에 `📚 학습` 주석으로 핵심 패턴 설명이 달려 있습니다.

| 파일 | 주제 |
|---|---|
| `app/layout.tsx` | Next.js Metadata API — `opengraph-image`, `icon.svg` 자동 매핑 |
| `app/globals.css` | CSS 토큰화, `scroll-padding-top`, padding-box 유리 효과 트릭 |
| `app/admin/actions.ts` | Server Action 흐름 + httpOnly 쿠키가 XSS를 막는 원리 |
| `app/admin/page.tsx` | 서버 컴포넌트에서 Server Action 사용 패턴 |
| `app/api/inquiry/route.ts` | honeypot — 봇에게 신호를 주지 않는 silent 200 처리 |
| `components/SiteHeader.tsx` | 상태 없는 서버 컴포넌트 — "use client" 없이 JS 번들 0 |
| `components/SiteFooter.tsx` | 정적 콘텐츠는 클라이언트 JS 없이 HTML만으로 충분 |
| `components/InquiryForm.tsx` | honeypot 필드 — 사람 눈엔 안 보이고 봇만 채움 |
| `components/AgentGrid.tsx` | 레지스트리 기반 그리드 + 카테고리 필터 탭 자동 등장 조건부 렌더 |
| `components/AgentCard.tsx` | 3D 틸트 카드, Framer Motion variants, `fill+sizes` 반응형 이미지 최적화 |
| `components/SectionReveal.tsx` | 뷰포트 진입 시 fade-in + slide-up 컨테이너 패턴 |
| `components/Journey.tsx` | GSAP ScrollTrigger pin + scrub 수평 스크롤리텔링 |
| `components/GlowBackground.tsx` | 상태·이벤트 없는 서버 컴포넌트 — 번들 크기 0 |
| `components/Stats.tsx` | rAF 기반 카운트업 + useInView 트리거 |
| `lib/admin-auth.ts` | HMAC 서명 쿠키 — DB 세션 없이 서버만 아는 secret으로 위조 방지 |
| `lib/rate-limit.ts` | 의존성 주입(now) — 시계를 주입받아 테스트에서 시간 제어 |
| `lib/supabase.ts` | `server-only` import — 클라이언트 번들에 service_role 키 노출을 빌드 타임 차단 |
| `lib/telegram.ts` | 알림은 best-effort — DB insert가 진실의 원천 |
| `lib/inquiry-schema.ts` | Zod honeypot 필드 선언 |

---

## 검증

Vitest 유닛 테스트 10개와 headless 브라우저 픽셀 검수를 거쳐 개발되었습니다.
