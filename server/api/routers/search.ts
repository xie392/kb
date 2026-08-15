import { z } from "zod";
import { router, publicProcedure } from "@/server/api/trpc";

export const searchRouter = router({
  /** 前台搜索：标题/摘要/分类名/标签名，按相关性排序 */
  search: publicProcedure
    .input(z.object({ q: z.string().min(1).max(100) }))
    .query(async ({ ctx, input }) => {
      const kw = input.q.trim();
      if (!kw) return { items: [] };

      const [byTitle, bySummary, byCategory, byTag] = await Promise.all([
        ctx.db.article.findMany({
          where: { status: "normal", title: { contains: kw } },
          select: { id: true, title: true, summary: true, updatedAt: true },
          take: 10,
        }),
        ctx.db.article.findMany({
          where: { status: "normal", summary: { contains: kw } },
          select: { id: true, title: true, summary: true, updatedAt: true },
          take: 10,
        }),
        ctx.db.article.findMany({
          where: { status: "normal", category: { name: { contains: kw } } },
          select: { id: true, title: true, summary: true, updatedAt: true },
          take: 10,
        }),
        ctx.db.article.findMany({
          where: { status: "normal", tags: { some: { tag: { name: { contains: kw } } } } },
          select: { id: true, title: true, summary: true, updatedAt: true },
          take: 10,
        }),
      ]);

      // 合并去重，标题命中优先
      const seen = new Set<string>();
      const items: { id: string; title: string; summary: string | null; updatedAt: Date }[] = [];
      for (const group of [byTitle, byCategory, byTag, bySummary]) {
        for (const a of group) {
          if (!seen.has(a.id)) {
            seen.add(a.id);
            items.push(a);
          }
        }
      }
      return { items: items.slice(0, 10) };
    }),
});
