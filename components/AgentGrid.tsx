"use client";

// 📚 학습 포인트: AgentGrid = 레지스트리 기반 에이전트 그리드.
// [...new Set(arr.map(...))] 패턴으로 unique 카테고리 추출.
// 카테고리 탭은 categories.length >= 2일 때만 노출 (스펙 §2-2):
//   현재 AGENTS는 전부 "공부" 카테고리 → 탭 숨김.
//   나중에 다른 카테고리 에이전트 추가 시 탭이 자동으로 나타남.

import { useState } from "react";
import { motion } from "framer-motion";
import { AGENTS } from "@/content/agents";
import type { AgentCategory } from "@/content/agents";
import AgentCard from "@/components/AgentCard";
import SectionReveal from "@/components/SectionReveal";

// 그리드 컨테이너 variants — staggerChildren으로 카드들이 순차 등장
const gridVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

export default function AgentGrid() {
  // 필터 상태: "전체" 또는 특정 카테고리
  const [selected, setSelected] = useState<"전체" | AgentCategory>("전체");

  // AGENTS에서 unique 카테고리 추출
  const categories = [...new Set(AGENTS.map((a) => a.category))];

  // 필터링된 에이전트 목록
  const filtered =
    selected === "전체" ? AGENTS : AGENTS.filter((a) => a.category === selected);

  return (
    <section id="agents" className="max-w-6xl mx-auto px-6 py-24 w-full">
      {/* 헤딩 블록 */}
      <SectionReveal className="mb-12">
        {/* 아이브로우 — 모노 소문자 accent-green */}
        <p
          className="font-mono text-sm mb-3"
          style={{ color: "var(--accent-green)" }}
        >
          ~/agents
        </p>

        {/* H2 */}
        <h2
          className="section-title-glow font-bold text-3xl md:text-4xl mb-3 break-keep"
          style={{ color: "var(--text-main)" }}
        >
          에이전트 &amp; 앱
        </h2>

        {/* 서브 라인 */}
        <p className="text-base" style={{ color: "var(--text-dim)" }}>
          전부 실제로 매일 굴러가는 것들입니다.
        </p>
      </SectionReveal>

      {/* 카테고리 필터 탭 — categories.length >= 2일 때만 노출
          📚 학습 포인트: 조건부 렌더 + 자동 등장 탭 디자인.
          현재 카테고리 1개(공부)라 숨김이지만 필터 로직은 완전히 구현되어 있음.
          새 카테고리 에이전트가 추가되는 순간 탭이 자동으로 나타남. */}
      {categories.length >= 2 && (
        <div className="flex items-center gap-2 flex-wrap mb-8">
          {/* "전체" 탭 */}
          <button
            onClick={() => setSelected("전체")}
            className="rounded-full px-4 py-1.5 text-sm font-mono border transition-all cursor-pointer"
            style={
              selected === "전체"
                ? {
                    borderColor: "var(--accent-purple)",
                    color: "var(--accent-purple)",
                    background:
                      "color-mix(in srgb, var(--accent-purple) 12%, transparent)",
                  }
                : {
                    borderColor: "rgba(255,255,255,0.1)",
                    color: "var(--text-dim)",
                  }
            }
          >
            전체
          </button>

          {/* 카테고리 탭들 */}
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelected(cat)}
              className="rounded-full px-4 py-1.5 text-sm font-mono border transition-all cursor-pointer"
              style={
                selected === cat
                  ? {
                      borderColor: "var(--accent-purple)",
                      color: "var(--accent-purple)",
                      background:
                        "color-mix(in srgb, var(--accent-purple) 12%, transparent)",
                    }
                  : {
                      borderColor: "rgba(255,255,255,0.1)",
                      color: "var(--text-dim)",
                    }
              }
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* 에이전트 그리드 — key={selected}: 필터 변경 시 리마운트해서
          stagger 등장 애니메이션을 다시 재생 (once:true 상태 고착 방지) */}
      <motion.div
        key={selected}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
        variants={gridVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-60px" }}
      >
        {filtered.map((agent) => (
          <AgentCard key={agent.id} agent={agent} />
        ))}
      </motion.div>
    </section>
  );
}
