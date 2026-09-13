import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { revalidateKb } from "@/server/queries/revalidate";

export const tagRouter = router({
  list: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.tag.findMany({
      include: {
        _count: {
          select: {
            articles: ctx.user ? true : { where: { article: { visibility: "public" } } },
          },
        },
      },
      orderBy: { name: "asc" },
    });
  }),

  create: protectedProcedure
    .input(z.object({ name: z.string().min(1).max(30) }))
    .mutation(async ({ ctx, input }) => {
      const tag = await ctx.db.tag.upsert({
        where: { name: input.name },
        update: {},
        create: { name: input.name },
      });
      revalidateKb();
      return tag;
    }),

  update: protectedProcedure
    .input(z.object({ id: z.string().min(1).max(50), name: z.string().min(1).max(30) }))
    .mutation(async ({ ctx, input }) => {
      const tag = await ctx.db.tag.update({
        where: { id: input.id },
        data: { name: input.name },
      });
      revalidateKb();
      return tag;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string().min(1).max(50) }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.tag.delete({ where: { id: input.id } });
      revalidateKb();
      return { ok: true };
    }),

  /**
   * 合并标签：把 source 的绑定全部转移到 target（已绑定的跳过），然后删除 source。
   * 用于收敛同义/近义标签。
   */
  merge: protectedProcedure
    .input(z.object({ sourceId: z.string().min(1).max(50), targetId: z.string().min(1).max(50) }))
    .mutation(async ({ ctx, input }) => {
      if (input.sourceId === input.targetId) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "不能合并到自身" });
      }
      const [source, target] = await Promise.all([
        ctx.db.tag.findUnique({ where: { id: input.sourceId }, select: { id: true, name: true } }),
        ctx.db.tag.findUnique({ where: { id: input.targetId }, select: { id: true, name: true } }),
      ]);
      if (!source || !target) {
        throw new TRPCError({ code: "NOT_FOUND", message: "标签不存在" });
      }

      const moved = await ctx.db.$transaction(async (tx) => {
        const [targetLinks, sourceLinks] = await Promise.all([
          tx.articleTag.findMany({ where: { tagId: input.targetId }, select: { articleId: true } }),
          tx.articleTag.findMany({ where: { tagId: input.sourceId }, select: { articleId: true } }),
        ]);
        const hasTarget = new Set(targetLinks.map((l) => l.articleId));
        let count = 0;
        for (const l of sourceLinks) {
          if (hasTarget.has(l.articleId)) continue;
          await tx.articleTag.update({
            where: { articleId_tagId: { articleId: l.articleId, tagId: input.sourceId } },
            data: { tagId: input.targetId },
          });
          count++;
        }
        // 删除 source（剩余同名关联由级联清理）
        await tx.tag.delete({ where: { id: input.sourceId } });
        return count;
      });

      revalidateKb();
      return { ok: true, moved, sourceName: source.name, targetName: target.name };
    }),

  /** 清理空标签（绑定 0 篇笔记） */
  cleanEmpty: protectedProcedure.mutation(async ({ ctx }) => {
    const empty = await ctx.db.tag.findMany({
      where: { articles: { none: {} } },
      select: { id: true },
    });
    if (empty.length > 0) {
      await ctx.db.tag.deleteMany({
        where: { id: { in: empty.map((t) => t.id) } },
      });
    }
    revalidateKb();
    return { removed: empty.length };
  }),
});
