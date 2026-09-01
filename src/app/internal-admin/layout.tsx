import type { Metadata } from "next";
import Link from "next/link";
import AdminHeader from "./admin-header";
import AdminNav from "@/components/admin-nav";
import { ADMIN_HOME } from "@/lib/config";
// sketch.css 内部已 @import base.css，自包含；default.css 是另一套独立风格（本项目用 sketch），无需引入
import "@tipkit/themes/sketch.css";
import "@tipkit/themes/dark.css";
import "@/app/editor.css";

// 后台页面不参与索引：用页面级 noindex 而非 robots.txt Disallow，
// 避免在公开的 robots.txt 中暴露后台路径。
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="graph-paper h-screen flex overflow-hidden font-hand-body text-ink-secondary">
      {/* 后台侧边导航（固定不滚动） */}
      <aside className="w-55 shrink-0 h-full flex flex-col bg-white border-r-2 border-dashed border-hairline">
        <div className="px-4 pt-4 pb-3 flex items-center justify-between">
          <Link href={ADMIN_HOME} className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-secondary grid place-items-center text-white text-[13px] font-bold">
              管
            </span>
            <div className="leading-tight">
              <div className="font-hand-display text-[18px] font-bold text-ink-secondary">知识库管理</div>
              <div className="text-[11px] text-ink-faint mt-0.5">控制台</div>
            </div>
          </Link>
        </div>

        <AdminNav />

        <div className="px-3 pb-4 border-t border-hairline pt-3">
          <Link
            href="/"
            className="flex items-center gap-2.5 px-2.5 py-2 sketch-border text-[13.5px] text-ink-muted hover:bg-canvas-soft/60 hover:text-ink-secondary transition-colors"
          >
            <svg className="w-[18px] h-[18px] text-ink-faint" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M10 3.5L2.5 9.5h1.5V17h4v-4h4v4h4v-7.5h1.5L10 3.5z" strokeLinejoin="round" />
            </svg>
            返回前台
          </Link>
        </div>
      </aside>

      {/* 内容区（锁定视口高度，超出部分在内部滚动） */}
      <div className="flex-1 min-w-0 h-full overflow-hidden flex flex-col">
        <AdminHeader />
        <main id="main" className="flex-1 min-h-0 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
