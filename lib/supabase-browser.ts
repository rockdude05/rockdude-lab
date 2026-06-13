// 📚 anon 키 브라우저 클라이언트 — 클라이언트 컴포넌트에서 로그인/세션에 사용.
// service_role 아님(공개 anon, RLS가 보호). lib/supabase.ts(service_role)와 분리.
import { createBrowserClient } from "@supabase/ssr";

export function createSupabaseBrowser() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY 미설정",
    );
  }
  return createBrowserClient(url, key);
}
