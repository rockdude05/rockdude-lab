"use client";
import { Component, useEffect, useRef, useState, type ReactNode } from "react";
import dynamic from "next/dynamic";
import CoinFallback from "./CoinFallback";

// 동적 청크 격리 — /membership 진입 + 뷰포트 도달 전엔 R3F 로드 안 됨(메인·초기 번들 무영향).
const CoinScene = dynamic(() => import("./CoinScene"), {
  ssr: false,
  loading: () => <CoinFallback />,
});

// WebGL 지원 사전 체크 (truly-no-WebGL 환경 차단)
function hasWebGL(): boolean {
  try {
    const c = document.createElement("canvas");
    return !!(
      window.WebGLRenderingContext &&
      (c.getContext("webgl2") || c.getContext("webgl"))
    );
  } catch {
    return false;
  }
}

// 런타임 WebGL 에러(컨텍스트 생성 실패 등) → 폴백. 헤드리스/저사양 GPU 대응.
class CoinErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? <CoinFallback /> : this.props.children;
  }
}

export default function MembershipHero3D() {
  const box = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [webgl, setWebgl] = useState(true);
  // 확정 톤: 딥 새터레이티드 골드. ?gold=헥스로 라이브 전환 가능(QA).
  const [gold, setGold] = useState("#f0a830");
  const [still, setStill] = useState(false); // ?still=1 → 회전 정지(정면 캡처용)
  const [poseYaw, setPoseYaw] = useState<number | null>(null); // ?yaw=deg → 고정 3/4 포즈(QA)
  const [rimStyle, setRimStyle] = useState("knurl"); // ?rim=knurl|rope|segment|bead|reed (QA/확정)

  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setReduced(prefersReduced);
    setMobile(window.innerWidth < 768);
    setWebgl(hasWebGL());
    const q = sp.get("gold");
    if (q && /^[0-9a-fA-F]{6}$/.test(q)) setGold(`#${q}`);
    setStill(sp.get("still") === "1");
    const y = sp.get("yaw");
    if (y != null && y !== "" && !Number.isNaN(Number(y))) setPoseYaw((Number(y) * Math.PI) / 180);
    const rim = sp.get("rim");
    if (rim && ["knurl", "rope", "segment", "bead", "reed"].includes(rim)) setRimStyle(rim);
    const el = box.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => e.isIntersecting && setInView(true),
      { rootMargin: "120px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // reduced-motion·WebGL 미지원 → 폴백. 모바일: 자동회전만(패럴랙스·스크롤 끔).
  const show3D = webgl && inView && !reduced;
  return (
    <div ref={box} style={{ width: "100%", height: 320, position: "relative" }}>
      {show3D ? (
        <CoinErrorBoundary>
          <CoinScene
            reduced={still || poseYaw != null}
            interactive={!mobile && !still && poseYaw == null}
            gold={gold}
            poseYaw={poseYaw}
            rimStyle={rimStyle}
          />
        </CoinErrorBoundary>
      ) : (
        <CoinFallback />
      )}
    </div>
  );
}
