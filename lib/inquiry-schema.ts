import { z } from "zod";
export const INQUIRY_TYPES = ["try", "idea", "request", "bug"] as const; // 써보고싶어요/아이디어/새 에이전트 요청/버그·질문
const schema = z.object({
  type: z.enum(INQUIRY_TYPES),
  name: z.string().min(1).max(40),
  contact: z.string().max(120).default(""),
  body: z.string().min(10).max(4000),
  website: z.string(), // 📚 학습: honeypot — 사람 눈엔 안 보이는 필드, 봇만 채움
});
export type Inquiry = z.infer<typeof schema>;
export type ParseResult = { ok: true; data: Inquiry } | { ok: false; reason: "honeypot" | "invalid" };
export function parseInquiry(raw: unknown): ParseResult {
  const p = schema.safeParse(raw);
  if (!p.success) return { ok: false, reason: "invalid" };
  if (p.data.website.trim() !== "") return { ok: false, reason: "honeypot" };
  return { ok: true, data: p.data };
}
