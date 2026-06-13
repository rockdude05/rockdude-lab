"use client";

// 📚 학습 포인트: AgentCard = 3D 틸트 카드 컴포넌트.
// useMotionValue + useSpring 조합:
//   useMotionValue: 리렌더 없이 실시간 값 추적 (퍼포먼스 최적화)
//   useSpring: 물리 기반 스프링 보간 → rotateX/rotateY에 적용해 자연스러운 틸트
// transformPerspective: CSS perspective와 동일 효과, Framer Motion style prop으로 적용.

import { useRef, useState } from "react";
import Image from "next/image";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import type { Agent } from "@/content/agents";
import { revealItem } from "@/components/SectionReveal";

// accent 이름 → CSS 변수 매핑
const ACCENT_VAR: Record<Agent["accent"], string> = {
  blue: "var(--accent-blue)",
  green: "var(--accent-green)",
  orange: "var(--accent-orange)",
  purple: "var(--accent-purple)",
};

// status 배지 스타일
const STATUS_STYLE: Record<Agent["status"], React.CSSProperties> = {
  live: {
    color: "var(--accent-green)",
    background: "color-mix(in srgb, var(--accent-green) 12%, transparent)",
  },
  beta: {
    color: "var(--accent-orange)",
    background: "color-mix(in srgb, var(--accent-orange) 12%, transparent)",
  },
};

interface AgentCardProps {
  agent: Agent;
}

export default function AgentCard({ agent }: AgentCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const accentVar = ACCENT_VAR[agent.accent];
  const [hovered, setHovered] = useState(false);

  // 3D 틸트용 모션 값 (리렌더 없이 실시간 업데이트)
  const rawRotateX = useMotionValue(0);
  const rawRotateY = useMotionValue(0);

  // 스프링 보간 — 자연스러운 물리 기반 틸트
  const rotateX = useSpring(rawRotateX, { stiffness: 150, damping: 20 });
  const rotateY = useSpring(rawRotateY, { stiffness: 150, damping: 20 });

  // 📚 conic 림라이트 각도 — 기존 틸트 스프링을 useTransform으로 재배선(신규 이벤트·상태 0).
  // 카드가 기울면 모서리를 흐르는 흰빛 specular의 각도가 따라 움직임. @property --angle이 보간.
  const rimAngle = useTransform(rotateY, (v) => `${135 + v * 4}deg`);

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    // 카드 중심 기준 포인터 상대 위치 (-0.5 ~ 0.5 범위)
    const cx = (e.clientX - rect.left) / rect.width - 0.5;
    const cy = (e.clientY - rect.top) / rect.height - 0.5;

    // rotateY: 좌우, rotateX: 상하 (부호 반전으로 자연스러운 방향)
    // cx ∈ -0.5~0.5 → ×12 = ±6°
    rawRotateY.set(cx * 12);
    rawRotateX.set(-cy * 12);
  }

  function handleMouseLeave() {
    rawRotateX.set(0);
    rawRotateY.set(0);
    setHovered(false);
  }

  // 호버 시 accent 색상 그라데이션 보더 + 글로우 + 뒤 헤일로
  // 📚 학습: .cta-glass와 같은 padding-box/border-box 이중 배경 트릭 →
  // hover 시 1px 그라데이션 테두리(accent→purple). 비hover는 솔리드 바탕.
  const hoverBackground = `linear-gradient(var(--bg-panel), var(--bg-panel)) padding-box, linear-gradient(135deg, ${accentVar}, var(--accent-purple)) border-box`;
  const hoverBoxShadow = `0 10px 48px color-mix(in srgb, ${accentVar} 32%, transparent), inset 0 1px 0 rgba(255,255,255,0.08)`;

  return (
    // 📚 학습 포인트: revealItem variants를 motion.div에 적용하면
    // 부모 AgentGrid의 staggerChildren이 이 카드를 0.08s씩 지연 등장시킴
    <motion.div variants={revealItem} className="relative h-full">
      {/* accent 글로우 헤일로 — 카드 뒤, hover 시 색 블룸(--halo로 accent 주입) */}
      <div
        className={`card-halo ${hovered ? "is-on" : ""}`}
        style={{
          ["--halo" as string]: `color-mix(in srgb, ${accentVar} 55%, transparent)`,
        }}
        aria-hidden="true"
      />
      {/* 3D 틸트 컨테이너 — zIndex:1로 헤일로(z:0) 위에 고정 */}
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={handleMouseLeave}
        style={{
          rotateX,
          rotateY,
          transformPerspective: 800,
          position: "relative",
          zIndex: 1,
          // conic 림라이트가 참조하는 각도 (틸트 스프링 연동)
          ["--angle" as string]: rimAngle,
          background: hovered ? hoverBackground : "var(--bg-panel)",
          border: `1px solid ${hovered ? "transparent" : "rgba(255,255,255,0.07)"}`,
          boxShadow: hovered ? hoverBoxShadow : "none",
          transition: "box-shadow 0.25s ease",
        }}
        className={`card-rim ${hovered ? "is-on" : ""} rounded-2xl overflow-hidden h-full flex flex-col`}
      >
        {/* 1. 이미지 영역 — aspect-[4/3], fill로 반응형 이미지 최적화 */}
        {/* 📚 학습 포인트: fill+sizes로 반응형 이미지 최적화
            fill: 부모 컨테이너를 꽉 채움 (width/height 불필요)
            sizes: 뷰포트별 실제 렌더 크기 힌트 → 브라우저가 최적 해상도 선택
            objectFit+objectPosition: 이미지 자르기 방향 제어 */}
        <div
          className="relative overflow-hidden"
          style={{
            aspectRatio: "4/3",
            background: "#0d1117",
          }}
        >
          <Image
            src={agent.image}
            alt={agent.name}
            fill
            style={{
              objectFit: "cover",
              objectPosition: "top",
            }}
            sizes="(max-width: 768px) 100vw, 33vw"
          />
          {/* 하단 그라데이션 오버레이 — 이미지와 바디 영역 자연스럽게 블렌딩 */}
          <div
            className="absolute inset-x-0 bottom-0 h-12"
            style={{
              background:
                "linear-gradient(to bottom, transparent, var(--bg-panel))",
            }}
          />
          {/* sheen 스윕 — hover 시 대각 광택이 이미지를 가로질러 지나감 */}
          <div
            className={`card-sheen ${hovered ? "is-on" : ""}`}
            aria-hidden="true"
          />
        </div>

        {/* 2. 바디 — p-5 */}
        <div className="p-5 flex flex-col gap-2">
          {/* 첫 번째 행: (앱 로고) + 이름 + 상태 배지 */}
          <div className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-2 min-w-0">
              {agent.icon && (
                <Image
                  src={agent.icon}
                  alt=""
                  width={22}
                  height={22}
                  className="rounded-[6px] shrink-0"
                />
              )}
              <span
                className="font-mono text-base font-semibold truncate"
                style={{ color: "var(--text-main)" }}
              >
                {agent.name}
              </span>
            </span>
            <span
              className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-mono"
              style={STATUS_STYLE[agent.status]}
            >
              {agent.status}
            </span>
          </div>

          {/* 두 번째 행: 태그라인 */}
          <p
            className="text-sm leading-snug"
            style={{ color: "var(--text-dim)" }}
          >
            {agent.tagline}
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}
