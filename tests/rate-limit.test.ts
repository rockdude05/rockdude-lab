// tests/rate-limit.test.ts
import { describe, it, expect } from "vitest";
import { createRateLimiter } from "@/lib/rate-limit";

describe("rate limit", () => {
  it("창 내 N회 초과 시 차단, 창 지나면 해제", () => {
    let now = 1000;
    const rl = createRateLimiter({ limit: 3, windowMs: 60_000, now: () => now });
    expect(rl.check("ip1")).toBe(true);
    expect(rl.check("ip1")).toBe(true);
    expect(rl.check("ip1")).toBe(true);
    expect(rl.check("ip1")).toBe(false);
    now += 61_000;
    expect(rl.check("ip1")).toBe(true);
  });
  it("키별 독립 카운트", () => {
    const rl = createRateLimiter({ limit: 1, windowMs: 60_000, now: () => 0 });
    expect(rl.check("a")).toBe(true);
    expect(rl.check("b")).toBe(true);
    expect(rl.check("a")).toBe(false);
  });
});
