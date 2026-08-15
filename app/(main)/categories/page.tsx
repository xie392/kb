import Link from "next/link";
import { articles, categories } from "@/lib/mock-data";
import { formatDate } from "@/lib/format";

export default function CategoriesPage() {
  return (
    <div className="max-w-[1000px] mx-auto px-6 py-10">
      <header className="mb-10 text-center pt-4 fade-up">
        <h1 className="font-hand-display text-[40px] font-bold text-[#213183]">分类</h1>
        <p className="mt-2 text-[14px] text-[#615d59]">
          按主题归档所有笔记，共 {categories.length} 个分类
        </p>
      </header>

      <div className="space-y-10">
        {categories.map((cat, ci) => {
          const catArticles = articles.filter(
            (a) => a.category === cat.children?.[0]?.name || a.categoryColor === cat.color
          );
          return (
            <section key={cat.id} id={cat.id} className="fade-up" style={{ animationDelay: `${ci * 80}ms` }}>
              <div className="flex items-center gap-3 mb-5">
                <span className="w-8 h-8 rounded-[10px] grid place-items-center text-white text-[14px] font-bold" style={{ backgroundColor: cat.color }}>
                  {cat.name[0]}
                </span>
                <h2 className="text-[20px] font-bold tracking-[-0.25px] text-ink">{cat.name}</h2>
                <span className="text-[13px] text-[#a39e98] tabular-nums">{cat.count} 篇</span>
                <span className="flex-1 h-px bg-hairline" />
                {cat.children?.map((child) => (
                  <span key={child.id} className="text-[12px] text-[#615d59]">
                    {child.name} <span className="text-[#a39e98]">({child.count})</span>
                  </span>
                ))}
              </div>
              <div className="divide-y divide-hairline">
                {catArticles.length > 0 ? (
                  catArticles.map((article, i) => (
                    <Link
                      key={article.id}
                      href={`/article/${article.id}`}
                      className="group flex items-center gap-4 py-4 fade-up"
                      style={{ animationDelay: `${(ci * 4 + i) * 50}ms` }}
                    >
                      <span className="text-[13px] text-[#a39e98] tabular-nums w-16 shrink-0">
                        {formatDate(article.updatedAt)}
                      </span>
                      <span className="text-[15px] font-medium text-ink group-hover:text-[#0075de] transition-colors truncate flex-1">
                        {article.title}
                      </span>
                      <span className="flex items-center gap-1.5 text-[11.5px] text-[#a39e98] shrink-0">
                        {article.tags.slice(0, 2).map((t) => (
                          <span key={t}>#{t}</span>
                        ))}
                      </span>
                    </Link>
                  ))
                ) : (
                  <div className="py-6 text-center text-[13px] text-[#a39e98]">
                    该分类下暂无笔记
                  </div>
                )}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
