"use client";
import { useMemo } from "react";
import * as THREE from "three";

// 'r.' 브랜드 마크를 투명 캔버스에 그림 — 글자=밝은 골드, 마침표=바이올렛(브랜드 악센트).
// 코인 면에 얹는 인레이(원판)용 텍스처. 면의 cap UV 대신 평면 원판 UV를 써서 중앙·정립 제어.
function useGlyphTexture() {
  return useMemo(() => {
    const s = 512;
    const c = document.createElement("canvas");
    c.width = c.height = s;
    const ctx = c.getContext("2d")!;
    ctx.clearRect(0, 0, s, s); // 투명 배경
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    // 'r' — 밝은 크림골드 (마크 중심을 면 중앙에 맞춰 살짝 위로)
    ctx.font = "700 250px Menlo, ui-monospace, monospace";
    ctx.fillStyle = "#fff4d6";
    ctx.fillText("r", s / 2 - 34, s / 2 - 40);
    // '.' — 바이올렛 마침표 (r의 베이스라인 우하단)
    ctx.fillStyle = "#7b6bff";
    ctx.beginPath();
    ctx.arc(s / 2 + 74, s / 2 + 40, 32, 0, Math.PI * 2);
    ctx.fill();
    const tex = new THREE.CanvasTexture(c);
    tex.anisotropy = 8;
    tex.needsUpdate = true;
    return tex;
  }, []);
}

export default function Coin({
  gold = "#f5b14c",
  roughness = 0.3,
}: {
  gold?: string;
  roughness?: number;
}) {
  const glyph = useGlyphTexture();
  const goldMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: gold, metalness: 1, roughness }),
    [gold, roughness],
  );
  // 인레이: 투명 원판 위 'r.' — 금속 광택 살짝 더(roughness↓). color=white라 map 색 그대로.
  const inlayMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        map: glyph,
        transparent: true,
        metalness: 1,
        roughness: roughness * 0.7,
        color: "#ffffff",
      }),
    [glyph, roughness],
  );

  return (
    <group>
      {/* 코인 몸체 — 전부 골드 (옆면 림 포함) */}
      <mesh rotation={[Math.PI / 2, 0, 0]} material={goldMat} castShadow>
        <cylinderGeometry args={[1.2, 1.2, 0.14, 64]} />
      </mesh>
      {/* 앞면 'r.' 인레이 (코인 면 살짝 위 z=+0.0705) */}
      <mesh position={[0, 0, 0.0705]} material={inlayMat}>
        <circleGeometry args={[1.12, 64]} />
      </mesh>
      {/* 뒷면 'r.' 인레이 (Y 180° 회전해 바깥 향함) */}
      <mesh position={[0, 0, -0.0705]} rotation={[0, Math.PI, 0]} material={inlayMat}>
        <circleGeometry args={[1.12, 64]} />
      </mesh>
    </group>
  );
}
