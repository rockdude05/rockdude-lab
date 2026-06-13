"use client";

// 📚 학습 포인트: GSAP ScrollTrigger pin + scrub 수평 스크롤리텔링 패턴.
// gsap.context()로 클린업을 보장하고, ctx.revert()로 ScrollTrigger 인스턴스를 제거.
// useReducedMotion 감지 시 GSAP 완전 건너뛰고 수직 스택 레이아웃으로 폴백.

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useReducedMotion } from "framer-motion";
import SectionReveal from "@/components/SectionReveal";

// 4개 컷 데이터 — 내부 도구명 / 모델명 일절 제외 (스펙 §하드룰)
// glow: 컷별 무대 조명 색 / num: 배경 워터마크 / desc: 경험 언어 한 줄
const CUTS = [
  {
    step: "① 시험지 도착",
    desc: "사진이든 PDF든 — 시험지 한 장이면 시작됩니다",
    glow: "rgba(255, 196, 110, 0.24)", // 따뜻한 색은 어두운 배경에서 체감 밝기가 낮아 알파를 높임
    num: "01",
  },
  {
    step: "② 문제·그림 정밀 판독",
    desc: "글자만이 아니라 구조식·그래프의 입체 정보까지 읽습니다",
    glow: "rgba(63, 199, 123, 0.20)",
    num: "02",
  },
  {
    step: "③ 풀이 생성 + 자체 검증",
    desc: "계산은 두 번 확인하고, 그림은 스스로 검사를 통과해야 실립니다",
    glow: "rgba(77, 139, 255, 0.24)",
    num: "03",
  },
  {
    step: "④ 텔레그램 도착",
    desc: "검증을 마친 풀이와 그림이 PDF로 도착합니다",
    glow: "rgba(34, 158, 217, 0.24)",
    num: "04",
  },
];

/** 컷 1: 종이 느낌의 시험지 카드 */
function CutExam() {
  return (
    <div
      className="w-[200px] sm:w-[220px] rounded-lg overflow-hidden shadow-xl"
      style={{
        background: "#f5f3ec",
        transform: "rotate(-1.5deg)",
        border: "1px solid #e0ddd5",
      }}
    >
      {/* 제목 바 */}
      <div
        className="px-3 py-2 text-xs font-bold tracking-wider"
        style={{ background: "#1a1a2e", color: "#ece9f4" }}
      >
        2024 기말고사
      </div>
      {/* 텍스트 라인들 */}
      <div className="px-3 py-3 flex flex-col gap-1.5">
        {[80, 70, 90, 60].map((w, i) => (
          <div
            key={i}
            className="rounded-sm h-1.5"
            style={{ background: "#ccc", width: `${w}%` }}
          />
        ))}
        {/* 구조식 그림 박스 */}
        <div
          className="mt-2 rounded px-2 py-3 flex items-center justify-center"
          style={{
            border: "1.5px dashed #aaa",
            background: "rgba(0,0,0,0.03)",
          }}
        >
          <span
            className="text-[10px] font-sans"
            style={{ color: "#777" }}
          >
            구조식 그림
          </span>
        </div>
        {[55, 75, 65].map((w, i) => (
          <div
            key={i}
            className="rounded-sm h-1.5"
            style={{ background: "#ccc", width: `${w}%` }}
          />
        ))}
      </div>
    </div>
  );
}

/** 컷 2: 터미널 스타일 판독 노트 카드 */
function CutRead() {
  return (
    <div
      className="w-[200px] sm:w-[220px] rounded-lg overflow-hidden shadow-xl"
      style={{
        background: "#0d1117",
        border: "1px solid #2ea763",
      }}
    >
      <div
        className="px-3 py-2 text-xs font-mono font-semibold"
        style={{ color: "#3fc77b", borderBottom: "1px solid #2ea76340" }}
      >
        판독 노트
      </div>
      <div className="px-3 py-3 flex flex-col gap-2">
        {[
          "문제 12개 인식",
          "그림 4개 — 입체 정보까지 판독",
          "애매한 부분 0개",
        ].map((line, i) => (
          <p
            key={i}
            className="text-[11px] font-mono leading-relaxed"
            style={{ color: "#8b949e" }}
          >
            <span style={{ color: "#3fc77b" }}>❯ </span>
            {line}
          </p>
        ))}
      </div>
    </div>
  );
}

