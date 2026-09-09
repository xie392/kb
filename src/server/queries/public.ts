// 前台公开内容查询（Cache Components）。
// 说明：前台页面始终处于未登录态，故所有查询固定只取 visibility: "public" 的文章，
// 与 tRPC 中「未登录 ctx.user 为空」分支的行为完全一致，但不再依赖 auth()/cookies，
// 因此可用 "use cache" 进静态壳/预取，实现点击即跳转。
//
// 缓存失效：
// - 时间维度由 cacheLife('kb') 后台静默刷新；
// - 后台写操作后调用 revalidateTag('kb', 'max') 即时失效（见 server/queries/revalidate.ts）。
import { cacheLife, cacheTag } from "next/cache";
import type { Prisma } from "@prisma/client";
import { db } from "@/server/db";

const articleSelect = {
  id: true,
  title: true,
  summary: true,
  visibility: true,
  isPinned: true,
  viewCount: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  category: { select: { id: true, name: true, parent: { select: { name: true } } } },
  tags: { select: { tag: { select: { id: true, name: true } } } },
} as const;

type ArticleListItem = Prisma.ArticleGetPayload<{ select: typeof articleSelect }>;

function mapArticle(a: ArticleListItem) {
  return {
    ...a,
    categoryName: a.category
      ? a.category.parent
        ? `${a.category.parent.name}/${a.category.name}`
        : a.category.name
      : null,
    tagNames: a.tags.map((t) => t.tag.name),
  };
}

/** 文章列表（等价 article.list 的未登录分支） */
export async function listArticles(input: { page?: number; pageSize?: number }) {
  "use cache";
  cacheLife("kb");
  cacheTag("kb");

  const page = input.page ?? 1;
  const pageSize = input.pageSize ?? 20;
  const where = { status: "normal" as const, visibility: "public" as const };

  const [items, total] = await Promise.all([
    db.article.findMany({
      where,
      select: articleSelect,
      orderBy: [{ isPinned: "desc" }, { updatedAt: "desc" }],
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    db.article.count({ where }),
  ]);

  return {
    items: items.map(mapArticle),
    total,
    page,
    pageSize,
    nextCursor: page * pageSize < total ? page + 1 : null,
  };
}

/** 文章详情（等价 article.get 的未登录分支；不存在或非公开时返回 null） */
export async function getArticle(id: string) {
  "use cache";
  cacheLife("kb");
  cacheTag("kb");

  const article = await db.article.findUnique({
    where: { id },
    include: {
      category: { select: { id: true, name: true, parent: { select: { name: true } } } },
      tags: { select: { tag: { select: { id: true, name: true } } } },
    },
  });
  if (!article || article.visibility !== "public") return null;
  return {
    ...article,
    categoryName: article.category
      ? article.category.parent
        ? `${article.category.parent.name}/${article.category.name}`
        : article.category.name
      : null,
    tagNames: article.tags.map((t) => t.tag.name),
  };
}

/** 上一篇/下一篇（等价 article.adjacent 的未登录分支） */
export async function getAdjacent(id: string) {
  "use cache";
  cacheLife("kb");
  cacheTag("kb");

  const self = await db.article.findUnique({
    where: { id },
    select: { isPinned: true, updatedAt: true },
  });
  if (!self) return { prev: null, next: null };

  const pick = { id: true, title: true } as const;
  const base = { status: "normal" as const, visibility: "public" as const };

  let prev = null;
  if (self.isPinned) {
    prev = await db.article.findFirst({
      where: { ...base, isPinned: true, updatedAt: { gt: self.updatedAt } },
      orderBy: { updatedAt: "asc" },
      select: pick,
    });
  } else {
    prev = await db.article.findFirst({
      where: { ...base, isPinned: false, updatedAt: { gt: self.updatedAt } },
      orderBy: { updatedAt: "asc" },
      select: pick,
    });
    if (!prev) {
      prev = await db.article.findFirst({
        where: { ...base, isPinned: true },
        orderBy: { updatedAt: "asc" },
        select: pick,
      });
    }
  }

  let next = null;
  if (self.isPinned) {
    next = await db.article.findFirst({
      where: { ...base, isPinned: true, updatedAt: { lt: self.updatedAt } },
      orderBy: { updatedAt: "desc" },
      select: pick,
    });
    if (!next) {
      next = await db.article.findFirst({
        where: { ...base, isPinned: false },
        orderBy: { updatedAt: "desc" },
        select: pick,
      });
    }
  } else {
    next = await db.article.findFirst({
      where: { ...base, isPinned: false, updatedAt: { lt: self.updatedAt } },
      orderBy: { updatedAt: "desc" },
      select: pick,
    });
  }

  return { prev, next };
}

/** 分类树（等价 category.tree 的未登录分支，笔记数只统计公开文章） */
export async function getCategoryTree() {
  "use cache";
  cacheLife("kb");
  cacheTag("kb");

  const categories = await db.category.findMany({
    include: {
      _count: { select: { articles: { where: { visibility: "public" } } } },
    },
    orderBy: { sort: "asc" },
  });

  type TreeNode = { id: string; name: string; sort: number; count: number; children: TreeNode[] };

  const childrenMap = new Map<string | null, typeof categories>();
  for (const c of categories) {
    const arr = childrenMap.get(c.parentId) ?? [];
    arr.push(c);
    childrenMap.set(c.parentId, arr);
  }

  const build = (parentId: string | null): TreeNode[] =>
    (childrenMap.get(parentId) ?? []).map((c) => {
      const children = build(c.id);
      const childCount = children.reduce((sum, ch) => sum + ch.count, 0);
      return {
        id: c.id,
        name: c.name,
        sort: c.sort,
        count: c._count.articles + childCount,
        children,
      };
    });

  return build(null);
}

/** 标签列表（等价 tag.list 的未登录分支，文章数只统计公开文章） */
export async function getTagList() {
  "use cache";
  cacheLife("kb");
  cacheTag("kb");

  return db.tag.findMany({
    include: {
      _count: { select: { articles: { where: { article: { visibility: "public" } } } } },
    },
    orderBy: { name: "asc" },
  });
}

/** 近 30 天每日新增笔记数（等价 stats.trend 的未登录分支，只统计公开文章） */
export async function getTrend(days = 30) {
  "use cache";
  cacheLife("kb");
  cacheTag("kb");

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
        visibility: "public",
        createdAt: { gte: d, lt: next },
      },
    });
    out.push({ date: d.toISOString().slice(0, 10), count });
  }
  return out;
}
