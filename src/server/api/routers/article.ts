import { z } from "zod";
import { cookies } from "next/headers";
import { router, publicProcedure, protectedProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";

const articleSelect = {
  id: true,
  title: true,
  summary: true,
  visibility: true,
  isPinned: true,
  isFavorite: true,
  viewCount: true,
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
  cursor: z.number().int().min(1).nullish(),
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

    const page = input.cursor ?? input.page;

    const [items, total] = await Promise.all([
      ctx.db.article.findMany({
        where,
        select: articleSelect,
        orderBy: [{ isPinned: "desc" }, { updatedAt: "desc" }],
        skip: (page - 1) * input.pageSize,
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
      page,
      pageSize: input.pageSize,
      nextCursor: page * input.pageSize < total ? page + 1 : null,
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

  /** 记录一次文章阅读（Cookie 30分钟去重 + localStorage 前端去重） */
  trackView: publicProcedure
    .input(z.object({ id: z.string().min(1).max(50) }))
    .mutation(async ({ ctx, input }) => {
      const article = await ctx.db.article.findUnique({
        where: { id: input.id },
        select: { id: true, visibility: true, status: true },
      });
      if (!article || article.status !== "normal") return { ok: false, counted: false };
      if (!ctx.user && article.visibility !== "public") return { ok: false, counted: false };

      const cookieStore = await cookies();
      const viewed = cookieStore.get("kb_viewed")?.value;
      const viewedSet = new Set(viewed ? viewed.split(",").filter(Boolean) : []);
      const key = input.id;

      if (viewedSet.has(key)) {
        return { ok: true, counted: false };
      }

      viewedSet.add(key);
      const MAX_COOKIE_ITEMS = 40;
      const arr = [...viewedSet].slice(-MAX_COOKIE_ITEMS);
      const cookieVal = arr.join(",");
      try {
        cookieStore.set("kb_viewed", cookieVal, {
          maxAge: 60 * 30,
          path: "/",
          httpOnly: true,
          sameSite: "lax",
        });
      } catch {
        // RSC 环境下 cookie 可能只读，忽略
      }

      const today = new Date().toISOString().slice(0, 10);
      await ctx.db.$transaction([
        ctx.db.article.update({
          where: { id: input.id },
          data: { viewCount: { increment: 1 } },
        }),
        ctx.db.articleDailyView.upsert({
          where: { articleId_date: { articleId: input.id, date: today } },
          create: { articleId: input.id, date: today, count: 1 },
          update: { count: { increment: 1 } },
        }),
      ]);
      return { ok: true, counted: true };
    }),

  adjacent: publicProcedure
    .input(z.object({ id: z.string().min(1).max(50) }))
    .query(async ({ ctx, input }) => {
      const vis = ctx.user ? undefined : { visibility: "public" as const };

      const self = await ctx.db.article.findUnique({
        where: { id: input.id },
        select: { isPinned: true, updatedAt: true },
      });
      if (!self) throw new TRPCError({ code: "NOT_FOUND" });

      const pick = { id: true, title: true } as const;
      const base = { status: "normal" as const, ...vis };

      // 列表顺序 = [置顶组 updatedAt 倒序] ++ [非置顶组 updatedAt 倒序]
      // 上一篇：当前组内更晚更新的，否则是上一组的最后一篇
      let prev = null;
      if (self.isPinned) {
        prev = await ctx.db.article.findFirst({
          where: { ...base, isPinned: true, updatedAt: { gt: self.updatedAt } },
          orderBy: { updatedAt: "asc" },
          select: pick,
        });
      } else {
        prev = await ctx.db.article.findFirst({
          where: { ...base, isPinned: false, updatedAt: { gt: self.updatedAt } },
          orderBy: { updatedAt: "asc" },
          select: pick,
        });
        if (!prev) {
          prev = await ctx.db.article.findFirst({
            where: { ...base, isPinned: true },
            orderBy: { updatedAt: "asc" },
            select: pick,
          });
        }
      }

      // 下一篇：当前组内更早更新的，否则是下一组的第一篇
      let next = null;
      if (self.isPinned) {
        next = await ctx.db.article.findFirst({
          where: { ...base, isPinned: true, updatedAt: { lt: self.updatedAt } },
          orderBy: { updatedAt: "desc" },
          select: pick,
        });
        if (!next) {
          next = await ctx.db.article.findFirst({
            where: { ...base, isPinned: false },
            orderBy: { updatedAt: "desc" },
            select: pick,
          });
        }
      } else {
        next = await ctx.db.article.findFirst({
          where: { ...base, isPinned: false, updatedAt: { lt: self.updatedAt } },
          orderBy: { updatedAt: "desc" },
          select: pick,
        });
      }

      return { prev, next };
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
