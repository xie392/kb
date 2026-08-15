import Link from "next/link";
import { articles } from "@/lib/mock-data";
import { formatDate } from "@/lib/format";

export default function FavoritesPage() {
  const favorites = articles.filter((a) => a.isFavorite);

  return (
    <div className="max-w-[1000px] mx-auto px-6 py-10">
      <header className="mb-8 text-center pt-4 fade-up">
        <h1 className="font-hand-display text-[40px] font-bold text-[#213183]">收藏</h1>
        <p className="mt-2 text-[14px] text-[#615d59]">
          重点标记的笔记，共 {favorites.length} 篇
        </p>
      </header>

      <div className="divide-y divide-hairline">
        {favorites.length > 0 ? (
          favorites.map((article, i) => (
            <Link
              key={article.id}
              href={`/article/${article.id}`}
              className="group flex items-center gap-4 py-4 fade-up"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <svg className="w-4 h-4 text-sticker-pink shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 2.5l2.2 4.6 5 .7-3.6 3.6.9 5-4.5-2.4-4.5 2.4.9-5L2.8 7.8l5-.7L10 2.5z" />
              </svg>
              <span className="text-[13px] text-[#a39e98] tabular-nums w-16 shrink-0">
                {formatDate(article.updatedAt)}
              </span>
              <span className="text-[15px] font-medium text-ink group-hover:text-[#0075de] transition-colors truncate flex-1">
                {article.title}
              </span>
              <span
                className="flex items-center gap-1.5 text-[11.5px] font-medium shrink-0"
                style={{ color: article.categoryColor }}
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: article.categoryColor }} />
                {article.category}
              </span>
            </Link>
          ))
        ) : (
          <div className="py-16 text-center">
            <div className="text-[14px] text-[#a39e98]">还没有收藏任何笔记</div>
            <p className="mt-2 text-[12.5px] text-[#a39e98]/70">
              在文章详情页点击收藏，重点笔记会出现在这里
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
