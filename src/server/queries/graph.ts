// 双向链接与关系图谱查询（从 public.ts 拆出，控制在单文件 500 行内）。
// 与 public.ts 一致：未登录只读公开内容并走 "use cache"，登录后动态查询。
import { cacheLife, cacheTag } from "next/cache";
import type { Prisma } from "@prisma/client";
import { db } from "@/server/db";
import { extractWikiLinkTitles, normalizeTitle } from "@/lib/wikilink";
import { isAuthed } from "./public";

/** 可见性范围：匿名仅公开，登录后全部正常文章 */
interface LinkScope {
  status: "normal";
  visibility?: "public";
}

// ===== 双向链接 =====

const backlinkSelect = {
  id: true,
  title: true,
  summary: true,
  visibility: true,
  updatedAt: true,
  category: { select: { name: true, parent: { select: { name: true } } } },
} as const;

type BacklinkRow = Prisma.ArticleGetPayload<{ select: typeof backlinkSelect }>;

function mapBacklink(a: BacklinkRow) {
  return {
    id: a.id,
    title: a.title,
    summary: a.summary,
    visibility: a.visibility,
    updatedAt: a.updatedAt,
    categoryName: a.category
      ? a.category.parent
        ? `${a.category.parent.name}/${a.category.name}`
        : a.category.name
      : null,
  };
}

async function getLinksLogic(id: string, content: string, base: LinkScope) {
  const titles = extractWikiLinkTitles(content);

  const [targets, incomingLinks] = await Promise.all([
    titles.length
      ? db.article.findMany({
          where: { ...base, id: { not: id }, title: { in: titles } },
          select: { id: true, title: true },
        })
      : Promise.resolve([] as { id: string; title: string }[]),
    db.articleLink.findMany({
      where: { targetId: id, source: base },
      select: { source: { select: backlinkSelect } },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  // (归一化标题 -> id)，供只读渲染把 [[标题]] 转成链接
  const resolveMap: Record<string, string> = {};
  for (const t of targets) {
    const key = normalizeTitle(t.title);
    if (!(key in resolveMap)) resolveMap[key] = t.id;
  }

  return {
    resolveMap,
    outgoing: targets.map((t) => ({ id: t.id, title: t.title })),
    incoming: incomingLinks.map((l) => mapBacklink(l.source)),
  };
}

async function getLinksPublic(id: string, content: string) {
  "use cache";
  cacheLife("kb");
  cacheTag("kb");
  return getLinksLogic(id, content, { status: "normal", visibility: "public" });
}

export async function getArticleLinks(id: string, content: string) {
  const authed = await isAuthed();
  if (authed) return getLinksLogic(id, content, { status: "normal" });
  return getLinksPublic(id, content);
}

// ===== 关系图谱 =====

/** 单页最多渲染的节点数（超出则按置顶/更新时间截断，避免力导向布局卡顿） */
const GRAPH_NODE_LIMIT = 300;

const graphNodeSelect = {
  id: true,
  title: true,
  visibility: true,
  viewCount: true,
  category: { select: { id: true, name: true, parent: { select: { name: true } } } },
} as const;

async function getGraphLogic(base: LinkScope, limit: number) {
  const articles = await db.article.findMany({
    where: base,
    select: graphNodeSelect,
    orderBy: [{ isPinned: "desc" }, { updatedAt: "desc" }],
    take: limit,
  });

  const ids = articles.map((a) => a.id);
  const links = ids.length
    ? await db.articleLink.findMany({
        where: { sourceId: { in: ids }, targetId: { in: ids } },
        select: { sourceId: true, targetId: true },
      })
    : [];

  const degree = new Map<string, number>();
  for (const l of links) {
    degree.set(l.sourceId, (degree.get(l.sourceId) ?? 0) + 1);
    degree.set(l.targetId, (degree.get(l.targetId) ?? 0) + 1);
  }

  return {
    nodes: articles.map((a) => ({
      id: a.id,
      title: a.title,
      visibility: a.visibility,
      viewCount: a.viewCount,
      degree: degree.get(a.id) ?? 0,
      // 顶层分类名作为分组着色依据（无分类归入「未分类」）
      group: a.category ? (a.category.parent ? a.category.parent.name : a.category.name) : "未分类",
    })),
    links: links.map((l) => ({ source: l.sourceId, target: l.targetId })),
    truncated: articles.length >= limit,
  };
}

async function getGraphPublic() {
  "use cache";
  cacheLife("kb");
  cacheTag("kb");
  return getGraphLogic({ status: "normal", visibility: "public" }, GRAPH_NODE_LIMIT);
}

export async function getGraphData() {
  const authed = await isAuthed();
  if (authed) return getGraphLogic({ status: "normal" }, GRAPH_NODE_LIMIT);
  return getGraphPublic();
}
