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
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
      </head>
      <body className="min-h-full flex flex-col">
        <GlowBackground />
        {children}
      </body>
    </html>
  );
}
