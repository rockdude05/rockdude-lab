"use client";
import { Canvas } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import { useEffect, useRef } from "react";
import Coin from "./Coin";
import CoinRig from "./CoinRig";

export default function CoinScene({
  reduced = false,
  interactive = true,
  gold = "#f5b14c",
  roughness = 0.3,
}: {
  reduced?: boolean;
  interactive?: boolean;
  gold?: string;
  roughness?: number;
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
      <ambientLight intensity={0.4} />
      <directionalLight position={[2, 3, 4]} intensity={1.6} color="#fff3da" />
      <directionalLight position={[-3, -1, 2]} intensity={0.5} color="#6c63ff" />
      <Environment preset="studio" />
      <CoinRig reduced={reduced} interactive={interactive} scrollRef={scroll}>
        <Coin gold={gold} roughness={roughness} />
      </CoinRig>
    </Canvas>
  );
}
