"use client";
import { useMemo } from "react";
import * as THREE from "three";

// ─────────────────────────────────────────────────────────────────────────────
// Aurora Halo — a clean, modern, minimal medallion.
// A gently DOMED polished gold face with the "r." deeply embossed, ringed by a
// thin recessed channel near the rim that carries a quiet VIOLET emissive glow
// (the brand "aurora" edge light). Restraint everywhere + one striking detail.
//
// Techniques inherited from the baseline (all proven):
//   • procedural canvas textures  -> THREE.CanvasTexture
//   • flat "r." inlay disc        -> map / bumpMap / emissiveMap
//   • reeded rim                  -> bump height texture
//   • multi-material cylinder     -> [rim, topCap, bottomCap]
// Reimagined: domed (LatheGeometry) faces + a torus halo + a frosted glow band.
// ─────────────────────────────────────────────────────────────────────────────

const VIOLET = "#6c63ff";
const VIOLET_HI = "#7b6bff";

function useHaloTextures() {
  return useMemo(() => {
    const s = 1024;

    // ── glyph: "r." wordmark, monospace/terminal voice ──────────────────────
    // Letter = warm cream gold; period = brand violet. Drawn large + centered
    // so the deep emboss reads cleanly on the dome's flat plateau.
    const g = document.createElement("canvas");
    g.width = g.height = s;
    const gx = g.getContext("2d")!;
    gx.clearRect(0, 0, s, s);
    gx.textAlign = "center";
    gx.textBaseline = "middle";
    gx.font = "600 540px Menlo, ui-monospace, SFMono-Regular, monospace";
    gx.fillStyle = "#fff3d2";
    gx.fillText("r", s / 2 - 80, s / 2 - 50);
    // crisp violet period — the accent
    gx.fillStyle = VIOLET_HI;
    gx.beginPath();
    gx.arc(s / 2 + 172, s / 2 + 96, 66, 0, Math.PI * 2);
    gx.fill();
    const glyph = new THREE.CanvasTexture(g);
    glyph.anisotropy = 8;
    glyph.colorSpace = THREE.SRGBColorSpace;

    // ── glyphBump: white glyph on black for a DEEP, even emboss ──────────────
    const gb = document.createElement("canvas");
    gb.width = gb.height = s;
    const gbx = gb.getContext("2d")!;
    gbx.fillStyle = "#000";
    gbx.fillRect(0, 0, s, s);
    gbx.textAlign = "center";
    gbx.textBaseline = "middle";
    gbx.font = "600 540px Menlo, ui-monospace, SFMono-Regular, monospace";
    gbx.fillStyle = "#fff";
    gbx.fillText("r", s / 2 - 80, s / 2 - 50);
    gbx.beginPath();
    gbx.arc(s / 2 + 172, s / 2 + 96, 66, 0, Math.PI * 2);
    gbx.fill();
    const glyphBump = new THREE.CanvasTexture(gb);

    // ── dotEmissive: ONLY the period glows violet (emissiveMap) ──────────────
    const d = document.createElement("canvas");
    d.width = d.height = s;
    const dx = d.getContext("2d")!;
    dx.fillStyle = "#000";
    dx.fillRect(0, 0, s, s);
    // soft violet bloom around the period so the accent feels lit, not painted
    const grad = dx.createRadialGradient(
      s / 2 + 172,
      s / 2 + 96,
      6,
      s / 2 + 172,
      s / 2 + 96,
      135,
    );
    grad.addColorStop(0, "#ffffff");
    grad.addColorStop(0.45, "#9a90ff");
    grad.addColorStop(1, "#000000");
    dx.fillStyle = grad;
    dx.beginPath();
    dx.arc(s / 2 + 172, s / 2 + 96, 135, 0, Math.PI * 2);
    dx.fill();
    dx.fillStyle = "#ffffff";
    dx.beginPath();
    dx.arc(s / 2 + 172, s / 2 + 96, 66, 0, Math.PI * 2);
    dx.fill();
    const dotEmissive = new THREE.CanvasTexture(d);

    // ── haloGlow: a radial-soft white band on black, used as the emissiveMap
    //    for the recessed channel torus so the violet light feathers softly. ──
    const hg = document.createElement("canvas");
    hg.width = hg.height = 256;
    const hx = hg.getContext("2d")!;
    hx.fillStyle = "#000";
    hx.fillRect(0, 0, 256, 256);
    const hgGrad = hx.createLinearGradient(0, 0, 0, 256);
    hgGrad.addColorStop(0, "#1a1830");
    hgGrad.addColorStop(0.5, "#ffffff");
    hgGrad.addColorStop(1, "#1a1830");
    hx.fillStyle = hgGrad;
    hx.fillRect(0, 0, 256, 256);
    const haloGlow = new THREE.CanvasTexture(hg);
    haloGlow.wrapS = haloGlow.wrapT = THREE.RepeatWrapping;

    return { glyph, glyphBump, dotEmissive, haloGlow };
  }, []);
}

