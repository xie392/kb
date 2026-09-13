import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { io } from "next/cache";
import { getArchive } from "@/server/queries/public";
import { pageAlternates } from "@/lib/config";

export const metadata: Metadata = {
  title: "归档",
  description: "按时间线浏览全部公开笔记，纵览历年的记录脉络。",
  alternates: pageAlternates("/archive"),
};

type ArchiveItem = Awaited<ReturnType<typeof getArchive>>[number];

/** 按本地时间把文章分到「年 → 月」两级 */
function groupByYearMonth(items: ArchiveItem[]) {
  const years: {
    year: number;
    months: { month: number; items: ArchiveItem[] }[];
  }[] = [];

  for (const item of items) {
    const d = new Date(item.createdAt);
    const year = d.getFullYear();
    const month = d.getMonth() + 1;
    let yearGroup = years.find((y) => y.year === year);
    if (!yearGroup) {
      yearGroup = { year, months: [] };
      years.push(yearGroup);
    }
    let monthGroup = yearGroup.months.find((m) => m.month === month);
    if (!monthGroup) {
      monthGroup = { month, items: [] };
      yearGroup.months.push(monthGroup);
    }
    monthGroup.items.push(item);
  }
  return years;
}

export default function ArchivePage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-250 mx-auto px-4 sm:px-6 py-20 text-center font-hand-body text-[16px] text-ink-faint">
          正在整理时间线…
        </div>
      }
    >
      <ArchiveContent />
    </Suspense>
  );
}

async function ArchiveContent() {
  await io(); // 动态渲染：分组依赖本地时区
  const items = await getArchive();
  const grouped = groupByYearMonth(items);

  return (
    <div className="max-w-250 mx-auto px-4 sm:px-6 py-10">
      <header className="mb-12 text-center pt-4 fade-up">
        <h1 className="font-hand-display text-[40px] font-bold text-secondary rotate-[-1deg]">
          归档
        </h1>
        <p className="mt-2 font-hand-body text-[16px] text-ink-muted">
          按时间线回顾，共 {items.length} 篇公开笔记
        </p>
      </header>

      {grouped.length === 0 ? (
        <div className="py-20 text-center font-hand-body text-[16px] text-ink-faint">
          还没有公开的笔记
        </div>
      ) : (
        <div className="space-y-12">
          {grouped.map((yearGroup) => (
            <section key={yearGroup.year} className="fade-up">
              <div className="flex items-center gap-4 mb-5">
                <h2 className="font-hand-display text-[32px] font-bold text-secondary rotate-[-1deg]">
                  {yearGroup.year}
                </h2>
                <span className="flex-1 pencil-line h-[2px]" />
                <span className="font-hand-body text-[14px] text-ink-faint tabular-nums">
                  {yearGroup.months.reduce((s, m) => s + m.items.length, 0)} 篇
                </span>
              </div>

              <div className="space-y-6">
                {yearGroup.months.map((monthGroup) => (
                  <div key={monthGroup.month}>
                    <div className="font-hand-display text-[18px] font-bold text-sticker-pink mb-2 ml-1">
                      {monthGroup.month} 月
                    </div>
                    <div className="bg-white sketch-border sketch-shadow divide-y divide-dashed divide-hairline">
                      {monthGroup.items.map((a) => {
                        const d = new Date(a.createdAt);
                        const day = String(d.getDate()).padStart(2, "0");
                        return (
                          <Link
                            key={a.id}
                            href={`/article/${a.id}`}
                            className="group flex items-center gap-4 py-3.5 px-4 sm:px-5"
                          >
                            <span className="font-hand-body text-[14px] text-ink-faint tabular-nums w-8 shrink-0">
                              {day}
                            </span>
                            <span className="font-hand-display text-[19px] font-bold text-ink-secondary group-hover:text-primary transition-colors truncate flex-1">
                              {a.title}
                            </span>
                            <span className="hidden sm:inline font-hand-body text-[13px] text-sticker-pink shrink-0">
                              【{a.categoryName ?? "未分类"}】
                            </span>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
