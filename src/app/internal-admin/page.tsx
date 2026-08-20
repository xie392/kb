"use client";

import { api } from "@/trpc/client";
import HandChart from "@/components/hand-chart";

const NOTE_COLORS = ["#0075de", "#ff64c8", "#2a9d99", "#dd5b00"];
const VIEW_COLORS = ["#9b59b6", "#e67e22", "#1abc9c", "#e74c3c"];

function StatCard({
  label,
  value,
  delta,
  color,
  delay,
}: {
  label: string;
  value: number | string;
  delta: string;
  color: string;
  delay: number;
}) {
  return (
    <div
      className="bg-white sketch-border sketch-shadow p-5 fade-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center justify-between">
        <span
          className="w-9 h-9 grid place-items-center text-white font-hand-display text-[18px] font-bold sketch-border rotate-[-3deg]"
          style={{ backgroundColor: color }}
        >
          {value}
        </span>
        <span className="font-hand-body text-[13px] text-ink-faint">{delta}</span>
      </div>
      <div className="mt-4">
        <div className="font-hand-display text-[32px] font-bold text-ink-secondary tabular-nums leading-none">
          {value}
        </div>
        <div className="mt-1 font-hand-body text-[14px] text-ink-muted">{label}</div>
      </div>
    </div>
  );
}

function ChartCard({
  title,
  subtitle,
  data,
  barFill,
  lineStroke,
  delay,
}: {
  title: string;
  subtitle: string;
  data: { date: string; count: number }[];
  barFill: string;
  lineStroke: string;
  delay: number;
}) {
  return (
    <div
      className="bg-white sketch-border sketch-shadow p-6 fade-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <h3 className="font-hand-display text-[22px] font-bold text-ink-secondary marker-underline inline-block">
        {title}
      </h3>
      <p className="font-hand-body text-[13px] text-ink-faint mt-1">{subtitle}</p>
      {data.length > 0 ? (
        <div className="mt-4">
          <HandChart data={data} barFill={barFill} lineStroke={lineStroke} />
        </div>
      ) : (
        <div className="py-16 text-center font-hand-body text-[15px] text-ink-faint">
          暂无数据
        </div>
      )}
    </div>
  );
}

