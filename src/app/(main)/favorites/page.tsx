import Link from "next/link";
import { formatDate } from "@/lib/format";
import { createServerCaller } from "@/trpc/server";

export default async function FavoritesPage() {
  const caller = await createServerCaller();
  const list = await caller.article.list({ status: "normal", page: 1, pageSize: 100 });
  const favorites = list.items.filter((a) => a.isFavorite);

  return (
    <div className="max-w-250 mx-auto px-4 sm:px-6 py-10">
      <header className="mb-8 text-center pt-4 fade-up">
        <h1 className="font-hand-display text-[40px] font-bold text-secondary rotate-[-1deg]">收藏</h1>
        <p className="mt-2 font-hand-body text-[16px] text-ink-muted">
          重点标记的笔记，共 {favorites.length} 篇
        </p>
      </header>

      <div className="bg-white sketch-border sketch-shadow divide-y divide-dashed divide-hairline">
        {favorites.length > 0 ? (
          favorites.map((article, i) => (
            <Link
              key={article.id}
              href={`/article/${article.id}`}
              className="group flex items-center gap-4 py-4 px-4 sm:px-5 fade-up"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <svg aria-hidden="true" className="w-4 h-4 text-sticker-pink shrink-0 rotate-[-6deg]" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 2.5l2.2 4.6 5 .7-3.6 3.6.9 5-4.5-2.4-4.5 2.4.9-5L2.8 7.8l5-.7L10 2.5z" />
              </svg>
              <span className="font-hand-body text-[14px] text-ink-faint tabular-nums w-20 shrink-0">
                {formatDate(String(article.updatedAt))}
              </span>
              <span className="font-hand-display text-[19px] font-bold text-ink-secondary group-hover:text-primary transition-colors truncate flex-1">
                {article.title}
              </span>
              <span className="hidden sm:inline font-hand-body text-[13px] text-sticker-pink shrink-0">
                【{article.categoryName ?? "未分类"}】
              </span>
            </Link>
          ))
        ) : (
          <div className="py-16 text-center">
            <div className="font-hand-display text-[24px] font-bold text-ink-faint rotate-[-1deg]">
              还没有收藏任何笔记
            </div>
            <p className="mt-2 font-hand-body text-[14px] text-ink-faint">
              在后台文章管理中标记收藏，重点笔记会出现在这里
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
