export interface TocItem {
  id: string;
  text: string;
  level: number;
}

function slugify(text: string, index: number): string {
  const base = text
    .trim()
    .toLowerCase()
    .replace(/<[^>]+>/g, "")
    .replace(/[^\w\u4e00-\u9fff]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `heading-${base || "section"}-${index}`;
}

export function extractToc(html: string): { items: TocItem[]; html: string } {
  const items: TocItem[] = [];
  let index = 0;

  const result = html.replace(
    /<(h[1-4])([^>]*)>([\s\S]*?)<\/\1>/gi,
    (match, tag: string, attrs: string, inner: string) => {
      const text = inner.replace(/<[^>]+>/g, "").trim();
      if (!text) return match;

      const id = slugify(text, index);
      const level = parseInt(tag[1]!, 10);
      items.push({ id, text, level });

      const existingId = /\sid=["'][^"']*["']/i.exec(attrs);
      const newAttrs = existingId
        ? attrs
        : attrs + ` id="${id}"`;

      index++;
      return `<${tag}${newAttrs}>${inner}</${tag}>`;
    }
  );

  return { items, html: result };
}
