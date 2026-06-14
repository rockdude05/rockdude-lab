import { z } from "zod";
export const INQUIRY_TYPES = ["try", "review", "request", "bug"] as const; // 써보고싶어요/리뷰/새 에이전트 요청/버그·질문
// 한글 라벨 단일 출처 — 폼·상태조회·김비서 텔레그램 메시지가 공유(라벨 중복 방지).
export const INQUIRY_LABELS: Record<(typeof INQUIRY_TYPES)[number], string> = {
  try: "써보고 싶어요",
  review: "리뷰",
  request: "새 에이전트 요청",
  bug: "버그·질문",
};
const schema = z.object({
  type: z.enum(INQUIRY_TYPES),
  name: z.string().min(1).max(40),
  // 연락처 = 이메일 필수 — 현재 결과 전달 수단이 이메일뿐 (카톡·텔레그램 미구축)
  contact: z.string().trim().toLowerCase().email().max(120),
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
