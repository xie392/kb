import type { Metadata } from "next";
import HandChart from "@/components/hand-chart";
import HomeArticleFeed from "@/components/home-article-feed";
import HomeHero from "@/components/home-hero";
import HomeFeatured from "@/components/home-featured";
import { createServerCaller } from "@/trpc/server";
import { SITE_NAME } from "@/lib/config";

// 首页使用 ISR：每60秒重新验证，后台静默更新，用户访问秒开
// 既保证数据新鲜度，又能获得静态页面的极速响应
export const revalidate = 60;

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
  const featured = articles.filter((a) => a.isPinned).slice(0, 3);
  const featuredIds = featured.map((a) => a.id);
  const stats = [
    { v: String(list.total), l: "笔记总数" },
    { v: String(cats.length), l: "分类" },
    { v: String(tags.length), l: "标签" },
  ];
  const trendTotal = trend.reduce((s, t) => s + t.count, 0);
  const trendPeak = Math.max(...trend.map((t) => t.count), 0);

  return (
    <div className="graph-paper min-h-screen font-hand-body text-ink-secondary">
      <HomeHero siteName={SITE_NAME} stats={stats} cats={cats} />

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

      <HomeFeatured articles={featured} />

      {/* 全部文章（触底加载） */}
      <HomeArticleFeed featuredIds={featuredIds} />
    </div>
  );
}
