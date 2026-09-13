"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { TocItem } from "@/lib/toc";

interface ArticleTocProps {
  items: TocItem[];
}

// 高亮判定线：与全局 scroll-padding-top(80px) 大致对齐，
// 标题顶部越过这条线即视为"当前章节"。
const ACTIVE_LINE = 96;

// 正文标题选择器：只取只读正文区内的标题（不含文章大标题）。
//
// 这里刻意"按文档顺序 + 索引"匹配，而不是依赖 id：
// 标题 id 需要由客户端写入 ProseMirror 托管的 DOM，而 UniqueID 扩展挂载后会用
// 重试事务补 `data-id`（见 tipkit unique-id.ts 的 onCreate/attempt），ProseMirror
// 随之重渲染这些标题节点，手写上去的 id 会被抹掉 —— 于是 getElementById 拿不到元素，
// 目录高亮算不出当前章节、点击跳转也失效。
// emitOutline 遍历文档顺序、DOM 渲染同样是文档顺序，因此索引匹配稳定可靠。
const HEADING_SELECTOR = [
  ".tk-readonly h1",
  ".tk-readonly h2",
  ".tk-readonly h3",
  ".tk-readonly h4",
  ".tk-readonly h5",
  ".tk-readonly h6",
].join(", ");

/** 取只读正文区的标题元素（文档顺序，与 items 一一对应） */
function resolveHeadings(): HTMLElement[] {
  if (typeof document === "undefined") return [];
  return Array.from(document.querySelectorAll<HTMLElement>(HEADING_SELECTOR));
}

export default function ArticleToc({ items }: ArticleTocProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLElement>(null);
  const itemRefs = useRef<Map<number, HTMLAnchorElement>>(new Map());
  const rafRef = useRef<number | null>(null);

  // 基于滚动位置计算当前章节：取最后一个"顶部已越过判定线"的标题。
  // 不依赖窄判定带（IntersectionObserver 那版在正文顶部/标题附近完全没有高亮），
  // 也不依赖 entries 的增量状态，滚动过程中不会丢；未滚到第一个标题时兜底第 0 项。
  const computeActive = useCallback(() => {
    if (items.length === 0) return;
    const headings = resolveHeadings();
    let current = 0;
    for (let i = 0; i < items.length; i++) {
      const el = headings[i];
      if (!el) continue;
      if (el.getBoundingClientRect().top <= ACTIVE_LINE) {
        current = i;
      } else {
        // 标题按文档顺序排列，后面的只会更靠下，可提前结束
        break;
      }
    }
    setActiveIndex(current);
  }, [items]);

  useEffect(() => {
    if (items.length === 0) return;

    const schedule = () => {
      if (rafRef.current !== null) return;
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        computeActive();
      });
    };

    schedule();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);

    // 只读正文在挂载后才被 TipTap 接管（SSR 首屏是 dangerouslySetInnerHTML 的占位 DOM，
    // 之后整块被替换），结构变化时重算一次，避免用了旧节点。
    const mo = new MutationObserver(schedule);
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      mo.disconnect();
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, [items, computeActive]);

  // 高亮项若滚出目录可视区，自动把目录滚到中间
  useEffect(() => {
    const container = containerRef.current;
    const activeEl = itemRefs.current.get(activeIndex);
    if (!container || !activeEl) return;

    const containerRect = container.getBoundingClientRect();
    const itemRect = activeEl.getBoundingClientRect();

    if (
      itemRect.top < containerRect.top + 8 ||
      itemRect.bottom > containerRect.bottom - 8
    ) {
      const targetTop =
        activeEl.offsetTop - container.clientHeight / 2 + activeEl.clientHeight / 2;
      container.scrollTo({ top: targetTop, behavior: "smooth" });
    }
  }, [activeIndex]);

  const handleClick = (e: React.MouseEvent, index: number) => {
    e.preventDefault();
    const el = resolveHeadings()[index];
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      history.replaceState(null, "", `#${items[index]?.id ?? ""}`);
    }
  };

  const setItemRef = useCallback(
    (index: number) => (el: HTMLAnchorElement | null) => {
      if (el) itemRefs.current.set(index, el);
      else itemRefs.current.delete(index);
    },
    [],
  );

  if (items.length === 0) {
    return (
      <aside className="hidden xl:block w-50 shrink-0" />
    );
  }

  return (
    <aside
      ref={containerRef}
      className="hidden xl:block w-50 shrink-0 sticky top-20 self-start max-h-[calc(100vh-100px)] overflow-y-auto toc-scrollbar-hide"
    >
      <div>
        <div className="font-hand-display text-[17px] font-bold text-secondary mb-2 flex items-center gap-2">
          <span className="w-5 h-5 grid place-items-center sketch-border-2 bg-white text-[12px] rotate-[2deg]">
            ¶
          </span>
          本文目录
        </div>
        <nav className="sketch-dashed p-1.5 bg-white/50">
          {/* list-none：去掉 ul/li 默认小黑点 */}
          <ul className="space-y-0 list-none">
            {items.map((item, index) => {
              const isActive = activeIndex === index;
              const indent = (item.level - 1) * 8;
              return (
                <li key={item.id}>
                  <a
                    ref={setItemRef(index)}
                    href={`#${item.id}`}
                    onClick={(e) => handleClick(e, index)}
                    className={`block font-hand-body text-[13px] leading-tight py-0.5 px-1.5 rounded-xs transition-colors truncate ${
                      isActive
                        ? "text-primary font-bold bg-primary/10"
                        : "text-ink-muted hover:text-primary hover:bg-white/60"
                    }`}
                    style={{ paddingLeft: `${indent + 6}px` }}
                    title={item.text}
                    aria-current={isActive ? "location" : undefined}
                  >
                    {item.level > 1 && <span className="text-ink-faint mr-0.5">·</span>}
                    {item.text}
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </aside>
  );
}
