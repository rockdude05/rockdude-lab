import { describe, it, expect } from "vitest";
import { COIN_WON, AGENT_COSTS, wonToCoins, coinsToWon } from "@/lib/coins";

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
