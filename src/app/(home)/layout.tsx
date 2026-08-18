import Link from "next/link";
import SiteNav from "@/components/site-nav";

export default function HomeLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="min-h-screen bg-transparent font-hand-body text-ink-secondary flex flex-col">
      {/* 手绘顶部导航 */}
      <header className="sticky top-0 z-50 bg-[#fbfaf6]/90 backdrop-blur-sm border-b-2 border-dashed border-hairline">
        <div className="max-w-250 mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <span className="w-9 h-9 grid place-items-center sketch-border sketch-shadow bg-white font-hand-display text-[20px] font-bold text-secondary rotate-[-4deg] group-hover:rotate-0 transition-transform">
              知
            </span>
            <span className="font-hand-display text-[24px] font-bold text-ink-secondary rotate-[-1deg]">
              我的知识库
            </span>
          </Link>

          <SiteNav />
        </div>
      </header>

      <main id="main" className="flex-1">{children}</main>

      {/* 手绘页脚 */}
      <footer className="border-t-2 border-dashed border-hairline py-8">
        <div className="max-w-250 mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 font-hand-body text-[15px] text-ink-faint">
          <span>我的知识库 · 私有部署 · 数据自持</span>
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-sticker-pink rotate-12" />
            <span className="w-2 h-2 rounded-full bg-sticker-sky -rotate-12" />
            <span className="w-2 h-2 rounded-full bg-sticker-teal rotate-6" />
            <span className="ml-1">手绘原型 · 线框稿</span>
          </span>
        </div>
      </footer>
    </div>
  );
}
