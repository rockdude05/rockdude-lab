import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase-server";
import { getSupabase } from "@/lib/supabase";
import { createRateLimiter } from "@/lib/rate-limit";
import { parseRunFields, validateRunFiles } from "@/lib/run-schema";
import { RUN_INPUTS } from "@/lib/run-inputs";
import { runCost, ABS_MAX_PAGES, type CoinAgent } from "@/lib/coins";
import { countWeightedPages } from "@/lib/page-count";

// 세션(쿠키) 의존 → 정적 prerender 불가
export const dynamic = "force-dynamic";
const limiter = createRateLimiter({ limit: 5, windowMs: 10 * 60_000 });

function safeName(original: string, i: number): string {
  const ascii = original.replace(/[^\x00-\x7F]/g, "").replace(/[^a-zA-Z0-9.\-]/g, "_");
  return ascii.length > 0 ? ascii : `file${i}`;
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] ?? "unknown";
  if (!limiter.check(ip)) return NextResponse.json({ ok: false }, { status: 429 });

  // 1. 인증
  const supa = await createSupabaseServer();
  const {
    data: { user },
  } = await supa.auth.getUser();
  if (!user) return NextResponse.json({ ok: false, error: "auth" }, { status: 401 });

  // 2. multipart 파싱
  let fd: FormData;
  try {
    fd = await req.formData();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  const fields: Record<string, unknown> = {};
  for (const [k, v] of fd.entries()) if (typeof v === "string") fields[k] = v;

  const parsed = parseRunFields(fields);
  if (!parsed.ok) {
    return parsed.reason === "honeypot"
      ? NextResponse.json({ ok: true }) // silent
      : NextResponse.json({ ok: false, error: parsed.message ?? "invalid" }, { status: 400 });
  }
  const agent = parsed.data.agent as CoinAgent;

  // 3. 슬롯별 파일 수집 (필드명 = `file:{slotKey}`)
  const filesByRole: Record<string, File[]> = {};
  for (const slot of RUN_INPUTS[agent].fileSlots) {
    const got = fd
      .getAll(`file:${slot.key}`)
      .filter((v): v is File => v instanceof File && v.size > 0);
    if (got.length) filesByRole[slot.key] = got;
  }
  const fileMeta: Record<string, { size: number; type: string }[]> = Object.fromEntries(
    Object.entries(filesByRole).map(([k, arr]) => [
      k,
      arr.map((f) => ({ size: f.size, type: f.type })),
    ]),
  );
  const fileCheck = validateRunFiles(agent, fileMeta);
  if (!fileCheck.ok) {
    return NextResponse.json({ ok: false, error: fileCheck.message }, { status: 400 });
  }

  // 4. 가중 페이지 카운트(서버 권위)
  const allFiles = Object.values(filesByRole).flat();
  const withBytes = await Promise.all(
    allFiles.map(async (f) => ({ type: f.type, bytes: new Uint8Array(await f.arrayBuffer()) })),
  );
  const pageCount = await countWeightedPages(withBytes);
  if (pageCount > ABS_MAX_PAGES) {
    return NextResponse.json({ ok: false, error: "too_large", max: ABS_MAX_PAGES }, { status: 400 });
  }
  const cost = runCost(agent, pageCount);

  // 5. 원자 차감 + run 생성 (create_run: insert + apply_coin_delta 한 트랜잭션)
  const sb = getSupabase();
  const { data: runId, error: rpcErr } = await sb.rpc("create_run", {
    p_user_id: user.id,
    p_agent: agent,
    p_cost: cost,
    p_page_count: pageCount,
    p_inputs: parsed.data.inputs,
    p_note: parsed.data.note,
  });
  if (rpcErr || !runId) {
    const insufficient =
      rpcErr?.message?.includes("insufficient") || rpcErr?.message?.includes("잔액");
    return NextResponse.json(
      { ok: false, error: insufficient ? "insufficient_coins" : "server", need: cost },
      { status: insufficient ? 400 : 500 },
    );
  }

  // 6. 파일 업로드 (run-files/{runId}/{role}/{i}_name) → files 컬럼
  const uploaded: { path: string; name: string; size: number; role: string }[] = [];
  for (const [role, arr] of Object.entries(filesByRole)) {
    for (let i = 0; i < arr.length; i++) {
      const f = arr[i];
      const path = `${runId}/${role}/${i}_${safeName(f.name, i)}`;
      try {
        const buf = await f.arrayBuffer();
        const { error } = await sb.storage.from("run-files").upload(path, buf, {
          contentType: f.type,
        });
        if (!error) uploaded.push({ path, name: f.name, size: f.size, role });
        else console.error("[run] upload 실패", path, error.message);
      } catch (e) {
        console.error("[run] upload 예외", path, e);
      }
    }
  }
  // 필수 슬롯 파일이 전부 업로드 실패 → 환불 + failed
  const requiredSlots = RUN_INPUTS[agent].fileSlots.filter((s) => s.required).map((s) => s.key);
  const uploadedRoles = new Set(uploaded.map((u) => u.role));
  const missingRequired = requiredSlots.some((k) => !uploadedRoles.has(k));
  if (missingRequired) {
    await sb.rpc("apply_coin_delta", {
      p_user_id: user.id,
      p_delta: cost,
      p_reason: "refund",
      p_ref_id: runId,
    });
    await sb.from("agent_runs").update({ status: "failed" }).eq("id", runId);
    return NextResponse.json({ ok: false, error: "upload_failed" }, { status: 500 });
  }
  await sb.from("agent_runs").update({ files: uploaded }).eq("id", runId);

  return NextResponse.json({ ok: true, run_id: runId, charged: cost });
}
