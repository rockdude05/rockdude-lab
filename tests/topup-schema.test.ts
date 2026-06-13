import { describe, it, expect } from "vitest";
import { topupSchema } from "@/lib/topup-schema";

describe("topupSchema", () => {
  it("정상 입력 통과", () => {
    const r = topupSchema.safeParse({ amount_won: 10000, depositor: "김진수" });
    expect(r.success).toBe(true);
  });
  it("최소 금액 미만 거절", () => {
    expect(
      topupSchema.safeParse({ amount_won: 500, depositor: "김진수" }).success,
    ).toBe(false);
  });
  it("10원 단위 아니면 거절(정수 코인 보장)", () => {
    expect(
      topupSchema.safeParse({ amount_won: 10005, depositor: "김진수" }).success,
    ).toBe(false);
  });
  it("입금자명 빈 값 거절", () => {
    expect(
      topupSchema.safeParse({ amount_won: 10000, depositor: "" }).success,
    ).toBe(false);
  });
  it("과대 금액 거절", () => {
    expect(
      topupSchema.safeParse({ amount_won: 2000000, depositor: "김진수" }).success,
    ).toBe(false);
  });
});
