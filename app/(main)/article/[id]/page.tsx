import Link from "next/link";
import { articles, articleContent } from "@/lib/mock-data";
import { formatDate } from "@/lib/format";

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const article = articles.find((a) => a.id === id) ?? articles[0];
  const index = articles.findIndex((a) => a.id === article.id);
  const prev = articles[index + 1];
  const next = articles[index - 1];

  return (
    <div className="max-w-[1000px] mx-auto px-6 py-10">
      {/* 面包屑 */}
      <nav className="flex items-center gap-2 font-hand-body text-[15px] text-[#a39e98] mb-8">
        <Link href="/" className="hover:text-[#0075de] transition-colors">
          首页
        </Link>
        <span className="text-[#e6e6e6]">/</span>
        <span
          className="flex items-center gap-1.5 font-medium"
          style={{ color: article.categoryColor }}
        >
          <span className="w-2 h-2 rounded-full rotate-12" style={{ backgroundColor: article.categoryColor }} />
          {article.category}
        </span>
      </nav>

      {/* 文章卡片（手绘白纸） */}
      <article className="bg-white sketch-border sketch-shadow p-8 sm:p-12 fade-up">
        {/* 文章头部 */}
        <header className="mb-10">
          <div className="flex items-center gap-2 flex-wrap mb-4">
            <span
              className="font-hand-body text-[15px] px-1.5"
              style={{ color: article.categoryColor }}
            >
              【{article.category}】
            </span>
            {article.isPinned && (
              <span className="marker-highlight font-hand-display text-[14px] text-[#523410] rotate-[-1deg]">
                ★ 置顶
              </span>
            )}
            {article.visibility === "public" && (
              <span className="font-hand-body text-[14px] text-[#0075de] rotate-[0.5deg]">
                〇 公开
              </span>
            )}
          </div>

          <h1 className="font-hand-display text-[40px] sm:text-[46px] font-bold leading-[1.15] text-[#213183] marker-underline inline-block">
            {article.title}
          </h1>

          <div className="mt-5 flex items-center gap-4 font-hand-body text-[15px] text-[#a39e98]">
            <span>✎ 更新于 {formatDate(article.updatedAt)}</span>
            <span>·</span>
            <span>创建于 {formatDate(article.createdAt)}</span>
          </div>

          {/* 标签 */}
          <div className="mt-5 flex items-center gap-2 flex-wrap">
            {article.tags.map((tag) => (
              <Link
                key={tag}
                href={`/tags#${tag}`}
                className="font-hand-body text-[14px] px-2.5 py-0.5 bg-[#f6f5f4] sketch-border hover:text-[#0075de] transition-colors"
              >
                #{tag}
              </Link>
            ))}
          </div>
        </header>

        {/* 正文 */}
        <div className="border-t-2 border-dashed border-[#e6e6e6] pt-8">
          <div className="prose-kb" dangerouslySetInnerHTML={{ __html: articleContent.html }} />
        </div>

        {/* 操作栏 */}
        <div className="mt-10 pt-6 border-t-2 border-dashed border-[#e6e6e6] flex items-center gap-3 font-hand-display">
          <button className="px-4 py-1.5 bg-white sketch-border sketch-shadow text-[16px] text-[#31302e] hover:text-[#ff64c8] rotate-[0.5deg] hover:rotate-0 transition-all">
            ☆ 收藏
          </button>
          <span className="flex-1" />
          <span className="font-hand-body text-[14px] text-[#a39e98]">约 4 分钟阅读</span>
        </div>
      </article>

      {/* 上一篇/下一篇（手绘便签） */}
      <div className="mt-8 grid grid-cols-2 gap-4">
        {prev ? (
          <Link
            href={`/article/${prev.id}`}
            className="sticky-note sketch-border px-4 py-3 rotate-[-1deg] hover:rotate-0 transition-transform group"
          >
            <div className="font-hand-body text-[13px] text-[#a39e98]">← 上一篇</div>
            <div className="mt-1 font-hand-display text-[17px] font-bold text-[#523410] line-clamp-2 group-hover:text-[#0075de] transition-colors">
              {prev.title}
            </div>
          </Link>
        ) : (
          <div className="sticky-note sketch-border px-4 py-3 rotate-[-1deg] opacity-40">
            <div className="font-hand-body text-[13px] text-[#a39e98]">← 上一篇</div>
            <div className="mt-1 font-hand-display text-[17px] text-[#a39e98]">没有了</div>
          </div>
        )}
        {next ? (
          <Link
            href={`/article/${next.id}`}
            className="sticky-note sketch-border-2 px-4 py-3 rotate-[1deg] hover:rotate-0 transition-transform group text-right"
          >
            <div className="font-hand-body text-[13px] text-[#a39e98]">下一篇 →</div>
            <div className="mt-1 font-hand-display text-[17px] font-bold text-[#523410] line-clamp-2 group-hover:text-[#0075de] transition-colors">
              {next.title}
            </div>
          </Link>
        ) : (
          <div className="sticky-note sketch-border-2 px-4 py-3 rotate-[1deg] opacity-40 text-right">
            <div className="font-hand-body text-[13px] text-[#a39e98]">下一篇 →</div>
            <div className="mt-1 font-hand-display text-[17px] text-[#a39e98]">没有了</div>
          </div>
        )}
      </div>
    </div>
  );
}
