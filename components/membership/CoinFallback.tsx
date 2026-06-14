// 정적 폴백 — 3D 코인과 일관된 골드 디스크 + 'r.' 마크. (로딩 중·reduced-motion·WebGL off용)
// 순수 CSS라 네트워크 요청 0·즉시 표시·레이아웃 시프트 없음.
export default function CoinFallback() {
  return (
    <div
      aria-hidden
      style={{ width: "100%", height: "100%", display: "grid", placeItems: "center" }}
    >
      <div
        style={{
          position: "relative",
          width: 220,
          height: 220,
          borderRadius: "50%",
          background:
            "radial-gradient(circle at 38% 32%, #ffe2a6, #f0a830 46%, #946012 78%, #34230a)",
          boxShadow: "0 0 80px rgba(240,168,48,0.45), inset 0 2px 0 rgba(255,255,255,0.4)",
          display: "grid",
          placeItems: "center",
        }}
      >
        {/* 'r' — 크림골드 */}
        <span
          style={{
            fontFamily: "Menlo, ui-monospace, monospace",
            fontWeight: 700,
            fontSize: 104,
            lineHeight: 1,
            color: "#fff4d6",
            transform: "translate(-10px, -6px)",
          }}
        >
          r
        </span>
        {/* '.' — 바이올렛 마침표 */}
        <span
          style={{
            position: "absolute",
            left: "58%",
            top: "60%",
            width: 22,
            height: 22,
            borderRadius: "50%",
            background: "#7b6bff",
            boxShadow: "0 0 14px rgba(108,99,255,0.7)",
          }}
        />
      </div>
    </div>
  );
}
