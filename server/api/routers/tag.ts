import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "@/server/api/trpc";

export const tagRouter = router({
  list: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.tag.findMany({
      include: { _count: { select: { articles: true } } },
      orderBy: { name: "asc" },
    });
  }),

  create: protectedProcedure
    .input(z.object({ name: z.string().min(1).max(30) }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.tag.upsert({
        where: { name: input.name },
        update: {},
        create: { name: input.name },
      });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string().cuid() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.tag.delete({ where: { id: input.id } });
      return { ok: true };
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
    return { removed: empty.length };
  }),
});
