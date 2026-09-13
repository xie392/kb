import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "@/server/api/trpc";
import type { PrismaClient } from "@prisma/client";
import { localDayKey } from "@/lib/format";

/** 近 N 天每日新增笔记数（status: normal；未登录只统计公开文章） */
async function getDailyTrend(db: PrismaClient, includePrivate: boolean, days = 30) {
  const now = new Date();
  const out: { date: string; count: number }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    const next = new Date(d);
    next.setDate(d.getDate() + 1);
    const count = await db.article.count({
      where: {
        status: "normal",
        ...(includePrivate ? {} : { visibility: "public" }),
        createdAt: { gte: d, lt: next },
      },
    });
    out.push({ date: d.toISOString().slice(0, 10), count });
  }
  return out;
}

/** 近 N 天每日阅读量（从 ArticleDailyView 聚合） */
async function getDailyViews(db: PrismaClient, days = 30) {
  const now = new Date();
  const dates: string[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    dates.push(d.toISOString().slice(0, 10));
  }

  const rows = await db.articleDailyView.findMany({
    where: { date: { in: dates } },
    select: { date: true, count: true },
  });

  const map = new Map(rows.map((r) => [r.date, r.count]));
  return dates.map((date) => ({ date, count: map.get(date) ?? 0 }));
}

export const statsRouter = router({
  trend: publicProcedure.query(async ({ ctx }) =>
    getDailyTrend(ctx.db, !!ctx.user)
  ),

  /** 写作热力图：近 N 天每日新增笔记数（本地自然日，含私有） */
  heatmap: protectedProcedure
    .input(z.object({ days: z.number().int().min(30).max(365).default(182) }))
    .query(async ({ ctx, input }) => {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (input.days - 1));
      const rows = await ctx.db.article.findMany({
        where: { status: "normal", createdAt: { gte: start } },
        select: { createdAt: true },
      });
      const counts = new Map<string, number>();
      for (const r of rows) {
        const key = localDayKey(r.createdAt);
        counts.set(key, (counts.get(key) ?? 0) + 1);
      }
      const days: { date: string; count: number }[] = [];
      for (let i = input.days - 1; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
        const key = localDayKey(d);
        days.push({ date: key, count: counts.get(key) ?? 0 });
      }
      return { days };
    }),

  overview: protectedProcedure.query(async ({ ctx }) => {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const todayStr = now.toISOString().slice(0, 10);
    const weekDates: string[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      weekDates.push(d.toISOString().slice(0, 10));
    }

    const [
      total,
      todayNew,
      weekNew,
      monthNew,
      trash,
      publicCount,
      categories,
      totalViews,
      todayViewsRow,
      weekViewsRows,
      monthViewsRows,
      viewTrend,
      topArticles,
    ] = await Promise.all([
      ctx.db.article.count({ where: { status: "normal" } }),
      ctx.db.article.count({ where: { status: "normal", createdAt: { gte: startOfDay } } }),
      ctx.db.article.count({ where: { status: "normal", createdAt: { gte: startOfWeek } } }),
      ctx.db.article.count({ where: { status: "normal", createdAt: { gte: startOfMonth } } }),
      ctx.db.article.count({ where: { status: "trash" } }),
      ctx.db.article.count({ where: { status: "normal", visibility: "public" } }),
      ctx.db.category.findMany({
        where: { parentId: null },
        select: {
          id: true,
          name: true,
          _count: { select: { articles: { where: { status: "normal" } } } },
        },
      }),
      ctx.db.article.aggregate({
        where: { status: "normal" },
        _sum: { viewCount: true },
      }),
      ctx.db.articleDailyView.aggregate({
        where: { date: todayStr },
        _sum: { count: true },
      }),
      ctx.db.articleDailyView.aggregate({
        where: { date: { in: weekDates } },
        _sum: { count: true },
      }),
      ctx.db.articleDailyView.aggregate({
        where: { date: { gte: startOfMonth.toISOString().slice(0, 10) } },
        _sum: { count: true },
      }),
      getDailyViews(ctx.db, 30),
      ctx.db.article.findMany({
        where: { status: "normal", viewCount: { gt: 0 } },
        select: { id: true, title: true, viewCount: true },
        orderBy: { viewCount: "desc" },
        take: 5,
      }),
    ]);

    const days = await getDailyTrend(ctx.db, true);

    return {
      total,
      todayNew,
      weekNew,
      monthNew,
      trash,
      publicCount,
      privateCount: total - publicCount,
      categories: categories.map((c) => ({ id: c.id, name: c.name, count: c._count.articles })),
      trend: days,
      views: {
        total: totalViews._sum.viewCount ?? 0,
        today: todayViewsRow._sum.count ?? 0,
        week: weekViewsRows._sum.count ?? 0,
        month: monthViewsRows._sum.count ?? 0,
        trend: viewTrend,
        topArticles,
      },
    };
  }),
});
