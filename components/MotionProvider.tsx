"use client";

// 📚 학습: MotionConfig reducedMotion="user" — Framer Motion의 JS 주도 애니메이션은
// CSS prefers-reduced-motion 미디어쿼리의 영향을 받지 않는다.
// 이 설정 하나로 모든 motion.* 컴포넌트가 OS '동작 줄이기'를 자동 존중.
import { MotionConfig } from "framer-motion";

export default function MotionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
