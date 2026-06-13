// 📚 학습: 서버 컴포넌트는 상태·이벤트 없이 HTML만 반환 → 번들 크기 0, "use client" 불필요.
// 이 컴포넌트는 순수 CSS 애니메이션만 쓰므로 서버에서 렌더링해도 완전히 작동한다.
//
// 2026-06-13 Aurora 강화: 단순 3블롭 → 바이올렛 4겹 오로라(보라·블루·인디고 + 약한 그린).
// drift 키프레임에 scale 호흡이 들어가 "살아있는" 오로라로 작동(globals.css glow-drift-1~4).

// 오로라 블롭 한 겹 정의 — color/위치/크기/blur/opacity/animation을 데이터로 분리
type Blob = {
  color: string;
  top?: string;
  bottom?: string;
  left?: string;
  right?: string;
  size: string;
  blur: string;
  opacity: number;
  animation: string;
};

const BLOBS: Blob[] = [
  // 보라 — 좌상단 메인
  {
    color: "var(--accent-purple)",
    top: "8%",
    left: "6%",
    size: "46vw",
    blur: "85px",
    opacity: 0.42,
    animation: "glow-drift-1 74s ease-in-out infinite",
  },
  // 블루 — 우중단
  {
    color: "var(--accent-blue)",
    top: "44%",
    right: "2%",
    size: "52vw",
    blur: "95px",
    opacity: 0.40,
    animation: "glow-drift-2 88s ease-in-out infinite",
  },
  // 인디고/바이올렛 틴트 — 중앙 하단 (색 범위 확장, 바이올렛 밴드 내)
  {
    color: "#8b5cf6",
    top: "58%",
    left: "28%",
    size: "44vw",
    blur: "90px",
    opacity: 0.34,
    animation: "glow-drift-4 80s ease-in-out infinite",
  },
  // 그린 — 하단, 약하게 (색의 생기만 살짝)
  {
    color: "var(--accent-green)",
    bottom: "4%",
    left: "44%",
    size: "36vw",
    blur: "100px",
    opacity: 0.16,
    animation: "glow-drift-3 92s ease-in-out infinite",
  },
];

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
      {BLOBS.map((b, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            top: b.top,
            bottom: b.bottom,
            left: b.left,
            right: b.right,
            width: b.size,
            height: b.size,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${b.color} 0%, transparent 70%)`,
            opacity: b.opacity,
            filter: `blur(${b.blur})`,
            animation: b.animation,
            willChange: "transform",
          }}
        />
      ))}
    </div>
  );
}
