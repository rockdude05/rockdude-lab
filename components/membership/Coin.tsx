"use client";
import { useMemo } from "react";
import * as THREE from "three";

// 'r.' 로고를 캔버스에 그려 텍스처화 (앞/뒤 면 map + bumpMap = 양각).
function useGlyphTexture() {
  return useMemo(() => {
    const s = 512;
    const c = document.createElement("canvas");
    c.width = c.height = s;
    const ctx = c.getContext("2d")!;
    ctx.fillStyle = "#9a7b2e"; // 골드 베이스(면 음영)
    ctx.fillRect(0, 0, s, s);
    ctx.fillStyle = "#f7eccb"; // 양각 하이라이트(밝은 글자)
    ctx.font = "700 300px Menlo, monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("r", s / 2 - 24, s / 2);
    ctx.fillStyle = "#6c63ff"; // 'r.'의 마침표 = 바이올렛(브랜드)
    ctx.beginPath();
    ctx.arc(s / 2 + 96, s / 2 + 96, 26, 0, Math.PI * 2);
    ctx.fill();
    const tex = new THREE.CanvasTexture(c);
    tex.anisotropy = 8;
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
  const faceMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: gold,
        metalness: 1,
        roughness,
        map: glyph,
        bumpMap: glyph,
        bumpScale: 0.04,
      }),
    [gold, roughness, glyph],
  );
  // cylinder material 순서: [0]=옆면(림), [1]=윗면(앞), [2]=아랫면(뒤). 면엔 glyph, 림은 골드.
  return (
    <mesh rotation={[Math.PI / 2, 0, 0]} material={[goldMat, faceMat, faceMat]} castShadow>
      <cylinderGeometry args={[1.2, 1.2, 0.14, 64]} />
    </mesh>
  );
}
