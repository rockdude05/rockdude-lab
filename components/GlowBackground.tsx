// 📚 학습: 서버 컴포넌트는 상태·이벤트 없이 HTML만 반환 → 번들 크기 0, "use client" 불필요.
// 이 컴포넌트는 순수 CSS 애니메이션만 쓰므로 서버에서 렌더링해도 완전히 작동한다.

export default function GlowBackground() {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        zIndex: -1,
        overflow: "hidden",
      }}
      aria-hidden="true"
    >
      {/* accent-blue glow */}
      <div
        style={{
          position: "absolute",
          top: "15%",
          left: "10%",
          width: "45vw",
          height: "45vw",
          borderRadius: "50%",
          background: "radial-gradient(circle, var(--accent-blue) 0%, transparent 70%)",
          opacity: "var(--glow-strength)",
          filter: "blur(80px)",
          animation: "glow-drift-1 70s ease-in-out infinite",
        }}
      />
      {/* accent-purple glow */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          right: "5%",
          width: "50vw",
          height: "50vw",
          borderRadius: "50%",
          background: "radial-gradient(circle, var(--accent-purple) 0%, transparent 70%)",
          opacity: "var(--glow-strength)",
          filter: "blur(90px)",
          animation: "glow-drift-2 90s ease-in-out infinite",
        }}
      />
      {/* accent-green glow */}
      <div
        style={{
          position: "absolute",
          bottom: "10%",
          left: "35%",
          width: "40vw",
          height: "40vw",
          borderRadius: "50%",
          background: "radial-gradient(circle, var(--accent-green) 0%, transparent 70%)",
          opacity: "var(--glow-strength)",
          filter: "blur(80px)",
          animation: "glow-drift-3 80s ease-in-out infinite",
        }}
      />
    </div>
  );
}
