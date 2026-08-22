"use client";

import { useEffect, useMemo, useRef } from "react";
import { emojisToName } from "./emoji-data";
import { cn } from "@/lib/utils";

interface EmojiGridProps {
  query: string;
  onSelect: (emoji: string) => void;
  activeIndex: number;
  onActiveIndexChange: (index: number) => void;
  cols?: number;
  maxHeight?: number;
}

export function EmojiGrid({
  query,
  onSelect,
  activeIndex,
  onActiveIndexChange,
  cols = 8,
  maxHeight = 260,
}: EmojiGridProps) {
  const gridRef = useRef<HTMLDivElement>(null);

  const items = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return emojisToName;
    return emojisToName.filter((e) => e.name.includes(q));
  }, [query]);

  useEffect(() => {
    if (!gridRef.current) return;
    const el = gridRef.current.children[activeIndex] as HTMLElement | undefined;
    if (el) el.scrollIntoView({ block: "nearest" });
  }, [activeIndex, items.length]);

  useEffect(() => {
    if (activeIndex >= items.length) {
      onActiveIndexChange(0);
    }
  }, [items.length, activeIndex, onActiveIndexChange]);

  if (items.length === 0) {
    return (
      <div className="py-4 text-center text-xs text-ink-muted">没有匹配</div>
    );
  }

  return (
    <div
      ref={gridRef}
      className="scrollbar-wide grid gap-0.5 overflow-y-auto"
      style={{
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        maxHeight,
      }}
    >
      {items.map((item, index) => (
        <button
          key={item.name}
          type="button"
          title={`:${item.name}:`}
          onClick={() => onSelect(item.emoji)}
          onMouseEnter={() => onActiveIndexChange(index)}
          className={cn(
            "flex h-7 w-7 items-center justify-center rounded-md text-base transition-colors hover:bg-canvas-soft",
            activeIndex === index && "bg-canvas-soft ring-1 ring-primary",
          )}
        >
          {item.emoji}
        </button>
      ))}
    </div>
  );
}
