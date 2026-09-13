"use client";

import { useState } from "react";
import { toast } from "sonner";

/** 复制当前页面链接（文章详情页用） */
export default function ShareButton() {
  const [copied, setCopied] = useState(false);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      toast.success("链接已复制");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("复制失败，请手动复制地址栏链接");
    }
  };

  return (
    <button
      type="button"
      onClick={onCopy}
      title="复制本文链接"
      className="shrink-0 inline-flex items-center gap-1 font-hand-body text-[14px] px-2.5 py-1 bg-white sketch-border sketch-shadow text-ink-muted hover:text-primary hover:-translate-y-0.5 transition-transform"
    >
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {copied ? (
          <path d="M20 6 9 17l-5-5" />
        ) : (
          <>
            <path d="M10 13a5 5 0 0 0 7.07 0l3-3a5 5 0 0 0-7.07-7.07l-1 1" />
            <path d="M14 11a5 5 0 0 0-7.07 0l-3 3a5 5 0 0 0 7.07 7.07l1-1" />
          </>
        )}
      </svg>
      {copied ? "已复制" : "分享"}
    </button>
  );
}
