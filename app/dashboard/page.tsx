import { redirect } from "next/navigation";
import { createSupabaseServer } from "@/lib/supabase-server";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import SignOutButton from "@/components/dashboard/SignOutButton";
import GoldAtmosphere from "@/components/membership/GoldAtmosphere";
import TopupForm from "@/components/dashboard/TopupForm";
import { AGENT_COSTS, coinsToWon } from "@/lib/coins";

// 세션(쿠키) 의존 → 절대 정적 prerender 불가. build 시 prerender 차단.
export const dynamic = "force-dynamic";
export const metadata = { title: "대시보드 — Rockdude Lab" };

export default async function DashboardPage() {
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/membership");

  // profiles.coins (신규가입 트리거로 생성됨). 없으면 0.
  const { data: profile } = await supabase
    .from("profiles")
    .select("coins, email")
    .eq("id", user.id)
    .single();
  const coins = profile?.coins ?? 0;

  // 최근 충전 신청 (본인 행만 — RLS)
  const { data: topups } = await supabase
    .from("coin_topup_requests")
    .select("amount_won, coins, status, created_at")
    .order("created_at", { ascending: false })
    .limit(5);

  return (
    <>
      {/* 골드 회원 존 — 떠다니는 골드 글로우 + 길로셰 무늬(전역 바이올렛 오로라를 덮음) */}
      <GoldAtmosphere />
      <SiteHeader />
      <main className="min-h-screen max-w-4xl mx-auto px-6 w-full pt-32 pb-24 flex flex-col gap-10">
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            <p className="font-mono text-sm" style={{ color: "var(--accent-gold)" }}>
              ~/dashboard
            </p>
            <h1
              className="font-bold text-3xl break-keep"
              style={{ color: "var(--text-main)" }}
            >
              {profile?.email ?? user.email}
            </h1>
          </div>
          <SignOutButton />
        </div>

        {/* 보유 코인 */}
        <div className="membership-card rounded-2xl p-8 flex flex-col gap-2">
          <p className="text-sm" style={{ color: "var(--text-dim)" }}>
            보유 코인
          </p>
          <p className="font-mono text-5xl font-bold gold-glow">
            {coins.toLocaleString()}
          </p>
        </div>

        {/* 코인 가격 */}
        <div className="flex flex-col gap-3">
          <h2 className="font-bold text-xl" style={{ color: "var(--text-main)" }}>
            코인 가격
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {(
              [
                ["course-analyzer", "분석"],
                ["homework-solver", "과제풀이"],
                ["study-notes", "공부노트"],
              ] as const
            ).map(([key, label]) => (
              <div
                key={key}
                className="membership-card rounded-xl p-4 flex flex-col gap-1"
              >
                <p className="text-sm" style={{ color: "var(--text-dim)" }}>
                  {label}
                </p>
                <p className="font-mono text-lg gold-glow">
                  {AGENT_COSTS[key]}코인
                </p>
                <p className="text-xs" style={{ color: "var(--text-dim)" }}>
                  ₩{coinsToWon(AGENT_COSTS[key]).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* 코인 충전 */}
        <div className="flex flex-col gap-3">
          <h2 className="font-bold text-xl" style={{ color: "var(--text-main)" }}>
            코인 충전
          </h2>
          <div className="membership-card rounded-2xl p-6">
            <TopupForm />
          </div>
          {(topups ?? []).length > 0 && (
            <div className="flex flex-col gap-1.5">
              <p className="text-sm" style={{ color: "var(--text-dim)" }}>
                최근 충전 신청
              </p>
              {(topups ?? []).map((t, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between text-sm rounded-lg px-3 py-2"
                  style={{
                    background: "var(--bg-panel)",
                    border: "1px solid rgba(255,255,255,0.06)",
                    color: "var(--text-dim)",
                  }}
                >
                  <span>
                    ₩{t.amount_won.toLocaleString()} ({t.coins}코인)
                  </span>
                  <span
                    style={{
                      color:
                        t.status === "done"
                          ? "var(--accent-green)"
                          : t.status === "rejected"
                            ? "var(--accent-orange)"
                            : "var(--text-dim)",
                    }}
                  >
                    {t.status === "done"
                      ? "지급됨"
                      : t.status === "rejected"
                        ? "거절"
                        : "대기 중"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 실행 이력 — Phase 3에서 agent_runs 연결 */}
        <div className="flex flex-col gap-3">
          <h2 className="font-bold text-xl" style={{ color: "var(--text-main)" }}>
            실행 이력
          </h2>
          <div
            className="rounded-2xl p-8 text-center text-sm"
            style={{
              background: "var(--bg-panel)",
              border: "1px solid rgba(255,255,255,0.07)",
              color: "var(--text-dim)",
            }}
          >
            아직 실행 내역이 없어요. (실행 기능은 곧 열립니다)
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
