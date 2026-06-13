import { NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase-server";

// Google OAuth + PKCE 매직링크의 code 교환 → 세션 쿠키 set → 대시보드로.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createSupabaseServer();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${origin}${next}`);
  }
  return NextResponse.redirect(`${origin}/membership?error=auth`);
}
