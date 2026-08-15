import Link from "next/link";

const navItems = [
  { label: "数据看板", href: "/kb-9f3x", icon: "dashboard" },
  { label: "文章管理", href: "/kb-9f3x/articles", icon: "articles" },
  { label: "分类管理", href: "/kb-9f3x/categories", icon: "categories" },
  { label: "标签管理", href: "/kb-9f3x/tags", icon: "tags" },
  { label: "系统设置", href: "/kb-9f3x/settings", icon: "settings" },
];

function NavIcon({ name }: { name: string }) {
  const cls = "w-[18px] h-[18px]";
  switch (name) {
    case "dashboard":
      return (
        <svg className={cls} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="3" y="3" width="6" height="6" rx="1.5" />
          <rect x="11" y="3" width="6" height="6" rx="1.5" />
          <rect x="3" y="11" width="6" height="6" rx="1.5" />
          <rect x="11" y="11" width="6" height="6" rx="1.5" />
        </svg>
      );
    case "articles":
      return (
        <svg className={cls} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M4 3.5h8l3 3v10H4v-13z" strokeLinejoin="round" />
          <path d="M12 3.5v3h3" strokeLinejoin="round" />
          <path d="M7 10.5h6M7 13.5h6" strokeLinecap="round" />
        </svg>
      );
    case "categories":
      return (
        <svg className={cls} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="3" y="3" width="6" height="6" rx="1.5" />
          <rect x="11" y="3" width="6" height="6" rx="1.5" />
          <rect x="3" y="11" width="6" height="6" rx="1.5" />
          <path d="M14 11v3h3" strokeLinecap="round" />
        </svg>
      );
    case "tags":
      return (
        <svg className={cls} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M3 11.5L8.5 6a1.5 1.5 0 0 1 2.1 0l4.2 4.2a1.5 1.5 0 0 1 0 2.1L9.3 17.9A1.5 1.5 0 0 1 7.2 17.9l-4.2-4.2a1.5 1.5 0 0 1 0-2.1z" />
          <circle cx="12" cy="7" r="1.5" />
        </svg>
      );
    case "settings":
      return (
        <svg className={cls} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="10" cy="10" r="2.5" />
          <path d="M10 2.5v2M10 15.5v2M2.5 10h2M15.5 10h2M4.8 4.8l1.4 1.4M13.8 13.8l1.4 1.4M4.8 15.2l1.4-1.4M13.8 6.2l1.4-1.4" strokeLinecap="round" />
        </svg>
      );
  }
}

export default function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="graph-paper min-h-screen flex font-hand-body text-[#31302e]">
      {/* 后台侧边导航 */}
      <aside className="w-[220px] shrink-0 h-screen sticky top-0 flex flex-col bg-white border-r-2 border-dashed border-[#e6e6e6]">
        <div className="px-4 pt-4 pb-3 flex items-center justify-between">
          <Link href="/kb-9f3x" className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-secondary grid place-items-center text-white text-[13px] font-bold">
              管
            </span>
            <div className="leading-tight">
              <div className="font-hand-display text-[18px] font-bold text-[#31302e]">知识库管理</div>
              <div className="text-[11px] text-[#a39e98] mt-0.5">控制台</div>
            </div>
          </Link>
        </div>

        <nav className="flex-1 px-2 mt-2 space-y-0.5">
          {navItems.map((item, i) => (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center gap-2.5 px-2.5 py-[8px] sketch-border text-[16px] font-hand-display transition-colors ${
                i === 0
                  ? "bg-[#f6f5f4] sketch-border text-[#0075de] font-bold"
                  : "text-[#615d59] hover:bg-[#f6f5f4]/60 hover:text-[#31302e]"
              }`}
            >
              <span className={i === 0 ? "text-primary" : "text-[#a39e98]"}>
                <NavIcon name={item.icon} />
              </span>
              {item.label}
              {i === 0 && <span className="ml-auto w-1 h-1 rounded-full bg-primary" />}
            </Link>
          ))}
        </nav>

        <div className="px-3 pb-4 border-t border-[#e6e6e6] pt-3">
          <Link
            href="/"
            className="flex items-center gap-2.5 px-2.5 py-[8px] sketch-border text-[13.5px] text-[#615d59] hover:bg-[#f6f5f4]/60 hover:text-[#31302e] transition-colors"
          >
            <svg className="w-[18px] h-[18px] text-[#a39e98]" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M10 3.5L2.5 9.5h1.5V17h4v-4h4v4h4v-7.5h1.5L10 3.5z" strokeLinejoin="round" />
            </svg>
            返回前台
          </Link>
        </div>
      </aside>

      {/* 内容区 */}
      <div className="flex-1 min-w-0">
        {/* 顶部栏 */}
        <header className="sticky top-0 z-20 h-14 bg-[#fbfaf6]/90 backdrop-blur-sm border-b border-[#e6e6e6] flex items-center justify-between px-8">
          <div className="text-[14px] text-[#31302e]">数据看板</div>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 text-[12px] text-[#615d59]">
              <span className="w-6 h-6 rounded-full bg-sticker-purple grid place-items-center text-[11px] font-semibold text-white">
                我
              </span>
              管理员
            </span>
            <button className="text-[12px] text-[#a39e98] hover:text-[#31302e] transition-colors">
              退出
            </button>
          </div>
        </header>
        {children}
      </div>
    </div>
  );
}
