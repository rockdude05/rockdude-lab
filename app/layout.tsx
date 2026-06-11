import type { Metadata } from "next";
import "./globals.css";
import GlowBackground from "@/components/GlowBackground";
import MotionProvider from "@/components/MotionProvider";

// 📚 학습: Next.js Metadata API — app/opengraph-image.png, app/icon.svg를
// 같은 폴더에 두면 OG 태그·파비콘 link가 자동 생성됨 (파일 규약 기반)
export const metadata: Metadata = {
  metadataBase: new URL("https://rockdude0512.vercel.app"),
  title: "Rockdude Lab — 공부 에이전트 작업실",
  description:
    "기말 풀이 PDF가 텔레그램으로 도착하는 경험. rockdude0512가 만드는 공부 에이전트들 — 과제풀이·공부노트·강의분석부터 학습 뷰어까지.",
  openGraph: {
    title: "Rockdude Lab — 공부 에이전트 작업실",
    description:
      "기말 풀이 PDF가 텔레그램으로 도착하는 경험. 명령 한 줄이면 검증을 거친 풀이·그림·분석이 도착합니다.",
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
            split(unicode-range 분할) 버전: complete는 단일 1.3MB woff2라 FCP를 죽임 —
            split은 화면에 실제 쓰인 글자 블록만 내려받음 (Lighthouse perf 57→ 개선) */}
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/wanteddev/wanted-sans@v1.0.3/packages/wanted-sans/fonts/webfonts/variable/split/WantedSansVariable.min.css"
        />
      </head>
      <body className="min-h-full flex flex-col">
        <MotionProvider>
          <GlowBackground />
          {children}
        </MotionProvider>
      </body>
    </html>
  );
}
