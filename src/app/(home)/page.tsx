import type { Metadata } from "next";
import Link from "next/link";
import { formatDate } from "@/lib/format";
import HandChart from "@/components/hand-chart";
import HomeArticleFeed from "@/components/home-article-feed";
import { createServerCaller } from "@/trpc/server";
import { SITE_NAME } from "@/lib/config";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default async function HomePage() {
  const caller = await createServerCaller();
  const [list, cats, tags, trend] = await Promise.all([
    caller.article.list({ status: "normal", page: 1, pageSize: 50 }),
    caller.category.tree(),
    caller.tag.list(),
    caller.stats.trend(),
  ]);

  const articles = list.items;
  const featured = articles.filter((a) => a.isPinned || a.isFavorite).slice(0, 3);
  const featuredIds = featured.map((a) => a.id);
  const stats = [
    { v: String(list.total), l: "笔记总数" },
    { v: String(cats.length), l: "分类" },
    { v: String(tags.length), l: "标签" },
    { v: String(articles.filter((a) => a.isFavorite).length), l: "收藏" },
  ];
  const trendTotal = trend.reduce((s, t) => s + t.count, 0);
  const trendPeak = Math.max(...trend.map((t) => t.count), 0);

  return (
    <div className="graph-paper min-h-screen font-hand-body text-ink-secondary">
      {/* ─── 手绘 Hero ─── */}
      <section className="max-w-250 mx-auto px-4 sm:px-6 pt-10 sm:pt-14 pb-10 text-center">
        <h1 className="font-hand-display text-[44px] sm:text-[64px] md:text-[80px] font-bold leading-none text-secondary rotate-[-2deg] inline-block">
          {SITE_NAME}
          <span
            className="block w-full h-[6px] mt-2 rotate-[-1deg]"
            style={{
              background:
                "repeating-linear-gradient(90deg, rgba(0,117,222,0.55) 0 8px, transparent 8px 14px)",
              borderRadius: "3px",
            }}
          />
        </h1>

        <p className="mt-6 font-hand-body text-[20px] text-ink-muted max-w-md mx-auto">
          记录碎片化的想法，<span className="marker-highlight">沉淀系统化的知识</span>
        </p>

        {/* 统计便签 */}
        <div className="mt-10 flex items-center justify-center gap-6 flex-wrap">
          {stats.map((s, i) => (
            <div
              key={s.l}
              className="sticky-note sketch-border px-5 py-3 fade-up"
              style={{ transform: `rotate(${[-2, 1, -1, 2][i]}deg)`, animationDelay: `${i * 100}ms` }}
            >
              <div className="font-hand-display text-[28px] sm:text-[34px] font-bold text-sticker-brown leading-none">
                {s.v}
              </div>
              <div className="mt-1 font-hand-body text-[14px] text-sticker-orange-deep">{s.l}</div>
            </div>
          ))}
        </div>

        {/* 分类胶囊 */}
        <div className="mt-10 flex items-center justify-center gap-3 flex-wrap fade-up" style={{ animationDelay: "200ms" }}>
          {cats.map((c, i) => (
            <Link
              key={c.id}
              href={`/categories?cat=${c.id}`}
              className={`font-hand-display text-[16px] sm:text-[18px] px-4 py-1.5 bg-white sketch-border sketch-shadow hover:-translate-y-0.5 transition-transform ${
                i % 2 ? "rotate-[1deg]" : "rotate-[-1deg]"
              }`}
            >
              <span style={{ color: ["#0075de", "#ff64c8", "#2a9d99"][i % 3] }}>●</span> {c.name}
              <span className="text-ink-faint text-[14px]"> ({c.count})</span>
            </Link>
          ))}
        </div>
      </section>

      {/* 便签注释 + 增长图表 */}
      <div className="relative max-w-250 mx-auto px-4 sm:px-6">
        <div className="hidden lg:block sticky-note sketch-border-2 px-4 py-3 rotate-[3deg] absolute -left-16 top-8 w-35 fade-up">
          <div className="font-hand-display text-[16px] font-bold text-sticker-brown">✏️ 提示</div>
          <div className="mt-1 font-hand-body text-[13px] text-sticker-orange-deep leading-snug">
            点击卡片进入完整笔记
          </div>
        </div>

        <div className="hidden lg:block sticky-note sketch-border px-3 py-2 rotate-[-2deg] absolute -right-16 top-12 w-32 fade-up">
          <div className="font-hand-body text-[13px] text-sticker-brown">真实数据</div>
          <div className="font-hand-body text-[12px] text-ink-faint">每篇笔记都是记录</div>
        </div>

        <div className="mb-10 sketch-dashed p-4 rotate-[-0.5deg] fade-up" style={{ animationDelay: "100ms" }}>
          <div className="font-hand-display text-[20px] font-bold text-ink-secondary marker-underline inline-block">
            近 30 天笔记增长
          </div>
          {trendTotal > 0 ? (
            <>
              <div className="mt-1 font-hand-body text-[13px] text-ink-faint">
                近 30 天共新增 {trendTotal} 篇 · 峰值 {trendPeak} 篇/天
              </div>
              <div className="mt-3"><HandChart data={trend} /></div>
            </>
          ) : (
            <div className="mt-4 py-10 text-center font-hand-body text-[15px] text-ink-faint">
              近 30 天还没有新笔记，去写第一篇吧 ✍️
            </div>
          )}
        </div>
      </div>

      {/* 精选 */}
      <section className="max-w-250 mx-auto px-4 sm:px-6 pb-14">
        <div className="flex items-center gap-3 mb-4">
          <h2 className="font-hand-display text-[24px] font-bold text-secondary marker-underline inline-block">
            精选笔记
          </h2>
          <span className="flex-1 pencil-line h-[2px]" />
        </div>

        <div className="flex items-end gap-1 mb-0 pl-3">
          <span className="sketch-tab font-hand-display text-[15px] font-bold text-primary">全部</span>
          {cats.slice(0, 2).map((c) => (
            <span key={c.id} className="sketch-tab font-hand-body text-[14px] text-ink-faint opacity-70" style={{ top: 0 }}>
              {c.name}
            </span>
          ))}
        </div>

        <div className="bg-white sketch-border sketch-shadow p-5 grid grid-cols-1 md:grid-cols-3 gap-5 -mt-[1px]">
          {featured.map((article, i) => (
            <Link
              key={article.id}
              href={`/article/${article.id}`}
              className="group sketch-dashed p-4 hover:bg-canvas-soft transition-colors fade-up flex flex-col"
              style={{ animationDelay: `${i * 90}ms` }}
            >
              <span className="font-hand-body text-[13px] text-sticker-pink">
                【{article.categoryName ?? "未分类"}】
              </span>
              <h3 className="mt-1.5 font-hand-display text-[20px] font-bold leading-snug text-ink-secondary group-hover:text-primary transition-colors">
                {article.title}
              </h3>
              {article.summary && (
                <p className="mt-1.5 font-hand-body text-[14px] text-ink-muted leading-relaxed line-clamp-2 flex-1">
                  {article.summary}
                </p>
              )}
              <div className="mt-2 flex items-center justify-between">
                <span className="font-hand-body text-[13px] text-ink-faint">
                  {formatDate(article.updatedAt.toISOString())}
                </span>
                <span className="font-hand-display text-[14px] text-primary">→</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 全部文章（触底加载） */}
      <HomeArticleFeed featuredIds={featuredIds} />
    </div>
  );
}
