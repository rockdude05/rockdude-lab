import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Next 16: quality prop 값은 허용목록 필수 — 히어로 결과 카드(글자 위주)는 q=90
    qualities: [75, 90],
  },
};

export default nextConfig;
