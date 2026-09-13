/**
 * 搜索辅助纯逻辑：把富文本转成纯文本、并按关键词截取带上下文的摘要片段。
 * 供 search router 生成命中片段、前端展示使用。
 */

/** 富文本 → 纯文本（去标签、折叠空白、解码常见实体） */
export function plainTextFromHtml(html: string): string {
  if (!html) return "";
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * 以关键词为中心截取摘要片段（首尾按需补省略号）。
 * 命中不到时返回 null；关键词为空时返回开头片段。
 */
export function buildSnippet(
  html: string,
  keyword: string,
  radius = 40,
): string | null {
  const text = plainTextFromHtml(html);
  if (!text) return null;
  const kw = keyword.trim();

  if (!kw) {
    return text.length > radius * 2 ? `${text.slice(0, radius * 2)}…` : text;
  }

  const idx = text.toLowerCase().indexOf(kw.toLowerCase());
  if (idx === -1) return null;

  const start = Math.max(0, idx - radius);
  const end = Math.min(text.length, idx + kw.length + radius);
  return `${start > 0 ? "…" : ""}${text.slice(start, end)}${end < text.length ? "…" : ""}`;
}
