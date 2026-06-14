"use client";
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

// 코인을 감싸는 그룹 — 자동회전 + 마우스 패럴랙스 + 스크롤 반응(기울기·후퇴).
export default function CoinRig({
  children,
  reduced = false,
  interactive = true,
  scrollRef,
  poseYaw = null,
}: {
  children: React.ReactNode;
  reduced?: boolean;
  interactive?: boolean;
  scrollRef?: React.MutableRefObject<number>; // 0~1 히어로 스크롤 진행도
  poseYaw?: number | null; // QA: 고정 yaw(라디안)로 정지 — 3/4 캡처용
}) {
  const g = useRef<THREE.Group>(null);
  useFrame((state, dt) => {
    const grp = g.current;
    if (!grp) return;
    if (poseYaw != null) {
      grp.rotation.set(0.16, poseYaw, 0); // 살짝 위에서 본 3/4 포즈(림·두께 노출)
      return;
    }
    if (!reduced) grp.rotation.y += dt * 0.5; // 자동 회전
    const sp = scrollRef?.current ?? 0;
    // 패럴랙스(마우스) + 스크롤(기울기·후퇴)
    const px = interactive && !reduced ? state.pointer.x * 0.25 : 0;
    const py = interactive && !reduced ? state.pointer.y * 0.2 : 0;
    grp.rotation.x = THREE.MathUtils.lerp(grp.rotation.x, py + sp * 0.6, 0.08);
    grp.rotation.z = THREE.MathUtils.lerp(grp.rotation.z, px * 0.4, 0.08);
    const sc = 1 - sp * 0.12;
    grp.scale.setScalar(THREE.MathUtils.lerp(grp.scale.x, sc, 0.08));
    grp.position.x = THREE.MathUtils.lerp(grp.position.x, px, 0.08);
  });
  return <group ref={g}>{children}</group>;
}
