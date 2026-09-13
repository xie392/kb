import { z } from "zod";
import { router, publicProcedure } from "@/server/api/trpc";
import { buildSnippet } from "@/lib/search";

/** 命中来源：标题 > 分类 > 标签 > 摘要 > 正文，权重依次递减 */
type Hit = {
  id: string;
  title: string;
  summary: string | null;
  updatedAt: Date;
  snippet: string | null;
};

export const searchRouter = router({
  /** 前台搜索：标题/摘要/正文/分类名/标签名，按相关性排序 */
  search: publicProcedure
    .input(z.object({ q: z.string().min(1).max(100) }))
    .query(async ({ ctx, input }) => {
      const kw = input.q.trim();
      if (!kw) return { items: [] };

      // 未登录只能搜到公开文章
      const pubFilter = ctx.user ? {} : { visibility: "public" as const };
      const base = { status: "normal" as const, ...pubFilter };
      const pick = { id: true, title: true, summary: true, updatedAt: true } as const;

      const [byTitle, byCategory, byTag, bySummary, byContent] = await Promise.all([
        ctx.db.article.findMany({
          where: { ...base, title: { contains: kw } },
          select: pick,
          orderBy: { updatedAt: "desc" },
          take: 10,
        }),
        ctx.db.article.findMany({
          where: { ...base, category: { name: { contains: kw } } },
          select: pick,
          orderBy: { updatedAt: "desc" },
          take: 10,
        }),
        ctx.db.article.findMany({
          where: { ...base, tags: { some: { tag: { name: { contains: kw } } } } },
          select: pick,
          orderBy: { updatedAt: "desc" },
          take: 10,
        }),
        ctx.db.article.findMany({
          where: { ...base, summary: { contains: kw } },
          select: pick,
          orderBy: { updatedAt: "desc" },
          take: 10,
        }),
        ctx.db.article.findMany({
          where: { ...base, content: { contains: kw } },
          select: { ...pick, content: true },
          orderBy: { updatedAt: "desc" },
          take: 10,
        }),
      ]);

      // 合并去重，优先级：标题 > 分类 > 标签 > 摘要 > 正文
      const seen = new Set<string>();
      const items: Hit[] = [];
      const push = (a: { id: string; title: string; summary: string | null; updatedAt: Date }, snippet: string | null) => {
        if (seen.has(a.id)) return;
        seen.add(a.id);
        items.push({ id: a.id, title: a.title, summary: a.summary, updatedAt: a.updatedAt, snippet });
      };

      for (const a of byTitle) push(a, a.summary);
      for (const a of byCategory) push(a, a.summary);
      for (const a of byTag) push(a, a.summary);
      for (const a of bySummary) push(a, a.summary);
      // 正文命中：用关键词上下文生成片段
      for (const a of byContent) push(a, buildSnippet(a.content, kw));

      return { items: items.slice(0, 10) };
    }),
});
