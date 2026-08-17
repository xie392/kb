import Link from "next/link";
import { notFound } from "next/navigation";
import { formatDate } from "@/lib/format";
import { createServerCaller } from "@/trpc/server";
import { extractToc } from "@/lib/toc";
import { highlightCodeBlocks } from "@/lib/code-highlight";
import ArticleToc from "@/components/article-toc";
import ArticleCodeCopy from "@/components/article-code-copy";

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const caller = await createServerCaller();

  let article;
  try {
    article = await caller.article.get({ id });
  } catch {
    notFound();
  }

  const list = await caller.article.list({
    status: "normal",
    page: 1,
    pageSize: 100,
  });

  const { items: tocItems, html: contentWithIds } = extractToc(
    highlightCodeBlocks(article.content),
  );

  const index = list.items.findIndex((a) => a.id === id);
  const prev = index > 0 ? list.items[index - 1] : null;
  const next =
    index >= 0 && index < list.items.length - 1 ? list.items[index + 1] : null;

  return (
    <>
      <div className="flex-1 min-w-0">
        <div className="max-w-[820px] mx-auto">
          <nav className="flex items-center gap-2 font-hand-body text-[15px] text-[#a39e98] mb-8">
            <Link href="/" className="hover:text-[#0075de] transition-colors">
              首页
            </Link>
            <span className="text-[#e6e6e6]">/</span>
            <span className="flex items-center gap-1.5 font-medium text-[#ff64c8]">
              <span className="w-2 h-2 rounded-full rotate-12 bg-[#ff64c8]" />
              {article.categoryName ?? "未分类"}
            </span>
          </nav>

          <article className="bg-white sketch-border sketch-shadow p-5 sm:p-8 lg:p-12 fade-up">
            <header className="mb-10">
              <div className="flex items-center gap-2 flex-wrap mb-4">
                <span className="font-hand-body text-[15px] px-1.5 text-[#ff64c8]">
                  【{article.categoryName ?? "未分类"}】
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

              <h1 className="font-hand-display text-[30px] sm:text-[40px] lg:text-[46px] font-bold leading-[1.15] text-[#213183] marker-underline inline-block">
                {article.title}
              </h1>

              <div className="mt-5 flex items-center gap-x-4 gap-y-1 flex-wrap font-hand-body text-[15px] text-[#a39e98]">
                <span>✎ 更新于 {formatDate(article.updatedAt.toISOString())}</span>
                <span>·</span>
                <span>创建于 {formatDate(article.createdAt.toISOString())}</span>
              </div>

              <div className="mt-5 flex items-center gap-2 flex-wrap">
                {article.tagNames.map((tag) => (
                  <span
                    key={tag}
                    className="font-hand-body text-[14px] px-2.5 py-0.5 bg-[#f6f5f4] sketch-border text-[#615d59]"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </header>

            <div className="border-t-2 border-dashed border-[#e6e6e6] pt-8">
              <div
                className="prose-kb"
                dangerouslySetInnerHTML={{ __html: contentWithIds }}
              />
              <ArticleCodeCopy />
            </div>

            <div className="mt-10 pt-6 border-t-2 border-dashed border-[#e6e6e6] flex items-center gap-3 font-hand-display">
              <span className="font-hand-body text-[14px] text-[#a39e98]">
                {article.content.length > 800 ? "长文" : "短文"} · 约{" "}
                {Math.max(1, Math.round(article.content.length / 400))} 分钟阅读
              </span>
            </div>
          </article>

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
      </div>

      <ArticleToc items={tocItems} />
    </>
  );
}
