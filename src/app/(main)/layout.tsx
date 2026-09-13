import Link from "next/link";
import SiteNav from "@/components/site-nav";
import { Logo } from "@/components/logo";
import { SITE_NAME } from "@/lib/config";

export default function MainLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="graph-paper min-h-screen flex flex-col font-hand-body text-ink-secondary">
      {/* 手绘顶部导航 */}
      <header className="sticky top-0 z-50 bg-canvas-soft/90 backdrop-blur-sm border-b-2 border-dashed border-hairline">
        <div className="max-w-250 mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <Logo size="sm" className="group-hover:rotate-0 transition-transform" />
            <span className="font-hand-display text-[18px] sm:text-[24px] font-bold text-ink-secondary rotate-[-1deg]">
              {SITE_NAME}
            </span>
          </Link>

          <SiteNav />
        </div>
      </header>

      <main id="main" className="flex-1">{children}</main>

      {/* 手绘页脚 */}
      <footer className="border-t-2 border-dashed border-hairline py-8">
        <div className="max-w-250 mx-auto px-4 sm:px-6 flex flex-wrap items-center justify-center gap-3 font-hand-body text-[15px] text-ink-faint">
          <a
            href="/feed.xml"
            title="订阅 RSS"
            className="flex items-center gap-1 hover:text-primary transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <circle cx="6.18" cy="17.82" r="2.18" />
              <path d="M4 4.44v2.83c7.03 0 12.73 5.7 12.73 12.73h2.83C19.56 11.45 12.55 4.44 4 4.44zm0 5.66v2.83c3.9 0 7.07 3.17 7.07 7.07h2.83c0-5.47-4.43-9.9-9.9-9.9z" />
            </svg>
            RSS
          </a>
          <a
            href="https://beian.miit.gov.cn/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary transition-colors"
          >
            桂ICP备2026019706号-1
          </a>
          <a
            href="https://beian.mps.gov.cn/#/query/webSearch?code=45098102000582"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 hover:text-primary transition-colors"
          >
            <img
              src="/police-badge.png"
              alt="公安备案图标"
              width={16}
              height={16}
              loading="lazy"
              decoding="async"
              className="w-4 h-4 inline-block"
            />
            桂公网安备45098102000582号
          </a>
        </div>
      </footer>
    </div>
  );
}
