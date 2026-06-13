"use client";

// 📚 학습 포인트: rAF 기반 카운트업 + useInView 트리거.
// requestAnimationFrame 루프로 ~1.2s 동안 easeOutCubic 커브를 따라
// 0 → target 값을 부드럽게 증가시킴. useInView로 섹션이 뷰포트에
// 진입하는 순간 카운트업을 시작하고, once:true로 한 번만 실행.
// prefers-reduced-motion → 즉시 최종값 노출.

import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "framer-motion";
import { STATS } from "@/content/stats";
import SectionReveal from "@/components/SectionReveal";

/** easeOutCubic: 빠르게 시작해서 부드럽게 감속 */
function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

/** rAF 기반 카운트업 훅
 * @param target 최종 값
 * @param started 카운트업 시작 여부 (false이면 0 반환, reduced motion이면 즉시 target)
 */
function useCountUp(target: number, started: boolean): number {
  const prefersReduced = useReducedMotion();
  // SSR과 클라이언트 첫 렌더를 0으로 일치 (hydration mismatch 방지)
  const [count, setCount] = useState(0);
  const rafRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const DURATION = 1200; // ms

  useEffect(() => {
    // 아직 시작 신호가 없으면 대기
    if (!started) return;

    // reduced motion: 카운트업 없이 rAF 1회로 최종값 점프 (비동기 콜백 — lint 허용)
    if (prefersReduced) {
      rafRef.current = requestAnimationFrame(() => setCount(target));
      return () => {
        if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      };
    }

    // 이전 rAF 취소
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    startTimeRef.current = null;

    function tick(timestamp: number) {
      if (startTimeRef.current === null) startTimeRef.current = timestamp;
      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / DURATION, 1);
      const eased = easeOutCubic(progress);
      setCount(Math.round(eased * target));
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      }
    }

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [target, started, prefersReduced]);

  return count;
}

/** 단일 지표 카드 */
function StatItem({
  label,
  value,
  suffix,
  started,
}: {
  label: string;
  value: number;
  suffix?: string;
  started: boolean;
}) {
  const count = useCountUp(value, started);

  return (
    // 글래스 패널 — 상단 accent 바 + hover 글로우(globals.css .stat-panel)
    <div className="stat-panel flex flex-col gap-2 p-5">
      {/* 숫자 + 접미사 — 숫자에 바이올렛 그라데이션+글로우(.stat-number) */}
      <div className="flex items-end gap-1">
        <span className="stat-number font-mono text-4xl md:text-5xl font-bold leading-none">
          {count.toLocaleString()}
        </span>
        {suffix && (
          <span
            className="text-xl font-mono mb-1"
            style={{ color: "var(--text-dim)" }}
          >
            {suffix}
          </span>
        )}
      </div>
      {/* 라벨 */}
      <p className="text-sm" style={{ color: "var(--text-dim)" }}>
        {label}
      </p>
    </div>
  );
}

export default function Stats() {
  // 섹션이 뷰포트에 진입하면 started → true (once: true)
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-80px" });

  return (
    <section
      id="stats"
      ref={sectionRef}
      className="max-w-6xl mx-auto px-6 py-24"
    >
      {/* SectionReveal로 전체 래핑 — 진입 시 fade+slide-up */}
      <SectionReveal>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {STATS.map((stat) => (
            <StatItem
              key={stat.label}
              label={stat.label}
              value={stat.value}
              suffix={stat.suffix}
              // source 필드는 렌더링하지 않음 — 코드 주석/데이터에만 존재
              started={isInView}
            />
          ))}
        </div>
      </SectionReveal>
    </section>
  );
}
