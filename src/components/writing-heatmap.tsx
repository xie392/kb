interface HeatmapDatum {
  date: string; // YYYY-MM-DD
  count: number;
}

const LEVEL_CLASS = [
  "bg-canvas-soft border border-hairline",
  "bg-primary/20",
  "bg-primary/45",
  "bg-primary/70",
  "bg-primary",
];

function parseDay(date: string): Date {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

/**
 * 写作热力图（GitHub 贡献图风格）：按周分列、每列 7 天。
 * 纯展示组件，数据由 stats.heatmap 提供，深色模式跟随 CSS 变量。
 */
export default function WritingHeatmap({ data }: { data: HeatmapDatum[] }) {
  if (data.length === 0) return null;

  const max = Math.max(...data.map((d) => d.count), 1);
  const levelOf = (count: number) => {
    if (count === 0) return 0;
    if (count >= max) return 4;
    if (count >= max * 0.6) return 3;
    if (count >= max * 0.3) return 2;
    return 1;
  };

  // 首日之前用空格补齐，使每列为同一星期几
  const pad = parseDay(data[0].date).getDay();
  const cells: (HeatmapDatum | null)[] = [
    ...Array.from({ length: pad }, () => null),
    ...data,
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const weeks: (HeatmapDatum | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));

  const total = data.reduce((s, d) => s + d.count, 0);
  const activeDays = data.filter((d) => d.count > 0).length;

  return (
    <div>
      <div className="flex items-baseline gap-3 mb-3">
        <span className="font-hand-body text-[13px] text-ink-faint">
          近 {data.length} 天共 {total} 篇
        </span>
        <span className="font-hand-body text-[13px] text-ink-faint">
          · 有记录 {activeDays} 天
        </span>
      </div>

      <div className="overflow-x-auto pb-1">
        <div className="flex gap-[3px] min-w-max">
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-[3px]">
              {week.map((cell, di) => (
                <div
                  key={di}
                  title={cell ? `${cell.date} · ${cell.count} 篇` : ""}
                  className={`w-3 h-3 rounded-[2px] ${
                    cell ? LEVEL_CLASS[levelOf(cell.count)] : "bg-transparent"
                  }`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-3 flex items-center gap-1.5 font-hand-body text-[12px] text-ink-faint">
        <span>少</span>
        {LEVEL_CLASS.map((cls, i) => (
          <span key={i} className={`w-3 h-3 rounded-[2px] ${cls}`} />
        ))}
        <span>多</span>
      </div>
    </div>
  );
}