// 림(옆면) 높이맵 — edge 무늬 선택:
//  reed=미세 수직 빗금(클래식) · knurl=다이아 격자(크로스해치) · rope=대각 트위스트
//  · segment=분절 빗금(빗금 묶음+매끈 밴드) · bead=비드(구슬) 가장자리
function makeRimBump(style: string): THREE.CanvasTexture {
  const w = 1024;
  const h = 128;
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "#7a7a7a"; // 평탄 베이스(중간 높이)
  ctx.fillRect(0, 0, w, h);

  if (style === "bead") {
    const cols = 84;
    const rows = 3;
    const cw = w / cols;
    const ch = h / rows;
    const rad = Math.min(cw, ch) * 0.42;
    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        const cx = (i + 0.5) * cw;
        const cy = (j + 0.5) * ch;
        const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, rad);
        g.addColorStop(0, "#ededed");
        g.addColorStop(1, "#5f5f5f");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(cx, cy, rad, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  } else {
    const img = ctx.getImageData(0, 0, w, h);
    const data = img.data;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const u = x / w;
        const t = y / h;
        let v = 128;
        if (style === "knurl") {
          const nx = 80;
          const ny = 4;
          const a = Math.cos(2 * Math.PI * (u * nx + t * ny));
          const b = Math.cos(2 * Math.PI * (u * nx - t * ny));
          v = 128 + 80 * ((a + b) / 2);
        } else if (style === "rope") {
          const nx = 72;
          const ny = 5;
          v = 128 + 110 * Math.cos(2 * Math.PI * (u * nx + t * ny));
        } else if (style === "segment") {
          const segs = 18;
          const reedsPer = 4;
          const frac = u * segs - Math.floor(u * segs);
          v = frac < 0.7 ? 128 + 95 * Math.cos(2 * Math.PI * reedsPer * (frac / 0.7)) : 128;
        } else {
          // reed (기본)
          const reeds = 168;
          v = 128 + 110 * Math.cos(2 * Math.PI * reeds * u);
        }
        const vi = Math.max(0, Math.min(255, Math.round(v)));
        const idx = (y * w + x) * 4;
        data[idx] = data[idx + 1] = data[idx + 2] = vi;
        data[idx + 3] = 255;
      }
    }
    ctx.putImageData(img, 0, 0);
  }

  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

// A revolved profile for one DOMED face: a flat central plateau (so the "r."
// inlay sits crisp) easing into a gentle convex dome out to the rim radius.
function makeDomeGeometry(
  innerR: number,
  outerR: number,
  rise: number,
  segments: number,
): THREE.LatheGeometry {
  const pts: THREE.Vector2[] = [];
  const steps = 28;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const radius = THREE.MathUtils.lerp(0, outerR, t);
    // flat across the plateau, then a smooth cosine dome falloff to the rim
    let z: number;
    if (radius <= innerR) {
      z = rise;
    } else {
      const k = (radius - innerR) / (outerR - innerR); // 0..1
      z = rise * (Math.cos(k * Math.PI * 0.5)); // cosine ease down to 0
    }
    pts.push(new THREE.Vector2(radius, z));
  }
  // Lathe revolves around Y; we will rotate the mesh so its axis becomes +Z.
  return new THREE.LatheGeometry(pts, segments);
}

