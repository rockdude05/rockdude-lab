import { redirect } from "next/navigation";
import { createSupabaseServer } from "@/lib/supabase-server";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import SignOutButton from "@/components/dashboard/SignOutButton";

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

  return (
    <>
      {/* 골드 회원 존 — 따뜻한 다크 배경(전역 바이올렛 오로라를 덮음) */}
      <div className="zone-gold-bg" aria-hidden="true" />
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
        <div className="membership-card rounded-2xl p-8 flex items-end justify-between gap-4">
          <div className="flex flex-col gap-2">
            <p className="text-sm" style={{ color: "var(--text-dim)" }}>
              보유 코인
            </p>
            <p className="font-mono text-5xl font-bold gold-glow">
              {coins.toLocaleString()}
            </p>
          </div>
          {/* Phase 2: [충전하기] 동작 연결 */}
          <button
            disabled
            className="cta-gold rounded-full px-5 py-2.5 text-sm font-medium opacity-60 cursor-not-allowed"
          >
            충전하기 (준비 중)
          </button>
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
