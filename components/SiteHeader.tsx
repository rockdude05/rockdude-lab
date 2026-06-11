// 📚 학습: 서버 컴포넌트 헤더 — 상태가 없으므로 "use client" 불필요, JS 번들 0.
// backdrop-blur + 반투명 배경으로 스크롤 콘텐츠 위에 떠 있는 글래스 헤더.

const NAV = [
  { href: "#agents", label: "에이전트" },
  { href: "#journey", label: "여정" },
  { href: "#inquiry", label: "문의" },
] as const;

export default function SiteHeader() {
  return (
    <header
      className="fixed top-0 inset-x-0 z-50 backdrop-blur-md"
      style={{
        background: "color-mix(in srgb, var(--bg-base) 72%, transparent)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
        <a
          href="#top"
          className="font-mono text-sm font-semibold tracking-tight"
          style={{ color: "var(--text-main)" }}
        >
          rockdude<span style={{ color: "var(--accent-purple)" }}>.lab</span>
        </a>
        <nav className="flex items-center gap-5">
          {NAV.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="scroll-hint-link text-sm"
            >
              {item.label}
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
}
