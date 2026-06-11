"use client";

// 학습 포인트: page.tsx는 서버 컴포넌트 — HTML만 반환, JS 번들 0.
// LiveRun은 useState + useEffect가 필요하므로 "use client" 필수.
// 서버/클라이언트 분리로 히어로 텍스트는 SSR되고, 인터랙티브 터미널만 클라이언트화.

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { DEMO_AGENTS } from "@/content/agents";
import type { Agent, AgentDemo } from "@/content/agents";

// 에이전트 accent 이름 → CSS 변수 매핑
const ACCENT_VAR = {
  blue: "var(--accent-blue)",
  green: "var(--accent-green)",
  orange: "var(--accent-orange)",
  purple: "var(--accent-purple)",
} as const;

// 결과 이미지 실제 픽셀 치수 — next/image width/height 필수
const IMAGE_DIMS: Record<string, { width: number; height: number }> = {
  "/agents/homework/result.png": { width: 1200, height: 1696 },
  "/agents/figures/result.png": { width: 1035, height: 581 },
  "/agents/paper/result.png": { width: 1200, height: 1696 },
};

// 애니메이션 단계 타입
type Phase = "typing" | "steps" | "result" | "telegram" | "done";

type DemoAgent = Agent & { demo: AgentDemo };

export default function LiveRun() {
  // 학습 포인트: useReducedMotion() — prefers-reduced-motion 미디어쿼리를 React 훅으로 구독.
  // true이면 모든 타이밍을 건너뛰고 최종 상태를 즉시 렌더링 → 접근성 보장.
  const prefersReduced = useReducedMotion();

  const [activeIdx, setActiveIdx] = useState(0);
  // 학습 포인트: runId — 같은 데모를 다시 실행할 때 useEffect를 재트리거하는 카운터.
  // dependency array에 [activeIdx, runId]를 넣으면 칩 변경 + 리플레이 모두 새 시퀀스 시작.
  // setTimeout 정리(clearTimeout)는 cleanup 함수에서: 이전 runId가 만든 타이머를 모두 취소.
  const [runId, setRunId] = useState(0);

  const activeDemo = DEMO_AGENTS[activeIdx] as DemoAgent;
  const command = activeDemo.demo.command;
  const steps = activeDemo.demo.steps;
  const accentVar = ACCENT_VAR[activeDemo.accent];

  // reduced motion: 렌더링 시점에 최종 상태로 초기화 (effect 아님)
  const [phase, setPhase] = useState<Phase>(() =>
    prefersReduced ? "done" : "typing",
  );
  const [typedCount, setTypedCount] = useState(() =>
    prefersReduced ? command.length : 0,
  );
  const [visibleSteps, setVisibleSteps] = useState(() =>
    prefersReduced ? steps.length : 0,
  );

  // 타이머 refs — cleanup 용
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearAllTimers = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  }, []);

  const addTimer = useCallback((fn: () => void, ms: number) => {
    const id = setTimeout(fn, ms);
    timersRef.current.push(id);
    return id;
  }, []);

  // 데모 전환 — 칩 클릭 시 상태를 이벤트 핸들러에서 일괄 초기화
  const switchDemo = useCallback(
    (idx: number) => {
      clearAllTimers();
      setActiveIdx(idx);
      setPhase("typing");
      setTypedCount(0);
      setVisibleSteps(0);
      setRunId((r) => r + 1);
    },
    [clearAllTimers],
  );

  // 리플레이 — 이벤트 핸들러에서 상태 초기화
  const replay = useCallback(() => {
    clearAllTimers();
    setPhase("typing");
    setTypedCount(0);
    setVisibleSteps(0);
    setRunId((r) => r + 1);
  }, [clearAllTimers]);

  // ─── 타이핑 시퀀스 ─────────────────────────────────────────────────────────
  // phase === "typing" 이면서 activeIdx/runId 변경 시 실행
  useEffect(() => {
    if (prefersReduced || phase !== "typing") return;

    let charIdx = 0;
    const typeInterval = setInterval(() => {
      charIdx += 1;
      setTypedCount(charIdx);
      if (charIdx >= command.length) {
        clearInterval(typeInterval);
        addTimer(() => setPhase("steps"), 250);
      }
    }, 35);

    timersRef.current.push(
      typeInterval as unknown as ReturnType<typeof setTimeout>,
    );

    return () => {
      clearInterval(typeInterval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, activeIdx, runId]);

  // ─── 단계 표시 ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== "steps" || prefersReduced) return;

    steps.forEach((step, i) => {
      addTimer(() => setVisibleSteps(i + 1), step.delayMs);
    });

    const lastDelay = steps[steps.length - 1]?.delayMs ?? 0;
    addTimer(() => setPhase("result"), lastDelay + 600);

    return clearAllTimers;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, activeIdx, runId]);

  // ─── result → telegram → done ──────────────────────────────────────────────
  useEffect(() => {
    if (prefersReduced) return;

    if (phase === "result") {
      addTimer(() => setPhase("telegram"), 900);
    } else if (phase === "telegram") {
      addTimer(() => setPhase("done"), 600);
    }

    return clearAllTimers;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, activeIdx, runId]);

  const isLandscape =
    (IMAGE_DIMS[activeDemo.demo.resultImage]?.width ?? 1) >
    (IMAGE_DIMS[activeDemo.demo.resultImage]?.height ?? 1);
  const cardWidth = isLandscape ? 210 : 150;
  const dims = IMAGE_DIMS[activeDemo.demo.resultImage] ?? {
    width: 1200,
    height: 1696,
  };

  const showResult =
    phase === "result" || phase === "telegram" || phase === "done";
  const showToast = phase === "telegram" || phase === "done";
  const showCTA = phase === "done";

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col gap-4">
      {/* 칩 행 */}
      <div className="flex items-center gap-2 flex-wrap">
        {DEMO_AGENTS.map((agent, i) => {
          const chipAccent = ACCENT_VAR[(agent as DemoAgent).accent];
          const chipCommand = (agent as DemoAgent).demo.command.split(/\s+/)[0];
          const isActive = i === activeIdx;
          return (
            <button
              key={agent.id}
              onClick={() => switchDemo(i)}
              className="font-mono text-sm rounded-full px-4 py-1.5 border transition-all cursor-pointer"
              style={
                isActive
                  ? {
                      borderColor: chipAccent,
                      color: chipAccent,
                      background: `color-mix(in srgb, ${chipAccent} 12%, transparent)`,
                    }
                  : {
                      borderColor: "#30363d",
                      color: "var(--text-dim)",
                    }
              }
            >
              {chipCommand}
            </button>
          );
        })}
        {/* 리플레이 버튼 — done 단계만 표시 */}
        {showCTA && (
          <button
            onClick={replay}
            className="ml-auto text-xs font-mono transition-opacity cursor-pointer"
            style={{ color: "var(--text-dim)" }}
          >
            ↻ 다시 보기
          </button>
        )}
      </div>

      {/* 터미널 패널 래퍼 — overflow visible로 아티팩트 오버행 허용, mb-16으로 CTA 충돌 방지 */}
      <div className="relative mb-16">
        {/* 터미널 패널 */}
        <div
          className="w-full rounded-2xl"
          style={{
            background: "#0d1117",
            border: "1px solid rgba(255,255,255,0.08)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
          }}
        >
          {/* 터미널 헤더 */}
          <div
            className="flex items-center px-4 py-3 border-b"
            style={{ borderColor: "rgba(255,255,255,0.06)" }}
          >
            {/* macOS 신호등 */}
            <div className="flex gap-2">
              <div className="w-[10px] h-[10px] rounded-full bg-[#ff5f57]" />
              <div className="w-[10px] h-[10px] rounded-full bg-[#febc2e]" />
              <div className="w-[10px] h-[10px] rounded-full bg-[#28c840]" />
            </div>
            <span
              className="mx-auto font-mono text-[11px]"
              style={{ color: "var(--text-dim)" }}
            >
              rockdude.lab — demo
            </span>
            {/* 헤더 우측 패딩 균형용 */}
            <div className="w-[34px]" />
          </div>

          {/* 터미널 콘텐츠 — 최소 높이로 레이아웃 점프 방지 */}
          <div className="px-5 py-4 min-h-[260px] flex flex-col gap-3">
            {/* 타이핑 라인 */}
            <div className="font-mono text-sm flex items-center gap-0">
              <span style={{ color: "var(--accent-green)" }}>$ </span>
              <span style={{ color: "var(--text-main)" }}>
                {command.slice(0, typedCount)}
              </span>
              {/* 깜빡이는 블록 커서 — typing 단계만 */}
              {phase === "typing" && (
                <span
                  className="inline-block w-[8px] h-[1em] ml-[1px] cursor-blink"
                  style={{ background: "var(--text-main)" }}
                />
              )}
            </div>

            {/* 단계 목록 — min-h 예약으로 패널 점프 방지 */}
            <div className="flex flex-col gap-1.5 min-h-[72px]">
              {steps.slice(0, visibleSteps).map((step, i) => (
                <motion.div
                  key={`${activeIdx}-${runId}-${i}`}
                  initial={prefersReduced ? undefined : { opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  className="font-mono text-sm flex items-center gap-2"
                >
                  <span style={{ color: accentVar }}>✓</span>
                  <span style={{ color: "var(--text-dim)" }}>{step.label}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* 결과 아티팩트 — 패널 우측 하단 오버행 */}
        {showResult && (
          <motion.div
            key={`result-${activeIdx}-${runId}`}
            initial={
              prefersReduced ? undefined : { opacity: 0, y: 30, rotate: -2 }
            }
            animate={{ opacity: 1, y: 0, rotate: -2 }}
            transition={{ type: "spring", stiffness: 200, damping: 22 }}
            className="absolute -bottom-6 -right-4 md:-right-8 rounded-md overflow-hidden result-glow-card"
            style={{
              width: cardWidth,
              // CSS 애니메이션에서 참조하는 커스텀 프로퍼티
              ["--glow-color" as string]: accentVar,
            }}
          >
            <Image
              src={activeDemo.demo.resultImage}
              alt={activeDemo.demo.resultCaption}
              width={dims.width}
              height={dims.height}
              style={{ width: "100%", height: "auto", display: "block" }}
            />
          </motion.div>
        )}

        {/* 텔레그램 토스트 — 패널 좌측 하단 오버행 */}
        {showToast && (
          <motion.div
            key={`toast-${activeIdx}-${runId}`}
            initial={
              prefersReduced ? undefined : { opacity: 0, scale: 0.85 }
            }
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              type: "spring",
              stiffness: 350,
              damping: 20,
              restDelta: 0.001,
            }}
            className="absolute -bottom-5 left-4 rounded-xl px-3.5 py-2 text-sm font-medium text-white"
            style={{ background: "#229ed9" }}
          >
            ✈️ {activeDemo.demo.resultCaption}
          </motion.div>
        )}
      </div>

      {/* CTA — done 단계 */}
      {showCTA && (
        <motion.div
          initial={prefersReduced ? undefined : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="flex justify-center"
        >
          <a
            href="#inquiry"
            className="rounded-full px-6 py-3 font-semibold text-white transition-all hover:brightness-110"
            style={{
              background:
                "linear-gradient(135deg, var(--accent-blue), var(--accent-purple))",
            }}
          >
            나도 써보기 — 문의하기
          </a>
        </motion.div>
      )}
    </div>
  );
}
