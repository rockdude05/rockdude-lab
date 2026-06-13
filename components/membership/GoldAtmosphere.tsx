// 📚 골드 회원 존 전용 분위기 — 서버 컴포넌트(순수 CSS, JS 번들 0).
// 전역 바이올렛 GlowBackground(z-index:-1) 위에 렌더돼 덮음(불투명 warm 베이스).
// 메인처럼 떠다니며 호흡하는 글로우 + 코인 테마 길로셰 무늬. 색은 골드 패밀리(바이올렛 아님).

type Blob = {
  color: string;
  top?: string;
  left?: string;
  right?: string;
  size: string;
  blur: string;
  opacity: number;
  animation: string;
};

const BLOBS: Blob[] = [
  // 골드 — 좌상단 메인
  {
    color: "#f5b14c",
    top: "6%",
    left: "8%",
    size: "46vw",
    blur: "85px",
    opacity: 0.4,
    animation: "glow-drift-1 74s ease-in-out infinite",
  },
  // 앰버(샴페인) — 우중단
  {
    color: "#e8c77a",
    top: "44%",
    right: "2%",
    size: "52vw",
    blur: "95px",
    opacity: 0.32,
    animation: "glow-drift-2 88s ease-in-out infinite",
  },
  // 코퍼/딥앰버 — 중앙 하단(색 범위·깊이)
  {
    color: "#d98a3c",
    top: "56%",
    left: "26%",
    size: "44vw",
    blur: "90px",
    opacity: 0.26,
    animation: "glow-drift-4 80s ease-in-out infinite",
  },
];

export default function GoldAtmosphere() {
  return (
    <div className="gold-atmosphere" aria-hidden="true">
      {BLOBS.map((b, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            top: b.top,
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
