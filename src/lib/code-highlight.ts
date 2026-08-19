import hljs from "highlight.js/lib/common";

/** 代码块主题：与编辑器 codeBlock 节点的 theme 属性一致 */
export type CodeBlockTheme = "light" | "dark";

/** 解码 HTML 实体（存储时代码内容已被转义） */
function decodeEntities(s: string): string {
  return s
    .replace(/&#(\d+);/g, (_, n: string) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, h: string) =>
      String.fromCodePoint(parseInt(h, 16)),
    )
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&amp;/g, "&");
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** 从标签属性串中读取某个属性的值 */
function attrOf(attrs: string, name: string): string | null {
  const m = attrs.match(
    new RegExp(`${name}\\s*=\\s*["']([^"']*)["']`, "i"),
  );
  return m ? m[1] : null;
}

/**
 * 服务端语法高亮：把内容 HTML 中的 `<pre><code>` 代码块替换为带 hljs 高亮
 * span 的版本（`pre.kb-code` + `data-theme`），供阅读页直接渲染。
 * 语言取自 code 的 `language-*` class，主题取自 pre 的 `data-theme`。
 */
export function highlightCodeBlocks(html: string): string {
  return html.replace(
    /<pre([^>]*)>\s*<code([^>]*)>([\s\S]*?)<\/code>\s*<\/pre>/gi,
    (match, preAttrs: string, codeAttrs: string, inner: string) => {
      const langMatch = codeAttrs.match(
        /class=["'][^"']*\blanguage-([\w-]+)/i,
      );
      const language = langMatch ? langMatch[1] : null;
      const theme: CodeBlockTheme =
        attrOf(preAttrs, "data-theme") === "light" ? "light" : "dark";

      const source = decodeEntities(inner);
      let highlighted: string;
      if (language && hljs.getLanguage(language)) {
        // 已注册语言：正常高亮（ignoreIllegals 避免语法不完整时抛异常）
        highlighted = hljs.highlight(source, {
          language,
          ignoreIllegals: true,
        }).value;
      } else if (language) {
        // 未注册语言：原样转义，不报错
        highlighted = escapeHtml(source);
      } else {
        // 无语言：自动检测
        highlighted = hljs.highlightAuto(source).value;
      }

      const langClass = language ? `language-${language}` : "";
      const codeClass = ["hljs", langClass].filter(Boolean).join(" ");
      const dataLang = language ? ` data-language="${language}"` : "";
      return `<pre class="kb-code" data-theme="${theme}"${dataLang}><code class="${codeClass}">${highlighted}</code></pre>`;
    },
  );
}
