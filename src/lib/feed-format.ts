/** Feed 相关的纯格式化函数（不依赖数据库/环境变量，便于单测） */

/** XML 特殊字符转义（& 必须最先处理，避免二次转义） */
export function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/** 富文本 HTML → 纯文本（用于 feed 摘要，避免把标签写进内容） */
export function plainText(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
