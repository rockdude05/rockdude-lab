"use server";

// 📚 학습: Server Action 흐름 — "use server" 선언된 함수는 서버에서만 실행.
// 클라이언트가 form action으로 호출하면 Next.js가 자동으로 POST 요청을 서버로 라우팅.
// 응답은 RSC(React Server Component) 페이로드로 반환되어 UI를 재렌더링.
//
// 📚 학습: httpOnly 쿠키가 XSS에서 토큰을 지키는 이유 —
// document.cookie로는 httpOnly 쿠키를 읽을 수 없어서 악성 스크립트가 토큰을 훔칠 수 없음.
// 서버로 요청할 때 브라우저가 자동으로 헤더에 포함시키는 방식으로만 동작.

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { sign, verify } from "@/lib/admin-auth";
import { getSupabase } from "@/lib/supabase";
import { createRateLimiter } from "@/lib/rate-limit";

const STATUSES = ["new", "review", "building", "done"] as const;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// 로그인 무차별 대입 방지 — IP당 5회/15분
const loginLimiter = createRateLimiter({ limit: 5, windowMs: 15 * 60_000 });

export async function login(formData: FormData) {
  const hdrs = await headers();
  const ip = hdrs.get("x-forwarded-for")?.split(",")[0] ?? "unknown";
  if (!loginLimiter.check(ip)) {
    redirect("/admin?error=1");
  }

  const password = formData.get("password") as string;
  const adminPassword = process.env.ADMIN_PASSWORD;
  const adminSecret = process.env.ADMIN_SECRET;

  if (!adminPassword || !adminSecret || password !== adminPassword) {
    redirect("/admin?error=1");
  }

  const cookieStore = await cookies();
  cookieStore.set("admin_token", sign(adminSecret), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7일
  });

  redirect("/admin");
}

export async function updateStatus(formData: FormData) {
  const adminSecret = process.env.ADMIN_SECRET ?? "";
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value ?? "";

  if (!verify(token, adminSecret)) {
    redirect("/admin");
  }

  // 📚 학습: Server Action 입력도 신뢰 금지 — 폼을 우회해 임의 값으로 호출 가능하므로
  // id(UUID)·status(화이트리스트)를 서버에서 다시 검증한다.
  const id = formData.get("id");
  const status = formData.get("status");
  if (typeof id !== "string" || !UUID_RE.test(id)) return;
  if (
    typeof status !== "string" ||
    !STATUSES.includes(status as (typeof STATUSES)[number])
  )
    return;

  const { error } = await getSupabase()
    .from("inquiries")
    .update({ status })
    .eq("id", id);
  if (error) console.error("[admin] status 업데이트 실패:", error.message);
  revalidatePath("/admin");
}

export async function publishReply(formData: FormData) {
  const adminSecret = process.env.ADMIN_SECRET ?? "";
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value ?? "";

  if (!verify(token, adminSecret)) {
    redirect("/admin");
  }

  const id = formData.get("id");
  if (typeof id !== "string" || !UUID_RE.test(id)) return;

  const replyRaw = formData.get("reply");
  const reply = typeof replyRaw === "string" ? replyRaw.trim() : "";

  if (reply.length > 4000) return;

  const updatePayload =
    reply.length === 0
      ? { reply: "", replied_at: null }
      : { reply, replied_at: new Date().toISOString() };

  const { error } = await getSupabase()
    .from("inquiries")
    .update(updatePayload)
    .eq("id", id);
  if (error) console.error("[admin] reply 업데이트 실패:", error.message);
  revalidatePath("/admin");
}
