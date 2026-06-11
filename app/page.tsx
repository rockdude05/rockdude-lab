// 학습 포인트: page.tsx = 서버 컴포넌트 (기본값).
// "use client" 없음 → Next.js가 서버에서 렌더링해 HTML로 전송 → 히어로 텍스트 SEO 인덱싱 가능.
// LiveRun, AgentGrid는 클라이언트 컴포넌트 ("use client" 선언됨) — 인터랙션 필요.

import LiveRun from "@/components/hero/LiveRun";
import AgentGrid from "@/components/AgentGrid";

export default function Home() {
  return (
    <>
      {/* 히어로 섹션 */}
      <section className="min-h-screen flex flex-col items-center justify-center max-w-5xl mx-auto px-6 w-full py-24 gap-8">
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
          기말 풀이 PDF가
          <br />
          <span
            className="bg-clip-text text-transparent"
            style={{
              backgroundImage:
                "linear-gradient(135deg, var(--accent-blue), var(--accent-purple))",
            }}
          >
            텔레그램으로 도착
          </span>
          하는 경험
        </h1>

        {/* 서브 카피 */}
        <p className="text-center max-w-xl" style={{ color: "var(--text-dim)" }}>
          명령 한 줄이면 검증을 거친 풀이·그림·분석이 도착합니다. 아래에서 직접
          실행해보세요.
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
    </>
  );
}
