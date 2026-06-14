// 정적 폴백 — coin-static.png 생성 전엔 골드 글로우 디스크. (로딩 중·reduced-motion·WebGL off용)
export default function CoinFallback() {
  return (
    <div
      aria-hidden
      style={{ width: "100%", height: "100%", display: "grid", placeItems: "center" }}
    >
      <div
        style={{
          width: 220,
          height: 220,
          borderRadius: "50%",
          background:
            "radial-gradient(circle at 38% 32%, #ffe2a6, #f0a830 46%, #946012 78%, #34230a)",
          boxShadow: "0 0 80px rgba(240,168,48,0.45), inset 0 2px 0 rgba(255,255,255,0.4)",
        }}
      />
    </div>
  );
}
