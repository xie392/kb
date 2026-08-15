import { categories } from "@/lib/mock-data";

const stats = [
  { label: "总笔记数", value: 42, delta: "+3 今日", color: "#0075de", icon: "doc" },
  { label: "本周新增", value: 9, delta: "+2 较上周", color: "#ff64c8", icon: "plus" },
  { label: "本月新增", value: 21, delta: "63% 增量", color: "#2a9d99", icon: "calendar" },
  { label: "收藏笔记", value: 7, delta: "16.7% 占比", color: "#dd5b00", icon: "star" },
];

const trend = [4, 6, 3, 8, 5, 9, 7, 11, 6, 8, 12, 9];
const maxTrend = Math.max(...trend);

function StatIcon({ name }: { name: string }) {
  const cls = "w-4 h-4";
  switch (name) {
    case "doc":
      return (
        <svg className={cls} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M4 3.5h8l3 3v10H4v-13z" strokeLinejoin="round" />
        </svg>
      );
    case "plus":
      return (
        <svg className={cls} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M10 4v12M4 10h12" strokeLinecap="round" />
        </svg>
      );
    case "calendar":
      return (
        <svg className={cls} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="3" y="4.5" width="14" height="12" rx="1.5" />
          <path d="M3 8.5h14M7 3v3M13 3v3" />
        </svg>
      );
    case "star":
      return (
        <svg className={cls} viewBox="0 0 20 20" fill="currentColor">
          <path d="M10 2.5l2.2 4.6 5 .7-3.6 3.6.9 5-4.5-2.4-4.5 2.4.9-5L2.8 7.8l5-.7L10 2.5z" />
        </svg>
      );
  }
}

export default function AdminDashboardPage() {
  return (
    <div className="p-8 w-full">
      {/* 统计卡片 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s, i) => (
          <div
            key={s.label}
            className="card p-5 fade-up"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <div className="flex items-center justify-between">
              <span
                className="w-9 h-9 sketch-border grid place-items-center text-white"
                style={{ backgroundColor: s.color }}
              >
                <StatIcon name={s.icon} />
              </span>
              <span className="text-[11px] text-[#a39e98]">{s.delta}</span>
            </div>
            <div className="mt-4">
              <div className="text-[28px] font-bold tracking-[-0.625px] text-ink tabular-nums">
                {s.value}
              </div>
              <div className="text-[13px] text-[#615d59] mt-0.5">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* 趋势图 */}
        <div className="card p-6 lg:col-span-3 fade-up" style={{ animationDelay: "240ms" }}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-[15px] font-semibold text-ink">近 30 天新增趋势</h3>
              <p className="text-[12px] text-[#a39e98] mt-0.5">每日新增笔记数</p>
            </div>
            <span className="px-2.5 py-1 rounded-full text-[11px] bg-[#f6f5f4] text-[#615d59] border border-[#e6e6e6]">
              30 天
            </span>
          </div>
          <div className="flex items-end gap-[6px] h-[160px]">
            {trend.map((v, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1.5 group">
                <span className="text-[10px] text-[#a39e98] opacity-0 group-hover:opacity-100 transition-opacity tabular-nums">
                  {v}
                </span>
                <div
                  className="w-full rounded-t-[4px] transition-all duration-300 group-hover:opacity-80"
                  style={{
                    height: `${(v / maxTrend) * 100}%`,
                    backgroundColor: i === trend.length - 1 ? "#0075de" : "#d6e8fb",
                  }}
                />
              </div>
            ))}
          </div>
          <div className="mt-2 flex justify-between text-[10px] text-[#a39e98]">
            <span>07-16</span>
            <span>07-23</span>
            <span>07-30</span>
            <span>08-06</span>
            <span>08-14</span>
          </div>
        </div>

        {/* 分类分布 */}
        <div className="card p-6 lg:col-span-2 fade-up" style={{ animationDelay: "300ms" }}>
          <h3 className="text-[15px] font-semibold text-ink">分类分布</h3>
          <p className="text-[12px] text-[#a39e98] mt-0.5">各分类笔记数量占比</p>
          <div className="mt-6 space-y-4">
            {categories.map((cat) => {
              const pct = Math.round((cat.count / 42) * 100);
              return (
                <div key={cat.id}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="flex items-center gap-2 text-[13px] text-[#31302e]">
                      <span className="sticker-dot" style={{ backgroundColor: cat.color }} />
                      {cat.name}
                    </span>
                    <span className="text-[12px] text-[#615d59] tabular-nums">
                      {cat.count} 篇 · {pct}%
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-[#f6f5f4] overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${pct}%`, backgroundColor: cat.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-6 pt-4 border-t border-[#e6e6e6] grid grid-cols-3 gap-3 text-center">
            <div>
              <div className="text-[18px] font-bold text-ink tabular-nums">2</div>
              <div className="text-[11px] text-[#a39e98] mt-0.5">回收站</div>
            </div>
            <div>
              <div className="text-[18px] font-bold text-ink tabular-nums">3</div>
              <div className="text-[11px] text-[#a39e98] mt-0.5">公开文章</div>
            </div>
            <div>
              <div className="text-[18px] font-bold text-ink tabular-nums">37</div>
              <div className="text-[11px] text-[#a39e98] mt-0.5">私有文章</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
