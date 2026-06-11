// 학습 포인트: page.tsx = 서버 컴포넌트 (기본값).
// "use client" 없음 → Next.js가 서버에서 렌더링해 HTML로 전송 → 히어로 텍스트 SEO 인덱싱 가능.
// LiveRun, AgentGrid, Journey, Stats는 클라이언트 컴포넌트 ("use client" 선언됨) — 인터랙션 필요.

import LiveRun from "@/components/hero/LiveRun";
import AgentGrid from "@/components/AgentGrid";
import Journey from "@/components/Journey";
import Stats from "@/components/Stats";
import InquiryForm from "@/components/InquiryForm";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

export default function Home() {
  return (
    <>
      <SiteHeader />
      {/* main 랜드마크 — 스크린리더 본문 탐색 + Lighthouse a11y */}
      <main className="flex flex-col w-full">
      {/* 히어로 섹션 — pt-32는 고정 헤더 높이만큼 보정 */}
      <section
        id="top"
        className="min-h-screen flex flex-col items-center justify-center max-w-5xl mx-auto px-6 w-full pt-32 pb-24 gap-8"
      >
        {/* 아이브로우 */}
        <p
          className="text-sm tracking-widest uppercase"
          style={{ color: "var(--text-dim)" }}
        >
          rockdude0512가 만드는 공부 에이전트들
        </p>

        {/* H1 */}
        <h1
          className="font-bold text-4xl md:text-6xl leading-tight text-center"
          style={{ color: "var(--text-main)" }}
        >
          풀이도, 노트도, 분석도
          <br />
          <span
            className="bg-clip-text text-transparent"
            style={{
              backgroundImage:
                "linear-gradient(135deg, var(--accent-blue), var(--accent-purple))",
            }}
          >
            내 손 안에
          </span>{" "}
          도착하는 경험
        </h1>

        {/* 서브 카피 */}
        <p className="text-center max-w-xl" style={{ color: "var(--text-dim)" }}>
          기말 풀이부터 논문 분석까지 — 명령 한 줄이면 검증을 거친 결과물이
          텔레그램으로 도착합니다. 아래에서 직접 실행해보세요.
        </p>

        {/* 라이브 런 클라이언트 컴포넌트 */}
        <LiveRun />

        {/* 푸터 힌트 — #agents 앵커 링크, hover 시 밝아짐 (CSS .scroll-hint-link) */}
        <a
          href="#agents"
          className="scroll-hint-link text-sm text-center mt-auto"
        >
          ↓ 스크롤해서 에이전트들 구경하기
        </a>
      </section>

      {/* 에이전트 그리드 섹션 */}
      <AgentGrid />

      {/* 여정 스크롤리텔링 섹션 */}
      <Journey />

      {/* 지표 카운트업 섹션 */}
      <Stats />

      {/* 문의 폼 섹션 */}
      <InquiryForm />
      </main>
      <SiteFooter />
    </>
  );
}