export default function AdminDashboardPage() {
  const { data, isFetching } = api.stats.overview.useQuery();

  const noteCards = data
    ? [
        { label: "总笔记数", value: data.total, delta: `今日 +${data.todayNew}`, color: NOTE_COLORS[0] },
        { label: "本周新增", value: data.weekNew, delta: "本周", color: NOTE_COLORS[1] },
        { label: "本月新增", value: data.monthNew, delta: "本月", color: NOTE_COLORS[2] },
        { label: "回收站", value: data.trash, delta: "软删除", color: NOTE_COLORS[3] },
      ]
    : [];

  const viewCards = data
    ? [
        { label: "总阅读量", value: data.views.total, delta: `今日 +${data.views.today}`, color: VIEW_COLORS[0] },
        { label: "本周阅读", value: data.views.week, delta: "本周", color: VIEW_COLORS[1] },
        { label: "本月阅读", value: data.views.month, delta: "本月", color: VIEW_COLORS[2] },
        { label: "今日阅读", value: data.views.today, delta: "今日", color: VIEW_COLORS[3] },
      ]
    : [];

  const maxCat = Math.max(...(data?.categories.map((c) => c.count) ?? [1]), 1);
  const noteTrendTotal = (data?.trend ?? []).reduce((s, t) => s + t.count, 0);
  const viewTrendTotal = (data?.views.trend ?? []).reduce((s, t) => s + t.count, 0);
  const maxView = Math.max(...(data?.views.topArticles.map((a) => a.viewCount) ?? [1]), 1);

  return (
    <div className="p-8 w-full">
      {isFetching && (
        <div
          aria-live="polite"
          className="mb-4 sticky-note sketch-border px-4 py-2 rotate-[-1deg] w-fit"
        >
          <span className="font-hand-display text-[16px] font-bold text-ink-faint">
            加载中…
          </span>
        </div>
      )}

      <div className="flex items-center gap-3 mb-4">
        <h2 className="font-hand-display text-[18px] font-bold text-ink-muted">笔记统计</h2>
        <span className="flex-1 pencil-line h-[2px]" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {noteCards.map((s, i) => (
          <StatCard key={s.label} {...s} delay={i * 60} />
        ))}
      </div>

      <div className="flex items-center gap-3 mb-4">
        <h2 className="font-hand-display text-[18px] font-bold text-ink-muted">阅读统计</h2>
        <span className="flex-1 pencil-line h-[2px]" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {viewCards.map((s, i) => (
          <StatCard key={s.label} {...s} delay={i * 60 + 240} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-6">
        <div className="lg:col-span-3">
          {data && (
            <ChartCard
              title="近 30 天新增趋势"
              subtitle={`每日新增笔记数${noteTrendTotal > 0 ? ` · 共 ${noteTrendTotal} 篇` : ""}`}
              data={data.trend}
              barFill="#0075de"
              lineStroke="#213183"
              delay={480}
            />
          )}
        </div>

        <div className="lg:col-span-2 relative min-h-0">
          <div className="lg:absolute lg:inset-0 bg-white sketch-border sketch-shadow p-6 fade-up flex flex-col min-h-0 overflow-hidden" style={{ animationDelay: "540ms" }}>
            <h3 className="font-hand-display text-[22px] font-bold text-ink-secondary marker-underline inline-block shrink-0">
              分类分布
            </h3>
            <div className="mt-6 space-y-4 overflow-y-auto scrollbar-wide pr-1 flex-1 min-h-0">
              {(data?.categories ?? []).map((cat, i) => {
                const pct = Math.round((cat.count / maxCat) * 100);
                return (
                  <div key={cat.id}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-hand-body text-[14px] text-ink-secondary">
                        {cat.name}
                      </span>
                      <span className="font-hand-body text-[13px] text-ink-faint tabular-nums">
                        {cat.count} 篇
                      </span>
                    </div>
                    <div className="h-3 rounded-full bg-canvas-soft border border-dashed border-hairline overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${Math.max(pct, 4)}%`,
                          backgroundColor: NOTE_COLORS[i % 4],
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            {data && (
              <div className="mt-6 pt-4 border-t-2 border-dashed border-hairline grid grid-cols-3 gap-3 text-center shrink-0">
                <div>
                  <div className="font-hand-display text-[22px] font-bold text-ink-secondary tabular-nums">
                    {data.trash}
                  </div>
                  <div className="font-hand-body text-[12px] text-ink-faint">回收站</div>
                </div>
                <div>
                  <div className="font-hand-display text-[22px] font-bold text-ink-secondary tabular-nums">
                    {data.publicCount}
                  </div>
                  <div className="font-hand-body text-[12px] text-ink-faint">公开文章</div>
                </div>
                <div>
                  <div className="font-hand-display text-[22px] font-bold text-ink-secondary tabular-nums">
                    {data.privateCount}
                  </div>
                  <div className="font-hand-body text-[12px] text-ink-faint">私有文章</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3">
          {data && (
            <ChartCard
              title="近 30 天阅读趋势"
              subtitle={`每日阅读量${viewTrendTotal > 0 ? ` · 共 ${viewTrendTotal} 次` : ""}`}
              data={data.views.trend}
              barFill="#9b59b6"
              lineStroke="#6c3483"
              delay={600}
            />
          )}
        </div>

        <div className="lg:col-span-2 relative min-h-0">
          <div className="lg:absolute lg:inset-0 bg-white sketch-border sketch-shadow p-6 fade-up flex flex-col min-h-0 overflow-hidden" style={{ animationDelay: "660ms" }}>
            <h3 className="font-hand-display text-[22px] font-bold text-ink-secondary marker-underline inline-block shrink-0">
              热门文章
            </h3>
            <div className="mt-6 space-y-3 overflow-y-auto scrollbar-wide pr-1 flex-1 min-h-0">
              {(data?.views.topArticles ?? []).length > 0 ? (
                data!.views.topArticles.map((a, i) => {
                  const pct = Math.round((a.viewCount / maxView) * 100);
                  return (
                    <div key={a.id}>
                      <div className="flex items-center justify-between mb-1.5 gap-2">
                        <span className="font-hand-body text-[14px] text-ink-secondary truncate">
                          <span className="font-hand-display text-[16px] font-bold mr-1.5" style={{ color: VIEW_COLORS[i % 4] }}>
                            {i + 1}
                          </span>
                          {a.title}
                        </span>
                        <span className="font-hand-body text-[13px] text-ink-faint tabular-nums shrink-0">
                          {a.viewCount}
                        </span>
                      </div>
                      <div className="h-2.5 rounded-full bg-canvas-soft border border-dashed border-hairline overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${Math.max(pct, 6)}%`,
                            backgroundColor: VIEW_COLORS[i % 4],
                          }}
                        />
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-10 text-center font-hand-body text-[15px] text-ink-faint">
                  还没有阅读数据
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
