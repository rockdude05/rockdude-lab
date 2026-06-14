"use client";

import { useEffect } from "react";
import { createSupabaseBrowser } from "@/lib/supabase-browser";

// 📚 매직링크(implicit 흐름) 세션 처리.
// 무료 Supabase 플랜은 이메일 템플릿을 못 바꿔 매직링크가 기본 {{ .ConfirmationURL }}을 쓴다.
// 그 흐름은 verify 후 토큰을 URL **해시**(#access_token=…&refresh_token=…)로 사이트(보통 루트)에 보낸다.
// 서버는 해시를 읽을 수 없으므로(서버 라우트 /auth/callback은 ?code= PKCE/OAuth용),
// 전역 클라이언트 핸들러가 해시를 잡아 세션을 쿠키에 설정하고 대시보드로 보낸다. (해시는 즉시 제거 — 토큰 노출 방지)
export default function AuthHashHandler() {
  useEffect(() => {
    const hash = window.location.hash;
    if (!hash || !hash.includes("access_token")) return;

    const params = new URLSearchParams(hash.slice(1));
    const access_token = params.get("access_token");
    const refresh_token = params.get("refresh_token");
    if (!access_token || !refresh_token) return;

    const supabase = createSupabaseBrowser();
    supabase.auth
      .setSession({ access_token, refresh_token })
      .then(({ error }) => {
        // URL에서 해시(토큰) 제거
        window.history.replaceState(
          null,
          "",
          window.location.pathname + window.location.search,
        );
        window.location.replace(error ? "/membership?error=auth" : "/dashboard");
      })
      .catch(() => {
        window.location.replace("/membership?error=auth");
      });
  }, []);

  return null;
}
