"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

// 搜索面板（cmdk / Command UI）按需加载，不进全站首屏 bundle
const SearchDialogInner = dynamic(
  () => import("@/components/search-dialog-inner"),
  { ssr: false }
);

// 悬停/聚焦触发按钮时预取 chunk，首次打开即可秒开
function prefetchPanel() {
  void import("@/components/search-dialog-inner");
}

export default function SearchDialog() {
  const [open, setOpen] = useState(false);
  // 首次打开后才挂载面板，避免拖累首屏；之后保留以支持关闭动画
  const [everOpened, setEverOpened] = useState(false);

  useEffect(() => {
    if (open) setEverOpened(true);
  }, [open]);

  // ⌘K / Ctrl+K 全局开合（Esc 关闭、点击外部关闭由 Dialog 内置处理）
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      {/* 触发按钮 */}
      <button
        onClick={() => setOpen(true)}
        onMouseEnter={prefetchPanel}
        onFocus={prefetchPanel}
        className="hidden md:flex items-center gap-2 px-3.5 py-1.5 bg-white sketch-border sketch-shadow font-hand-display text-[16px] text-ink-muted hover:text-primary hover:-translate-y-0.5 transition-[color,transform] rotate-[0.5deg]"
        aria-label="搜索"
      >
        <svg aria-hidden="true" className="w-4 h-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8">
          <circle cx="9" cy="9" r="5.5" />
          <path d="M13.5 13.5L17 17" strokeLinecap="round" />
        </svg>
        <span>搜索</span>
        <kbd aria-hidden="true" className="hidden sm:inline font-hand-body text-[12px] text-ink-faint border border-hairline rounded px-1">
          ⌘K
        </kbd>
      </button>
      {/* 移动端搜索图标按钮 */}
      <button
        onClick={() => setOpen(true)}
        onMouseEnter={prefetchPanel}
        onFocus={prefetchPanel}
        className="md:hidden flex items-center justify-center size-10 bg-white sketch-border sketch-shadow text-ink-muted hover:text-primary transition-colors rotate-[0.5deg]"
        aria-label="搜索"
      >
        <svg aria-hidden="true" className="w-5 h-5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8">
          <circle cx="9" cy="9" r="5.5" />
          <path d="M13.5 13.5L17 17" strokeLinecap="round" />
        </svg>
      </button>

      {everOpened && <SearchDialogInner open={open} onOpenChange={setOpen} />}
    </>
  );
}
