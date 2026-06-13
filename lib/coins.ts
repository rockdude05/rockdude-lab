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
