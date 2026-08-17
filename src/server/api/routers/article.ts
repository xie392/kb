import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";

const articleSelect = {
  id: true,
  title: true,
  summary: true,
  visibility: true,
  isPinned: true,
  isFavorite: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  category: { select: { id: true, name: true, parent: { select: { name: true } } } },
  tags: { select: { tag: { select: { id: true, name: true } } } },
} as const;

const listInput = z.object({
  status: z.enum(["normal", "trash"]).default("normal"),
  categoryId: z.string().min(1).max(50).nullish(),
  tagId: z.string().min(1).max(50).nullish(),
  keyword: z.string().max(100).optional(),
  visibility: z.enum(["private", "public"]).optional(),
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(100).default(20),
});

export const articleRouter = router({
  list: publicProcedure.input(listInput).query(async ({ ctx, input }) => {
    const where: Record<string, unknown> = { status: input.status };
    if (input.categoryId) where.categoryId = input.categoryId;
    // 未登录只能看到公开文章
    if (!ctx.user) {
      where.visibility = "public";
    } else if (input.visibility) {
      where.visibility = input.visibility;
    }
    if (input.keyword) {
      where.OR = [
        { title: { contains: input.keyword } },
        { summary: { contains: input.keyword } },
        { content: { contains: input.keyword } },
      ];
    }
    if (input.tagId) {
      where.tags = { some: { tagId: input.tagId } };
    }

    const [items, total] = await Promise.all([
      ctx.db.article.findMany({
        where,
        select: articleSelect,
        orderBy: [{ isPinned: "desc" }, { updatedAt: "desc" }],
        skip: (input.page - 1) * input.pageSize,
        take: input.pageSize,
      }),
      ctx.db.article.count({ where }),
    ]);

    return {
      items: items.map((a) => ({
        ...a,
        categoryName: a.category ? (a.category.parent ? `${a.category.parent.name}/${a.category.name}` : a.category.name) : null,
        tagNames: a.tags.map((t) => t.tag.name),
      })),
      total,
      page: input.page,
      pageSize: input.pageSize,
    };
  }),

  get: publicProcedure
    .input(z.object({ id: z.string().min(1).max(50) }))
    .query(async ({ ctx, input }) => {
      const article = await ctx.db.article.findUnique({
        where: { id: input.id },
        include: {
          category: { select: { id: true, name: true, parent: { select: { name: true } } } },
          tags: { select: { tag: { select: { id: true, name: true } } } },
        },
      });
      if (!article) throw new TRPCError({ code: "NOT_FOUND" });
      // 未登录只能看公开文章
      if (!ctx.user && article.visibility !== "public") {
        throw new TRPCError({ code: "NOT_FOUND" });
      }
      return {
        ...article,
        categoryName: article.category
          ? article.category.parent
            ? `${article.category.parent.name}/${article.category.name}`
            : article.category.name
          : null,
        tagNames: article.tags.map((t) => t.tag.name),
      };
    }),

  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1).max(200),
        content: z.string(),
        summary: z.string().max(500).nullish(),
        categoryId: z.string().min(1).max(50).nullish(),
        visibility: z.enum(["private", "public"]).default("private"),
        tagIds: z.array(z.string().min(1).max(50)).max(10).default([]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const summary =
        input.summary ??
        input.content.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").slice(0, 100);
      return ctx.db.article.create({
        data: {
          title: input.title,
          content: input.content,
          summary,
          categoryId: input.categoryId,
          visibility: input.visibility,
          tags: {
            create: input.tagIds.map((tagId) => ({ tagId })),
          },
        },
      });
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string().min(1).max(50),
        title: z.string().min(1).max(200).optional(),
        content: z.string().optional(),
        summary: z.string().max(500).nullish(),
        categoryId: z.string().min(1).max(50).nullish(),
        visibility: z.enum(["private", "public"]).optional(),
        isPinned: z.boolean().optional(),
        isFavorite: z.boolean().optional(),
        tagIds: z.array(z.string().min(1).max(50)).max(10).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, tagIds, ...data } = input;
      if (tagIds) {
        await ctx.db.articleTag.deleteMany({ where: { articleId: id } });
        await ctx.db.articleTag.createMany({
          data: tagIds.map((tagId) => ({ articleId: id, tagId })),
        });
      }
      return ctx.db.article.update({ where: { id }, data });
    }),

  softDelete: protectedProcedure
    .input(z.object({ ids: z.array(z.string().min(1).max(50)).min(1) }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.article.updateMany({
        where: { id: { in: input.ids } },
        data: { status: "trash", deletedAt: new Date() },
      });
      return { ok: true };
    }),

  restore: protectedProcedure
    .input(z.object({ ids: z.array(z.string().min(1).max(50)).min(1) }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.article.updateMany({
        where: { id: { in: input.ids } },
        data: { status: "normal", deletedAt: null },
      });
      return { ok: true };
    }),

  hardDelete: protectedProcedure
    .input(z.object({ ids: z.array(z.string().min(1).max(50)).min(1) }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.article.deleteMany({ where: { id: { in: input.ids } } });
      return { ok: true };
    }),

  /** 批量迁移分类 / 批量设权限 / 批量置顶 */
  batch: protectedProcedure
    .input(
      z.object({
        ids: z.array(z.string().min(1).max(50)).min(1),
        categoryId: z.string().min(1).max(50).nullish(),
        visibility: z.enum(["private", "public"]).nullish(),
        isPinned: z.boolean().nullish(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const data: Record<string, unknown> = {};
      if (input.categoryId !== null && input.categoryId !== undefined)
        data.categoryId = input.categoryId;
      if (input.visibility) data.visibility = input.visibility;
      if (input.isPinned !== null && input.isPinned !== undefined)
        data.isPinned = input.isPinned;
      await ctx.db.article.updateMany({
        where: { id: { in: input.ids } },
        data,
      });
      return { ok: true };
    }),
});
