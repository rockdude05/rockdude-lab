import { describe, it, expect } from "vitest";
import {
  COIN_WON,
  AGENT_COSTS,
  wonToCoins,
  coinsToWon,
  PAGE_RULES,
  IMAGE_PAGE_WEIGHT,
  ABS_MAX_PAGES,
  weightedPages,
  runCost,
} from "@/lib/coins";

describe("coins", () => {
  it("1코인 = ₩10", () => {
    expect(COIN_WON).toBe(10);
  });
  it("에이전트별 코인 단가 확정값", () => {
    expect(AGENT_COSTS["course-analyzer"]).toBe(30);
    expect(AGENT_COSTS["homework-solver"]).toBe(100);
    expect(AGENT_COSTS["study-notes"]).toBe(125);
  });
  it("won→coin 내림", () => {
    expect(wonToCoins(10000)).toBe(1000);
    expect(wonToCoins(1255)).toBe(125); // 내림
  });
  it("coin→won", () => {
    expect(coinsToWon(125)).toBe(1250);
  });
});

describe("coins — 페이지 가중·비용 (Phase 3)", () => {
  it("이미지 가중 = 2쪽", () => {
    expect(IMAGE_PAGE_WEIGHT).toBe(2);
    expect(weightedPages(10, 3)).toBe(16); // 10 + 3*2
    expect(weightedPages(0, 0)).toBe(0);
  });
  it("절대 상한 100", () => {
    expect(ABS_MAX_PAGES).toBe(100);
  });
  it("포함 페이지 이내 = 기본가", () => {
    expect(runCost("course-analyzer", 20)).toBe(30); // included 20
    expect(runCost("homework-solver", 30)).toBe(100); // included 30
    expect(runCost("study-notes", 50)).toBe(125); // included 50
    expect(runCost("course-analyzer", 5)).toBe(30); // 미만도 기본가
  });
  it("초과분 블록당 가산(올림)", () => {
    expect(runCost("course-analyzer", 25)).toBe(40); // 30 + ceil(5/10)*10
    expect(runCost("homework-solver", 45)).toBe(160); // 100 + ceil(15/10)*30
    expect(runCost("study-notes", 70)).toBe(205); // 125 + ceil(20/10)*40
    expect(runCost("homework-solver", 31)).toBe(130); // 1쪽 초과도 1블록
  });
  it("PAGE_RULES 확정값", () => {
    expect(PAGE_RULES["course-analyzer"]).toEqual({ included: 20, blockRate: 10 });
    expect(PAGE_RULES["homework-solver"]).toEqual({ included: 30, blockRate: 30 });
    expect(PAGE_RULES["study-notes"]).toEqual({ included: 50, blockRate: 40 });
  });
});
