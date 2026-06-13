"use client";

import { useState } from "react";
import { createSupabaseBrowser } from "@/lib/supabase-browser";

export default function LoginPanel() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<
    "idle" | "sending" | "sent" | "error"
  >("idle");

  async function sendMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    const supabase = createSupabaseBrowser();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${location.origin}/auth/callback` },
    });
    setStatus(error ? "error" : "sent");
  }

  async function signInGoogle() {
    const supabase = createSupabaseBrowser();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${location.origin}/auth/callback` },
    });
  }

  if (status === "sent") {
    return (
      <p
        className="text-center text-sm break-keep"
        style={{ color: "var(--text-dim)" }}
      >
        ✉️ {email}로 로그인 링크를 보냈어요 — 메일함을 확인해주세요.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <button
        onClick={signInGoogle}
        className="cta-gold rounded-full px-6 py-3 font-semibold cursor-pointer"
      >
        Google로 계속하기
      </button>
      <div
        className="flex items-center gap-3 text-xs"
        style={{ color: "var(--text-dim)" }}
      >
        <span
          className="h-px flex-1"
          style={{ background: "rgba(255,255,255,0.1)" }}
        />
        또는 이메일
        <span
          className="h-px flex-1"
          style={{ background: "rgba(255,255,255,0.1)" }}
        />
      </div>
      <form onSubmit={sendMagicLink} className="flex flex-col gap-3">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="이메일 주소"
          className="inquiry-input rounded-lg px-4 py-3 text-sm"
        />
        <button
          type="submit"
          disabled={status === "sending"}
          className="cta-gold rounded-full px-6 py-3 font-semibold disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {status === "sending" ? "보내는 중…" : "로그인 링크 받기"}
        </button>
        {status === "error" && (
          <p className="text-xs" style={{ color: "var(--accent-orange)" }}>
            전송 실패 — 잠시 후 다시 시도해주세요.
          </p>
        )}
      </form>
    </div>
  );
}
