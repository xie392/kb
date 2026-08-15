import Link from "next/link";
import { articles, tags } from "@/lib/mock-data";
import { formatDate } from "@/lib/format";

function tagCount(tag: string) {
  return articles.filter((a) => a.tags.includes(tag)).length;
}

export default function TagsPage() {
  return (
    <div className="max-w-[1000px] mx-auto px-6 py-10">
      <header className="mb-10 text-center pt-4 fade-up">
        <h1 className="font-hand-display text-[40px] font-bold text-[#213183]">标签</h1>
        <p className="mt-2 text-[14px] text-[#615d59]">
          跨维度的内容标记，共 {tags.length} 个标签
        </p>
      </header>

      {/* 标签云 */}
      <div className="flex items-center justify-center gap-3 flex-wrap max-w-[700px] mx-auto mb-12 fade-up" style={{ animationDelay: "100ms" }}>
        {tags.map((tag, i) => {
          const count = tagCount(tag);
          const sizes = [
            "text-[22px] font-bold",
            "text-[19px] font-semibold",
            "text-[17px] font-medium",
            "text-[15px]",
          ];
          return (
            <Link
              key={tag}
              href={`/tags#${tag}`}
              className={`px-4 py-2 rounded-full bg-canvas border border-[#e6e6e6] text-[#31302e] hover:border-[#0075de]/40 hover:text-[#0075de] transition-colors ${sizes[i % sizes.length]}`}
            >
              #{tag}
              <span className="ml-1.5 text-[11px] text-[#a39e98] tabular-nums">{count}</span>
            </Link>
          );
        })}
      </div>

      {/* 按标签列出文章 */}
      <div className="space-y-10">
        {tags.map((tag, ti) => {
          const tagArticles = articles.filter((a) => a.tags.includes(tag));
          if (tagArticles.length === 0) return null;
          return (
            <section key={tag} id={tag} className="fade-up" style={{ animationDelay: `${ti * 70}ms` }}>
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-[17px] font-bold tracking-[-0.125px] text-ink">#{tag}</h2>
                <span className="text-[12.5px] text-[#a39e98] tabular-nums">{tagArticles.length} 篇</span>
                <span className="flex-1 h-px bg-hairline" />
              </div>
              <div className="divide-y divide-hairline">
                {tagArticles.map((article, i) => (
                  <Link
                    key={article.id}
                    href={`/article/${article.id}`}
                    className="group flex items-center gap-4 py-3.5 fade-up"
                    style={{ animationDelay: `${(ti * 4 + i) * 40}ms` }}
                  >
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
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
