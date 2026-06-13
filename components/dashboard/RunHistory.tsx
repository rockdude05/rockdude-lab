"use client";

import { useState } from "react";
import { getResultUrl, requestRevision } from "@/app/dashboard/actions";

export type RunRow = {
  id: string;
  agent: string;
  cost: number;
  status: string;
  created_at: string;
  parent_run_id: string | null;
  has_child: boolean;
};

const AGENT_LABEL: Record<string, string> = {
  "study-notes": "공부노트",
  "homework-solver": "과제풀이",
  "course-analyzer": "분석",
};
const STATUS: Record<string, { t: string; c: string }> = {
  queued: { t: "대기", c: "var(--text-dim)" },
  running: { t: "실행 중", c: "var(--accent-gold)" },
  review: { t: "검토 중", c: "var(--accent-gold)" },
  done: { t: "완료", c: "var(--accent-green)" },
  failed: { t: "환불됨", c: "var(--accent-orange)" },
  refunded: { t: "환불됨", c: "var(--accent-orange)" },
};

export default function RunHistory({ runs }: { runs: RunRow[] }) {
  const [busy, setBusy] = useState<string | null>(null);
  const [revising, setRevising] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [msg, setMsg] = useState<Record<string, string>>({});

  if (runs.length === 0) {
    return (
      <div
        className="rounded-2xl p-8 text-center text-sm"
        style={{
          background: "var(--bg-panel)",
          border: "1px solid rgba(255,255,255,0.07)",
          color: "var(--text-dim)",
        }}
      >
        아직 실행 내역이 없어요. 위에서 에이전트를 골라 실행해보세요.
      </div>
    );
  }

  async function download(id: string) {
    setBusy(id);
    const r = await getResultUrl(id);
    setBusy(null);
    if (r.url) window.open(r.url, "_blank");
    else setMsg((m) => ({ ...m, [id]: "다운로드 준비 중이거나 만료됐어요." }));
  }

  async function submitRevision(id: string) {
    setBusy(id);
    const r = await requestRevision(id, note);
    setBusy(null);
    if (r.ok) {
      setRevising(null);
      setNote("");
      setMsg((m) => ({ ...m, [id]: "✅ 재요청 접수됨" }));
    } else {
      setMsg((m) => ({ ...m, [id]: r.error ?? "실패" }));
    }
  }

  return (
    <div className="flex flex-col gap-2">
      {runs.map((run) => {
        const st = STATUS[run.status] ?? { t: run.status, c: "var(--text-dim)" };
        const canRevise = run.status === "done" && !run.parent_run_id && !run.has_child;
        return (
          <div
            key={run.id}
            className="rounded-xl px-4 py-3 flex flex-col gap-2"
            style={{ background: "var(--bg-panel)", border: "1px solid rgba(255,255,255,0.07)" }}
          >
            <div className="flex items-center justify-between text-sm">
              <span style={{ color: "var(--text-main)" }}>
                {AGENT_LABEL[run.agent] ?? run.agent}
                {run.parent_run_id && " (재요청)"}
                <span className="text-xs ml-2" style={{ color: "var(--text-dim)" }}>
                  {run.cost}코인
                </span>
              </span>
              <span className="text-sm font-medium" style={{ color: st.c }}>
                {st.t}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {run.status === "done" && (
                <button
                  onClick={() => download(run.id)}
                  disabled={busy === run.id}
                  className="cta-gold rounded-full px-4 py-1.5 text-xs font-semibold disabled:opacity-50 cursor-pointer"
                >
                  {busy === run.id ? "…" : "결과 PDF 다운로드"}
                </button>
              )}
              {canRevise && revising !== run.id && (
                <button
                  onClick={() => {
                    setRevising(run.id);
                    setNote("");
                  }}
                  className="rounded-full px-4 py-1.5 text-xs cursor-pointer"
                  style={{ border: "1px solid rgba(255,255,255,0.2)", color: "var(--text-dim)" }}
                >
                  무료 재요청
                </button>
              )}
            </div>
            {revising === run.id && (
              <div className="flex flex-col gap-2">
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={2}
                  maxLength={2000}
                  placeholder="무엇을 고칠지 적어주세요 (예: 3번 문제 풀이가 틀렸어요)"
                  className="inquiry-input rounded-lg px-3 py-2 text-sm resize-none"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => submitRevision(run.id)}
                    disabled={busy === run.id || note.trim().length < 5}
                    className="cta-gold rounded-full px-4 py-1.5 text-xs font-semibold disabled:opacity-50 cursor-pointer"
                  >
                    재요청 보내기
                  </button>
                  <button
                    onClick={() => setRevising(null)}
                    className="text-xs px-3 cursor-pointer"
                    style={{ color: "var(--text-dim)" }}
                  >
                    취소
                  </button>
                </div>
              </div>
            )}
            {msg[run.id] && (
              <p className="text-xs" style={{ color: "var(--text-dim)" }}>
                {msg[run.id]}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