/** 컷 3: 문서 스타일 풀이 카드 + 검증 박스 */
function CutSolve() {
  return (
    <div
      className="w-[200px] sm:w-[220px] rounded-lg overflow-hidden shadow-xl"
      style={{
        background: "#fff",
        border: "1px solid #e0ddd5",
      }}
    >
      {/* 제목 바 */}
      <div
        className="px-3 py-2 text-xs font-bold tracking-wide"
        style={{ background: "#1a1a2e", color: "#ece9f4" }}
      >
        풀이 문서
      </div>
      <div className="px-3 py-3 flex flex-col gap-1.5">
        {[85, 70, 90].map((w, i) => (
          <div
            key={i}
            className="rounded-sm h-1.5"
            style={{ background: "#ddd", width: `${w}%` }}
          />
        ))}
        {/* 검증 통과 박스 */}
        <div
          className="my-1.5 rounded px-2 py-2"
          style={{
            border: "1.5px solid #2ea763",
            background: "rgba(46,167,99,0.06)",
            boxShadow: "0 0 10px rgba(46,167,99,0.25)",
          }}
        >
          <p
            className="text-[11px] font-semibold"
            style={{ color: "#2ea763" }}
          >
            ✓ 검증 통과 그림
          </p>
        </div>
        {[65, 80, 55].map((w, i) => (
          <div
            key={i}
            className="rounded-sm h-1.5"
            style={{ background: "#ddd", width: `${w}%` }}
          />
        ))}
      </div>
    </div>
  );
}

/** 컷 4: 텔레그램 버블 + CTA */
function CutTelegram() {
  return (
    <div className="flex flex-col items-center gap-3">
      {/* 텔레그램 버블들 */}
      <div className="flex flex-col gap-2">
        {["✈️ 풀이.pdf (17쪽)", "✈️ 그림.pdf (8장)"].map((msg, i) => (
          <div
            key={i}
            className="rounded-xl px-4 py-2.5 text-sm font-medium text-white"
            style={{ background: "#229ed9" }}
          >
            {msg}
          </div>
        ))}
      </div>
      {/* CTA 버튼 */}
      <a
        href="#inquiry"
        className="cta-glass rounded-full px-5 py-2.5 text-sm font-medium"
      >
        새 에이전트 요청하기 →
      </a>
    </div>
  );
}

const CUT_CARDS = [CutExam, CutRead, CutSolve, CutTelegram];

