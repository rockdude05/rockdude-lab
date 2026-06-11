import { NextRequest, NextResponse } from "next/server";
import { parseInquiry } from "@/lib/inquiry-schema";
import { createRateLimiter } from "@/lib/rate-limit";
import { getSupabase } from "@/lib/supabase";
import { sendTelegram } from "@/lib/telegram";

const limiter = createRateLimiter({ limit: 5, windowMs: 10 * 60_000 });

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] ?? "unknown";
  if (!limiter.check(ip)) return NextResponse.json({ ok: false }, { status: 429 });
  const parsed = parseInquiry(await req.json().catch(() => null));
  if (!parsed.ok) {
    // 📚 학습: honeypot은 200으로 조용히 무시 — 봇에게 신호를 주지 않음
    return parsed.reason === "honeypot"
      ? NextResponse.json({ ok: true })
      : NextResponse.json({ ok: false }, { status: 400 });
  }
  try {
    const { error } = await getSupabase().from("inquiries").insert(parsed.data);
    if (error) return NextResponse.json({ ok: false }, { status: 500 });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
  await sendTelegram(`💌 새 문의 [${parsed.data.type}] ${parsed.data.name}\n${parsed.data.body.slice(0, 300)}`);
  return NextResponse.json({ ok: true });
}
