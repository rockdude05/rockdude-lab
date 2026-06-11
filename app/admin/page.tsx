// 📚 학습: Server Action 흐름 — 이 페이지는 서버 컴포넌트.
// form의 action prop에 Server Action 함수를 직접 전달하면
// Next.js가 클라이언트 JS 없이도 제출을 처리 (Progressive Enhancement).
//
// 📚 학습: httpOnly 쿠키가 XSS에서 토큰을 지키는 이유 —
// httpOnly 설정 시 document.cookie로 읽기 불가 → 악성 스크립트가 세션을 탈취 불가.
// 브라우저가 HTTP 요청 시 자동으로 헤더에 포함시킴.

import { cookies } from "next/headers";
import { verify } from "@/lib/admin-auth";
import { login, updateStatus, publishReply } from "@/app/admin/actions";

export const dynamic = "force-dynamic";

const STATUS_ORDER = ["new", "review", "building", "done"] as const;
type InquiryStatus = (typeof STATUS_ORDER)[number];

interface Inquiry {
  id: string;
  created_at: string;
  type: string;
  name: string;
  contact: string;
  body: string;
  status: InquiryStatus;
  access_code?: string | null;
  reply?: string | null;
  replied_at?: string | null;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  const yy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${yy}-${mm}-${dd} ${hh}:${min}`;
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const adminSecret = process.env.ADMIN_SECRET ?? "";

  // 쿠키 확인 — 인증 여부 판단
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value ?? "";
  const isAuthed = adminSecret !== "" && verify(token, adminSecret);

  // 미인증 → 로그인 폼
  if (!isAuthed) {
    return (
      <main
        className="min-h-screen flex items-center justify-center px-6"
        style={{ background: "var(--bg-base)" }}
      >
        <div
          className="w-full max-w-sm rounded-2xl p-8 flex flex-col gap-6"
          style={{
            background: "var(--bg-panel)",
            border: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          <h1
            className="text-xl font-semibold"
            style={{ color: "var(--text-main)" }}
          >
            관리자 로그인
          </h1>
          {params.error && (
            <p className="text-sm" style={{ color: "var(--accent-orange)" }}>
              비밀번호가 올바르지 않습니다.
            </p>
          )}
          <form action={login} className="flex flex-col gap-4">
            <input
              type="password"
              name="password"
              required
              autoComplete="current-password"
              placeholder="비밀번호"
              className="rounded-lg px-4 py-3 text-sm outline-none"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                color: "var(--text-main)",
              }}
            />
            <button
              type="submit"
              className="cta-glass rounded-full px-6 py-3 font-semibold"
            >
              로그인
            </button>
          </form>
        </div>
      </main>
    );
  }

  // 인증됨 → 문의 목록 조회
  let inquiries: Inquiry[] = [];
  let fetchError = false;

  try {
    const { data, error } = await import("@/lib/supabase").then((m) =>
      m.getSupabase().from("inquiries").select("*").order("created_at", { ascending: false })
    );
    if (error) fetchError = true;
    else inquiries = (data as Inquiry[]) ?? [];
  } catch {
    fetchError = true;
  }

  if (fetchError) {
    return (
      <main
        className="min-h-screen flex items-center justify-center px-6"
        style={{ background: "var(--bg-base)" }}
      >
        <p style={{ color: "var(--text-dim)" }}>
          Supabase 미설정 — .env.local 채우면 목록이 나옵니다.
        </p>
      </main>
    );
  }

  // 상태별 그룹화
  const grouped = STATUS_ORDER.reduce<Record<string, Inquiry[]>>(
    (acc, s) => {
      acc[s] = inquiries.filter((i) => (i.status ?? "new") === s);
      return acc;
    },
    {} as Record<string, Inquiry[]>,
  );

  const statusLabel: Record<string, string> = {
    new: "신규",
    review: "검토 중",
    building: "개발 중",
    done: "완료",
  };

  return (
    <main
      className="min-h-screen px-6 py-12 max-w-4xl mx-auto"
      style={{ background: "var(--bg-base)" }}
    >
      <h1
        className="text-2xl font-bold mb-8"
        style={{ color: "var(--text-main)" }}
      >
        문의 관리
      </h1>

      {inquiries.length === 0 && (
        <p style={{ color: "var(--text-dim)" }}>접수된 문의가 없습니다.</p>
      )}

      {STATUS_ORDER.map((s) => {
        const group = grouped[s];
        if (group.length === 0) return null;
        return (
          <section key={s} className="mb-10">
            <h2
              className="text-lg font-semibold mb-4"
              style={{ color: "var(--text-dim)" }}
            >
              {statusLabel[s]} ({group.length})
            </h2>
            <div className="flex flex-col gap-4">
              {group.map((inq) => (
                <div
                  key={inq.id}
                  className="rounded-xl p-5 flex flex-col gap-3"
                  style={{
                    background: "var(--bg-panel)",
                    border: "1px solid rgba(255,255,255,0.07)",
                  }}
                >
                  <div className="flex flex-wrap items-center gap-3">
                    <span
                      className="text-xs font-mono"
                      style={{ color: "var(--text-dim)" }}
                    >
                      {formatDate(inq.created_at)}
                    </span>
                    <span
                      className="text-xs rounded-full px-2.5 py-0.5 font-mono"
                      style={{
                        background: "rgba(255,255,255,0.06)",
                        color: "var(--accent-orange)",
                      }}
                    >
                      {inq.type}
                    </span>
                    <span
                      className="text-sm font-semibold"
                      style={{ color: "var(--text-main)" }}
                    >
                      {inq.name}
                    </span>
                    {inq.contact && (
                      <span
                        className="text-sm"
                        style={{ color: "var(--text-dim)" }}
                      >
                        {inq.contact}
                      </span>
                    )}
                    {inq.access_code && (
                      <span
                        className="text-xs font-mono"
                        style={{ color: "var(--text-dim)" }}
                      >
                        {inq.access_code}
                      </span>
                    )}
                  </div>
                  <p
                    className="text-sm whitespace-pre-wrap"
                    style={{ color: "var(--text-main)" }}
                  >
                    {inq.body}
                  </p>
                  <form action={updateStatus} className="flex items-center gap-2">
                    <input type="hidden" name="id" value={inq.id} />
                    <select
                      name="status"
                      defaultValue={inq.status ?? "new"}
                      className="rounded-lg px-3 py-1.5 text-sm outline-none"
                      style={{
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        color: "var(--text-main)",
                      }}
                    >
                      {STATUS_ORDER.map((opt) => (
                        <option key={opt} value={opt}>
                          {statusLabel[opt]}
                        </option>
                      ))}
                    </select>
                    <button
                      type="submit"
                      className="text-sm rounded-lg px-3 py-1.5 transition-colors"
                      style={{
                        background: "rgba(255,255,255,0.06)",
                        color: "var(--text-main)",
                        border: "1px solid rgba(255,255,255,0.1)",
                      }}
                    >
                      변경
                    </button>
                  </form>
                  <details className="flex flex-col gap-2">
                    <summary
                      className="text-sm cursor-pointer select-none"
                      style={{ color: "var(--text-dim)" }}
                    >
                      답변{" "}
                      {inq.reply
                        ? `(발행됨 ${inq.replied_at ? formatDate(inq.replied_at) : ""})`
                        : "(미발행)"}
                    </summary>
                    <form
                      action={publishReply}
                      className="flex flex-col gap-2 mt-2"
                    >
                      <input type="hidden" name="id" value={inq.id} />
                      <textarea
                        name="reply"
                        rows={4}
                        defaultValue={inq.reply ?? ""}
                        className="rounded-lg p-3 text-sm outline-none resize-none w-full"
                        style={{
                          background: "rgba(255,255,255,0.04)",
                          border: "1px solid rgba(255,255,255,0.08)",
                          color: "var(--text-main)",
                        }}
                      />
                      <div className="flex items-center gap-3">
                        <button
                          type="submit"
                          className="text-sm rounded-lg px-3 py-1.5 transition-colors"
                          style={{
                            background: "rgba(255,255,255,0.06)",
                            color: "var(--text-main)",
                            border: "1px solid rgba(255,255,255,0.1)",
                          }}
                        >
                          발행
                        </button>
                        <span
                          className="text-xs"
                          style={{ color: "var(--text-dim)" }}
                        >
                          빈 칸으로 발행하면 답변이 내려갑니다
                        </span>
                      </div>
                    </form>
                  </details>
                </div>
              ))}
            </div>
          </section>
        );
      })}
    </main>
  );
}
