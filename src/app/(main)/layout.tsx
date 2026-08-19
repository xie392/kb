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
      <header className="sticky top-0 z-50 bg-[#fbfaf6]/90 backdrop-blur-sm border-b-2 border-dashed border-hairline">
        <div className="max-w-250 mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <Logo size="sm" className="group-hover:rotate-0 transition-transform" />
            <span className="font-hand-display text-[24px] font-bold text-ink-secondary rotate-[-1deg]">
              {SITE_NAME}
            </span>
          </Link>

          <SiteNav />
        </div>
      </header>

      <main id="main" className="flex-1">{children}</main>

      {/* 手绘页脚 */}
      <footer className="border-t-2 border-dashed border-hairline py-8">
        <div className="max-w-250 mx-auto px-4 sm:px-6 flex items-center justify-center gap-3 font-hand-body text-[15px] text-ink-faint">
          {/* TODO: 备案信息（ICP/公安备案号），备案完成后替换为真实信息 */}
          <a
            href="https://beian.miit.gov.cn/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary transition-colors"
          >
            粤ICP备2026000000号-1
          </a>
          <a
            href="https://beian.mps.gov.cn/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 hover:text-primary transition-colors"
          >
            <span className="w-3 h-3 rounded-full bg-ink-faint/60 inline-block" />
            粤公网安备44030002000000号
          </a>
        </div>
      </footer>
    </div>
  );
}
