import type { Metadata, Viewport } from "next";
import "./globals.css";
// sketch 主题走 JS import（resolveAlias 指向本地 tipkit），替代 globals.css 里无法解析的 CSS @import
import "@tipkit/themes/sketch.css";
import { Geist, Caveat, Patrick_Hand } from "next/font/google";
import { cn } from "@/lib/utils";
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION } from "@/lib/config";
import TRPCProvider from "@/trpc/react";
import { Toaster } from "@/components/ui/sonner";
import BackToTop from "@/components/back-to-top";
import { ThemeProvider } from "@/components/theme-provider";

// 移除全局 force-dynamic：前台公开内容改用 Cache Components（"use cache"）进入静态壳/预取，
// 点击切换即可即时渲染，实现丝滑跳转。数据库构建时不再需要（缓存函数构建期不执行）。
// 后台等真正动态的页面仍各自处理。线上数据库迁移仍走容器启动时的 entrypoint。

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
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: ["知识库", "知识管理", "个人笔记", "博客", "全栈开发", "Next.js"],
  applicationName: SITE_NAME,
  authors: [{ name: "xie392", url: SITE_URL }],
  creator: "xie392",
  robots: { index: true, follow: true },
  // 图标由 app/icon.tsx 与 app/apple-icon.tsx 文件约定自动注入，无需手写 icons
  alternates: { languages: { "zh-CN": "/", "x-default": "/" } },
  openGraph: {
    type: "website",
    locale: "zh_CN",
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    // og:image 由 app/opengraph-image.tsx 动态生成（1200×630 PNG）；
    // 注意：不能用 SVG（Facebook/X/微信/Telegram 均不支持 SVG 作为预览图）
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
  },
};

// 移动端浏览器 UI 配色与主题一致（浅色=暖纸，深色=暖暗）
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  colorScheme: "light dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f6f5f4" },
    { media: "(prefers-color-scheme: dark)", color: "#1c1b19" },
  ],
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
        description: SITE_DESCRIPTION,
        inLanguage: "zh-CN",
        // 注：站点搜索为弹窗交互、无独立 URL，故不再声明 SearchAction
        //（声明却无对应可抓取搜索页会被 Search Console 判为无效富结果）
        publisher: { "@id": `${SITE_URL}/#organization` },
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
        description: SITE_DESCRIPTION,
        // GEO：明确地域相关性信号（站点为中文站、主体在中国大陆）
        areaServed: { "@type": "Country", name: "China" },
        address: { "@type": "PostalAddress", addressCountry: "CN" },
        logo: {
          "@type": "ImageObject",
          url: `${SITE_URL}/icon`,
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
        {/* Umami 访问统计：未配置 NEXT_PUBLIC_UMAMI_URL 时不加载（本地开发默认关闭） */}
        {process.env.NEXT_PUBLIC_UMAMI_URL && process.env.NEXT_PUBLIC_UMAMI_SITE_ID && (
          <script
            defer
            src={`${process.env.NEXT_PUBLIC_UMAMI_URL}/script.js`}
            data-website-id={process.env.NEXT_PUBLIC_UMAMI_SITE_ID}
            {...(process.env.NEXT_PUBLIC_UMAMI_DOMAINS
              ? { "data-domains": process.env.NEXT_PUBLIC_UMAMI_DOMAINS }
              : {})}
          />
        )}
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
