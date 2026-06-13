"use client";

import { useState, useMemo } from "react";
import { RUN_INPUTS } from "@/lib/run-inputs";
import {
  AGENT_COSTS,
  IMAGE_PAGE_WEIGHT,
  ABS_MAX_PAGES,
  runCost,
  coinsToWon,
  type CoinAgent,
} from "@/lib/coins";

const AGENT_LABEL: Record<CoinAgent, string> = {
  "study-notes": "공부노트",
  "homework-solver": "과제풀이",
  "course-analyzer": "분석",
};
const ORDER: CoinAgent[] = ["course-analyzer", "homework-solver", "study-notes"];
const IMG = new Set(["image/png", "image/jpeg", "image/heic", "image/webp"]);

type RunResult = { ok?: boolean; error?: string; charged?: number };

export default function RunForm({ coins }: { coins: number }) {
  const [agent, setAgent] = useState<CoinAgent>("course-analyzer");
  const [filesByRole, setFilesByRole] = useState<Record<string, File[]>>({});
  const [estPages, setEstPages] = useState(0);
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<RunResult | null>(null);

  const spec = RUN_INPUTS[agent];
  const estCost = useMemo(() => runCost(agent, estPages), [agent, estPages]);
  const over = estPages > ABS_MAX_PAGES;
  const insufficient = estCost > coins;

  // 파일 선택 시 브라우저에서 가중 페이지 추정 (pdf-lib 동적 import → 코드 스플릿)
  async function recount(next: Record<string, File[]>) {
    const all = Object.values(next).flat();
    let pages = 0;
    let images = 0;
    const { PDFDocument } = await import("pdf-lib");
    for (const f of all) {
      if (IMG.has(f.type)) {
        images++;
        continue;
      }
      try {
        const doc = await PDFDocument.load(await f.arrayBuffer(), { ignoreEncryption: true });
        pages += doc.getPageCount();
      } catch {
        pages += 1;
      }
    }
    setEstPages(pages + images * IMAGE_PAGE_WEIGHT);
  }

  function onPick(role: string, files: FileList | null) {
    const next = { ...filesByRole, [role]: files ? Array.from(files) : [] };
    setFilesByRole(next);
    void recount(next);
  }

  function switchAgent(a: CoinAgent) {
    setAgent(a);
    setFilesByRole({});
    setEstPages(0);
    setResult(null);
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setResult(null);
    const form = e.currentTarget;
    const fd = new FormData(form);
    fd.set("agent", agent);
    for (const [role, arr] of Object.entries(filesByRole))
      for (const f of arr) fd.append(`file:${role}`, f);
    const res = await fetch("/api/run", { method: "POST", body: fd });
    const json: RunResult = await res.json().catch(() => ({ ok: false }));
    setPending(false);
    setResult(json);
    if (json.ok) {
      setFilesByRole({});
      setEstPages(0);
      form.reset();
    }
  }

  if (result?.ok) {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-sm break-keep" style={{ color: "var(--text-dim)" }}>
          ✅ 실행 요청 접수!{" "}
          {typeof result.charged === "number" ? `${result.charged}코인 차감.` : ""} 처리되면
          이메일과 아래 이력에서 결과를 받을 수 있어요.
        </p>
        <button
          type="button"
          onClick={() => setResult(null)}
          className="text-xs self-start"
          style={{ color: "var(--accent-gold)" }}
        >
          + 새 실행
        </button>
      </div>
    );
  }

  const errMap: Record<string, string> = {
    insufficient_coins: "코인이 부족해요. 충전 후 다시 시도해주세요.",
    too_large: `입력이 너무 커요(최대 ${ABS_MAX_PAGES}쪽 상당). 범위를 줄여주세요.`,
    auth: "로그인이 필요해요.",
    upload_failed: "파일 업로드에 실패했어요. 다시 시도해주세요.",
  };

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      {/* 에이전트 선택 카드 */}
      <div className="grid grid-cols-3 gap-2">
        {ORDER.map((a) => (
          <button
            key={a}
            type="button"
            onClick={() => switchAgent(a)}
            className="rounded-xl p-3 text-center text-sm transition cursor-pointer"
            style={{
              background: agent === a ? "var(--bg-panel)" : "transparent",
              border:
                agent === a
                  ? "1px solid var(--accent-gold)"
                  : "1px solid rgba(255,255,255,0.1)",
              color: agent === a ? "var(--text-main)" : "var(--text-dim)",
            }}
          >
            <div className="font-semibold">{AGENT_LABEL[a]}</div>
            <div className="font-mono text-xs gold-glow mt-1">{AGENT_COSTS[a]}코인~</div>
          </button>
        ))}
      </div>

      {/* 슬롯별 파일 */}
      {spec.fileSlots.map((slot) => (
        <label key={slot.key} className="flex flex-col gap-1 text-sm">
          <span style={{ color: "var(--text-dim)" }}>
            {slot.label}
            {slot.required && <span style={{ color: "var(--accent-gold)" }}> ✱</span>}
            {slot.hint && <span className="text-xs"> · {slot.hint}</span>}
          </span>
          <input
            type="file"
            multiple
            accept=".pdf,image/*"
            onChange={(e) => onPick(slot.key, e.target.files)}
            className="inquiry-input rounded-lg px-3 py-2 text-sm"
          />
        </label>
      ))}

      {/* 에이전트별 텍스트 필드 */}
      {spec.textFields.map((f) => (
        <label key={f.key} className="flex flex-col gap-1 text-sm">
          <span style={{ color: "var(--text-dim)" }}>
            {f.label}
            {f.required && <span style={{ color: "var(--accent-gold)" }}> ✱</span>}
          </span>
          {f.multiline ? (
            <textarea
              name={f.key}
              required={f.required}
              placeholder={f.placeholder}
              maxLength={2000}
              rows={3}
              className="inquiry-input rounded-lg px-3 py-2 text-sm resize-none"
            />
          ) : (
            <input
              name={f.key}
              required={f.required}
              placeholder={f.placeholder}
              maxLength={2000}
              className="inquiry-input rounded-lg px-3 py-2 text-sm"
            />
          )}
        </label>
      ))}

      {/* honeypot */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        className="absolute -left-[9999px]"
        aria-hidden
      />

      {/* 라이브 비용 */}
      <div className="flex items-center justify-between text-sm">
        <span style={{ color: "var(--text-dim)" }}>
          예상 {estPages}쪽(가중) ·{" "}
          <span className="gold-glow font-mono">{estCost}코인</span>
          <span className="text-xs"> (₩{coinsToWon(estCost).toLocaleString()})</span>
        </span>
        <span className="text-xs" style={{ color: "var(--text-dim)" }}>
          보유 {coins.toLocaleString()}
        </span>
      </div>

      {result?.error && (
        <p className="text-xs" style={{ color: "var(--accent-orange)" }}>
          {errMap[result.error] ?? "입력을 확인해주세요."}
        </p>
      )}

      <button
        type="submit"
        disabled={pending || over || insufficient}
        className="cta-gold rounded-full px-6 py-3 font-semibold disabled:opacity-50 cursor-pointer"
      >
        {pending
          ? "요청 중…"
          : over
            ? "입력이 너무 커요"
            : insufficient
              ? "코인 부족 — 충전 필요"
              : `${estCost}코인으로 실행`}
      </button>
    </form>
  );
}
