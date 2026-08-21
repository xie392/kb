"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Editor } from "@tiptap/react";
import { emojisToName } from "./emoji-data";
import { cn } from "@/lib/utils";

/** 工具栏 emoji 按钮：弹出浏览面板，点击插入到当前选区 */
export function EmojiPicker({ editor }: { editor: Editor }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return emojisToName;
    return emojisToName.filter((e) => e.name.includes(q));
  }, [query]);

  const insert = (emoji: string) => {
    editor.chain().focus().insertContent(emoji + " ").run();
    setOpen(false);
    setQuery("");
  };

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        title="插入 emoji"
        aria-label="插入 emoji"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => setOpen((v) => !v)}
        className="flex h-7 w-7 items-center justify-center rounded-md text-ink-secondary transition-colors hover:bg-canvas-soft"
      >
        <HandEmojiPicker />
      </button>
      {open && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1.5 z-50 w-72 rounded-lg border border-hairline bg-white p-2 sketch-border sketch-shadow">
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜索 emoji（英文）"
            className="mb-2 w-full rounded-md border border-hairline bg-canvas-soft/30 px-2 py-1 text-[12px] outline-none focus:border-primary"
          />
          <div className="scrollbar-wide grid max-h-[260px] grid-cols-8 gap-1 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="col-span-8 py-4 text-center text-xs text-ink-muted">没有匹配</div>
            ) : (
              filtered.map((item) => (
                <button
                  key={item.name}
                  type="button"
                  title={`:${item.name}:`}
                  onClick={() => insert(item.emoji)}
                  className="flex h-7 w-7 items-center justify-center rounded-md text-base transition-colors hover:bg-canvas-soft"
                >
                  {item.emoji}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function HandEmojiPicker() {
  return (
    <svg
      width={16}
      height={16}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="8" cy="8" r="6" />
      <circle cx="6" cy="6.5" r="0.6" fill="currentColor" stroke="none" />
      <circle cx="10" cy="6.5" r="0.6" fill="currentColor" stroke="none" />
      <path d="M5.5 9.5c1 1.4 4 1.4 5 0" />
    </svg>
  );
}

export default EmojiPicker;
