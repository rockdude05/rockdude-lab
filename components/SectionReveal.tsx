"use client";

// 📚 학습 포인트: SectionReveal = 뷰포트 진입 시 fade-in+slide-up 컨테이너.
// variants 패턴: 부모 container가 staggerChildren을 선언하고,
// 자식들은 revealItem variants를 import해 motion.div에 적용하면
// 자동으로 0.08s 간격으로 순차 등장 → 코드 분리 + 재사용성 확보.

import { motion } from "framer-motion";

// 자식 컴포넌트에서 import해 motion.div에 적용하는 variants
export const revealItem = {
  hidden: { opacity: 0, y: 18 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

// SectionReveal 컨테이너 variants — initial fade+slide + staggerChildren 통합
const sectionVariants = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut" as const,
      staggerChildren: 0.08,
    },
  },
};

interface SectionRevealProps {
  children: React.ReactNode;
  className?: string;
}

export default function SectionReveal({
  children,
  className,
}: SectionRevealProps) {
  return (
    <motion.div
      className={className}
      variants={sectionVariants}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-80px" }}
    >
      {children}
    </motion.div>
  );
}
