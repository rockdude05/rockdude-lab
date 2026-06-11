// 과장 금지 — 모든 값은 실측, source에 측정 방법·날짜 명시 (스펙 §2-4)

export type Stat = { label: string; value: number; suffix?: string; source: string };

export const STATS: Stat[] = [
  {
    label: "공부 에이전트",
    value: 8,
    suffix: "개",
    source: "이 레지스트리의 항목 수 (2026-06-11)",
  },
  {
    label: "자동 테스트",
    value: 348,
    suffix: "개",
    source: "도구 테스트 스위트 수집 실측 267+81 (2026-06-11)",
  },
  {
    label: "누적 풀이 PDF",
    value: 861,
    suffix: "쪽",
    source: "풀이 PDF 84개 페이지 합계 실측 (2026-06-11)",
  },
  {
    label: "검증 통과 그림",
    value: 42,
    suffix: "개",
    source: "풀이에 동봉된 그림 PDF 개수 실측 (2026-06-11)",
  },
];
