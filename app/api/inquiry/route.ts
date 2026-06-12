import { NextRequest, NextResponse } from "next/server";
import { parseInquiry } from "@/lib/inquiry-schema";
import { createRateLimiter } from "@/lib/rate-limit";
import { getSupabase } from "@/lib/supabase";
import { sendTelegram } from "@/lib/telegram";
import { generateAccessCode } from "@/lib/access-code";

const limiter = createRateLimiter({ limit: 5, windowMs: 10 * 60_000 });

const ALLOWED_MIME = new Set([
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/heic",
  "image/webp",
]);
const MAX_FILES = 3;
const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10MB

function safeName(original: string, i: number): string {
  // Remove non-ASCII (e.g. Korean), keep alphanumeric, dots, hyphens; replace rest with _
  const ascii = original.replace(/[^\x00-\x7F]/g, "");
  const cleaned = ascii.replace(/[^a-zA-Z0-9.\-]/g, "_");
  return cleaned.length > 0 ? cleaned : `file${i}`;
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] ?? "unknown";
  if (!limiter.check(ip)) return NextResponse.json({ ok: false }, { status: 429 });

  const contentType = req.headers.get("content-type") ?? "";
  const isMultipart = contentType.includes("multipart/form-data");

  let rawFields: unknown;
  let fileEntries: File[] = [];

  if (isMultipart) {
    let fd: FormData;
    try {
      fd = await req.formData();
    } catch {
      return NextResponse.json({ ok: false }, { status: 400 });
    }
    rawFields = {
      type: fd.get("type"),
      name: fd.get("name"),
      contact: fd.get("contact") ?? "",
      body: fd.get("body"),
      website: fd.get("website") ?? "",
    };
    const allFiles = fd.getAll("files").filter((v): v is File => v instanceof File && v.size > 0);
    fileEntries = allFiles;
  } else {
    rawFields = await req.json().catch(() => null);
  }

  const parsed = parseInquiry(rawFields);
  if (!parsed.ok) {
    // honeypot: silent 200, ignore files
    return parsed.reason === "honeypot"
      ? NextResponse.json({ ok: true })
      : NextResponse.json({ ok: false }, { status: 400 });
  }

  // File validation (server-authoritative)
  if (fileEntries.length > MAX_FILES) {
    return NextResponse.json({ ok: false, error: "file" }, { status: 400 });
  }
  for (const f of fileEntries) {
    if (f.size > MAX_FILE_BYTES || !ALLOWED_MIME.has(f.type)) {
      return NextResponse.json({ ok: false, error: "file" }, { status: 400 });
    }
  }

  let access_code = generateAccessCode();
  let insertError: { code?: string; message?: string } | null = null;
  let inquiryId: string | null = null;

  try {
    const result = await getSupabase()
      .from("inquiries")
      .insert({ ...parsed.data, access_code })
      .select("id")
      .single();
    insertError = result.error;

    if (
      insertError &&
      (insertError.code === "23505" ||
        insertError.message?.toLowerCase().includes("duplicate"))
    ) {
      access_code = generateAccessCode();
      const retry = await getSupabase()
        .from("inquiries")
        .insert({ ...parsed.data, access_code })
        .select("id")
        .single();
      insertError = retry.error;
      if (!insertError) inquiryId = retry.data?.id ?? null;
    } else if (!insertError) {
      inquiryId = result.data?.id ?? null;
    }

    if (insertError) return NextResponse.json({ ok: false }, { status: 500 });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  // Upload files (best-effort)
  if (fileEntries.length > 0 && inquiryId) {
    const uploaded: { path: string; name: string; size: number }[] = [];
    for (let i = 0; i < fileEntries.length; i++) {
      const file = fileEntries[i];
      const sname = safeName(file.name, i);
      const path = `${inquiryId}/${i}_${sname}`;
      try {
        const buf = await file.arrayBuffer();
        const { error: upErr } = await getSupabase()
          .storage.from("inquiry-files")
          .upload(path, buf, { contentType: file.type });
        if (upErr) {
          console.error("[inquiry] file upload failed:", path, upErr.message);
        } else {
          uploaded.push({ path, name: file.name, size: file.size });
        }
      } catch (e) {
        console.error("[inquiry] file upload exception:", path, e);
      }
    }
    if (uploaded.length > 0) {
      const { error: updErr } = await getSupabase()
        .from("inquiries")
        .update({ files: uploaded })
        .eq("id", inquiryId);
      if (updErr) {
        console.error("[inquiry] files column update failed:", updErr.message);
      }
    }
  }

  const attachNote = fileEntries.length > 0 ? ` 📎${fileEntries.length}개` : "";
  await sendTelegram(
    `💌 새 문의 [${parsed.data.type}] ${parsed.data.name}${attachNote}\n${parsed.data.body.slice(0, 300)}`
  );
  return NextResponse.json({ ok: true, code: access_code });
}