export default function Coin({
  gold = "#f0a830",
  roughness = 0.3,
  rimStyle = "knurl",
}: {
  gold?: string;
  roughness?: number;
  rimStyle?: string;
}) {
  const { glyph, glyphBump, dotEmissive, haloGlow } = useHaloTextures();
  const rimBump = useMemo(() => makeRimBump(rimStyle), [rimStyle]);

  const R = 1.2; // overall coin radius
  const H = 0.3; // body thickness
  const half = H / 2;
  const channelR = 1.02; // radius of the recessed halo channel
  const plateauR = 0.86; // flat zone radius for the wordmark (enlarged)
  const domeRise = 0.07; // how far the dome rises above the body cap

  // ── Materials ─────────────────────────────────────────────────────────────

  // Reeded rim (edge)
  const rimMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: gold,
        metalness: 1,
        roughness: roughness * 1.05,
        bumpMap: rimBump,
        bumpScale: 0.09,
      }),
    [gold, roughness, rimBump],
  );

  // Body caps — kept plain; the domes sit on top of them.
  const bodyCapMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: gold, metalness: 1, roughness }),
    [gold, roughness],
  );

  // Polished domed face — clearcoat for that liquid, premium sheen.
  const domeMat = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: gold,
        metalness: 1,
        roughness: roughness * 0.7,
        clearcoat: 1,
        clearcoatRoughness: 0.12,
        side: THREE.FrontSide,
      }),
    [gold, roughness],
  );

  // "r." inlay — deeply embossed, period glowing violet.
  const inlayMat = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        map: glyph,
        bumpMap: glyphBump,
        bumpScale: 0.06,
        transparent: true,
        metalness: 1,
        roughness: roughness * 0.55,
        clearcoat: 0.8,
        clearcoatRoughness: 0.18,
        color: "#ffffff",
        emissive: new THREE.Color(VIOLET),
        emissiveMap: dotEmissive,
        emissiveIntensity: 2.2,
      }),
    [glyph, glyphBump, dotEmissive, roughness],
  );

  // The HALO: a thin violet emissive torus seated in the recessed channel.
  const haloMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#2a2550",
        metalness: 0.4,
        roughness: 0.35,
        emissive: new THREE.Color(VIOLET_HI),
        emissiveMap: haloGlow,
        emissiveIntensity: 2.4,
        toneMapped: true,
      }),
    [haloGlow],
  );

  // A darker recessed "trench" ring so the halo reads as a true channel cut
  // into the gold rather than a ring laid on the surface.
  const trenchMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#5a4a22",
        metalness: 1,
        roughness: Math.min(1, roughness * 1.6),
      }),
    [roughness],
  );

  // ── Geometries ──────────────────────────────────────────────────────────
  const domeGeo = useMemo(
    () => makeDomeGeometry(plateauR, channelR - 0.04, domeRise, 128),
    [plateauR, channelR, domeRise],
  );

  // 인레이는 면 그룹(±half) 안의 평탄 plateau 바로 위. 국소 z = domeRise+epsilon (이전 버그:
  // half를 이중 가산해 면보다 한참 앞에 떠 있었음 → 회전 시 'r.'이 분리돼 보임).
  const inlayLocalZ = domeRise + 0.001;

  return (
    <group>
      {/* ── Coin body: reeded rim + plain caps (domes/halo go on top) ─────── */}
      <mesh rotation={[Math.PI / 2, 0, 0]} material={[rimMat, bodyCapMat, bodyCapMat]} castShadow>
        <cylinderGeometry args={[R, R, H, 160]} />
      </mesh>

      {/* ── FRONT (+Z) — 볼록 돔: lathe +Y → +Z (rotation +PI/2) ──────────── */}
      <group position={[0, 0, half]}>
        <mesh geometry={domeGeo} rotation={[Math.PI / 2, 0, 0]} material={domeMat} castShadow />

        {/* recessed trench just inside the rim (dark ring → channel illusion) */}
        <mesh position={[0, 0, 0.004]} material={trenchMat}>
          <ringGeometry args={[channelR - 0.05, channelR + 0.05, 160]} />
        </mesh>

        {/* the violet halo, seated in the trench */}
        <mesh position={[0, 0, 0.012]} material={haloMat}>
          <torusGeometry args={[channelR, 0.022, 16, 220]} />
        </mesh>

        {/* deeply embossed "r." inlay, flush on the raised plateau */}
        <mesh position={[0, 0, inlayLocalZ]} material={inlayMat}>
          <circleGeometry args={[plateauR, 96]} />
        </mesh>
      </group>

      {/* ── BACK (-Z) — 볼록 돔: lathe +Y → -Z (rotation -PI/2), 인레이 후면향 ── */}
      <group position={[0, 0, -half]}>
        <mesh geometry={domeGeo} rotation={[-Math.PI / 2, 0, 0]} material={domeMat} castShadow />

        <mesh position={[0, 0, -0.004]} material={trenchMat}>
          <ringGeometry args={[channelR - 0.05, channelR + 0.05, 160]} />
        </mesh>

        <mesh position={[0, 0, -0.012]} material={haloMat}>
          <torusGeometry args={[channelR, 0.022, 16, 220]} />
        </mesh>

        <mesh position={[0, 0, -inlayLocalZ]} rotation={[0, Math.PI, 0]} material={inlayMat}>
          <circleGeometry args={[plateauR, 96]} />
        </mesh>
      </group>
    </group>
  );
}
