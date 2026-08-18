import Link from "next/link";
import { formatDate } from "@/lib/format";
import { createServerCaller } from "@/trpc/server";

export default async function TagsPage() {
  const caller = await createServerCaller();
  const [tags, list] = await Promise.all([
    caller.tag.list(),
    caller.article.list({ status: "normal", page: 1, pageSize: 100 }),
  ]);

  const all = list.items;

  return (
    <div className="max-w-250 mx-auto px-4 sm:px-6 py-10">
      <header className="mb-10 text-center pt-4 fade-up">
        <h1 className="font-hand-display text-[40px] font-bold text-secondary rotate-[-1deg]">标签</h1>
        <p className="mt-2 font-hand-body text-[16px] text-ink-muted">
          跨维度的内容标记，共 {tags.length} 个标签
        </p>
      </header>

      {/* 标签云 */}
      <div className="flex items-center justify-center gap-3 flex-wrap max-w-175 mx-auto mb-12 fade-up" style={{ animationDelay: "100ms" }}>
        {tags.map((tag, i) => {
          const sizes = [
            "text-[22px] font-bold",
            "text-[19px] font-semibold",
            "text-[17px] font-medium",
            "text-[15px]",
          ];
          return (
            <Link
              key={tag.id}
              href={`/tags#${tag.id}`}
              className={`px-4 py-2 rounded-full bg-white sketch-border text-ink-secondary hover:text-primary hover:-translate-y-0.5 transition-[color,transform] ${sizes[i % sizes.length]}`}
            >
              #{tag.name}
              <span className="ml-1.5 text-[12px] text-ink-faint tabular-nums">{tag._count.articles}</span>
            </Link>
          );
        })}
      </div>

      {/* 按标签列出文章 */}
      <div className="space-y-10">
        {tags.map((tag, ti) => {
          const tagArticles = all.filter((a) => a.tagNames.includes(tag.name));
          if (tagArticles.length === 0) return null;
          return (
            <section key={tag.id} id={tag.id} className="fade-up scroll-mt-24" style={{ animationDelay: `${ti * 70}ms` }}>
              <div className="flex items-center gap-3 mb-4">
                <h2 className="font-hand-display text-[22px] font-bold text-ink-secondary">#{tag.name}</h2>
                <span className="font-hand-body text-[13px] text-ink-faint tabular-nums">{tagArticles.length} 篇</span>
                <span className="flex-1 pencil-line h-[2px]" />
              </div>
              <div className="bg-white sketch-border sketch-shadow divide-y divide-dashed divide-hairline">
                {tagArticles.map((article, i) => (
                  <Link
                    key={article.id}
                    href={`/article/${article.id}`}
                    className="group flex items-center gap-4 py-3.5 px-4 sm:px-5 fade-up"
                    style={{ animationDelay: `${(ti * 4 + i) * 40}ms` }}
                  >
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
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
