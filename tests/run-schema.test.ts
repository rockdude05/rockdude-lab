import { describe, it, expect } from "vitest";
import {
  parseRunFields,
  validateRunFiles,
  ALLOWED_RUN_MIME,
  MAX_RUN_FILES,
  MAX_RUN_FILE_BYTES,
} from "@/lib/run-schema";

describe("run-schema 필드 검증", () => {
  it("분석: concept 있으면 통과", () => {
    const r = parseRunFields({ agent: "course-analyzer", concept: "엔올 vs 알릴", website: "" });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.data.inputs.concept).toBe("엔올 vs 알릴");
  });
  it("분석: concept 누락 거절", () => {
    const r = parseRunFields({ agent: "course-analyzer", website: "" });
    expect(r.ok).toBe(false);
  });
  it("공부노트: scope 누락 거절", () => {
    const r = parseRunFields({ agent: "study-notes", website: "" });
    expect(r.ok).toBe(false);
  });
  it("잘못된 agent 거절", () => {
    expect(parseRunFields({ agent: "figure-writer", website: "" }).ok).toBe(false);
  });
  it("honeypot=silent reject", () => {
    const r = parseRunFields({ agent: "study-notes", scope: "Ch1", website: "bot" });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toBe("honeypot");
  });
  it("파일 제약 상수", () => {
    expect(MAX_RUN_FILES).toBe(5);
    expect(MAX_RUN_FILE_BYTES).toBe(10 * 1024 * 1024);
    expect(ALLOWED_RUN_MIME.has("application/pdf")).toBe(true);
  });
});

describe("run-schema 파일 검증", () => {
  const pdf = { size: 1000, type: "application/pdf" };
  it("과제: problems 슬롯 파일 있으면 통과", () => {
    const r = validateRunFiles("homework-solver", { problems: [pdf] });
    expect(r.ok).toBe(true);
  });
  it("과제: problems 누락 거절", () => {
    const r = validateRunFiles("homework-solver", { reference: [pdf] });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.message).toBe("required:problems");
  });
  it("공부노트: past_exams 누락 거절", () => {
    const r = validateRunFiles("study-notes", {});
    expect(r.ok).toBe(false);
  });
  it("분석: 파일 없어도 통과(필수 파일 없음)", () => {
    expect(validateRunFiles("course-analyzer", {}).ok).toBe(true);
  });
  it("파일 개수 초과 거절", () => {
    const r = validateRunFiles("homework-solver", { problems: Array(6).fill(pdf) });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.message).toBe("file_count");
  });
  it("잘못된 MIME 거절", () => {
    const r = validateRunFiles("homework-solver", { problems: [{ size: 100, type: "application/zip" }] });
    expect(r.ok).toBe(false);
  });
  it("크기 초과 거절", () => {
    const r = validateRunFiles("homework-solver", {
      problems: [{ size: MAX_RUN_FILE_BYTES + 1, type: "application/pdf" }],
    });
    expect(r.ok).toBe(false);
  });
});
