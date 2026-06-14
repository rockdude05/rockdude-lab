// tests/inquiry-schema.test.ts
import { describe, it, expect } from "vitest";
import { parseInquiry } from "@/lib/inquiry-schema";

describe("parseInquiry", () => {
  it("정상 입력 통과 (연락처 = 이메일)", () => {
    const r = parseInquiry({ type: "request", name: "김진수", contact: "jinsu@example.com", body: "암석역학 발표자료 에이전트 만들어주세요", website: "" });
    expect(r.ok).toBe(true);
  });
  it("이메일 형식 아니면 거부 (카톡·텔레그램 핸들 불가)", () => {
    const r = parseInquiry({ type: "try", name: "친구", contact: "tg:@handle", body: "에이전트 한번 써보고 싶어요!", website: "" });
    expect(r.ok).toBe(false);
  });
  it("이메일 대문자는 소문자로 정규화", () => {
    const r = parseInquiry({ type: "try", name: "친구", contact: "Friend@Example.COM", body: "에이전트 한번 써보고 싶어요!", website: "" });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.data.contact).toBe("friend@example.com");
  });
  it("honeypot(website) 채워지면 silent-reject", () => {
    const r = parseInquiry({ type: "review", name: "bot", contact: "bot@spam.com", body: "spam spam spam spam", website: "http://spam" });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toBe("honeypot");
  });
  it("body 10자 미만 거부", () => {
    const r = parseInquiry({ type: "bug", name: "a", contact: "", body: "짧음", website: "" });
    expect(r.ok).toBe(false);
  });
  it("허용 외 type 거부", () => {
    const r = parseInquiry({ type: "hack", name: "a", contact: "", body: "0123456789", website: "" });
    expect(r.ok).toBe(false);
  });
  it("연락처 비면 거부 (결과 전달처 필수)", () => {
    const r = parseInquiry({ type: "try", name: "친구", contact: "", body: "에이전트 한번 써보고 싶어요!", website: "" });
    expect(r.ok).toBe(false);
  });
  it("연락처 공백만이면 거부", () => {
    const r = parseInquiry({ type: "try", name: "친구", contact: "   ", body: "에이전트 한번 써보고 싶어요!", website: "" });
    expect(r.ok).toBe(false);
  });
  it("반환 데이터에 honeypot(website) 키 없음 — DB insert 형태와 일치", () => {
    const r = parseInquiry({ type: "try", name: "친구", contact: "friend@example.com", body: "에이전트 한번 써보고 싶어요!", website: "" });
    expect(r.ok).toBe(true);
    if (r.ok) expect("website" in r.data).toBe(false);
  });
});
