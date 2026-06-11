export const dynamic = "force-dynamic";

import Link from "next/link";
import { normalizeAccessCode } from "@/lib/access-code";
import { getSupabase } from "@/lib/supabase";

const TYPE_LABELS: Record<string, string> = {
  try: "써보고 싶어요",
  idea: "아이디어",
  request: "새 에이전트 요청",
  bug: "버그·질문",
};

const STATUS_LABELS: Record<string, string> = {
  new: "접수됨",
  review: "검토중",
  building: "작업중",
  done: "완료",
};

type StatusKey = "new" | "review" | "building" | "done";

const STATUS_COLORS: Record<StatusKey, string> = {
  new: "var(--text-dim)",
  review: "var(--accent-orange)",
  building: "var(--accent-blue)",
  done: "var(--accent-green)",
};

function formatDate(iso: string): string {
  const d = new Date(iso);
  const yy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yy}-${mm}-${dd}`;
}

interface InquiryRow {
  created_at: string;
  type: string;
  body: string;
  status: string;
  reply: string;
  replied_at: string | null;
}

export default async function CheckPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string | string[] }>;
}) {
  const params = await searchParams;
  const rawCode = Array.isArray(params.code) ? params.code[0] : (params.code ?? "");
  const normalized = rawCode ? normalizeAccessCode(rawCode) : "";

  let inquiry: InquiryRow | null = null;
  let lookupError = false;

  if (normalized) {
    try {
      const { data, error } = await getSupabase()
        .from("inquiries")
        .select("created_at,type,body,status,reply,replied_at")
        .eq("access_code", normalized)
        .maybeSingle();
      if (error) {
        lookupError = true;
      } else {
        inquiry = data as InquiryRow | null;
      }
    } catch {
      lookupError = true;
    }
  }

  const statusKey = (inquiry?.status ?? "new") as StatusKey;

  const inputStyle: React.CSSProperties = {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    color: "var(--text-main)",
  };

  return (
    <main
      className="min-h-screen"
      style={{ background: "var(--bg-base)" }}
    >
      <div className="max-w-lg mx-auto px-6 py-32 flex flex-col gap-8">
        {/* 로고 */}
        <Link
          href="/"
          className="font-mono text-sm self-start"
          style={{ color: "var(--text-dim)" }}
        >
          rockdude.lab
        </Link>

        {/* 헤딩 */}
        <div className="flex flex-col gap-2">
          <h1
            className="text-3xl font-bold"
            style={{ color: "var(--text-main)" }}
          >
            답변 확인
          </h1>
          <p className="text-sm" style={{ color: "var(--text-dim)" }}>
            문의 접수 시 받은 조회코드를 입력하세요.
          </p>
        </div>

        {/* 조회 폼 */}
        <form method="get" action="/check" className="flex flex-col gap-3">
          <div className="flex gap-2">
            <input
              name="code"
              type="text"
              defaultValue={rawCode}
              placeholder="예: A3F9KQ2M"
              className="flex-1 rounded-lg px-4 py-3 text-sm font-mono outline-none"
              style={{ ...inputStyle, textTransform: "uppercase" }}
            />
            <button
              type="submit"
              className="cta-glass rounded-full px-5 py-2.5 text-sm font-semibold"
            >
              조회
            </button>
          </div>
        </form>

        {/* 결과 */}
        {normalized && (
          <div className="flex flex-col gap-4">
            {lookupError ? (
              <p className="text-sm" style={{ color: "var(--accent-orange)" }}>
                조회 중 문제가 발생했어요. 잠시 후 다시 시도해주세요.
              </p>
            ) : inquiry === null ? (
              <p className="text-sm" style={{ color: "var(--accent-orange)" }}>
                코드와 일치하는 문의가 없어요. 코드를 다시 확인해주세요.
              </p>
            ) : (
              <div
                className="rounded-2xl p-6 flex flex-col gap-4"
                style={{
                  background: "var(--bg-panel)",
                  border: "1px solid rgba(255,255,255,0.07)",
                }}
              >
                {/* 메타 행 */}
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className="text-xs font-mono"
                    style={{ color: "var(--text-dim)" }}
                  >
                    {formatDate(inquiry.created_at)}
                  </span>
                  <span
                    className="text-xs rounded-full px-2.5 py-0.5"
                    style={{
                      background: "rgba(255,255,255,0.06)",
                      color: "var(--accent-orange)",
                    }}
                  >
                    {TYPE_LABELS[inquiry.type] ?? inquiry.type}
                  </span>
                  <span
                    className="text-xs rounded-full px-2.5 py-0.5 font-medium"
                    style={{
                      background: "rgba(255,255,255,0.06)",
                      color: STATUS_COLORS[statusKey] ?? "var(--text-dim)",
                    }}
                  >
                    {STATUS_LABELS[statusKey] ?? statusKey}
                  </span>
                </div>

                {/* 내 문의 */}
                <div className="flex flex-col gap-1.5">
                  <p
                    className="text-xs font-medium"
                    style={{ color: "var(--text-dim)" }}
                  >
                    내 문의
                  </p>
                  <p
                    className="text-sm whitespace-pre-wrap"
                    style={{ color: "var(--text-dim)" }}
                  >
                    {inquiry.body}
                  </p>
                </div>

                {/* 답변 */}
                <div className="flex flex-col gap-1.5">
                  <p
                    className="text-xs font-medium"
                    style={{ color: "var(--text-dim)" }}
                  >
                    답변
                  </p>
                  {inquiry.reply ? (
                    <div className="flex flex-col gap-1">
                      <p
                        className="text-sm whitespace-pre-wrap"
                        style={{ color: "var(--text-main)" }}
                      >
                        {inquiry.reply}
                      </p>
                      {inquiry.replied_at && (
                        <p
                          className="text-xs"
                          style={{ color: "var(--text-dim)" }}
                        >
                          {formatDate(inquiry.replied_at)}
                        </p>
                      )}
                    </div>
                  ) : (
                    <p
                      className="text-sm"
                      style={{ color: "var(--text-dim)", fontStyle: "italic" }}
                    >
                      아직 답변을 준비하고 있어요 — 보통 하루 안에 올라옵니다.
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
