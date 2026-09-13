import type { PrismaClient } from "@prisma/client";
import { extractWikiLinkTitles, normalizeTitle } from "@/lib/wikilink";

/**
 * 双向链接的落库逻辑（服务端专用）。
 *
 * 正文写入时把 `[[标题]]` 解析为 ArticleLink 关系；标题 -> id 的解析只认「正常状态」的文章。
 * 关系表在 source 侧整体重建（先删后插），保证编辑后引用增删都能正确同步。
 */

/** 把一组标题解析成 (归一化标题 -> 文章 id) 的映射；不存在或命中多篇时以第一条为准 */
export async function resolveTitlesToIds(
  db: PrismaClient,
  titles: string[],
): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  const uniq = [...new Set(titles.map(normalizeTitle).filter(Boolean))];
  if (uniq.length === 0) return map;

  // 精确匹配 + 少量模糊兜底：先按原文取候选，再按归一化标题建索引
  const candidates = await db.article.findMany({
    where: { status: "normal", title: { in: uniq } },
    select: { id: true, title: true },
  });
  for (const a of candidates) {
    const key = normalizeTitle(a.title);
    if (!map.has(key)) map.set(key, a.id);
  }
  return map;
}

/**
 * 重建某篇文章的出链关系。
 * @returns 本次解析出的目标文章 id 列表（不含自身）
 */
export async function syncArticleLinks(
  db: PrismaClient,
  articleId: string,
  content: string,
): Promise<string[]> {
  const titles = extractWikiLinkTitles(content);
  const map = await resolveTitlesToIds(db, titles);
  const targetIds = [...new Set(map.values())].filter((id) => id !== articleId);

  await db.$transaction([
    db.articleLink.deleteMany({ where: { sourceId: articleId } }),
    ...(targetIds.length
      ? [
          db.articleLink.createMany({
            data: targetIds.map((targetId) => ({ sourceId: articleId, targetId })),
          }),
        ]
      : []),
  ]);
  return targetIds;
}

/** 全量重建所有正常文章的双链关系（用于迁移、恢复备份后的一致性修复） */
export async function reindexAllArticleLinks(db: PrismaClient): Promise<number> {
  const articles = await db.article.findMany({
    where: { status: "normal" },
    select: { id: true, content: true },
  });
  let count = 0;
  for (const a of articles) {
    const ids = await syncArticleLinks(db, a.id, a.content);
    count += ids.length;
  }
  return count;
}
