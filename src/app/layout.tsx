import type { Metadata } from "next";
import "./globals.css";
import { Geist, Caveat, Patrick_Hand } from "next/font/google";
import { cn } from "@/lib/utils";
import TRPCProvider from "@/trpc/react";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });
const caveat = Caveat({
  subsets: ["latin"],
  variable: "--font-hand-display",
  weight: ["500", "600", "700"],
});
const patrick = Patrick_Hand({
  subsets: ["latin"],
  variable: "--font-hand-body",
  weight: "400",
});

export const metadata: Metadata = {
  title: "个人知识库",
  description: "轻量化、私有化的个人知识管理工具",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-CN"
      className={cn("font-sans", geist.variable, caveat.variable, patrick.variable)}
    >
      <body className="min-h-screen antialiased">
        <TRPCProvider>{children}</TRPCProvider>
      </body>
    </html>
  );
}