// 📚 학습: useSyncExternalStore로 만든 lint-safe "mounted" 감지 —
// 서버 스냅샷 false, 클라이언트 스냅샷 true → effect 없이 하이드레이션 후 1회 재렌더.
function useMounted(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

export default function Journey() {
  const prefersReduced = useReducedMotion();
  // SSR에선 reduced 여부를 모름(null) → 항상 핀 레이아웃으로 hydrate하고,
  // 마운트 후 reduced 사용자만 수직 스택으로 전환 (hydration mismatch 방지)
  const mounted = useMounted();
  const reduced = mounted && prefersReduced === true;
  const pinRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  // 📚 학습 포인트: GSAP ScrollTrigger 수평 핀 패턴.
  // gsap.context() 스코프로 인스턴스를 묶어두면 ctx.revert() 한 번으로
  // 생성된 모든 ScrollTrigger + 트윈을 한 번에 정리 (메모리 누수 방지).
  // scrub:1 = 스크롤 위치와 1초 부드러움으로 애니메이션 동기화.
  // end:"+=2400" = 핀 상태에서 2400px 추가 스크롤 후 언핀.
  // 📚 학습: GSAP 동적 import — 초기 JS 번들에서 gsap(~30KB gz)을 분리.
  // Journey는 below-the-fold라 hydration 후 로드해도 체감 차이 없음 (Lighthouse perf 개선).
  useEffect(() => {
    if (prefersReduced) return;

    let ctx: { revert: () => void } | null = null;
    let cancelled = false;

    (async () => {
      const [{ default: gsap }, { ScrollTrigger }] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ]);
      if (cancelled) return;

      gsap.registerPlugin(ScrollTrigger);

      ctx = gsap.context(() => {
        // 패널 84vw + 양옆 peek 8vw: 컷 i 중앙 정렬 x = 8 - 84i (vw)
        gsap.fromTo(trackRef.current, { x: "8vw" }, {
          x: "-244vw",
          ease: "none",
          scrollTrigger: {
            trigger: pinRef.current,
            pin: true,
            scrub: 1,
            end: "+=2400",
            // 스크롤을 멈추면 가장 가까운 컷 중앙으로 부드럽게 정착
            snap: { snapTo: 1 / 3, duration: 0.4, ease: "power1.inOut" },
            onUpdate: (self) => {
              // 진행도(0~1)를 4개 컷 인덱스로 변환
              const idx = Math.min(3, Math.floor(self.progress * 4));
              setActiveIndex(idx);
            },
          },
        });
      });
    })();

    return () => {
      cancelled = true;
      ctx?.revert();
    };
  }, [prefersReduced]);

  return (
    <section id="journey" className="w-full">
      {/* 헤딩 블록 — SectionReveal 래퍼 */}
      <SectionReveal className="max-w-6xl mx-auto px-6 pt-24 pb-8">
        <p
          className="eyebrow-rule font-mono text-sm mb-3"
          style={{ color: "var(--accent-purple)" }}
        >
          ~/journey
        </p>
        <h2
          className="section-title-glow display-title mb-3 break-keep"
          style={{ color: "var(--text-main)" }}
        >
          시험지 한 장의 여정
        </h2>
        <p className="text-base" style={{ color: "var(--text-dim)" }}>
          명령 한 줄 뒤에서 일어나는 일
        </p>
      </SectionReveal>

      {/* 핀 래퍼 — reduced motion 시 일반 섹션으로 폴백 */}
      {reduced ? (
        // 접근성 폴백: 수직 스택 레이아웃
        <div className="max-w-6xl mx-auto px-6 pb-24 flex flex-col gap-12 items-center">
          {CUTS.map((cut, i) => {
            const CardComponent = CUT_CARDS[i];
            return (
              <div key={i} className="flex flex-col items-center gap-4">
                <CardComponent />
                <p className="text-sm" style={{ color: "var(--text-main)" }}>
                  {cut.step}
                </p>
                <p
                  className="text-sm text-center max-w-xs"
                  style={{ color: "var(--text-dim)" }}
                >
                  {cut.desc}
                </p>
              </div>
            );
          })}
        </div>
      ) : (
        // 수평 핀 스크롤리텔링
        <div
          ref={pinRef}
          className="relative overflow-hidden"
          style={{ height: "100vh" }}
        >
          {/* 수평 트랙: 4 패널 × 84vw — 양옆에 이전/다음 컷이 8vw씩 살짝 보임(peek) */}
          <div
            ref={trackRef}
            className="relative flex h-full"
            style={{ width: "336vw" }}
          >
            {/* 여정 연결선 — 네 컷을 관통하는 흐르는 대시(violet, 카드 뒤) */}
            <div
              aria-hidden="true"
              className="journey-connector absolute pointer-events-none"
              style={{
                top: "44%",
                left: "4vw",
                width: "328vw",
                height: "2px",
              }}
            />
            {CUTS.map((cut, i) => {
              const CardComponent = CUT_CARDS[i];
              return (
                <div
                  key={i}
                  className="relative flex flex-col items-center justify-center gap-7 px-6"
                  style={{ width: "84vw" }}
                >
                  {/* 컷별 무대 조명 — 명시 좌표로 중앙 고정, 카드보다 충분히 커서
                      카드가 중심을 가려도 가장자리 링이 항상 보임 */}
                  <div
                    aria-hidden="true"
                    className="absolute pointer-events-none"
                    style={{
                      top: "46%",
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                      width: "min(760px, 96vw)",
                      height: "min(760px, 96vw)",
                      borderRadius: "50%",
                      background: `radial-gradient(circle, ${cut.glow} 0%, transparent 62%)`,
                    }}
                  />
                  {/* 활성 컷 강조 — 부드러운 원형 바이올렛 글로우.
                      📚 사각형 실루엣을 추적하던 drop-shadow 대신 원형 radial → 흐릿한 패널 artifact 제거 */}
                  <div
                    aria-hidden="true"
                    className="absolute pointer-events-none"
                    style={{
                      top: "46%",
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                      width: "min(560px, 80vw)",
                      height: "min(560px, 80vw)",
                      borderRadius: "50%",
                      background:
                        "radial-gradient(circle, rgba(108,99,255,0.20) 0%, transparent 60%)",
                      opacity: i === activeIndex ? 1 : 0,
                      transition: "opacity 0.5s ease",
                    }}
                  />
                  {/* 배경 워터마크 번호 — 위로 올려서 숫자 상단이 카드 위로 항상 노출
                      (컷 1처럼 키 큰 카드도 못 가리게) */}
                  <span
                    aria-hidden="true"
                    className="absolute font-bold select-none pointer-events-none text-[190px] md:text-[320px] leading-none"
                    style={{
                      // 배경 워터마크 — 플랫 화이트알파 대신 은은한 바이올렛 그라데이션
                      backgroundImage:
                        "linear-gradient(180deg, rgba(108,99,255,0.12) 0%, rgba(108,99,255,0.02) 100%)",
                      WebkitBackgroundClip: "text",
                      backgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      color: "transparent",
                      top: "44%",
                      left: "50%",
                      transform: "translate(-50%, -88%)",
                    }}
                  >
                    {cut.num}
                  </span>
                  <div className="relative scale-110 md:scale-125">
                    <CardComponent />
                  </div>
                  <div className="relative flex flex-col items-center gap-1.5">
                    <p
                      className="text-base font-semibold text-center"
                      style={{ color: "var(--text-main)" }}
                    >
                      {cut.step}
                    </p>
                    <p
                      className="text-sm text-center max-w-xs"
                      style={{ color: "var(--text-dim)" }}
                    >
                      {cut.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 진행도 점 — 핀 뷰포트 하단 중앙 고정 */}
          <div
            className="absolute bottom-8 left-1/2"
            style={{ transform: "translateX(-50%)" }}
          >
            <div className="flex gap-2">
              {CUTS.map((_, i) => (
                <div
                  key={i}
                  className="rounded-full transition-all duration-300"
                  style={{
                    width: i === activeIndex ? "20px" : "8px",
                    height: "8px",
                    background:
                      i === activeIndex
                        ? "var(--accent-purple)"
                        : "rgba(255,255,255,0.2)",
                    boxShadow:
                      i === activeIndex
                        ? "0 0 12px var(--accent-purple)"
                        : "none",
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
