"use client";

import { useState } from "react";
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

export default function InquiryForm() {
  const [type, setType] = useState<InquiryType>("try");
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [body, setBody] = useState("");
  const [website, setWebsite] = useState(""); // honeypot
  const [status, setStatus] = useState<Status>("idle");
  const [bodyHint, setBodyHint] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (body.length < 10) {
      setBodyHint(true);
      return;
    }
    setBodyHint(false);
    setStatus("sending");

    try {
      const res = await fetch("/api/inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, name, contact, body, website }),
      });
      if (res.status === 429) {
        setStatus("ratelimit");
      } else if (res.ok) {
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
            style={{ color: "var(--accent-orange)" }}
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
                className="flex flex-col gap-2 py-8 items-center text-center"
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
                                    borderColor: "var(--accent-orange)",
                                    color: "var(--accent-orange)",
                                    background:
                                      "color-mix(in srgb, var(--accent-orange) 12%, transparent)",
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
                      e.currentTarget.style.borderColor = "var(--accent-orange)";
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor =
                        "rgba(255,255,255,0.08)";
                    }}
                  />
                </div>

                {/* 연락처 (선택) */}
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="inq-contact"
                    className="text-sm font-medium"
                    style={{ color: "var(--text-dim)" }}
                  >
                    연락처 (선택)
                  </label>
                  <input
                    id="inq-contact"
                    type="text"
                    maxLength={120}
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    placeholder="카톡 ID · 이메일 · 텔레그램 등"
                    className="rounded-lg px-4 py-3 text-sm outline-none transition-all"
                    style={inputStyle}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = "var(--accent-orange)";
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
                      e.currentTarget.style.borderColor = "var(--accent-orange)";
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
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>
      </SectionReveal>
    </section>
  );
}
