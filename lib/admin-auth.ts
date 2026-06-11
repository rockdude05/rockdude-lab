// 📚 학습: HMAC 서명 쿠키 — 서버만 아는 secret으로 서명하면 위조 불가. DB 세션 없이 인증 유지.
import { createHmac, timingSafeEqual } from "crypto";

export function sign(secret: string): string {
  return createHmac("sha256", secret).update("admin-session").digest("hex");
}

export function verify(token: string, secret: string): boolean {
  const expected = sign(secret);
  if (token.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(token), Buffer.from(expected));
}
