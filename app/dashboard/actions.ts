"use server";

import { createSupabaseServer } from "@/lib/supabase-server";
import { getSupabase } from "@/lib/supabase";
import { sendTelegram } from "@/lib/telegram";
import { topupSchema } from "@/lib/topup-schema";
import { wonToCoins } from "@/lib/coins";
import { revalidatePath } from "next/cache";

export type TopupState = { ok?: boolean; error?: string };

// 충전 신청 — 로그인 유저 확인 → 검증 → service_role insert → 김비서 알림.
export async function requestTopup(
  _prev: TopupState,
  formData: FormData,
): Promise<TopupState> {
  const supa = await createSupabaseServer();
  const {
    data: { user },
  } = await supa.auth.getUser();
  if (!user) return { error: "로그인이 필요합니다." };

  const parsed = topupSchema.safeParse({
    amount_won: Number(formData.get("amount_won")),
    depositor: (formData.get("depositor") as string) ?? "",
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "입력을 확인해주세요." };
  }
  const coins = wonToCoins(parsed.data.amount_won);

  // 쓰기는 service_role 서버 경로(RLS 쓰기 정책 0)
  const { error } = await getSupabase().from("coin_topup_requests").insert({
    user_id: user.id,
    amount_won: parsed.data.amount_won,
    coins,
    depositor: parsed.data.depositor,
  });
  if (error) {
    console.error("[topup] insert 실패:", error.message);
    return { error: "신청 저장에 실패했어요. 잠시 후 다시 시도해주세요." };
  }

  await sendTelegram(
    `💰 코인 충전 신청\n${user.email}\n입금자: ${parsed.data.depositor}\n₩${parsed.data.amount_won.toLocaleString()} → ${coins}코인`,
  );
  revalidatePath("/dashboard");
  return { ok: true };
}

export type RevisionState = { ok?: boolean; error?: string };

// 무료 재요청(원본당 1회) — create_revision DB 함수가 규칙(부모 done·자식 없음) 강제.
export async function requestRevision(
  parentId: string,
  note: string,
): Promise<RevisionState> {
  const supa = await createSupabaseServer();
  const {
    data: { user },
  } = await supa.auth.getUser();
  if (!user) return { error: "로그인이 필요합니다." };
  const n = note.trim();
  if (n.length < 5) return { error: "재요청 사항을 5자 이상 적어주세요." };

  const { error } = await getSupabase().rpc("create_revision", {
    p_user_id: user.id,
    p_parent: parentId,
    p_revision_note: n.slice(0, 2000),
  });
  if (error) {
    const map: Record<string, string> = {
      revision_used: "이미 무료 재요청을 사용했어요. 추가 수정은 문의로 부탁드려요.",
      already_revision: "재요청본은 다시 재요청할 수 없어요.",
      parent_not_done: "완료된 실행만 재요청할 수 있어요.",
      not_owner: "본인 실행만 재요청할 수 있어요.",
    };
    const key = Object.keys(map).find((k) => error.message.includes(k));
    return { error: key ? map[key] : "재요청에 실패했어요." };
  }
  revalidatePath("/dashboard");
  return { ok: true };
}

// 결과 PDF 서명 URL — 본인 done run만(서버에서 user_id 대조).
export async function getResultUrl(
  runId: string,
): Promise<{ url?: string; error?: string }> {
  const supa = await createSupabaseServer();
  const {
    data: { user },
  } = await supa.auth.getUser();
  if (!user) return { error: "auth" };
  const sb = getSupabase();
  const { data: run } = await sb
    .from("agent_runs")
    .select("user_id, status, result_path")
    .eq("id", runId)
    .single();
  if (!run || run.user_id !== user.id) return { error: "not_found" };
  if (run.status !== "done" || !run.result_path) return { error: "not_ready" };
  const { data, error } = await sb.storage
    .from("run-results")
    .createSignedUrl(run.result_path, 3600);
  if (error || !data) return { error: "sign_failed" };
  return { url: data.signedUrl };
}
