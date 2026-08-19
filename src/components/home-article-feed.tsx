"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef } from "react";
import { formatDate } from "@/lib/format";
import { api } from "@/trpc/client";

interface FeedArticle {
  id: string;
  title: string;
  summary: string | null;
  categoryName: string | null;
  tagNames: string[];
  updatedAt: string | Date;
  isPinned: boolean;
}

function HandPost({ article, index }: { article: FeedArticle; index: number }) {
  return (
    <Link
      href={`/article/${article.id}`}
      className="group flex items-start gap-4 py-4 px-4 hover:bg-white/60 transition-colors"
    >
      <span className="w-10 h-10 shrink-0 grid place-items-center sketch-border sketch-shadow bg-white font-hand-display text-[18px] font-bold text-secondary rotate-[-3deg]">
        {String(index + 1).padStart(2, "0")}
      </span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          {article.categoryName && (
            <span className="font-hand-body text-[14px] px-1.5 text-sticker-pink">
              【{article.categoryName}】
            </span>
          )}
          {article.isPinned && (
            <span className="marker-highlight font-hand-display text-[13px] text-sticker-brown rotate-[-1deg]">
              ★ 置顶
            </span>
          )}
          <span className="font-hand-body text-[13px] text-ink-faint">
            {formatDate(String(article.updatedAt))}
          </span>
        </div>
        <h3 className="mt-1 font-hand-display text-[24px] font-bold leading-snug text-ink-secondary group-hover:text-primary transition-colors marker-underline inline-block">
          {article.title}
        </h3>
        {article.summary && (
          <p className="mt-1 font-hand-body text-[15px] text-ink-muted leading-relaxed line-clamp-2">
            {article.summary}
          </p>
        )}
        <div className="mt-2 flex items-center gap-2 flex-wrap">
          {article.tagNames.map((t) => (
            <span key={t} className="font-hand-body text-[13px] text-ink-faint">
              #{t}
            </span>
          ))}
          <span className="font-hand-display text-[14px] text-primary opacity-0 group-hover:opacity-100 transition-opacity">
            阅读 →
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function HomeArticleFeed({ featuredIds }: { featuredIds: string[] }) {
  const query = api.article.list.useInfiniteQuery(
    { status: "normal", pageSize: 20 },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
      initialCursor: 1,
    }
  );

  const featuredSet = useMemo(() => new Set(featuredIds), [featuredIds]);
  const articles = useMemo(
    () =>
      (query.data?.pages ?? [])
        .flatMap((p) => p.items)
        .filter((a) => !featuredSet.has(a.id)) as FeedArticle[],
    [query.data, featuredSet]
  );
  // 总数扣除上方「精选」已展示的文章，避免重复计数
  const total = Math.max(0, (query.data?.pages?.[0]?.total ?? 0) - featuredIds.length);
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

  return (
    <section className="max-w-250 mx-auto px-4 sm:px-6 pb-16">
      <div className="flex items-center gap-3 mb-4">
        <h2 className="font-hand-display text-[24px] font-bold text-secondary marker-underline inline-block">
          全部文章
        </h2>
        <span className="font-hand-body text-[15px] text-ink-faint">{total} 篇</span>
        <span className="flex-1 pencil-line h-[2px]" />
        <Link href="/favorites" className="font-hand-display text-[16px] text-primary hover:underline">
          收藏夹 →
        </Link>
      </div>

      {isLoading ? (
        <div className="py-20 text-center font-hand-body text-[15px] text-ink-faint">
          加载中…
        </div>
      ) : articles.length > 0 ? (
        <>
          <div className="bg-white sketch-border sketch-shadow divide-y divide-dashed divide-hairline">
            {articles.map((article, i) => (
              <HandPost key={article.id} article={article} index={i} />
            ))}
          </div>
          <div ref={sentinelRef} className="h-6" />
          <div className="pb-2 text-center font-hand-body text-[13px] text-ink-faint">
            {query.isFetchingNextPage
              ? "加载中…"
              : hasNextPage
                ? "继续向下滚动加载"
                : "已经到底啦"}
          </div>
        </>
      ) : (
        <div className="py-16 text-center font-hand-body text-[15px] text-ink-faint">
          还没有文章
        </div>
      )}
    </section>
  );
}