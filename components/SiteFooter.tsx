// 📚 학습: 푸터도 서버 컴포넌트 — 정적 콘텐츠는 클라이언트 JS 없이 HTML로만.

export default function SiteFooter() {
  return (
    <footer
      className="w-full mt-12"
      style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
    >
      <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="font-mono text-sm" style={{ color: "var(--text-dim)" }}>
          rockdude<span style={{ color: "var(--accent-purple)" }}>.lab</span>
          <span className="mx-2">—</span>
          rockdude0512가 만드는 에이전트 작업실
        </p>
        <div className="flex items-center gap-5">
          <a
            href="mailto:genesu.kim@gmail.com"
            className="scroll-hint-link text-sm"
          >
            메일
          </a>
          <a
            href="https://github.com/rockdude05"
            target="_blank"
            rel="noopener noreferrer"
            className="scroll-hint-link text-sm"
          >
            GitHub
          </a>
        </div>
      </div>
    </footer>
  );
}
