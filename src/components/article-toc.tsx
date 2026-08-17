"use client";

import { useEffect, useState } from "react";
import type { TocItem } from "@/lib/toc";

interface ArticleTocProps {
  items: TocItem[];
}

export default function ArticleToc({ items }: ArticleTocProps) {
  const [activeId, setActiveId] = useState<string>("");

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

  if (items.length === 0) return null;

  const handleClick = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top, behavior: "smooth" });
      history.replaceState(null, "", `#${id}`);
    }
  };

  return (
    <aside className="hidden xl:block w-[200px] shrink-0 sticky top-[80px] self-start max-h-[calc(100vh-100px)] overflow-y-auto">
      <div>
        <div className="font-hand-display text-[17px] font-bold text-[#213183] mb-2 flex items-center gap-2">
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
                    href={`#${item.id}`}
                    onClick={(e) => handleClick(e, item.id)}
                    className={`block font-hand-body text-[13px] leading-tight py-0.5 px-1.5 rounded-sm transition-colors truncate ${
                      isActive
                        ? "text-[#0075de] font-bold bg-[#0075de]/10"
                        : "text-[#615d59] hover:text-[#0075de] hover:bg-white/60"
                    }`}
                    style={{ paddingLeft: `${indent + 6}px` }}
                    title={item.text}
                  >
                    {item.level > 1 && <span className="text-[#a39e98] mr-0.5">·</span>}
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
