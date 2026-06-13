import { NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase-server";

// 로그아웃 — 세션 쿠키 제거 후 메인으로 (303: POST → GET 리다이렉트).
export async function POST(request: Request) {
  const supabase = await createSupabaseServer();
  await supabase.auth.signOut();
  return NextResponse.redirect(new URL("/", request.url), { status: 303 });
}
