import type { Metadata } from "next";
import "./globals.css";
// sketch 主题走 JS import（resolveAlias 指向本地 tipkit），替代 globals.css 里无法解析的 CSS @import
import "@tipkit/themes/sketch.css";
import { Geist, Caveat, Patrick_Hand } from "next/font/google";
import { cn } from "@/lib/utils";
import { SITE_URL, SITE_NAME } from "@/lib/config";
import TRPCProvider from "@/trpc/react";
import { Toaster } from "@/components/ui/sonner";
import BackToTop from "@/components/back-to-top";
import { ThemeProvider } from "@/components/theme-provider";

// 全局强制动态渲染，所有页面都不在构建时静态预生成（数据库在启动时才迁移）
export const dynamic = "force-dynamic";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const caveat = Caveat({
  subsets: ["latin"],
  variable: "--font-hand-display",
  weight: ["500", "600", "700"],
  display: "swap",
});
const patrick = Patrick_Hand({
  subsets: ["latin"],
  variable: "--font-hand-body",
  weight: "400",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "个人知识库",
    template: "%s | 个人知识库",
  },
  description: "轻量化、私有化的个人知识管理工具",
  keywords: ["知识库", "知识管理", "个人笔记", "博客"],
  applicationName: "个人知识库",
  robots: { index: true, follow: true },
  icons: { icon: "/logo.svg" },
  openGraph: {
    type: "website",
    locale: "zh_CN",
    siteName: "个人知识库",
    title: "个人知识库",
    description: "轻量化、私有化的个人知识管理工具",
    images: [{ url: "/logo.svg", width: 512, height: 512, alt: "个人知识库" }],
  },
  twitter: {
    card: "summary",
    title: "个人知识库",
    description: "轻量化、私有化的个人知识管理工具",
    images: ["/logo.svg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      // WebSite 信息（帮助AI识别这是一个博客/知识库网站）
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: SITE_NAME,
        description: "轻量化、私有化的个人知识管理工具",
        inLanguage: "zh-CN",
        potentialAction: {
          "@type": "SearchAction",
          target: `${SITE_URL}/?q={search_term_string}`,
          "query-input": "required name=search_term_string",
        },
      },
      // 作者/Organization 信息（帮助AI识别内容来源）
      {
        "@type": "Person",
        "@id": `${SITE_URL}/#author`,
        name: "xie392",
        url: SITE_URL,
        sameAs: [
          "https://github.com/xie392",
        ],
      },
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        name: SITE_NAME,
        url: SITE_URL,
        logo: {
          "@type": "ImageObject",
          url: `${SITE_URL}/logo.svg`,
          width: 512,
          height: 512,
        },
      },
    ],
  };

  return (
    <html
      lang="zh-CN"
      suppressHydrationWarning
      className={cn("tk-theme-sketch font-sans", geist.variable, caveat.variable, patrick.variable)}
    >
      <body className="min-h-screen antialiased" suppressHydrationWarning>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[999] focus:bg-primary focus:text-white focus:px-4 focus:py-2 focus:rounded-md focus:font-hand-body focus:text-[15px]"
        >
          跳到主要内容
        </a>
        <TRPCProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <Toaster position="top-center" richColors />
            <BackToTop />
          </ThemeProvider>
        </TRPCProvider>
      </body>
    </html>
  );
}
