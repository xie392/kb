import Link from "next/link";
import SiteNav from "@/components/site-nav";
import { createServerCaller } from "@/trpc/server";

const FOOTER_COLORS = ["#0075de", "#ff64c8", "#62aef0", "#2a9d99", "#dd5b00"];

export default async function MainLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // 页脚展示真实顶级分类（取前 3 个）
  let topCats: { id: string; name: string }[] = [];
  try {
    const caller = await createServerCaller();
    const cats = await caller.category.tree();
    topCats = cats.slice(0, 3);
  } catch {
    // 数据库异常时页脚不展示分类，不影响页面
  }

  return (
    <div className="graph-paper min-h-screen font-hand-body text-ink-secondary">
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
          {topCats.length > 0 && (
            <div className="flex items-center gap-3">
              {topCats.map((c, i) => (
                <span key={c.id} className="flex items-center gap-1.5">
                  <span
                    className="w-2 h-2 rounded-full rotate-12"
                    style={{ backgroundColor: FOOTER_COLORS[i % FOOTER_COLORS.length] }}
                  />
                  {c.name}
                </span>
              ))}
            </div>
          )}
        </div>
      </footer>
    </div>
  );
}
