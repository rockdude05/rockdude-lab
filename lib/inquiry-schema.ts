import { z } from "zod";
export const INQUIRY_TYPES = ["try", "idea", "request", "bug"] as const; // 써보고싶어요/아이디어/새 에이전트 요청/버그·질문
const schema = z.object({
  type: z.enum(INQUIRY_TYPES),
  name: z.string().min(1).max(40),
  // 연락처 필수 — 결과(데모 PDF·답변)를 전달하려면 받을 곳이 있어야 함
  contact: z.string().trim().min(1).max(120),
  body: z.string().min(10).max(4000),
  website: z.string(), // 📚 학습: honeypot — 사람 눈엔 안 보이는 필드, 봇만 채움
});
// 📚 학습: honeypot은 검증에만 쓰고 반환 데이터에서 제거 —
// DB 테이블에 없는 컬럼(website)을 insert하면 PostgREST가 거부하므로
// parse 단계에서 떼어내야 라우트가 parsed.data를 그대로 insert할 수 있음.
export type Inquiry = Omit<z.infer<typeof schema>, "website">;
export type ParseResult = { ok: true; data: Inquiry } | { ok: false; reason: "honeypot" | "invalid" };
export function parseInquiry(raw: unknown): ParseResult {
  const p = schema.safeParse(raw);
  if (!p.success) return { ok: false, reason: "invalid" };
  if (p.data.website.trim() !== "") return { ok: false, reason: "honeypot" };
  const { website: _website, ...data } = p.data;
  void _website;
  return { ok: true, data };
}
