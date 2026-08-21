"use client";

import { memo, useEffect, useMemo, useRef, useState } from "react";
import type { Editor } from "@tiptap/react";
import { useEditorState } from "@tiptap/react";
import { cn } from "@/lib/utils";

/* ─── 独立 TOC 侧边面板 ───
 * 照搬 demo/knloop-web-dev/components/TableOfContents 的思路，
 * 但**不依赖** `@tiptap-pro/extension-table-of-contents`：
 * - 自行从 doc 收集 heading（id/textContent/level/pos）
 * - 用 IntersectionObserver 高亮当前最靠上的可见标题
 *
 * 用法：
 *   <TocPanel editor={editor} onItemClick={() =>侧栏收起} />
 * 容器外层（width/position/背景）由调用方决定，本组件只负责列表。
 */

export interface TocHeading {
  id: string;
  text: string;
  level: number;
  pos: number;
}

export interface TocPanelProps {
  editor: Editor | null;
  onItemClick?: () => void;
  className?: string;
  /** 自定义空状态文案 */
  emptyText?: string;
}

function collectHeadings(editor: Editor): TocHeading[] {
  const items: TocHeading[] = [];
  editor.state.doc.descendants((node, pos) => {
    if (node.type.name === "heading") {
      items.push({
        id: `toc-${pos}`,
        text: node.textContent.slice(0, 80) || "（空标题）",
        level: node.attrs.level as number,
        pos,
      });
    }
    return true;
  });
  return items;
}

export const TocPanel = memo(function TocPanel({
  editor,
  onItemClick,
  className,
  emptyText = "添加标题后会自动生成目录",
}: TocPanelProps) {
  const headings: TocHeading[] = useEditorState({
    editor,
    selector: ({ editor: ed }) => (ed ? collectHeadings(ed) : []),
  }) ?? [];

  const [activeIdx, setActiveIdx] = useState(-1);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // 监听编辑器 DOM 中的标题进入视口，激活最靠上的可见标题
  useEffect(() => {
    if (!editor || headings.length === 0) {
      setActiveIdx(-1);
      return;
    }
    const root = editor.view.dom;
    const headingEls = Array.from(
      root.querySelectorAll<HTMLElement>("h1, h2, h3, h4, h5, h6"),
    );
    if (headingEls.length === 0) return;

    const visibleIdx = new Set<number>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const ent of entries) {
          const idx = headingEls.indexOf(ent.target as HTMLElement);
          if (idx === -1) continue;
          if (ent.isIntersecting) visibleIdx.add(idx);
          else visibleIdx.delete(idx);
        }
        const candidates = Array.from(visibleIdx).sort((a, b) => a - b);
        let next = candidates[0];
        if (next === undefined) {
          // 无可见标题：回退到首个已滚出顶部的标题（说明它在视口上方）
          next = headingEls.findIndex((h) => {
            const r = h.getBoundingClientRect();
            return r.bottom < 120;
          });
        }
        if (next !== undefined && next !== -1) setActiveIdx(next);
      },
      {
        rootMargin: "-120px 0px -60px 0px",
        threshold: [0, 1],
      },
    );
    headingEls.forEach((h) => observer.observe(h));
    return () => observer.disconnect();
  }, [editor, headings]);

  const jump = (pos: number) => {
    if (!editor) return;
    editor.commands.setNodeSelection(pos);
    editor.commands.focus();
    requestAnimationFrame(() => {
      const res = editor.view.domAtPos(pos);
      const node = res.node as unknown;
      if (node instanceof Element) {
        node.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
    onItemClick?.();
  };

  const levels = useMemo(() => headings.map((h) => h.level), [headings]);

  if (headings.length === 0) {
    return (
      <div className={cn("text-[13px] text-ink-faint", className)}>
        {emptyText}
      </div>
    );
  }

  return (
    <div ref={containerRef} className={cn("flex flex-col gap-0.5", className)}>
      {headings.map((item, idx) => {
        const isActive = idx === activeIdx;
        const level = levels[idx];
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => jump(item.pos)}
            className={cn(
              "block w-full text-left text-[13px] py-1.5 px-2 rounded-md transition-colors truncate border-l-2",
              isActive
                ? "bg-primary/10 text-primary border-primary font-medium"
                : "border-transparent hover:bg-canvas-soft",
              !isActive && level === 1 && "text-ink-secondary font-semibold",
              !isActive && level === 2 && "text-ink-muted pl-4",
              !isActive && level >= 3 && "text-ink-faint pl-6",
            )}
            title={item.text}
          >
            {item.text}
          </button>
        );
      })}
    </div>
  );
});

export default TocPanel;
