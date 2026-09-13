/**
 * 双向链接（WikiLink）纯逻辑：从正文中解析 `[[笔记标题]]`，并提供渲染为链接的能力。
 *
 * 约定：
 * - 引用语法为 `[[标题]]`，标题内不允许出现 `[`、`]` 与换行；
 * - 匹配只发生在「文本节点」上，不会误伤 HTML 标签/属性；
 * - 标题比较前做归一化（trim + 连续空白折叠），大小写保持敏感（中文无影响）。
 *
 * 本文件为纯函数，无任何框架/数据库依赖，便于单测与在服务端/客户端共用。
 */

/** 标题归一化：去除首尾空白，并把连续空白折叠为单个空格 */
export function normalizeTitle(title: string): string {
  return title.trim().replace(/\s+/g, " ");
}

/** 去掉 HTML 标签，仅保留文本（用于在纯文本里解析引用，避免命中属性值） */
export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, " ");
}

/**
 * 提取正文中出现的全部 `[[标题]]`（去重、保序、归一化）。
 * @param html 富文本 HTML
 * @param max 最多返回多少个，防止异常内容撑爆（默认 50）
 */
export function extractWikiLinkTitles(html: string, max = 50): string[] {
  if (!html) return [];
  const text = stripHtml(html);
  const re = /\[\[([^[\]\n]+?)\]\]/g;
  const out: string[] = [];
  const seen = new Set<string>();
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    const title = normalizeTitle(m[1]);
    if (!title || seen.has(title)) continue;
    seen.add(title);
    out.push(title);
    if (out.length >= max) break;
  }
  return out;
}

/** 带 XML 语义的转义，供把命中文本安全写回 HTML */
function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export interface WikiLinkTarget {
  id: string;
  title: string;
}

/**
 * 把正文中的 `[[标题]]` 渲染为可点击链接。
 * - 命中：输出 `<a href="/article/{id}" class="wiki-link" data-wiki-link="{id}">标题</a>`
 * - 未命中：输出 `<span class="wiki-link-missing" title="笔记不存在">标题</span>`
 *
 * 仅替换文本节点中的引用，HTML 标签原样保留。
 */
export function renderWikiLinks(
  html: string,
  resolve: (title: string) => WikiLinkTarget | null,
): string {
  if (!html) return html;
  // 交替匹配「HTML 标签」与「[[引用]]」：命中标签则原样返回，否则处理引用
  return html.replace(
    /(<[^>]*>)|\[\[([^[\]\n]+?)\]\]/g,
    (whole, tag: string | undefined, rawTitle: string | undefined) => {
      if (tag) return tag;
      const title = normalizeTitle(rawTitle ?? "");
      if (!title) return whole;
      const target = resolve(title);
      const safe = escapeHtml(title);
      if (target) {
        return `<a href="/article/${encodeURIComponent(target.id)}" class="wiki-link" data-wiki-link="${encodeURIComponent(
          target.id,
        )}">${safe}</a>`;
      }
      return `<span class="wiki-link wiki-link-missing" title="引用的笔记不存在">${safe}</span>`;
    },
  );
}

/** 由 (标题 -> id) 映射构造 resolve 函数，标题会先归一化后比较 */
export function createTitleResolver(
  map: Map<string, string>,
): (title: string) => WikiLinkTarget | null {
  return (title: string) => {
    const id = map.get(normalizeTitle(title));
    return id ? { id, title: normalizeTitle(title) } : null;
  };
}
