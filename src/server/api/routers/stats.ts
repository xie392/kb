import { router, publicProcedure, protectedProcedure } from "@/server/api/trpc";
import type { PrismaClient } from "@prisma/client";

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

export const statsRouter = router({
  /** 近 30 天每日新增（公开，供前台首页图表） */
  trend: publicProcedure.query(async ({ ctx }) =>
    getDailyTrend(ctx.db, !!ctx.user)
  ),

  overview: protectedProcedure.query(async ({ ctx }) => {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      total,
      todayNew,
      weekNew,
      monthNew,
      favorites,
      trash,
      publicCount,
      categories,
    ] = await Promise.all([
      ctx.db.article.count({ where: { status: "normal" } }),
      ctx.db.article.count({ where: { status: "normal", createdAt: { gte: startOfDay } } }),
      ctx.db.article.count({ where: { status: "normal", createdAt: { gte: startOfWeek } } }),
      ctx.db.article.count({ where: { status: "normal", createdAt: { gte: startOfMonth } } }),
      ctx.db.article.count({ where: { status: "normal", isFavorite: true } }),
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
    ]);

    // 近 30 天每日新增（后台已登录，统计全部）
    const days = await getDailyTrend(ctx.db, true);

    return {
      total,
      todayNew,
      weekNew,
      monthNew,
      favorites,
      trash,
      publicCount,
      privateCount: total - publicCount,
      categories: categories.map((c) => ({ id: c.id, name: c.name, count: c._count.articles })),
      trend: days,
    };
  }),
});
