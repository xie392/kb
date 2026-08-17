import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";

export const categoryRouter = router({
  /** 分类树（任意层级嵌套，含子分类和笔记数） */
  tree: publicProcedure.query(async ({ ctx }) => {
    // 未登录时每个分类的笔记数只统计公开文章
    const categories = await ctx.db.category.findMany({
      include: {
        _count: {
          select: {
            articles: ctx.user ? true : { where: { visibility: "public" } },
          },
        },
      },
      orderBy: { sort: "asc" },
    });

    type CategoryTreeNode = {
      id: string;
      name: string;
      sort: number;
      count: number;
      children: CategoryTreeNode[];
    };

    // 按 parentId 分组
    const childrenMap = new Map<string | null, typeof categories>();
    for (const c of categories) {
      const key = c.parentId;
      const arr = childrenMap.get(key) ?? [];
      arr.push(c);
      childrenMap.set(key, arr);
    }

    // 递归组装树
    const build = (parentId: string | null): CategoryTreeNode[] =>
      (childrenMap.get(parentId) ?? []).map((c) => ({
        id: c.id,
        name: c.name,
        sort: c.sort,
        count: c._count.articles,
        children: build(c.id),
      }));

    return build(null);
  }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(50),
        parentId: z.string().min(1).max(50).nullish(),
        sort: z.number().int().default(0),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (input.parentId) {
        const parent = await ctx.db.category.findUnique({
          where: { id: input.parentId },
        });
        if (!parent) throw new TRPCError({ code: "NOT_FOUND" });
      }
      return ctx.db.category.create({
        data: {
          name: input.name,
          parentId: input.parentId,
          sort: input.sort,
        },
      });
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string().min(1).max(50),
        name: z.string().min(1).max(50).optional(),
        sort: z.number().int().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      return ctx.db.category.update({ where: { id }, data });
    }),

  /** 删除分类：有子分类或笔记时拒绝 */
  delete: protectedProcedure
    .input(z.object({ id: z.string().min(1).max(50) }))
    .mutation(async ({ ctx, input }) => {
      const [children, articles] = await Promise.all([
        ctx.db.category.count({ where: { parentId: input.id } }),
        ctx.db.article.count({ where: { categoryId: input.id } }),
      ]);
      if (children > 0)
        throw new TRPCError({
          code: "CONFLICT",
          message: "该分类下有子分类，请先处理子分类",
        });
      if (articles > 0)
        throw new TRPCError({
          code: "CONFLICT",
          message: `该分类下有 ${articles} 篇文章，请先删除该分类下的文章后再删除该分类`,
        });
      await ctx.db.category.delete({ where: { id: input.id } });
      return { ok: true };
    }),
});
