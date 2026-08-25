"use client";

import { useEffect, useRef, useState } from "react";
import type { TocItem } from "@/lib/toc";

interface ArticleTocProps {
  items: TocItem[];
}

export default function ArticleToc({ items }: ArticleTocProps) {
  const [activeId, setActiveId] = useState<string>("");
  const containerRef = useRef<HTMLElement>(null);
  const itemRefs = useRef<Map<string, HTMLAnchorElement>>(new Map());

  useEffect(() => {
    if (items.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) {
          setActiveId(visible[0].target.id);
        }
      },
      {
        rootMargin: "-80px 0px -70% 0px",
        threshold: [0, 1],
      }
    );

    for (const item of items) {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, [items]);

  useEffect(() => {
    if (!activeId) return;
    const container = containerRef.current;
    const activeEl = itemRefs.current.get(activeId);
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
  }, [activeId]);

  if (items.length === 0) return null;

  const handleClick = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      history.replaceState(null, "", `#${id}`);
    }
  };

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
          <ul className="space-y-0">
            {items.map((item) => {
              const isActive = activeId === item.id;
              const indent = (item.level - 1) * 8;
              return (
                <li key={item.id}>
                  <a
                    ref={(el) => {
                      if (el) itemRefs.current.set(item.id, el);
                      else itemRefs.current.delete(item.id);
                    }}
                    href={`#${item.id}`}
                    onClick={(e) => handleClick(e, item.id)}
                    className={`block font-hand-body text-[13px] leading-tight py-0.5 px-1.5 rounded-xs transition-colors truncate ${
                      isActive
                        ? "text-primary font-bold bg-primary/10"
                        : "text-ink-muted hover:text-primary hover:bg-white/60"
                    }`}
                    style={{ paddingLeft: `${indent + 6}px` }}
                    title={item.text}
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
