import Link from "next/link";
import { categories } from "@/lib/mock-data";
import SearchDialog from "@/components/search-dialog";

const navLinks = [
  { label: "首页", href: "/" },
  { label: "分类", href: "/categories" },
  { label: "标签", href: "/tags" },
  { label: "收藏", href: "/favorites" },
];

export default function MainLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="graph-paper min-h-screen font-hand-body text-[#31302e]">
      {/* 手绘顶部导航 */}
      <header className="sticky top-0 z-50 bg-[#fbfaf6]/90 backdrop-blur-sm border-b-2 border-dashed border-[#e6e6e6]">
        <div className="max-w-[1000px] mx-auto px-6 h-[64px] flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <span className="w-9 h-9 grid place-items-center sketch-border sketch-shadow bg-white font-hand-display text-[20px] font-bold text-[#213183] rotate-[-4deg] group-hover:rotate-0 transition-transform">
              知
            </span>
            <span className="font-hand-display text-[24px] font-bold text-[#31302e] rotate-[-1deg]">
              我的知识库
            </span>
          </Link>

          <nav className="flex items-center gap-1.5">
            <SearchDialog />
            {navLinks.map((link, i) => (
              <Link
                key={link.href}
                href={link.href}
                className={`font-hand-display text-[17px] px-4 py-1.5 transition-colors ${
                  link.href === "/"
                    ? "bg-white sketch-border sketch-shadow text-[#0075de] font-bold"
                    : `text-[#615d59] hover:text-[#0075de] ${i % 2 ? "rotate-[0.5deg]" : "rotate-[-0.5deg]"}`
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      {/* 手绘页脚 */}
      <footer className="border-t-2 border-dashed border-[#e6e6e6] py-8">
        <div className="max-w-[1000px] mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-3 font-hand-body text-[15px] text-[#a39e98]">
          <span>我的知识库 · 私有部署 · 数据自持</span>
          <div className="flex items-center gap-3">
            {categories.slice(0, 3).map((c) => (
              <span key={c.id} className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full rotate-12" style={{ backgroundColor: c.color }} />
                {c.name}
              </span>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
