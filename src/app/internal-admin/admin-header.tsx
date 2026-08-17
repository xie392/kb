"use client";

import { usePathname } from "next/navigation";
import LogoutButton from "@/components/logout-button";
import { ADMIN_HOME } from "@/lib/config";

export default function AdminHeader() {
  const pathname = usePathname();
  // 编辑器页面隐藏 admin header，让编辑器自己控制顶部区域
  const isEditorPage =
    pathname === `${ADMIN_HOME}/articles/new` ||
    new RegExp(`^${ADMIN_HOME}/articles/[^/]+/edit$`).test(pathname);

  if (isEditorPage) return null;

  return (
    <header className="sticky top-0 z-20 h-14 bg-[#fbfaf6]/90 backdrop-blur-sm border-b border-[#e6e6e6] flex items-center justify-between px-8">
      <div className="text-[14px] text-[#31302e]">数据看板</div>
      <div className="flex items-center gap-3">
        <span className="inline-flex items-center gap-1.5 font-hand-body text-[14px] text-[#615d59]">
          <span className="w-7 h-7 grid place-items-center sketch-border sketch-shadow bg-white font-hand-display text-[14px] font-bold text-[#213183] rotate-[-3deg]">
            管
          </span>
          管理员
        </span>
        <LogoutButton />
      </div>
    </header>
  );
}
