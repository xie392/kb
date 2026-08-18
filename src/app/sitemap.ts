import type { MetadataRoute } from "next";
import { db } from "@/server/db";
import { SITE_URL } from "@/lib/config";

// 每 6 小时重新生成一次，新发布的公开文章会自动进入 sitemap
export const revalidate = 21600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // 遵循 sitemaps.org 极简规范：只保留 loc + lastmod，
  // changefreq/priority 已不被搜索引擎重视，生产普遍省略。
  const entries: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}/`,
    },
  ];

  try {
    // 仅收录公开且未删除的文章；分类/标签等导航页不单独收录
    const articles = await db.article.findMany({
      where: { status: "normal", visibility: "public" },
      select: { id: true, updatedAt: true },
      orderBy: { updatedAt: "desc" },
    });
    entries.push(
      ...articles.map((a) => ({
        url: `${SITE_URL}/article/${a.id}`,
        lastModified: a.updatedAt,
      })),
    );
  } catch {
    // 构建期数据库不可用时仅输出首页，避免阻断整个构建
  }

  return entries;
}
