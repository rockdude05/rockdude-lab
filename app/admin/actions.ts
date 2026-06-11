"use server";

// 📚 학습: Server Action 흐름 — "use server" 선언된 함수는 서버에서만 실행.
// 클라이언트가 form action으로 호출하면 Next.js가 자동으로 POST 요청을 서버로 라우팅.
// 응답은 RSC(React Server Component) 페이로드로 반환되어 UI를 재렌더링.
//
// 📚 학습: httpOnly 쿠키가 XSS에서 토큰을 지키는 이유 —
// document.cookie로는 httpOnly 쿠키를 읽을 수 없어서 악성 스크립트가 토큰을 훔칠 수 없음.
// 서버로 요청할 때 브라우저가 자동으로 헤더에 포함시키는 방식으로만 동작.

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { sign, verify } from "@/lib/admin-auth";
import { getSupabase } from "@/lib/supabase";

export async function login(formData: FormData) {
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

  const id = formData.get("id") as string;
  const status = formData.get("status") as string;

  await getSupabase().from("inquiries").update({ status }).eq("id", id);
  revalidatePath("/admin");
}
