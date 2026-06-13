import { AGENT_COSTS, type CoinAgent } from "@/lib/coins";
import { RUN_INPUTS } from "@/lib/run-inputs";

// 📚 Phase 3: 실행 제출 검증 (spec §9). 텍스트 필드(에이전트별 필수)는 parseRunFields,
// 파일(슬롯·MIME·크기)은 validateRunFiles — 라우트가 둘 다 통과해야 진행.
export const ALLOWED_RUN_MIME = new Set([
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/heic",
  "image/webp",
]);
export const IMAGE_MIME = new Set(["image/png", "image/jpeg", "image/heic", "image/webp"]);
export const MAX_RUN_FILES = 5;
export const MAX_RUN_FILE_BYTES = 10 * 1024 * 1024;

const AGENTS = Object.keys(AGENT_COSTS) as [CoinAgent, ...CoinAgent[]];

export type ParsedRun = {
  agent: CoinAgent;
  inputs: Record<string, string>; // 텍스트 필드 key→값
  note: string;
};
export type RunParseResult =
  | { ok: true; data: ParsedRun }
  | { ok: false; reason: "honeypot" | "invalid"; message?: string };

// 폼 텍스트 필드를 받아 agent별 필수 텍스트 충족 확인 (파일은 라우트에서 별도 검증).
export function parseRunFields(raw: Record<string, unknown>): RunParseResult {
  const agent = raw.agent;
  if (typeof agent !== "string" || !(AGENTS as string[]).includes(agent)) {
    return { ok: false, reason: "invalid", message: "agent" };
  }
  // honeypot — 사람 눈엔 안 보이는 website 필드를 봇만 채움
  if (typeof raw.website === "string" && raw.website.trim() !== "") {
    return { ok: false, reason: "honeypot" };
  }
  const spec = RUN_INPUTS[agent as CoinAgent];
  const inputs: Record<string, string> = {};
  for (const f of spec.textFields) {
    const v = typeof raw[f.key] === "string" ? (raw[f.key] as string).trim() : "";
    if (f.required && v.length === 0) {
      return { ok: false, reason: "invalid", message: f.key };
    }
    if (v.length > 0) {
      if (v.length > 2000) return { ok: false, reason: "invalid", message: f.key };
      inputs[f.key] = v;
    }
  }
  const note =
    typeof raw.note === "string" ? (raw.note as string).trim().slice(0, 2000) : "";
  return { ok: true, data: { agent: agent as CoinAgent, inputs, note } };
}

// 슬롯별 업로드 파일이 agent의 필수 파일 슬롯을 충족 + MIME/크기/개수 제약 만족하는지.
export function validateRunFiles(
  agent: CoinAgent,
  filesByRole: Record<string, { size: number; type: string }[]>,
): { ok: true } | { ok: false; message: string } {
  const spec = RUN_INPUTS[agent];
  const all = Object.values(filesByRole).flat();
  if (all.length > MAX_RUN_FILES) return { ok: false, message: "file_count" };
  for (const f of all) {
    if (f.size > MAX_RUN_FILE_BYTES || !ALLOWED_RUN_MIME.has(f.type)) {
      return { ok: false, message: "file_invalid" };
    }
  }
  for (const slot of spec.fileSlots) {
    if (slot.required && (filesByRole[slot.key]?.length ?? 0) === 0) {
      return { ok: false, message: `required:${slot.key}` };
    }
  }
  return { ok: true };
}
