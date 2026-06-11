// 📚 학습: 의존성 주입(now) — 시간을 주입받으면 테스트에서 시계를 마음대로 돌릴 수 있다
export function createRateLimiter(opts: { limit: number; windowMs: number; now?: () => number }) {
  const hits = new Map<string, number[]>();
  const now = opts.now ?? Date.now;
  return {
    check(key: string): boolean {
      const t = now();
      const arr = (hits.get(key) ?? []).filter((x) => t - x < opts.windowMs);
      if (arr.length >= opts.limit) { hits.set(key, arr); return false; }
      arr.push(t); hits.set(key, arr); return true;
    },
  };
}
