"use client";

import Link from "next/link";
import { useEffect } from "react";

/**
 * 前台/后台通用错误边界（App Router 约定文件）。
 * 捕获子树渲染抛出的错误，避免整页白屏；reset() 可重试当前路由。
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // 服务端已记录完整堆栈（带 digest），客户端仅保留摘要便于排查
    console.error("[app error]", error);
  }, [error]);

  return (
    <div className="graph-paper min-h-screen flex items-center justify-center p-6 font-hand-body text-ink-secondary">
      <div className="text-center fade-up">
        <div className="font-hand-display text-[88px] font-bold text-sticker-pink rotate-[-3deg] leading-none">
          ✕
        </div>
        <p className="mt-4 font-hand-display text-[24px] font-bold text-ink-secondary rotate-[-1deg]">
          出了一点小状况<span className="marker-highlight">（写歪了）</span>
        </p>
        <p className="mt-3 font-hand-body text-[15px] text-ink-faint max-w-100 mx-auto">
          页面加载时发生了错误，可以重试，或先返回首页。
        </p>
        {error.digest && (
          <p className="mt-2 font-mono text-[12px] text-ink-faint/70">
            错误编号：{error.digest}
          </p>
        )}
        <div className="mt-8 flex items-center justify-center gap-3">
          <button
            onClick={() => reset()}
            className="px-6 py-2.5 bg-primary text-white font-hand-display text-[19px] font-bold sketch-border sketch-shadow rotate-[-1deg] hover:rotate-0 transition-transform"
          >
            重试一下
          </button>
          <Link
            href="/"
            className="px-6 py-2.5 bg-white font-hand-display text-[19px] font-bold text-primary sketch-border sketch-shadow rotate-[1deg] hover:rotate-0 transition-transform"
          >
            ← 返回首页
          </Link>
        </div>
      </div>
    </div>
  );
}
