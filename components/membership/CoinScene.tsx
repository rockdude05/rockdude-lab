"use client";
import { Canvas } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import { useEffect, useRef } from "react";
import Coin from "./Coin";
import CoinRig from "./CoinRig";

export default function CoinScene({
  reduced = false,
  interactive = true,
  gold = "#f0a830",
  roughness = 0.3,
  poseYaw = null,
}: {
  reduced?: boolean;
  interactive?: boolean;
  gold?: string;
  roughness?: number;
  poseYaw?: number | null;
}) {
  const scroll = useRef(0);
  useEffect(() => {
    if (reduced) return;
    const onScroll = () => {
      // 히어로 상단 기준 0~1 (뷰포트 0.9 분량)
      scroll.current = Math.min(1, Math.max(0, window.scrollY / (window.innerHeight * 0.9)));
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [reduced]);

  return (
    <Canvas
      camera={{ position: [0, 0, 4], fov: 38 }}
      dpr={interactive ? [1, 2] : 1}
      gl={{ antialias: true, powerPreference: "high-performance", alpha: true }}
      style={{ width: "100%", height: "100%" }}
    >
      <ambientLight intensity={0.35} />
      <directionalLight position={[2, 3, 4]} intensity={1.6} color="#fff3da" />
      <directionalLight position={[-3, -1, 2]} intensity={0.5} color="#6c63ff" />
      {/* 절차적 스튜디오 환경 — 외부 HDR CDN 의존 제거(오프라인·차단에도 금속 반사 보장). */}
      <Environment resolution={256}>
        <Lightformer
          intensity={3}
          position={[0, 2, 5]}
          scale={[8, 6, 1]}
          color="#fff3da"
        />
        <Lightformer
          intensity={1.4}
          position={[-4, 1, 3]}
          scale={[4, 5, 1]}
          color="#ffd58a"
        />
        <Lightformer
          intensity={0.8}
          position={[3, -2, 2]}
          scale={[5, 4, 1]}
          color="#ffe9c2"
        />
        <Lightformer
          intensity={0.5}
          position={[0, -3, -4]}
          scale={[8, 8, 1]}
          color="#6c63ff"
        />
      </Environment>
      <CoinRig reduced={reduced} interactive={interactive} scrollRef={scroll} poseYaw={poseYaw}>
        <Coin gold={gold} roughness={roughness} />
      </CoinRig>
    </Canvas>
  );
}
