import type { Metadata } from "next";

// 登录页同样用页面级 noindex（不暴露在 robots.txt 中），保证不被收录
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function LoginLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
