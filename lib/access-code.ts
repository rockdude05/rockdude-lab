import { randomBytes } from "crypto";

// 조회코드: 혼동 글자(0/O, 1/I/L) 제외 알파벳 — Crockford 유사
export const CODE_ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";

export function generateAccessCode(length = 8): string {
  const alphabetLen = CODE_ALPHABET.length; // 31
  let code = "";
  // crypto.randomBytes 기반 — 편향 제거를 위해 거부 샘플링
  // 256 / 31 = 8.25... → 최대값을 8*31=248로 제한
  const limit = Math.floor(256 / alphabetLen) * alphabetLen;
  while (code.length < length) {
    const buf = randomBytes(length * 2); // 여유 있게 생성
    for (let i = 0; i < buf.length && code.length < length; i++) {
      const byte = buf[i];
      if (byte < limit) {
        code += CODE_ALPHABET[byte % alphabetLen];
      }
    }
  }
  return code;
}

export function normalizeAccessCode(raw: string): string {
  // trim + 대문자화 + 공백·하이픈 제거만 (알파벳 외 글자는 보존)
  return raw.trim().toUpperCase().replace(/[\s-]/g, "");
}
