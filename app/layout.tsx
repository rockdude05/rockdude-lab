import type { Metadata } from "next";
import "./globals.css";
import GlowBackground from "@/components/GlowBackground";

export const metadata: Metadata = {
  title: "Rockdude Lab",
  description: "rockdude0512가 만드는 공부 에이전트들",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full antialiased">
      <head>
        {/* Wanted Sans Variable — 시안 3 확정 (2026-06-11 사용자 검수) */}
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/wanteddev/wanted-sans@v1.0.3/packages/wanted-sans/fonts/webfonts/variable/complete/WantedSansVariable.min.css"
        />
      </head>
      <body className="min-h-full flex flex-col">
        <GlowBackground />
        {children}
      </body>
    </html>
  );
}
