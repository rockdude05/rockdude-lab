import { redirect } from "next/navigation";
import Link from "next/link";
import { createSupabaseServer } from "@/lib/supabase-server";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import LoginPanel from "@/components/membership/LoginPanel";

export const metadata = { title: "Rockdude Lab — 회원 (코인 실행)" };

export default async function MembershipPage() {
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect("/dashboard");

  return (
    <>
      <SiteHeader />
      <main className="min-h-screen flex flex-col items-center justify-center max-w-2xl mx-auto px-6 w-full pt-32 pb-24 gap-8">
        <div className="flex flex-col items-center gap-3 text-center">
          <p
            className="font-mono text-sm tracking-widest"
            style={{ color: "var(--accent-gold)" }}
          >
            ~/membership
          </p>
          <h1
            className="font-bold text-4xl md:text-5xl break-keep"
            style={{ color: "var(--text-main)" }}
          >
            코인으로 <span className="gold-glow">에이전트를 실행</span>하세요
          </h1>
          <p className="max-w-md break-keep" style={{ color: "var(--text-dim)" }}>
            로그인하면 공부노트·과제풀이·분석을 코인으로 직접 돌리고, 결과
            PDF를 받습니다.
            {/* Phase 4: 이 자리에 R3F 3D 코인 오브젝트 */}
          </p>
        </div>
        <div className="membership-card rounded-2xl p-8 w-full max-w-sm">
          <LoginPanel />
        </div>
        <Link href="/" className="scroll-hint-link text-sm">
          ← 메인으로
        </Link>
      </main>
      <SiteFooter />
    </>
  );
}
