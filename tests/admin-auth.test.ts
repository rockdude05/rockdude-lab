import { describe, it, expect } from "vitest";
import { sign, verify } from "@/lib/admin-auth";

describe("admin-auth", () => {
  it("sign → verify 왕복", () => {
    const token = sign("secret-1");
    expect(verify(token, "secret-1")).toBe(true);
  });
  it("변조 토큰 거부", () => {
    expect(verify("tampered", "secret-1")).toBe(false);
  });
  it("다른 secret 거부", () => {
    expect(verify(sign("secret-1"), "secret-2")).toBe(false);
  });
});
