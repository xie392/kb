"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { FloatingMenu } from "@tiptap/react/menus";
import type { Editor } from "@tiptap/react";

export interface WikiTarget {
  id: string;
  title: string;
}

interface WikiSuggestionState {
  active: boolean;
  query: string;
  from: number;
  to: number;
}

const INACTIVE: WikiSuggestionState = { active: false, query: "", from: 0, to: 0 };

/** 检测光标前是否存在未闭合的 `[[查询词` */
export function getWikiSuggestionState(editor: Editor): WikiSuggestionState {
  const { state } = editor;
  const { $anchor, empty } = state.selection;
  if (!empty) return INACTIVE;

  const node = $anchor.parent;
  if (!node.isTextblock) return INACTIVE;

  const textBefore = node.textBetween(0, $anchor.parentOffset, "\n", "\n");
  const match = textBefore.match(/\[\[([^[\]\n]*)$/);
  if (!match) return INACTIVE;

  const from = $anchor.start() + match.index!;
  return { active: true, query: match[1], from, to: $anchor.pos };
}

interface Props {
  editor: Editor | null;
  /** 按关键词查询候选笔记（由外部注入，保持 rich-text 目录不耦合数据层） */
  search: (query: string) => Promise<WikiTarget[]>;
}

/** `[[` 触发的双向链接补全浮层 */
export function WikiSuggestion({ editor, search }: Props) {
  const [state, setState] = useState<WikiSuggestionState>(INACTIVE);
  const [items, setItems] = useState<WikiTarget[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const stateRef = useRef(state);
  stateRef.current = state;
  const itemsRef = useRef(items);
  itemsRef.current = items;

  // 跟踪光标位置，判断是否进入 [[ 补全态
  useEffect(() => {
    if (!editor) return;
    const sync = () => {
      setState(getWikiSuggestionState(editor));
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

  // 关键词变化时（防抖）拉取候选
  useEffect(() => {
    if (!state.active) {
      setItems([]);
      return;
    }
    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        const result = await search(state.query);
        if (!cancelled) setItems(result);
      } catch {
        if (!cancelled) setItems([]);
      }
    }, 150);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [state.active, state.query, search]);

  const insert = useCallback(
    (target: WikiTarget) => {
      if (!editor) return;
      const current = stateRef.current;
      if (!current.active) return;
      editor
        .chain()
        .focus()
        .insertContentAt(
          { from: current.from, to: current.to },
          `[[${target.title}]] `,
        )
        .run();
    },
    [editor],
  );

  // 键盘导航：捕获阶段拦截，避免 ProseMirror 先处理
  useEffect(() => {
    if (!editor) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      const current = stateRef.current;
      const list = itemsRef.current;
      if (!current.active || list.length === 0) return;

      if (event.key === "ArrowDown") {
        event.preventDefault();
        setActiveIndex((i) => (i + 1) % list.length);
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        setActiveIndex((i) => (i - 1 + list.length) % list.length);
      } else if (event.key === "Enter" || event.key === "Tab") {
        event.preventDefault();
        insert(list[Math.min(activeIndex, list.length - 1)]);
      } else if (event.key === "Escape") {
        event.preventDefault();
        setState(INACTIVE);
      }
    };
    editor.view.dom.addEventListener("keydown", handleKeyDown, true);
    return () => editor.view.dom.removeEventListener("keydown", handleKeyDown, true);
  }, [activeIndex, editor, insert]);

  if (!editor) return null;

  return (
    <FloatingMenu
      editor={editor}
      options={{ placement: "bottom-start", offset: 4 }}
      className="z-50 w-72 rounded-lg border border-hairline bg-white p-1.5 sketch-border sketch-shadow"
      shouldShow={({ editor: ed }) => getWikiSuggestionState(ed).active}
    >
      <div className="px-2 py-1 font-hand-body text-[12px] text-ink-faint">
        链接到笔记
      </div>
      {items.length === 0 ? (
        <div className="px-2 py-3 font-hand-body text-[13px] text-ink-faint text-center">
          没有匹配的笔记
        </div>
      ) : (
        <ul className="list-none max-h-64 overflow-y-auto">
          {items.map((item, i) => (
            <li key={item.id}>
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  insert(item);
                }}
                onMouseEnter={() => setActiveIndex(i)}
                className={`w-full text-left px-2 py-1.5 rounded-[6px] font-hand-display text-[15px] transition-colors ${
                  i === activeIndex
                    ? "bg-canvas-soft text-primary"
                    : "text-ink-secondary hover:bg-canvas-soft/60"
                }`}
              >
                <span className="line-clamp-1">{item.title}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </FloatingMenu>
  );
}

export default WikiSuggestion;
