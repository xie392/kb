"use client";

import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Editor } from "@tiptap/react";
import { useEditorState } from "@tiptap/react";
import { cn } from "@/lib/utils";
import { ChevronRight, ChevronsDownUp, ChevronsUpDown, List } from "lucide-react";

/* ─── 独立 TOC 侧边面板 ───
 * - 自行从 doc 收集 heading
 * - IntersectionObserver 高亮当前可见标题
 * - 支持层级折叠/展开、全部折叠/展开
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
  emptyText?: string;
  /** 是否显示头部标题和工具栏 */
  showHeader?: boolean;
  /** 头部右侧自定义内容（用于放关闭按钮等） */
  headerExtra?: React.ReactNode;
}

interface TreeNode extends TocHeading {
  children: TreeNode[];
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

function buildTree(headings: TocHeading[]): TreeNode[] {
  const root: TreeNode[] = [];
  const stack: TreeNode[] = [];

  for (const h of headings) {
    const node: TreeNode = { ...h, children: [] };
    while (stack.length > 0 && stack[stack.length - 1]!.level >= h.level) {
      stack.pop();
    }
    if (stack.length === 0) {
      root.push(node);
    } else {
      stack[stack.length - 1]!.children.push(node);
    }
    stack.push(node);
  }
  return root;
}

function getParentIds(tree: TreeNode[], targetId: string, parents: string[] = []): string[] | null {
  for (const node of tree) {
    if (node.id === targetId) return parents;
    if (node.children.length > 0) {
      const found = getParentIds(node.children, targetId, [...parents, node.id]);
      if (found) return found;
    }
  }
  return null;
}

function getAllParentIds(tree: TreeNode[]): string[] {
  const ids: string[] = [];
  for (const n of tree) {
    if (n.children.length > 0) {
      ids.push(n.id);
      ids.push(...getAllParentIds(n.children));
    }
  }
  return ids;
}

function TocNode({
  node,
  depth,
  activeId,
  collapsed,
  toggleCollapse,
  onJump,
}: {
  node: TreeNode;
  depth: number;
  activeId: string;
  collapsed: Set<string>;
  toggleCollapse: (id: string) => void;
  onJump: (pos: number) => void;
}) {
  const hasChildren = node.children.length > 0;
  const isCollapsed = collapsed.has(node.id);
  const isActive = activeId === node.id;
  const paddingLeft = 8 + depth * 12;

  return (
    <div>
      <div className="flex items-center group">
        {hasChildren ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              toggleCollapse(node.id);
            }}
            className="shrink-0 w-5 h-5 grid place-items-center text-ink-faint hover:text-ink-secondary transition-colors"
          >
            <ChevronRight
              className={cn(
                "w-3.5 h-3.5 transition-transform",
                !isCollapsed && "rotate-90",
              )}
            />
          </button>
        ) : (
          <span className="w-5 h-5 shrink-0" />
        )}
        <button
          type="button"
          onClick={() => onJump(node.pos)}
          style={{ paddingLeft }}
          className={cn(
            "flex-1 text-left text-[13px] py-1 pr-2 rounded-md transition-colors truncate border-l-2",
            isActive
              ? "bg-primary/10 text-primary border-primary font-medium"
              : "border-transparent hover:bg-canvas-soft",
            !isActive && depth === 0 && "text-ink-secondary font-semibold",
            !isActive && depth === 1 && "text-ink-muted",
            !isActive && depth >= 2 && "text-ink-faint text-[12px]",
          )}
          title={node.text}
        >
          {node.text}
        </button>
      </div>
      {hasChildren && !isCollapsed && (
        <div>
          {node.children.map((child) => (
            <TocNode
              key={child.id}
              node={child}
              depth={depth + 1}
              activeId={activeId}
              collapsed={collapsed}
              toggleCollapse={toggleCollapse}
              onJump={onJump}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export const TocPanel = memo(function TocPanel({
  editor,
  onItemClick,
  className,
  emptyText = "添加标题后会自动生成目录",
  showHeader = true,
  headerExtra,
}: TocPanelProps) {
  const headings: TocHeading[] = useEditorState({
    editor,
    selector: ({ editor: ed }) => (ed ? collectHeadings(ed) : []),
  }) ?? [];

  const [activeIdx, setActiveIdx] = useState(-1);
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const containerRef = useRef<HTMLDivElement | null>(null);

  const tree = useMemo(() => buildTree(headings), [headings]);
  const allParentIds = useMemo(() => getAllParentIds(tree), [tree]);
  const isAllCollapsed = allParentIds.length > 0 && allParentIds.every(id => collapsed.has(id));
  const activeId = headings[activeIdx]?.id ?? "";

  // 自动展开当前激活项的所有父级
  useEffect(() => {
    if (!activeId || headings.length === 0) return;
    const parentIds = getParentIds(tree, activeId);
    if (!parentIds) return;

    setCollapsed((prev) => {
      const next = new Set(prev);
      for (const pid of parentIds) {
        next.delete(pid);
      }
      return next;
    });
  }, [activeId, tree, headings]);

  // 监听编辑器 DOM 中的标题进入视口
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

    // 查找 pos 对应的实际 heading DOM 节点
    const resolved = editor.state.doc.resolve(pos);
    const node = resolved.depth >= 0 ? editor.view.nodeDOM(pos) : null;
    const headingEl = node instanceof HTMLElement ? node.closest("h1,h2,h3,h4,h5,h6") as HTMLElement | null : null;

    if (!headingEl) return;

    editor.commands.setTextSelection(pos + 1);
    editor.commands.focus();

    requestAnimationFrame(() => {
      const scroller = document.querySelector<HTMLElement>("[data-editor-scroll]");
      if (scroller) {
        const scrollerRect = scroller.getBoundingClientRect();
        const nodeRect = headingEl.getBoundingClientRect();
        const target = nodeRect.top - scrollerRect.top + scroller.scrollTop - 80;
        scroller.scrollTo({ top: target, behavior: "smooth" });
      } else {
        headingEl.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
    onItemClick?.();
  };

  const toggleCollapse = useCallback((id: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const toggleAll = useCallback(() => {
    if (isAllCollapsed) {
      setCollapsed(new Set());
    } else {
      setCollapsed(new Set(allParentIds));
    }
  }, [isAllCollapsed, allParentIds]);

  if (headings.length === 0) {
    return (
      <div ref={containerRef} className={cn("flex flex-col", className)}>
        {showHeader && (
          <div className="flex items-center justify-between mb-3">
            <div className="text-[12px] font-semibold text-ink-faint uppercase tracking-wider flex items-center gap-1.5">
              <List className="w-3.5 h-3.5" />
              大纲
            </div>
            {headerExtra}
          </div>
        )}
        <div className="text-[13px] text-ink-faint">{emptyText}</div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className={cn("flex flex-col", className)}>
      {showHeader && (
        <div className="flex items-center justify-between mb-2">
          <div className="text-[12px] font-semibold text-ink-faint uppercase tracking-wider flex items-center gap-1.5">
            <List className="w-3.5 h-3.5" />
            大纲
          </div>
          <div className="flex items-center gap-1">
            {allParentIds.length > 0 && (
              <button
                type="button"
                onClick={toggleAll}
                className="text-ink-faint hover:text-ink-secondary transition-colors p-1 -m-1"
                title={isAllCollapsed ? "展开全部" : "折叠全部"}
              >
                {isAllCollapsed ? (
                  <ChevronsUpDown className="w-3.5 h-3.5" />
                ) : (
                  <ChevronsDownUp className="w-3.5 h-3.5" />
                )}
              </button>
            )}
            {headerExtra}
          </div>
        </div>
      )}
      <div className="flex flex-col gap-0.5">
        {tree.map((node) => (
          <TocNode
            key={node.id}
            node={node}
            depth={0}
            activeId={activeId}
            collapsed={collapsed}
            toggleCollapse={toggleCollapse}
            onJump={jump}
          />
        ))}
      </div>
    </div>
  );
});

export default TocPanel;
