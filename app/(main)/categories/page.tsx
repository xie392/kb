import Link from "next/link";
import { formatDate } from "@/lib/format";
import { createServerCaller } from "@/trpc/server";

export default async function CategoriesPage() {
  const caller = await createServerCaller();
  const [cats, list] = await Promise.all([
    caller.category.tree(),
    caller.article.list({ status: "normal", page: 1, pageSize: 100 }),
  ]);

  const all = list.items;

  return (
    <div className="max-w-[1000px] mx-auto px-6 py-10">
      <header className="mb-10 text-center pt-4 fade-up">
        <h1 className="font-hand-display text-[40px] font-bold text-[#213183] rotate-[-1deg]">分类</h1>
        <p className="mt-2 font-hand-body text-[16px] text-[#615d59]">
          按主题归档所有笔记，共 {cats.length} 个分类
        </p>
      </header>

      <div className="space-y-10">
        {cats.map((cat, ci) => {
          const catArticles = all.filter((a) => a.categoryName?.startsWith(cat.name));
          return (
            <section key={cat.id} id={cat.id} className="fade-up" style={{ animationDelay: `${ci * 80}ms` }}>
              <div className="flex items-center gap-3 mb-5">
                <span
                  className="w-9 h-9 grid place-items-center text-white font-hand-display text-[18px] font-bold sketch-border sketch-shadow rotate-[-3deg]"
                  style={{ backgroundColor: ["#0075de", "#ff64c8", "#2a9d99"][ci % 3] }}
                >
                  {cat.name[0]}
                </span>
                <h2 className="font-hand-display text-[26px] font-bold text-[#31302e]">{cat.name}</h2>
                <span className="font-hand-body text-[14px] text-[#a39e98]">{cat.count} 篇</span>
                <span className="flex-1 pencil-line h-[2px]" />
                {cat.children?.map((child) => (
                  <span key={child.id} className="font-hand-body text-[14px] text-[#615d59]">
                    {child.name} <span className="text-[#a39e98]">({child.count})</span>
                  </span>
                ))}
              </div>
              <div className="bg-white sketch-border sketch-shadow divide-y divide-dashed divide-[#e6e6e6]">
                {catArticles.length > 0 ? (
                  catArticles.map((article, i) => (
                    <Link
                      key={article.id}
                      href={`/article/${article.id}`}
                      className="group flex items-center gap-4 py-4 px-5 fade-up"
                      style={{ animationDelay: `${(ci * 4 + i) * 50}ms` }}
                    >
                      <span className="font-hand-body text-[14px] text-[#a39e98] tabular-nums w-20 shrink-0">
                        {formatDate(String(article.updatedAt))}
                      </span>
                      <span className="font-hand-display text-[19px] font-bold text-[#31302e] group-hover:text-[#0075de] transition-colors truncate flex-1">
                        {article.title}
                      </span>
                      <span className="flex items-center gap-1.5 font-hand-body text-[13px] text-[#a39e98] shrink-0">
                        {article.tagNames.slice(0, 2).map((t) => (
                          <span key={t}>#{t}</span>
                        ))}
                      </span>
                    </Link>
                  ))
                ) : (
                  <div className="py-8 text-center font-hand-body text-[15px] text-[#a39e98]">
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
