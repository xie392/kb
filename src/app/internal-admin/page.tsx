"use client";

import { api } from "@/trpc/client";

const CARD_COLORS = ["#0075de", "#ff64c8", "#2a9d99", "#dd5b00"];

export default function AdminDashboardPage() {
  const { data, isFetching } = api.stats.overview.useQuery();

  const stats = data
    ? [
        { label: "总笔记数", value: data.total, delta: `今日 +${data.todayNew}`, color: CARD_COLORS[0] },
        { label: "本周新增", value: data.weekNew, delta: "本周", color: CARD_COLORS[1] },
        { label: "本月新增", value: data.monthNew, delta: "本月", color: CARD_COLORS[2] },
        { label: "收藏笔记", value: data.favorites, delta: "收藏", color: CARD_COLORS[3] },
      ]
    : [];

  const maxTrend = Math.max(...(data?.trend.map((t) => t.count) ?? [1]), 1);
  const maxCat = Math.max(...(data?.categories.map((c) => c.count) ?? [1]), 1);

  return (
    <div className="p-8 w-full">
      {isFetching && (
        <div aria-live="polite" className="mb-4 sticky-note sketch-border px-4 py-2 rotate-[-1deg] w-fit">
          <span className="font-hand-display text-[16px] font-bold text-ink-faint">加载中…</span>
        </div>
      )}

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s, i) => (
          <div key={s.label} className="bg-white sketch-border sketch-shadow p-5 fade-up" style={{ animationDelay: `${i * 60}ms` }}>
            <div className="flex items-center justify-between">
              <span className="w-9 h-9 grid place-items-center text-white font-hand-display text-[18px] font-bold sketch-border rotate-[-3deg]" style={{ backgroundColor: s.color }}>
                {s.value}
              </span>
              <span className="font-hand-body text-[13px] text-ink-faint">{s.delta}</span>
            </div>
            <div className="mt-4">
              <div className="font-hand-display text-[32px] font-bold text-ink-secondary tabular-nums leading-none">
                {s.value}
              </div>
              <div className="mt-1 font-hand-body text-[14px] text-ink-muted">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* 趋势图（手绘柱状） */}
        <div className="bg-white sketch-border sketch-shadow p-6 lg:col-span-3 fade-up" style={{ animationDelay: "240ms" }}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-hand-display text-[22px] font-bold text-ink-secondary marker-underline inline-block">
                近 30 天新增趋势
              </h3>
              <p className="font-hand-body text-[13px] text-ink-faint mt-1">每日新增笔记数</p>
            </div>
          </div>
          <div className="flex items-end gap-1 h-40">
            {(data?.trend ?? []).map((t, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
                <span className="text-[10px] text-ink-faint opacity-0 group-hover:opacity-100 transition-opacity tabular-nums">
                  {t.count}
                </span>
                <div
                  className="w-full rounded-t-[3px] transition-opacity group-hover:opacity-70"
                  style={{
                    height: `${(t.count / maxTrend) * 100}%`,
                    backgroundColor: i === (data?.trend.length ?? 0) - 1 ? "#0075de" : "#d6e8fb",
                    border: "1px solid rgba(49,48,46,0.25)",
                  }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* 分类分布 */}
        <div className="bg-white sketch-border sketch-shadow p-6 lg:col-span-2 fade-up" style={{ animationDelay: "300ms" }}>
          <h3 className="font-hand-display text-[22px] font-bold text-ink-secondary marker-underline inline-block">
            分类分布
          </h3>
          <div className="mt-6 space-y-4">
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
                      style={{ width: `${Math.max(pct, 4)}%`, backgroundColor: CARD_COLORS[i % 4] }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          {data && (
            <div className="mt-6 pt-4 border-t-2 border-dashed border-hairline grid grid-cols-3 gap-3 text-center">
              <div>
                <div className="font-hand-display text-[22px] font-bold text-ink-secondary tabular-nums">{data.trash}</div>
                <div className="font-hand-body text-[12px] text-ink-faint">回收站</div>
              </div>
              <div>
                <div className="font-hand-display text-[22px] font-bold text-ink-secondary tabular-nums">{data.publicCount}</div>
                <div className="font-hand-body text-[12px] text-ink-faint">公开文章</div>
              </div>
              <div>
                <div className="font-hand-display text-[22px] font-bold text-ink-secondary tabular-nums">{data.privateCount}</div>
                <div className="font-hand-body text-[12px] text-ink-faint">私有文章</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
