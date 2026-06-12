"use client";

import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SectionReveal, { revealItem } from "@/components/SectionReveal";
import type { INQUIRY_TYPES } from "@/lib/inquiry-schema";

type InquiryType = (typeof INQUIRY_TYPES)[number];

const CHIPS: { value: InquiryType; label: string }[] = [
  { value: "try", label: "써보고 싶어요" },
  { value: "idea", label: "아이디어" },
  { value: "request", label: "새 에이전트 요청" },
  { value: "bug", label: "버그·질문" },
];

type Status = "idle" | "sending" | "success" | "error" | "ratelimit";

const MAX_FILES = 3;
const MAX_FILE_BYTES = 10 * 1024 * 1024;
const ALLOWED_MIME = ["application/pdf", "image/png", "image/jpeg", "image/heic", "image/webp"];

interface AttachedFile {
  file: File;
  id: number;
}

let fileIdCounter = 0;

function formatMB(bytes: number): string {
  return (bytes / (1024 * 1024)).toFixed(1) + "MB";
}

export default function InquiryForm() {
  const [type, setType] = useState<InquiryType>("try");
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [body, setBody] = useState("");
  const [website, setWebsite] = useState(""); // honeypot
  const [status, setStatus] = useState<Status>("idle");
  const [bodyHint, setBodyHint] = useState(false);
  const [accessCode, setAccessCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
  const [fileError, setFileError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const incoming = Array.from(e.target.files ?? []);
    if (fileInputRef.current) fileInputRef.current.value = "";

    const newFiles = [...attachedFiles];
    let errorMsg: string | null = null;

    for (const f of incoming) {
      if (newFiles.length >= MAX_FILES) {
        errorMsg = `최대 ${MAX_FILES}개까지 첨부할 수 있어요.`;
        break;
      }
      if (f.size > MAX_FILE_BYTES) {
        errorMsg = `${f.name}: 파일 크기가 10MB를 초과해요.`;
        continue;
      }
      if (!ALLOWED_MIME.includes(f.type)) {
        errorMsg = `${f.name}: 지원하지 않는 파일 형식이에요.`;
        continue;
      }
      newFiles.push({ file: f, id: ++fileIdCounter });
    }

    setAttachedFiles(newFiles);
    setFileError(errorMsg);
  }

  function removeFile(id: number) {
    setAttachedFiles((prev) => prev.filter((af) => af.id !== id));
    setFileError(null);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (body.length < 10) {
      setBodyHint(true);
      return;
    }
    setBodyHint(false);
    setStatus("sending");

    try {
      let res: Response;

      if (attachedFiles.length > 0) {
        const fd = new FormData();
        fd.append("type", type);
        fd.append("name", name);
        fd.append("contact", contact);
        fd.append("body", body);
        fd.append("website", website);
        for (const af of attachedFiles) {
          fd.append("files", af.file);
        }
        res = await fetch("/api/inquiry", { method: "POST", body: fd });
      } else {
        res = await fetch("/api/inquiry", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type, name, contact, body, website }),
        });
      }

      if (res.status === 429) {
        setStatus("ratelimit");
      } else if (res.ok) {
        const json = await res.json().catch(() => ({}));
        if (typeof json.code === "string" && json.code.length > 0) {
          setAccessCode(json.code);
        }
        setStatus("success");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  const inputStyle: React.CSSProperties = {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    color: "var(--text-main)",
  };

  return (
    <section id="inquiry" className="max-w-2xl mx-auto px-6 py-24">
      <SectionReveal className="flex flex-col gap-6">
        {/* 헤딩 */}
        <motion.div variants={revealItem} className="flex flex-col gap-3">
          <p
            className="font-mono text-sm tracking-widest"
            style={{ color: "var(--accent-blue)" }}
          >
            ~/inquiry
          </p>
          <h2
            className="text-3xl md:text-4xl font-bold"
            style={{ color: "var(--text-main)" }}
          >
            문의 · 요청
          </h2>
          <p className="text-base" style={{ color: "var(--text-dim)" }}>
            써보고 싶거나, 만들어줬으면 하는 에이전트가 있다면 — 무엇이든 남겨주세요.
          </p>
        </motion.div>

        {/* 폼 카드 */}
        <motion.div
          variants={revealItem}
          className="rounded-2xl p-6 md:p-8 flex flex-col gap-5 relative overflow-hidden"
          style={{
            background: "var(--bg-panel)",
            border: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          <AnimatePresence mode="wait">
            {status === "success" ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="flex flex-col gap-4 py-8 items-center text-center"
              >
                <p
                  className="text-xl font-semibold"
                  style={{ color: "var(--text-main)" }}
                >
                  접수 완료 — 빠르게 연락드릴게요 ✉️
                </p>
                <p className="text-sm" style={{ color: "var(--text-dim)" }}>
                  보통 하루 안에 답합니다.
                </p>
                {accessCode && (
                  <div className="flex flex-col gap-3 items-center w-full mt-2">
                    <p className="text-sm" style={{ color: "var(--text-dim)" }}>
                      답변 조회코드
                    </p>
                    <div className="flex items-center gap-3">
                      <div
                        className="font-mono text-2xl rounded-lg px-5 py-3"
                        style={{
                          letterSpacing: "0.3em",
                          color: "var(--text-main)",
                          background: "rgba(255,255,255,0.05)",
                        }}
                      >
                        {accessCode}
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(accessCode).then(() => {
                            setCopied(true);
                            setTimeout(() => setCopied(false), 1500);
                          });
                        }}
                        className="text-sm rounded-lg px-3 py-2 transition-colors"
                        style={{
                          background: "rgba(255,255,255,0.06)",
                          color: "var(--text-dim)",
                          border: "1px solid rgba(255,255,255,0.1)",
                        }}
                      >
                        {copied ? "복사됨 ✓" : "복사"}
                      </button>
                    </div>
                    <p className="text-sm" style={{ color: "var(--text-dim)" }}>
                      이 코드로 답변을 확인할 수 있어요 — 잃어버리면 다시 문의해주세요.
                    </p>
                    <a
                      href={`/check?code=${accessCode}`}
                      className="cta-glass rounded-full px-5 py-2.5 text-sm"
                    >
                      답변 확인하러 가기 →
                    </a>
                  </div>
                )}
                {/* 추가 문의 — 성공 화면이 막다른 길이 되지 않게 폼으로 복귀 */}
                <button
                  type="button"
                  onClick={() => {
                    setBody("");
                    setAccessCode(null);
                    setCopied(false);
                    setAttachedFiles([]);
                    setFileError(null);
                    setStatus("idle");
                  }}
                  className="scroll-hint-link text-sm mt-2 cursor-pointer"
                >
                  다른 문의 보내기 ↺
                </button>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                onSubmit={handleSubmit}
                className="flex flex-col gap-5"
                exit={{ opacity: 0 }}
              >
                {/* 📚 학습: honeypot — 사람 눈엔 안 보이는 필드, 봇만 채움. 서버에서 감지하면 조용히 무시 */}
                <input
                  type="text"
                  name="website"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden="true"
                  className="absolute -left-[9999px] h-0 w-0 opacity-0"
                />

                {/* 유형 칩 그룹 */}
                <fieldset className="flex flex-col gap-2">
                  <legend
                    className="text-sm font-medium mb-2"
                    style={{ color: "var(--text-dim)" }}
                  >
                    유형
                  </legend>
                  <div className="flex flex-wrap gap-2" role="radiogroup">
                    {CHIPS.map((chip) => {
                      const isSelected = type === chip.value;
                      return (
                        <label key={chip.value} className="cursor-pointer">
                          <input
                            type="radio"
                            name="inquiry-type"
                            value={chip.value}
                            checked={isSelected}
                            onChange={() => setType(chip.value)}
                            className="sr-only"
                          />
                          <span
                            className="inline-block rounded-full px-4 py-1.5 text-sm border transition-all select-none"
                            style={
                              isSelected
                                ? {
                                    borderColor: "var(--accent-blue)",
                                    color: "var(--accent-blue)",
                                    background:
                                      "color-mix(in srgb, var(--accent-blue) 12%, transparent)",
                                  }
                                : {
                                    borderColor: "rgba(255,255,255,0.12)",
                                    color: "var(--text-dim)",
                                  }
                            }
                          >
                            {chip.label}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </fieldset>

                {/* 이름 */}
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="inq-name"
                    className="text-sm font-medium"
                    style={{ color: "var(--text-dim)" }}
                  >
                    이름
                  </label>
                  <input
                    id="inq-name"
                    type="text"
                    required
                    maxLength={40}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="이름 또는 별명"
                    className="rounded-lg px-4 py-3 text-sm outline-none transition-all"
                    style={inputStyle}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = "var(--accent-blue)";
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor =
                        "rgba(255,255,255,0.08)";
                    }}
                  />
                </div>

                {/* 연락처 (필수 — 결과·답변 전달처) */}
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="inq-contact"
                    className="text-sm font-medium"
                    style={{ color: "var(--text-dim)" }}
                  >
                    연락처
                  </label>
                  <input
                    id="inq-contact"
                    type="text"
                    required
                    maxLength={120}
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    placeholder="카톡 ID · 이메일 · 텔레그램 등 (답변 받으실 곳)"
                    className="rounded-lg px-4 py-3 text-sm outline-none transition-all"
                    style={inputStyle}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = "var(--accent-blue)";
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor =
                        "rgba(255,255,255,0.08)";
                    }}
                  />
                </div>

                {/* 내용 */}
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="inq-body"
                    className="text-sm font-medium"
                    style={{ color: "var(--text-dim)" }}
                  >
                    내용
                  </label>
                  <textarea
                    id="inq-body"
                    required
                    rows={5}
                    maxLength={4000}
                    value={body}
                    onChange={(e) => {
                      setBody(e.target.value);
                      if (bodyHint && e.target.value.length >= 10)
                        setBodyHint(false);
                    }}
                    placeholder="자유롭게 적어주세요 (10자 이상)"
                    className="rounded-lg px-4 py-3 text-sm outline-none transition-all resize-none"
                    style={inputStyle}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = "var(--accent-blue)";
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor =
                        "rgba(255,255,255,0.08)";
                    }}
                  />
                  {bodyHint && (
                    <p className="text-xs" style={{ color: "var(--accent-orange)" }}>
                      내용을 10자 이상 입력해주세요.
                    </p>
                  )}
                </div>

                {/* 파일 첨부 */}
                <div className="flex flex-col gap-2">
                  <label
                    className="text-sm font-medium"
                    style={{ color: "var(--text-dim)" }}
                  >
                    파일 첨부 (선택)
                  </label>
                  <small style={{ color: "var(--text-dim)" }}>
                    시험지 PDF나 사진 — 최대 3개, 개당 10MB
                  </small>
                  {/* Hidden file input */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="application/pdf,image/png,image/jpeg,image/heic,image/webp"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  {/* Styled trigger button */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="rounded-lg px-4 py-3 text-sm text-left transition-all self-start"
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      border: "1px dashed rgba(255,255,255,0.2)",
                      color: "var(--text-dim)",
                    }}
                  >
                    파일 선택
                  </button>
                  {/* File error */}
                  {fileError && (
                    <p className="text-xs" style={{ color: "var(--accent-orange)" }}>
                      {fileError}
                    </p>
                  )}
                  {/* Attached file list */}
                  {attachedFiles.length > 0 && (
                    <ul className="flex flex-col gap-1.5">
                      {attachedFiles.map((af) => (
                        <li
                          key={af.id}
                          className="flex items-center gap-2 text-sm"
                          style={{ color: "var(--text-dim)" }}
                        >
                          <span className="flex-1 truncate">{af.file.name}</span>
                          <span className="text-xs shrink-0">
                            {formatMB(af.file.size)}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeFile(af.id)}
                            className="shrink-0 text-xs rounded px-1.5 py-0.5 transition-colors"
                            style={{
                              background: "rgba(255,255,255,0.06)",
                              color: "var(--text-dim)",
                            }}
                            aria-label={`${af.file.name} 제거`}
                          >
                            ✕
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* 에러 메시지 — aria-live로 스크린리더에도 즉시 안내 */}
                <div aria-live="polite" role="status">
                  {status === "ratelimit" && (
                    <p className="text-sm" style={{ color: "var(--accent-orange)" }}>
                      요청이 너무 잦아요 — 10분 뒤에 다시 시도해주세요.
                    </p>
                  )}
                  {status === "error" && (
                    <p className="text-sm" style={{ color: "var(--accent-orange)" }}>
                      전송에 문제가 생겼어요. 잠시 후 다시 시도해주세요.
                    </p>
                  )}
                </div>

                {/* 제출 버튼 */}
                <button
                  type="submit"
                  disabled={status === "sending"}
                  className="cta-glass rounded-full px-6 py-3 font-semibold self-start disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                >
                  {status === "sending" ? "보내는 중…" : "보내기"}
                </button>
                <a
                  href="/check"
                  className="text-sm self-start"
                  style={{ color: "var(--text-dim)" }}
                >
                  이미 문의하셨나요? 답변 확인 →
                </a>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>
      </SectionReveal>
    </section>
  );
}
