import { describe, it, expect } from "vitest";
import { generateAccessCode, normalizeAccessCode, CODE_ALPHABET } from "@/lib/access-code";

describe("access-code", () => {
  it("① 길이 8 + CODE_ALPHABET 글자만 사용", () => {
    const code = generateAccessCode();
    expect(code).toHaveLength(8);
    for (const ch of code) {
      expect(CODE_ALPHABET).toContain(ch);
    }
  });

  it("② 100회 생성 중복 없음(확률적)", () => {
    const codes = new Set(Array.from({ length: 100 }, () => generateAccessCode()));
    expect(codes.size).toBe(100);
  });

  it('③ normalize: " ab-cd ef23 " → "ABCDEF23" (공백·하이픈 제거 + 대문자)', () => {
    expect(normalizeAccessCode(" ab-cd ef23 ")).toBe("ABCDEF23");
  });

  it("④ 빈 문자열 → \"\"", () => {
    expect(normalizeAccessCode("")).toBe("");
  });
});
