"use client";

// 로그아웃 — POST /auth/signout (Route Handler가 세션 제거 후 메인으로 리다이렉트).
export default function SignOutButton() {
  return (
    <form action="/auth/signout" method="post">
      <button
        type="submit"
        className="scroll-hint-link text-sm cursor-pointer"
      >
        로그아웃 →
      </button>
    </form>
  );
}
