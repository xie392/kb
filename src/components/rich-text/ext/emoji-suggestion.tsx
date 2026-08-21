"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { FloatingMenu } from "@tiptap/react/menus";
import type { Editor } from "@tiptap/react";
import { emojiSearch } from "./emoji-data";
import { cn } from "@/lib/utils";

interface EmojiSuggestionState {
  active: boolean;
  query: string;
  from: number;
  to: number;
  key: string;
}

const INACTIVE: EmojiSuggestionState = {
  active: false,
  query: "",
  from: 0,
  to: 0,
  key: "",
};

/** 检测光标前是否为 ":name" 模式（段落内任意位置） */
export function getEmojiSuggestionState(editor: Editor): EmojiSuggestionState {
  const { state } = editor;
  const { $anchor, empty } = state.selection;
  if (!empty) return INACTIVE;

  const node = $anchor.parent;
  if (!node.isTextblock) return INACTIVE;

  const textBefore = node.textBetween(0, $anchor.parentOffset, "\n", "\n");
  const match = textBefore.match(/(^|\s):([a-z0-9_+-]*)$/i);
  if (!match) return INACTIVE;

  const query = match[2];
  // 已经插入空格/换行则不触发
  if (textBefore.endsWith(" :\n")) return INACTIVE;

  const from = $anchor.start() + match.index! + match[1].length + 1;
  const to = $anchor.pos;

  return { active: true, query, from, to, key: `${from}:${to}:${query}` };
}

export function EmojiSuggestion({ editor }: { editor: Editor | null }) {
  const [state, setState] = useState<EmojiSuggestionState>(INACTIVE);
  const [activeIndex, setActiveIndex] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);

  const items = useMemo(
    () => (state.active ? emojiSearch(state.query, 12) : []),
    [state]
  );

  useEffect(() => {
    if (!editor) return;
    const sync = () => {
      setState(getEmojiSuggestionState(editor));
      setActiveIndex(0);
    };
    sync();
    editor.on("update", sync);
    editor.on("selectionUpdate", sync);
    return () => {
      editor.off("update", sync);
      editor.off("selectionUpdate", sync);
    };
  }, [editor]);

  useEffect(() => {
    if (!listRef.current) return;
    const el = listRef.current.children[activeIndex] as HTMLElement | undefined;
    if (el) el.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  useEffect(() => {
    if (!editor) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      const current = getEmojiSuggestionState(editor);
      if (!current.active || items.length === 0) return;

      if (event.key === "ArrowDown") {
        event.preventDefault();
        setActiveIndex((i) => (i + 1) % items.length);
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        setActiveIndex((i) => (i - 1 + items.length) % items.length);
      } else if (event.key === "Enter") {
        event.preventDefault();
        insert(items[Math.min(activeIndex, items.length - 1)].emoji);
      } else if (event.key === "Escape") {
        event.preventDefault();
        setState(INACTIVE);
      }
    };
    editor.view.dom.addEventListener("keydown", handleKeyDown, true);
    return () => editor.view.dom.removeEventListener("keydown", handleKeyDown, true);
  }, [activeIndex, items, editor]);

  if (!editor) return null;

  const insert = (emoji: string) => {
    const current = getEmojiSuggestionState(editor);
    if (!current.active) return;
    editor.chain().focus().deleteRange({ from: current.from, to: current.to }).insertContent(emoji + " ").run();
  };

  return (
    <FloatingMenu
      editor={editor}
      options={{ placement: "bottom-start", offset: 4 }}
      className="z-50 w-56 rounded-lg border border-hairline bg-white sketch-border sketch-shadow p-1"
      shouldShow={({ editor: ed }) => getEmojiSuggestionState(ed).active}
    >
      {items.length === 0 ? (
        <div className="px-2 py-3 text-center text-xs text-ink-muted">
          没有匹配的 emoji
        </div>
      ) : (
        <div ref={listRef} className="scrollbar-wide max-h-[260px] overflow-y-auto">
          {items.map((item, index) => (
            <button
              key={item.name}
              type="button"
              onClick={() => insert(item.emoji)}
              className={cn(
                "flex w-full items-center gap-2 rounded-md px-2 py-1 text-left text-[13px] transition-colors hover:bg-canvas-soft",
                activeIndex === index && "bg-canvas-soft"
              )}
            >
              <span className="text-base">{item.emoji}</span>
              <span className="text-ink-muted">:{item.name}:</span>
            </button>
          ))}
        </div>
      )}
    </FloatingMenu>
  );
}

export default EmojiSuggestion;
