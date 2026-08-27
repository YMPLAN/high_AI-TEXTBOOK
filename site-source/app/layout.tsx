import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "고등학교 인공지능 기초 스마트 수업",
  description: "길벗 2022 개정 고등학교 인공지능 기초 교과서 기반 스마트 수업 슬라이드",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="antialiased">{children}</body>
    </html>
  );
}
