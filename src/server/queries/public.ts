// 前台内容查询。
// - 未登录：只查公开文章，走 "use cache" 缓存，点击即跳转
// - 已登录：可以查看所有正常状态文章（包括私有），不走缓存（缓存不区分用户）
//
// 缓存失效：
// - 时间维度由 cacheLife('kb') 后台静默刷新；
// - 后台写操作后调用 revalidateTag('kb', 'max') 即时失效（见 server/queries/revalidate.ts）。
import { cacheLife, cacheTag } from "next/cache";
import type { Prisma } from "@prisma/client";
import { auth } from "@/server/auth";
import { db } from "@/server/db";

const articleSelect = {
  id: true,
  title: true,
  summary: true,
  visibility: true,
  isPinned: true,
  viewCount: true,
  status: true,
  categoryId: true,
  createdAt: true,
  updatedAt: true,
  category: { select: { id: true, name: true, parent: { select: { name: true } } } },
  tags: { select: { tag: { select: { id: true, name: true } } } },
} as const;

type ArticleListItem = Prisma.ArticleGetPayload<{ select: typeof articleSelect }>;
type ArticleDetail = ArticleListItem & { content: string };

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

function mapArticleDetail(a: ArticleDetail) {
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

/** 检查是否已登录（供查询函数判断是否放开权限） */
async function isAuthed() {
  try {
    const session = await auth();
    return !!session?.user;
  } catch {
    return false;
  }
}

/** 文章列表（未登录缓存版本） */
async function listArticlesPublic(input: { page?: number; pageSize?: number }) {
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

/** 文章列表（登录动态版本，不走缓存） */
async function listArticlesAuthed(input: { page?: number; pageSize?: number }) {
  const page = input.page ?? 1;
  const pageSize = input.pageSize ?? 20;
  const where = { status: "normal" as const };

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

/** 文章列表（根据登录态自动选择版本） */
export async function listArticles(input: { page?: number; pageSize?: number }) {
  const authed = await isAuthed();
  return authed ? listArticlesAuthed(input) : listArticlesPublic(input);
}

/** 文章详情（未登录缓存版本） */
async function getArticlePublic(id: string) {
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
  if (!article || article.visibility !== "public" || article.status !== "normal") return null;
  return mapArticleDetail(article);
}

/** 文章详情（登录动态版本，不走缓存） */
async function getArticleAuthed(id: string) {
  const article = await db.article.findUnique({
    where: { id },
    include: {
      category: { select: { id: true, name: true, parent: { select: { name: true } } } },
      tags: { select: { tag: { select: { id: true, name: true } } } },
    },
  });
  if (!article || article.status !== "normal") return null;
  return mapArticleDetail(article);
}

/** 文章详情（根据登录态自动选择版本：未登录只看公开，登录看所有正常文章） */
export async function getArticle(id: string) {
  const authed = await isAuthed();
  return authed ? getArticleAuthed(id) : getArticlePublic(id);
}

/** 上一篇/下一篇（未登录缓存版本） */
async function getAdjacentPublic(id: string) {
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
  return getAdjacentLogic(self, base, pick);
}

/** 上一篇/下一篇（登录动态版本，不走缓存） */
async function getAdjacentAuthed(id: string) {
  const self = await db.article.findUnique({
    where: { id },
    select: { isPinned: true, updatedAt: true },
  });
  if (!self) return { prev: null, next: null };

  const pick = { id: true, title: true } as const;
  const base = { status: "normal" as const };
  return getAdjacentLogic(self, base, pick);
}

async function getAdjacentLogic(
  self: { isPinned: boolean; updatedAt: Date },
  base: { status: "normal"; visibility?: "public" },
  pick: { id: true; title: true }
) {
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

/** 上一篇/下一篇（根据登录态自动选择版本） */
export async function getAdjacent(id: string) {
  const authed = await isAuthed();
  return authed ? getAdjacentAuthed(id) : getAdjacentPublic(id);
}

/** 分类树（未登录缓存版本，笔记数只统计公开文章） */
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

/** 标签列表（未登录缓存版本，文章数只统计公开文章） */
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

/** 近 30 天每日新增笔记数（未登录缓存版本，只统计公开文章） */
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
