// 📚 코인 경제 상수 (spec §5 확정 2026-06-13). 1코인=₩10, 구독-보조 가격.
// 키는 agent_runs.agent 이름(study-notes/homework-solver/course-analyzer)과 일치.
export const COIN_WON = 10;

export const AGENT_COSTS = {
  "course-analyzer": 30, // 분석
  "homework-solver": 100, // 과제풀이
  "study-notes": 125, // 공부노트(시험범위 전체 — 최고가)
} as const;

export type CoinAgent = keyof typeof AGENT_COSTS;

export function wonToCoins(won: number): number {
  return Math.floor(won / COIN_WON);
}
export function coinsToWon(coins: number): number {
  return coins * COIN_WON;
}

// 📚 Phase 3: 페이지 가중·비용 모델 (spec §5). 이미지=2쪽 환산, 초과분 블록 가산.
export const PAGE_RULES: Record<CoinAgent, { included: number; blockRate: number }> = {
  "course-analyzer": { included: 20, blockRate: 10 }, // 10쪽 초과당 +10
  "homework-solver": { included: 30, blockRate: 30 }, // 10쪽 초과당 +30
  "study-notes": { included: 50, blockRate: 40 }, // 기출+수업자료라 넉넉 / 10쪽당 +40
};
export const IMAGE_PAGE_WEIGHT = 2; // 이미지(사진)=그림 문제·크롭 멀티패스로 토큰 무거움 → 2쪽 환산
export const ABS_MAX_PAGES = 100; // 가중 페이지 초과 시 제출 거절

// 가중 페이지 = 텍스트 PDF 페이지 합 + 이미지 수 × IMAGE_PAGE_WEIGHT
export function weightedPages(pdfPages: number, imageCount: number): number {
  return pdfPages + imageCount * IMAGE_PAGE_WEIGHT;
}
// 실행 비용 = 기본가 + 초과분(10쪽 블록, 올림) × 블록당가산
export function runCost(agent: CoinAgent, pages: number): number {
  const base = AGENT_COSTS[agent];
  const { included, blockRate } = PAGE_RULES[agent];
  const blocks = Math.ceil(Math.max(0, pages - included) / 10);
  return base + blocks * blockRate;
}
