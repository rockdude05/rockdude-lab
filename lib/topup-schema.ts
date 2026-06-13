import { z } from "zod";

// 충전 신청 — 금액(₩, 10원 단위로 정수 코인 보장)·입금자명.
export const topupSchema = z.object({
  amount_won: z
    .number()
    .int()
    .min(1000, "최소 ₩1,000")
    .max(1_000_000, "최대 ₩1,000,000")
    .refine((v) => v % 10 === 0, "10원 단위로 입력해주세요"),
  depositor: z.string().trim().min(1, "입금자명 필수").max(40),
});

export type TopupInput = z.infer<typeof topupSchema>;
