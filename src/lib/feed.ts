import { db } from "@/server/db";
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION } from "@/lib/config";
import { escapeXml, plainText } from "@/lib/feed-format";

export { escapeXml, plainText };

export type FeedItem = {
  id: string;
  title: string;
  url: string;
  summary: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
};

/** 取最新公开文章，供 RSS / JSON Feed 共用 */
export async function getFeedItems(limit = 20): Promise<FeedItem[]> {
  const rows = await db.article.findMany({
    where: { status: "normal", visibility: "public" },
    orderBy: { createdAt: "desc" },
    take: limit,
    select: {
      id: true,
      title: true,
      summary: true,
      content: true,
      createdAt: true,
      updatedAt: true,
      tags: { select: { tag: { select: { name: true } } } },
    },
  });

  return rows.map((a) => ({
    id: a.id,
    title: a.title,
    url: `${SITE_URL}/article/${a.id}`,
    summary: (a.summary?.trim() || plainText(a.content)).slice(0, 200),
    tags: a.tags.map((t) => t.tag.name),
    createdAt: a.createdAt,
    updatedAt: a.updatedAt,
  }));
}

/** RSS 2.0（含 atom:link 自引用，兼容主流阅读器） */
export function buildRss(items: FeedItem[]): string {
  const feedUrl = `${SITE_URL}/feed.xml`;
  const lastBuild = (items[0]?.updatedAt ?? new Date()).toUTCString();

  const entries = items
    .map(
      (it) => `    <item>
      <title>${escapeXml(it.title)}</title>
      <link>${escapeXml(it.url)}</link>
      <guid isPermaLink="true">${escapeXml(it.url)}</guid>
      <pubDate>${it.createdAt.toUTCString()}</pubDate>
      <description>${escapeXml(it.summary)}</description>
${it.tags.map((t) => `      <category>${escapeXml(t)}</category>`).join("\n")}
    </item>`
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(SITE_NAME)}</title>
    <link>${escapeXml(SITE_URL)}</link>
    <description>${escapeXml(SITE_DESCRIPTION)}</description>
    <language>zh-CN</language>
    <lastBuildDate>${lastBuild}</lastBuildDate>
    <atom:link href="${escapeXml(feedUrl)}" rel="self" type="application/rss+xml" />
${entries}
  </channel>
</rss>
`;
}

/** JSON Feed 1.1 */
export function buildJsonFeed(items: FeedItem[]) {
  return {
    version: "https://jsonfeed.org/version/1.1",
    title: SITE_NAME,
    home_page_url: SITE_URL,
    feed_url: `${SITE_URL}/feed.json`,
    description: SITE_DESCRIPTION,
    language: "zh-CN",
    items: items.map((it) => ({
      id: it.url,
      url: it.url,
      title: it.title,
      summary: it.summary,
      content_text: it.summary,
      date_published: it.createdAt.toISOString(),
      date_modified: it.updatedAt.toISOString(),
      tags: it.tags,
    })),
  };
}
