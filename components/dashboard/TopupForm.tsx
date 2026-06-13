"use client";

import { useActionState } from "react";
import { requestTopup, type TopupState } from "@/app/dashboard/actions";
import { COIN_WON } from "@/lib/coins";

const initial: TopupState = {};

export default function TopupForm() {
  const [state, formAction, pending] = useActionState(requestTopup, initial);

  if (state.ok) {
    return (
      <p className="text-sm break-keep" style={{ color: "var(--text-dim)" }}>
        ✅ 충전 신청이 접수됐어요. 송금 확인 후 코인이 지급됩니다.
      </p>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-3">
      {/* 🛑 데모: 송금 정보(계좌)는 추후. 자리만 안내 */}
      <p className="text-xs break-keep" style={{ color: "var(--text-dim)" }}>
        아래 금액을 송금 후 입금자명과 함께 신청하면, 확인 후 코인을 지급합니다.
        (1코인 = ₩{COIN_WON} · 송금 계좌는 곧 안내)
      </p>
      <input
        type="number"
        name="amount_won"
        required
        min={1000}
        max={1000000}
        step={10}
        placeholder="충전 금액(₩) — 예: 10000"
        className="inquiry-input rounded-lg px-4 py-3 text-sm"
      />
      <input
        type="text"
        name="depositor"
        required
        maxLength={40}
        placeholder="입금자명"
        className="inquiry-input rounded-lg px-4 py-3 text-sm"
      />
      {state.error && (
        <p className="text-xs" style={{ color: "var(--accent-orange)" }}>
          {state.error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="cta-gold rounded-full px-6 py-3 font-semibold disabled:opacity-50 cursor-pointer"
      >
        {pending ? "신청 중…" : "충전 신청"}
      </button>
    </form>
  );
}
