import { describe, it, expect } from "vitest";
import { RUN_INPUTS } from "@/lib/run-inputs";
import { AGENT_COSTS } from "@/lib/coins";

describe("run-inputs 레지스트리", () => {
  it("코인 에이전트 3종 모두 스펙 존재", () => {
    for (const k of Object.keys(AGENT_COSTS)) {
      expect(RUN_INPUTS[k as keyof typeof AGENT_COSTS]).toBeDefined();
    }
  });
  it("분석=concept 텍스트 필수, 파일 선택", () => {
    const a = RUN_INPUTS["course-analyzer"];
    expect(a.textFields.find((f) => f.key === "concept")?.required).toBe(true);
    expect(a.fileSlots.every((s) => !s.required)).toBe(true);
  });
  it("과제=problems 파일 필수", () => {
    const h = RUN_INPUTS["homework-solver"];
    expect(h.fileSlots.find((s) => s.key === "problems")?.required).toBe(true);
  });
  it("공부노트=past_exams 파일 + scope 텍스트 필수", () => {
    const s = RUN_INPUTS["study-notes"];
    expect(s.fileSlots.find((x) => x.key === "past_exams")?.required).toBe(true);
    expect(s.textFields.find((x) => x.key === "scope")?.required).toBe(true);
  });
  it("슬롯 key는 role로 쓰이므로 ascii", () => {
    for (const spec of Object.values(RUN_INPUTS)) {
      for (const s of spec.fileSlots) expect(s.key).toMatch(/^[a-z_]+$/);
    }
  });
});
