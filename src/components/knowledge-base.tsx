"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import { api } from "@/trpc/client";

interface CatNode {
  id: string;
  name: string;
  count: number;
  children: CatNode[];
}

interface FeedArticle {
  id: string;
  title: string;
  summary: string | null;
  categoryName: string | null;
  tagNames: string[];
  updatedAt: string | Date;
  isPinned: boolean;
}

const DOT_COLORS = ["#0075de", "#ff64c8", "#2a9d99", "#dd5b00", "#62aef0"];

function countNodes(nodes: CatNode[]): number {
  return nodes.reduce((sum, n) => sum + 1 + countNodes(n.children), 0);
}

function collectAncestors(nodes: CatNode[], targetId: string, acc: string[]): boolean {
  for (const n of nodes) {
    if (n.id === targetId) return true;
    if (collectAncestors(n.children, targetId, acc)) {
      acc.unshift(n.id);
      return true;
    }
  }
  return false;
}

function findName(nodes: CatNode[], id: string): string | null {
  for (const n of nodes) {
    if (n.id === id) return n.name;
    const hit = findName(n.children, id);
    if (hit) return hit;
  }
  return null;
}

function TreeNode({
  node,
  depth,
  selectedId,
  expandedIds,
  onSelect,
  onToggle,
}: {
  node: CatNode;
  depth: number;
  selectedId: string | null;
  expandedIds: Set<string>;
  onSelect: (id: string) => void;
  onToggle: (id: string) => void;
}) {
  const hasChildren = node.children.length > 0;
  const expanded = expandedIds.has(node.id);
  const selected = selectedId === node.id;

  return (
    <div>
      <div className="flex items-center gap-0.5" style={{ paddingLeft: depth * 12 }}>
        <button
          type="button"
          onClick={() => hasChildren && onToggle(node.id)}
          aria-label={hasChildren ? (expanded ? "收起" : "展开") : undefined}
          className="w-4 h-4 shrink-0 grid place-items-center text-[10px] text-ink-faint"
        >
          {hasChildren ? (expanded ? "▾" : "▸") : ""}
        </button>
        <button
          type="button"
          onClick={() => onSelect(node.id)}
          className={cn(
            "flex-1 flex items-center gap-1.5 px-1.5 py-1 rounded-xs text-left transition-colors",
            selected ? "bg-primary/10" : "hover:bg-white/60"
          )}
        >
          <span
            className="w-1.5 h-1.5 rounded-full shrink-0 rotate-12"
            style={{ backgroundColor: DOT_COLORS[depth % DOT_COLORS.length] }}
          />
          <span
            className={cn(
              "flex-1 min-w-0 font-hand-display text-[14px] font-bold truncate",
              selected ? "text-primary" : "text-ink-secondary"
            )}
            title={node.name}
          >
            {node.name}
          </span>
          <span className="shrink-0 font-hand-body text-[11px] text-ink-faint tabular-nums">
            {node.count}
          </span>
        </button>
      </div>
      {hasChildren && expanded && (
        <div>
          {node.children.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              depth={depth + 1}
              selectedId={selectedId}
              expandedIds={expandedIds}
              onSelect={onSelect}
              onToggle={onToggle}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ArticleRow({ article }: { article: FeedArticle }) {
  return (
    <Link
      href={`/article/${article.id}`}
      className="group flex items-start gap-4 py-4 px-4 sm:px-5 hover:bg-white/60 transition-colors"
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          {article.categoryName && (
            <span className="font-hand-body text-[13px] text-sticker-pink">
              【{article.categoryName}】
            </span>
          )}
          {article.isPinned && (
            <span className="marker-highlight font-hand-display text-[12px] text-sticker-brown rotate-[-1deg]">
              ★ 置顶
            </span>
          )}
          <span className="font-hand-body text-[13px] text-ink-faint tabular-nums">
            {formatDate(String(article.updatedAt))}
          </span>
        </div>
        <h3 className="mt-1 font-hand-display text-[20px] font-bold leading-snug text-ink-secondary group-hover:text-primary transition-colors">
          {article.title}
        </h3>
        {article.summary && (
          <p className="mt-1 font-hand-body text-[14px] text-ink-muted leading-relaxed line-clamp-2">
            {article.summary}
          </p>
        )}
        {article.tagNames.length > 0 && (
          <div className="mt-1.5 flex items-center gap-2 flex-wrap">
            {article.tagNames.slice(0, 3).map((t) => (
              <span key={t} className="font-hand-body text-[12px] text-ink-faint">
                #{t}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}

export default function KnowledgeBase({
  tree,
  initialCategoryId,
}: {
  tree: CatNode[];
  initialCategoryId: string | null;
}) {
  const [selectedId, setSelectedId] = useState<string | null>(
    initialCategoryId && findName(tree, initialCategoryId) ? initialCategoryId : null
  );
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => {
    const acc: string[] = [];
    if (initialCategoryId) collectAncestors(tree, initialCategoryId, acc);
    return new Set(acc);
  });

  const query = api.article.list.useInfiniteQuery(
    { status: "normal", categoryId: selectedId ?? undefined, pageSize: 20 },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
      initialCursor: 1,
    }
  );

  const articles = useMemo(
    () => (query.data?.pages ?? []).flatMap((p) => p.items) as FeedArticle[],
    [query.data]
  );
  const total = query.data?.pages?.[0]?.total ?? 0;
  const hasNextPage = query.hasNextPage === true;
  const isLoading = query.isLoading;

  const sentinelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasNextPage && !query.isFetchingNextPage) {
          void query.fetchNextPage();
        }
      },
      { rootMargin: "240px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasNextPage, query.isFetchingNextPage, query.fetchNextPage]);

  const toggle = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectedName = selectedId ? findName(tree, selectedId) : null;

  return (
    <div className="max-w-250 mx-auto px-4 sm:px-6 py-10">
      <header className="mb-8 text-center pt-4 fade-up">
        <h1 className="font-hand-display text-[40px] font-bold text-secondary rotate-[-1deg]">
          知识库
        </h1>
        <p className="mt-2 font-hand-body text-[16px] text-ink-muted">
          按目录归档所有笔记，共 {countNodes(tree)} 个分类
        </p>
      </header>

      <div className="flex gap-6 items-start">
        {/* 目录树（桌面端） */}
        <aside className="hidden md:block w-60 shrink-0 sticky top-20 max-h-[calc(100vh-100px)] overflow-y-auto">
          <div className="bg-white sketch-border sketch-shadow p-2.5 space-y-0.5">
            <button
              type="button"
              onClick={() => setSelectedId(null)}
              className={cn(
                "w-full flex items-center gap-1.5 px-1.5 py-1 rounded-xs text-left transition-colors",
                selectedId === null ? "bg-primary/10" : "hover:bg-white/60"
              )}
            >
              <span aria-hidden="true">🏠</span>
              <span
                className={cn(
                  "flex-1 font-hand-display text-[14px] font-bold",
                  selectedId === null ? "text-primary" : "text-ink-secondary"
                )}
              >
                全部笔记
              </span>
            </button>
            {tree.map((node) => (
              <TreeNode
                key={node.id}
                node={node}
                depth={0}
                selectedId={selectedId}
                expandedIds={expandedIds}
                onSelect={setSelectedId}
                onToggle={toggle}
              />
            ))}
          </div>
        </aside>

        <section className="flex-1 min-w-0">
          {/* 移动端分类胶囊 */}
          <div className="md:hidden flex gap-2 overflow-x-auto pb-3 mb-4 -mx-1 px-1">
            <button
              type="button"
              onClick={() => setSelectedId(null)}
              className={cn(
                "shrink-0 font-hand-display text-[15px] px-3.5 py-1 bg-white sketch-border sketch-shadow",
                selectedId === null ? "text-primary font-bold" : "text-ink-muted"
              )}
            >
              全部
            </button>
            {tree.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setSelectedId(c.id)}
                className={cn(
                  "shrink-0 font-hand-display text-[15px] px-3.5 py-1 bg-white sketch-border sketch-shadow",
                  selectedId === c.id ? "text-primary font-bold" : "text-ink-muted"
                )}
              >
                {c.name}
              </button>
            ))}
          </div>

          {/* 当前目录标题 */}
          <div className="flex items-center gap-3 mb-4">
            <h2 className="font-hand-display text-[22px] font-bold text-ink-secondary">
              {selectedName ?? "全部笔记"}
            </h2>
            <span className="font-hand-body text-[13px] text-ink-faint tabular-nums">
              {total} 篇
            </span>
            <span className="flex-1 pencil-line h-[2px]" />
          </div>

          {/* 文章流 */}
          {isLoading ? (
            <div className="py-20 text-center font-hand-body text-[15px] text-ink-faint">
              加载中…
            </div>
          ) : articles.length > 0 ? (
            <>
              <div className="bg-white sketch-border sketch-shadow divide-y divide-dashed divide-hairline">
                {articles.map((article) => (
                  <ArticleRow key={article.id} article={article} />
                ))}
              </div>
              <div ref={sentinelRef} className="h-6" />
              <div className="pb-6 text-center font-hand-body text-[13px] text-ink-faint">
                {query.isFetchingNextPage
                  ? "加载中…"
                  : hasNextPage
                    ? "继续向下滚动加载"
                    : "已经到底啦"}
              </div>
            </>
          ) : (
            <div className="py-20 text-center">
              <div className="font-hand-display text-[22px] font-bold text-ink-faint rotate-[-1deg]">
                该目录下暂无笔记
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}