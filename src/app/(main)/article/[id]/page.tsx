import type { Metadata } from "next";
import { cache } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { formatDate } from "@/lib/format";
import { createServerCaller } from "@/trpc/server";
import { SITE_URL } from "@/lib/config";
import { extractToc } from "@/lib/toc";
import { highlightCodeBlocks } from "@/lib/code-highlight";
import ArticleToc from "@/components/article-toc";
import ArticleCodeCopy from "@/components/article-code-copy";

// generateMetadata 与页面组件共用，同一请求内只查询一次数据库
const getArticle = cache(async (id: string) => {
  const caller = await createServerCaller();
  return caller.article.get({ id });
});

/** 去掉富文本标签，生成纯文本摘要 */
function plainText(html: string) {
  return html.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
}

/** 页面描述：优先用自定义摘要，否则从正文截取 */
function getDescription(article: { summary: string | null; content: string }) {
  return article.summary?.trim() || plainText(article.content).slice(0, 150);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  let article;
  try {
    article = await getArticle(id);
  } catch {
    return {};
  }

  const description = getDescription(article);
  const keywords = [...article.tagNames];
  if (article.categoryName) keywords.unshift(article.categoryName);

  return {
    title: article.title,
    description,
    keywords,
    alternates: { canonical: `/article/${article.id}` },
    // og:image 由同目录 opengraph-image.tsx 动态生成（1200×630），此处不再覆盖
    openGraph: {
      type: "article",
      title: article.title,
      description,
      url: `${SITE_URL}/article/${article.id}`,
      siteName: "个人知识库",
      locale: "zh_CN",
      publishedTime: article.createdAt.toISOString(),
      modifiedTime: article.updatedAt.toISOString(),
      tags: article.tagNames,
    },
    // twitter:image 缺省时自动回退 og:image（动态生成图）
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description,
    },
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let article;
  try {
    article = await getArticle(id);
  } catch {
    notFound();
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: article.title,
    description: getDescription(article),
    datePublished: article.createdAt.toISOString(),
    dateModified: article.updatedAt.toISOString(),
    author: { "@type": "Person", name: "xie392" },
    keywords: article.tagNames.join(","),
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${SITE_URL}/article/${article.id}`,
    },
  };

  const caller = await createServerCaller();
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          // 转义 <，防止标题/摘要/标签等用户可控内容逃逸出 script 标签造成 XSS
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <div className="flex-1 min-w-0">
        <div className="max-w-205 mx-auto">
          <nav className="flex items-center gap-2 font-hand-body text-[15px] text-ink-faint mb-8">
            <Link href="/" className="hover:text-primary transition-colors">
              首页
            </Link>
            <span className="text-hairline">/</span>
            <span className="flex items-center gap-1.5 font-medium text-sticker-pink">
              <span className="w-2 h-2 rounded-full rotate-12 bg-sticker-pink" />
              {article.categoryName ?? "未分类"}
            </span>
          </nav>

          <article className="bg-white sketch-border sketch-shadow p-5 sm:p-8 lg:p-12 fade-up">
            <header className="mb-10">
              <div className="flex items-center gap-2 flex-wrap mb-4">
                <span className="font-hand-body text-[15px] px-1.5 text-sticker-pink">
                  【{article.categoryName ?? "未分类"}】
                </span>
                {article.isPinned && (
                  <span className="marker-highlight font-hand-display text-[14px] text-sticker-brown rotate-[-1deg]">
                    ★ 置顶
                  </span>
                )}
                {article.visibility === "public" && (
                  <span className="font-hand-body text-[14px] text-primary rotate-[0.5deg]">
                    〇 公开
                  </span>
                )}
              </div>

              <h1 className="font-hand-display text-[30px] sm:text-[40px] lg:text-[46px] font-bold leading-[1.15] text-secondary marker-underline inline-block">
                {article.title}
              </h1>

              <div className="mt-5 flex items-center gap-x-4 gap-y-1 flex-wrap font-hand-body text-[15px] text-ink-faint">
                <span>✎ 更新于 {formatDate(article.updatedAt.toISOString())}</span>
                <span>·</span>
                <span>创建于 {formatDate(article.createdAt.toISOString())}</span>
              </div>

              <div className="mt-5 flex items-center gap-2 flex-wrap">
                {article.tagNames.map((tag) => (
                  <span
                    key={tag}
                    className="font-hand-body text-[14px] px-2.5 py-0.5 bg-canvas-soft sketch-border text-ink-muted"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </header>

            <div className="border-t-2 border-dashed border-hairline pt-4">
              <div
                className="prose-kb"
                dangerouslySetInnerHTML={{ __html: contentWithIds }}
              />
              <ArticleCodeCopy />
            </div>

            <div className="mt-10 pt-6 border-t-2 border-dashed border-hairline flex items-center gap-3 font-hand-display">
              <span className="font-hand-body text-[14px] text-ink-faint">
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
                <div className="font-hand-body text-[13px] text-ink-faint">← 上一篇</div>
                <div className="mt-1 font-hand-display text-[17px] font-bold text-sticker-brown line-clamp-2 group-hover:text-primary transition-colors">
                  {prev.title}
                </div>
              </Link>
            ) : (
              <div className="sticky-note sketch-border px-4 py-3 rotate-[-1deg] opacity-40">
                <div className="font-hand-body text-[13px] text-ink-faint">← 上一篇</div>
                <div className="mt-1 font-hand-display text-[17px] text-ink-faint">没有了</div>
              </div>
            )}
            {next ? (
              <Link
                href={`/article/${next.id}`}
                className="sticky-note sketch-border-2 px-4 py-3 rotate-[1deg] hover:rotate-0 transition-transform group text-right"
              >
                <div className="font-hand-body text-[13px] text-ink-faint">下一篇 →</div>
                <div className="mt-1 font-hand-display text-[17px] font-bold text-sticker-brown line-clamp-2 group-hover:text-primary transition-colors">
                  {next.title}
                </div>
              </Link>
            ) : (
              <div className="sticky-note sketch-border-2 px-4 py-3 rotate-[1deg] opacity-40 text-right">
                <div className="font-hand-body text-[13px] text-ink-faint">下一篇 →</div>
                <div className="mt-1 font-hand-display text-[17px] text-ink-faint">没有了</div>
              </div>
            )}
          </div>
        </div>
      </div>

      <ArticleToc items={tocItems} />
    </>
  );
}
