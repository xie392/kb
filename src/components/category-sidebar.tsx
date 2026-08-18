"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

interface CatNode {
  id: string;
  name: string;
  count: number;
  children: CatNode[];
}

interface ArticleLite {
  id: string;
  title: string;
  categoryId: string | null;
}

interface CategorySidebarProps {
  tree: CatNode[];
  articles: ArticleLite[];
}

function ArticleItem({
  article,
  isActive,
  depth,
}: {
  article: ArticleLite;
  isActive: boolean;
  depth: number;
}) {
  return (
    <Link
      href={`/article/${article.id}`}
      className={`block font-hand-body text-[13px] leading-tight py-0.5 px-1.5 rounded-xs transition-colors truncate ${
        isActive
          ? "bg-primary/10 text-primary font-bold"
          : "text-ink-muted hover:text-primary hover:bg-white/60"
      }`}
      style={{ paddingLeft: `${depth * 10 + 22}px` }}
      title={article.title}
    >
      {article.title}
    </Link>
  );
}

function CategoryNode({
  node,
  articlesByCat,
  activeArticleId,
  expandedIds,
  onToggle,
  depth,
}: {
  node: CatNode;
  articlesByCat: Map<string, ArticleLite[]>;
  activeArticleId: string | null;
  expandedIds: Set<string>;
  onToggle: (id: string) => void;
  depth: number;
}) {
  const catArticles = articlesByCat.get(node.id) ?? [];
  const hasContent = node.children.length > 0 || catArticles.length > 0;
  const expanded = expandedIds.has(node.id);

  return (
    <div>
      <button
        type="button"
        className="group w-full flex items-center gap-1 py-0.5 px-1 rounded-xs cursor-pointer hover:bg-white/60 transition-colors text-left"
        style={{ paddingLeft: `${depth * 10 + 2}px` }}
        onClick={() => hasContent && onToggle(node.id)}
        aria-expanded={expanded}
      >
        {hasContent ? (
          <span
            className={`w-3.5 h-3.5 shrink-0 grid place-items-center font-hand-display text-[10px] text-ink-faint transition-transform ${
              expanded ? "rotate-90" : ""
            }`}
          >
            ▸
          </span>
        ) : (
          <span className="w-3.5 h-3.5 shrink-0" />
        )}
        <span
          className="w-1.5 h-1.5 rounded-full shrink-0 rotate-12"
          style={{
            backgroundColor:
              depth === 0
                ? ["#0075de", "#ff64c8", "#2a9d99", "#dd5b00", "#62aef0"][
                    parseInt(node.id.slice(-2), 36) % 5
                  ]
                : "#a39e98",
          }}
        />
        <span
          className="flex-1 min-w-0 font-hand-display text-[14px] font-bold text-ink-secondary group-hover:text-primary transition-colors truncate"
          title={node.name}
        >
          {node.name}
        </span>
        <span className="shrink-0 font-hand-body text-[11px] text-ink-faint">
          {node.count}
        </span>
      </button>

      {expanded && (
        <div>
          {catArticles.map((a) => (
            <ArticleItem
              key={a.id}
              article={a}
              isActive={a.id === activeArticleId}
              depth={depth}
            />
          ))}
          {node.children.map((child) => (
            <CategoryNode
              key={child.id}
              node={child}
              articlesByCat={articlesByCat}
              activeArticleId={activeArticleId}
              expandedIds={expandedIds}
              onToggle={onToggle}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function CategorySidebar({ tree, articles }: CategorySidebarProps) {
  const pathname = usePathname();
  const match = pathname.match(/^\/article\/([^/]+)/);
  const activeArticleId = match ? match[1]! : null;

  const activeArticle = articles.find((a) => a.id === activeArticleId) ?? null;
  const activeCategoryId = activeArticle?.categoryId ?? null;

  const treeRef = useRef(tree);
  treeRef.current = tree;

  const articlesByCat = new Map<string, ArticleLite[]>();
  for (const a of articles) {
    if (!a.categoryId) continue;
    const arr = articlesByCat.get(a.categoryId) ?? [];
    arr.push(a);
    articlesByCat.set(a.categoryId, arr);
  }

  function collectPath(nodes: CatNode[], targetId: string, acc: Set<string>): boolean {
    for (const node of nodes) {
      if (node.id === targetId) {
        acc.add(node.id);
        return true;
      }
      if (collectPath(node.children, targetId, acc)) {
        acc.add(node.id);
        return true;
      }
    }
    return false;
  }

  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => {
    const initial = new Set<string>();
    if (activeCategoryId) {
      collectPath(tree, activeCategoryId, initial);
    }
    return initial;
  });

  useEffect(() => {
    if (!activeCategoryId) return;
    setExpandedIds((prev) => {
      if (prev.has(activeCategoryId)) return prev;
      const pathIds = new Set<string>();
      collectPath(treeRef.current, activeCategoryId, pathIds);
      const next = new Set(prev);
      for (const id of pathIds) next.add(id);
      return next;
    });
  }, [activeCategoryId]);

  const handleToggle = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const uncategorized = articles.filter((a) => !a.categoryId);

  return (
    <aside className="hidden xl:block w-55 shrink-0 sticky top-20 self-start max-h-[calc(100vh-100px)] overflow-y-auto">
      <div>
        <div className="font-hand-display text-[17px] font-bold text-secondary mb-2 flex items-center gap-2">
          <span className="w-5 h-5 grid place-items-center sketch-border bg-white text-[12px] rotate-[-3deg]">
            ☰
          </span>
          目录
        </div>
        <div className="sketch-dashed p-1.5 bg-white/50 space-y-0.5">
          <Link
            href="/"
            className="flex items-center gap-1.5 py-0.5 px-1.5 font-hand-body text-[13px] text-ink-muted hover:text-primary hover:bg-white/60 rounded-xs transition-colors"
          >
            <span aria-hidden="true">🏠</span> 首页
          </Link>
          {tree.map((node) => (
            <CategoryNode
              key={node.id}
              node={node}
              articlesByCat={articlesByCat}
              activeArticleId={activeArticleId}
              expandedIds={expandedIds}
              onToggle={handleToggle}
              depth={0}
            />
          ))}
          {uncategorized.length > 0 && (
            <div>
              <div
                className="flex items-center gap-1 py-0.5 px-1"
                style={{ paddingLeft: 2 }}
              >
                <span className="w-3.5 h-3.5 shrink-0" />
                <span className="w-1.5 h-1.5 rounded-full shrink-0 rotate-12 bg-ink-faint" />
                <span className="flex-1 font-hand-display text-[14px] font-bold text-ink-secondary">
                  未分类
                </span>
                <span className="text-[11px] font-hand-body text-ink-faint">
                  {uncategorized.length}
                </span>
              </div>
              {uncategorized.map((a) => (
                <ArticleItem
                  key={a.id}
                  article={a}
                  isActive={a.id === activeArticleId}
                  depth={0}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
