"use client";

import { useTheme } from "next-themes";
import gsap from "gsap";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

function SunIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      className={className}
      aria-hidden="true"
    >
      <circle cx="10" cy="10" r="3.6" />
      <path d="M10 1.8v2.1M10 16.1v2.1M1.8 10h2.1M16.1 10h2.1M4.2 4.2l1.5 1.5M14.3 14.3l1.5 1.5M15.8 4.2l-1.5 1.5M5.7 14.3l-1.5 1.5" />
    </svg>
  );
}

function MoonIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M16.1 12.1A6.5 6.5 0 0 1 7.9 3.9 6.5 6.5 0 1 0 16.1 12.1z" />
    </svg>
  );
}

/**
 * 主题切换按钮：默认跟随系统，点击在亮/暗之间切换。
 * 切换动画：一条半透明"马克笔"色条从屏幕左侧横扫到右侧，
 * 扫到屏幕中央时切换主题 —— 全程页面可见，不会出现整屏变黑。
 * 色条通过 portal 挂到 <body>，避免 sticky header 的 backdrop-filter
 * 变成 fixed 元素的包含块导致无法全屏。
 */
export default function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const sweepRef = useRef<HTMLDivElement>(null);
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (resolvedTheme) setIsDark(resolvedTheme === "dark");
  }, [resolvedTheme]);

  const handleToggle = (e: React.MouseEvent<HTMLButtonElement>) => {
    const target = isDark ? "light" : "dark";
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    // 动画不可用或色条未挂载时，直接切换
    if (reduceMotion || !sweepRef.current) {
      setTheme(target);
      return;
    }

    const el = sweepRef.current;
    const W = el.offsetWidth || 380;
    el.style.opacity = "1";

    let flipped = false;
    gsap.fromTo(
      el,
      { x: -W - 60, skewX: -7 },
      {
        x: window.innerWidth + 60,
        skewX: -7,
        duration: 0.9,
        ease: "power2.inOut",
        onUpdate: () => {
          // 色条扫过屏幕中央时切换主题，视觉上"主题跟着马克笔走"
          if (flipped) return;
          const cx = el.getBoundingClientRect().left + W / 2;
          if (cx >= window.innerWidth / 2) {
            flipped = true;
            setTheme(target);
          }
        },
        onComplete: () => {
          el.style.opacity = "0";
        },
      }
    );
  };

  return (
    <>
      <button
        type="button"
        onClick={handleToggle}
        className="p-2 text-ink-muted hover:text-primary transition-colors rotate-[0.5deg]"
        aria-label={isDark ? "切换到亮色模式" : "切换到暗色模式"}
        title={isDark ? "切换到亮色模式" : "切换到暗色模式"}
      >
        {isDark ? (
          <SunIcon className="w-5 h-5" />
        ) : (
          <MoonIcon className="w-5 h-5" />
        )}
      </button>
      {mounted &&
        createPortal(
          <div
            ref={sweepRef}
            className="pointer-events-none fixed top-0 bottom-0 left-0 z-[9999] opacity-0"
            style={{
              width: "min(46vw, 420px)",
              backgroundImage: [
                "repeating-linear-gradient(90deg, rgba(255,255,255,0.16) 0 3px, rgba(255,255,255,0) 3px 10px)",
                "linear-gradient(180deg, rgba(98,174,240,0.66) 0%, rgba(98,174,240,0.42) 100%)",
              ].join(", "),
            }}
            aria-hidden="true"
          />,
          document.body
        )}
    </>
  );
}
