import Link from "next/link";
import AdminHeader from "./admin-header";
import AdminNav from "@/components/admin-nav";
import { ADMIN_HOME } from "@/lib/config";

export default function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="graph-paper h-screen flex overflow-hidden font-hand-body text-[#31302e]">
      {/* 后台侧边导航（固定不滚动） */}
      <aside className="w-[220px] shrink-0 h-full flex flex-col bg-white border-r-2 border-dashed border-[#e6e6e6]">
        <div className="px-4 pt-4 pb-3 flex items-center justify-between">
          <Link href={ADMIN_HOME} className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-secondary grid place-items-center text-white text-[13px] font-bold">
              管
            </span>
            <div className="leading-tight">
              <div className="font-hand-display text-[18px] font-bold text-[#31302e]">知识库管理</div>
              <div className="text-[11px] text-[#a39e98] mt-0.5">控制台</div>
            </div>
          </Link>
        </div>

        <AdminNav />

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

      {/* 内容区（锁定视口高度，超出部分在内部滚动） */}
      <div className="flex-1 min-w-0 h-full overflow-hidden flex flex-col">
        <AdminHeader />
        <main className="flex-1 min-h-0 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
