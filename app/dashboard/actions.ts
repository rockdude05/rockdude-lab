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
