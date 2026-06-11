"use client";

// 📚 학습 포인트: GSAP ScrollTrigger pin + scrub 수평 스크롤리텔링 패턴.
// gsap.context()로 클린업을 보장하고, ctx.revert()로 ScrollTrigger 인스턴스를 제거.
// useReducedMotion 감지 시 GSAP 완전 건너뛰고 수직 스택 레이아웃으로 폴백.

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SectionReveal from "@/components/SectionReveal";

// 4개 컷 데이터 — 내부 도구명 / 모델명 일절 제외 (스펙 §하드룰)
const CUTS = [
  { step: "① 시험지 도착" },
  { step: "② 문제·그림 정밀 판독" },
  { step: "③ 풀이 생성 + 자체 검증" },
  { step: "④ 텔레그램 도착" },
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

export default function Journey() {
  const prefersReduced = useReducedMotion();
  const pinRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  // 📚 학습 포인트: GSAP ScrollTrigger 수평 핀 패턴.
  // gsap.context() 스코프로 인스턴스를 묶어두면 ctx.revert() 한 번으로
  // 생성된 모든 ScrollTrigger + 트윈을 한 번에 정리 (메모리 누수 방지).
  // scrub:1 = 스크롤 위치와 1초 부드러움으로 애니메이션 동기화.
  // end:"+=2400" = 핀 상태에서 2400px 추가 스크롤 후 언핀.
  useEffect(() => {
    if (prefersReduced) return;

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      gsap.to(trackRef.current, {
        xPercent: -75,
        ease: "none",
        scrollTrigger: {
          trigger: pinRef.current,
          pin: true,
          scrub: 1,
          end: "+=2400",
          onUpdate: (self) => {
            // 진행도(0~1)를 4개 컷 인덱스로 변환
            const idx = Math.min(3, Math.floor(self.progress * 4));
            setActiveIndex(idx);
          },
        },
      });
    });

    return () => ctx.revert();
  }, [prefersReduced]);

  return (
    <section id="journey" className="w-full">
      {/* 헤딩 블록 — SectionReveal 래퍼 */}
      <SectionReveal className="max-w-6xl mx-auto px-6 pt-24 pb-8">
        <p
          className="font-mono text-sm mb-3"
          style={{ color: "var(--accent-purple)" }}
        >
          ~/journey
        </p>
        <h2
          className="font-bold text-3xl md:text-4xl mb-3"
          style={{ color: "var(--text-main)" }}
        >
          시험지 한 장의 여정
        </h2>
        <p className="text-base" style={{ color: "var(--text-dim)" }}>
          명령 한 줄 뒤에서 일어나는 일
        </p>
      </SectionReveal>

      {/* 핀 래퍼 — reduced motion 시 일반 섹션으로 폴백 */}
      {prefersReduced ? (
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
          {/* 수평 트랙: 4 패널 × 100vw = 400vw */}
          <div
            ref={trackRef}
            className="flex h-full"
            style={{ width: "400%" }}
          >
            {CUTS.map((cut, i) => {
              const CardComponent = CUT_CARDS[i];
              return (
                <div
                  key={i}
                  className="flex flex-col items-center justify-center gap-6 px-6"
                  style={{ width: "25%" }}
                >
                  <CardComponent />
                  <p
                    className="text-sm text-center"
                    style={{ color: "var(--text-main)" }}
                  >
                    {cut.step}
                  </p>
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
