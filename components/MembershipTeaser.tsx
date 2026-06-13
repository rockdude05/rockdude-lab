// 📚 메인의 골드 진입 배너 — R3F 없이 경량(메인 perf 보호). /membership으로 유도.
import Link from "next/link";

export default function MembershipTeaser() {
  return (
    <section id="membership" className="max-w-5xl mx-auto px-6 py-16 w-full">
      <div className="membership-card rounded-2xl p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
        <div className="flex flex-col gap-2">
          <p
            className="eyebrow-rule font-mono text-sm"
            style={{ color: "var(--accent-gold)" }}
          >
            ~/membership
          </p>
          <h2
            className="font-semibold text-2xl md:text-3xl tracking-[-0.02em] break-keep"
            style={{ color: "var(--text-main)" }}
          >
            <span className="gold-glow">코인</span>으로 에이전트를 직접 실행
          </h2>
          <p className="text-sm break-keep" style={{ color: "var(--text-dim)" }}>
            로그인하고 공부노트·과제풀이·분석을 코인으로 돌려 결과 PDF를
            받으세요.
          </p>
        </div>
        <Link
          href="/membership"
          className="cta-gold rounded-full px-6 py-3 font-semibold shrink-0"
        >
          회원 시작하기 →
        </Link>
      </div>
    </section>
  );
}
