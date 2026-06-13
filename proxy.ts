// 📚 Next 16: middleware.ts → proxy.ts (함수명 proxy, Node 런타임 기본).
// Supabase 세션 토큰을 매 요청마다 새로고침해 만료를 막는다.
// ⚠️ createServerClient와 getUser 사이에 다른 코드 넣지 말 것(세션 동기화 깨짐).
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return response; // env 미설정 시 통과(빌드/미설정 환경 보호)

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  await supabase.auth.getUser();
  return response;
}

export const config = {
  // 정적 자산·이미지·api 제외 (proxy.md 권장 negative match)
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|icon.svg|opengraph-image|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
