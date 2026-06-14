import type { Metadata } from "next";
import "./globals.css";
import "./fonts.css";
import GlowBackground from "@/components/GlowBackground";
import MotionProvider from "@/components/MotionProvider";
import AuthHashHandler from "@/components/AuthHashHandler";

// 📚 학습: Next.js Metadata API — app/opengraph-image.png, app/icon.svg를
// 같은 폴더에 두면 OG 태그·파비콘 link가 자동 생성됨 (파일 규약 기반)
export const metadata: Metadata = {
  metadataBase: new URL("https://rockdude0512.vercel.app"),
  title: "Rockdude Lab — 공부 에이전트 작업실",
  description:
    "풀이도, 노트도, 분석도 — 내 손 안에 도착하는 경험. rockdude0512가 만드는 공부 에이전트들 — 과제풀이·공부노트·강의분석부터 학습 뷰어까지.",
  openGraph: {
    title: "Rockdude Lab — 공부 에이전트 작업실",
    description:
      "풀이도, 노트도, 분석도 — 내 손 안에 도착하는 경험. 기말 풀이부터 논문 분석까지, 명령 한 줄이면 검증을 거친 결과물이 텔레그램으로 도착합니다.",
    locale: "ko_KR",
    type: "website",
    siteName: "Rockdude Lab",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full antialiased">
      <head>
        {/* 📚 학습: preconnect — 폰트 CDN과의 TLS 핸드셰이크를 미리 끝내 FCP 단축 */}
        <link
          rel="preconnect"
          href="https://cdn.jsdelivr.net"
          crossOrigin="anonymous"
        />
        {/* Wanted Sans Variable — 시안 3 확정 (2026-06-11 사용자 검수).
            📚 학습: @font-face CSS는 app/fonts.css로 인라인(same-origin 번들) —
            교차 출처 렌더 차단 체인 제거. woff2 청크만 CDN에서 unicode-range로 필요한 만큼 로드 */}
      </head>
      <body className="min-h-full flex flex-col">
        <MotionProvider>
          <AuthHashHandler />
          <GlowBackground />
          {children}
          {/* 필름 그레인 오버레이 — 전역 고정, soft-light 미세 질감(globals.css .grain-overlay).
              pointer-events:none이라 인터랙션 전부 통과. 콘텐츠 위·헤더(z-50) 아래. */}
          <div className="grain-overlay" aria-hidden="true" />
        </MotionProvider>
      </body>
    </html>
  );
}
