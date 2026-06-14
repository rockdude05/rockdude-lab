"use client";
import { useMemo } from "react";
import * as THREE from "three";

// 코인용 캔버스 텍스처 3종:
//  - glyph: 'r.' 마크 (map + bumpMap=양각). 글자=크림골드, 점=바이올렛.
//  - dotEmissive: 마침표만 흰색(나머지 검정) → emissiveMap. 점이 바이올렛으로 은은히 발광.
//  - rimBump: 림(옆면) 빗금(reeding) 높이맵 — 실제 주화의 톱니 가장자리.
function useCoinTextures() {
  return useMemo(() => {
    const s = 512;
    // --- glyph ---
    const g = document.createElement("canvas");
    g.width = g.height = s;
    const gx = g.getContext("2d")!;
    gx.clearRect(0, 0, s, s);
    gx.textAlign = "center";
    gx.textBaseline = "middle";
    gx.font = "700 250px Menlo, ui-monospace, monospace";
    gx.fillStyle = "#fff4d6";
    gx.fillText("r", s / 2 - 34, s / 2 - 40);
    gx.fillStyle = "#7b6bff";
    gx.beginPath();
    gx.arc(s / 2 + 74, s / 2 + 40, 32, 0, Math.PI * 2);
    gx.fill();
    const glyph = new THREE.CanvasTexture(g);
    glyph.anisotropy = 8;

    // --- dot emissive (마침표만) ---
    const d = document.createElement("canvas");
    d.width = d.height = s;
    const dx = d.getContext("2d")!;
    dx.fillStyle = "#000";
    dx.fillRect(0, 0, s, s);
    dx.fillStyle = "#fff";
    dx.beginPath();
    dx.arc(s / 2 + 74, s / 2 + 40, 32, 0, Math.PI * 2);
    dx.fill();
    const dotEmissive = new THREE.CanvasTexture(d);

    // --- rim reeding (수직 톱니 높이맵) ---
    const w = 1024;
    const r = document.createElement("canvas");
    r.width = w;
    r.height = 8;
    const rx = r.getContext("2d")!;
    const reeds = 130;
    for (let x = 0; x < w; x++) {
      const v = Math.round(((Math.cos((x / w) * reeds * Math.PI * 2) + 1) / 2) * 255);
      rx.fillStyle = `rgb(${v},${v},${v})`;
      rx.fillRect(x, 0, 1, 8);
    }
    const rimBump = new THREE.CanvasTexture(r);
    rimBump.wrapS = rimBump.wrapT = THREE.RepeatWrapping;

    return { glyph, dotEmissive, rimBump };
  }, []);
}

export default function Coin({
  gold = "#f0a830",
  roughness = 0.3,
}: {
  gold?: string;
  roughness?: number;
}) {
  const { glyph, dotEmissive, rimBump } = useCoinTextures();

  // 림(옆면) — 빗금 양각
  const rimMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: gold,
        metalness: 1,
        roughness: roughness * 1.1,
        bumpMap: rimBump,
        bumpScale: 0.05,
      }),
    [gold, roughness, rimBump],
  );
  // 면(앞/뒤 캡) — 매끈한 골드
  const capMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: gold, metalness: 1, roughness }),
    [gold, roughness],
  );
  // 'r.' 인레이 — 양각(bumpMap) + 마침표 바이올렛 발광(emissive)
  const inlayMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        map: glyph,
        bumpMap: glyph,
        bumpScale: 0.035,
        transparent: true,
        metalness: 1,
        roughness: roughness * 0.7,
        color: "#ffffff",
        emissive: new THREE.Color("#6c63ff"),
        emissiveMap: dotEmissive,
        emissiveIntensity: 1.7,
      }),
    [glyph, dotEmissive, roughness],
  );

  // cylinder material 순서: [0]=옆면(림), [1]=윗면, [2]=아랫면
  return (
    <group>
      <mesh
        rotation={[Math.PI / 2, 0, 0]}
        material={[rimMat, capMat, capMat]}
        castShadow
      >
        <cylinderGeometry args={[1.2, 1.2, 0.3, 96]} />
      </mesh>
      {/* 앞면 'r.' 인레이 */}
      <mesh position={[0, 0, 0.1505]} material={inlayMat}>
        <circleGeometry args={[1.12, 64]} />
      </mesh>
      {/* 뒷면 'r.' 인레이 (바깥 향함) */}
      <mesh position={[0, 0, -0.1505]} rotation={[0, Math.PI, 0]} material={inlayMat}>
        <circleGeometry args={[1.12, 64]} />
      </mesh>
    </group>
  );
}
