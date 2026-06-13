import type { CoinAgent } from "@/lib/coins";

// 📚 Phase 3: 에이전트별 입력 슬롯 레지스트리 (spec §4).
// content/agents.ts 처럼 "한 곳만 고치면 전체 반영" — 폼 렌더·서버 검증·런너 프롬프트가 전부 참조.
export type RunFileSlot = { key: string; label: string; required: boolean; hint?: string };
export type RunTextField = {
  key: string;
  label: string;
  required: boolean;
  placeholder?: string;
  multiline?: boolean;
};
export type RunInputSpec = { fileSlots: RunFileSlot[]; textFields: RunTextField[] };

export const RUN_INPUTS: Record<CoinAgent, RunInputSpec> = {
  "course-analyzer": {
    fileSlots: [
      { key: "material", label: "수업자료", required: false, hint: "올리면 이 자료 기준으로 설명해요" },
    ],
    textFields: [
      {
        key: "concept",
        label: "막히는 개념·문항",
        required: true,
        multiline: true,
        placeholder: "예: 1,2- vs 1,4-addition 차이가 이해 안 돼요",
      },
    ],
  },
  "homework-solver": {
    fileSlots: [
      { key: "problems", label: "문제·시험지", required: true },
      { key: "reference", label: "수업자료·모범답안", required: false },
    ],
    textFields: [
      {
        key: "note",
        label: "추가 요청",
        required: false,
        multiline: true,
        placeholder: "특정 문항만, 풀이 깊이 등(선택)",
      },
    ],
  },
  "study-notes": {
    fileSlots: [
      { key: "past_exams", label: "기출", required: true },
      { key: "material", label: "수업자료·유인물", required: false },
    ],
    textFields: [
      { key: "scope", label: "시험 범위", required: true, placeholder: "예: Chapter 3~5" },
    ],
  },
};

// 슬롯 key → 한글 라벨 (런너 프롬프트·검증 공용)
export const SLOT_LABEL: Record<string, string> = Object.fromEntries(
  Object.values(RUN_INPUTS).flatMap((s) => s.fileSlots.map((f) => [f.key, f.label])),
);
