import katex from "katex";

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

function attrOf(attrs: string, name: string): string | null {
  const m = attrs.match(
    new RegExp(`${name}\\s*=\\s*["']([^"']*)["']`, "i"),
  );
  return m ? m[1] : null;
}

export function renderKatexBlocks(html: string): string {
  return html.replace(
    /<div([^>]*class=["'][^"']*kb-katex[^"']*["'][^>]*)><\/div>/gi,
    (match, attrs: string) => {
      const text = attrOf(attrs, "data-text");
      if (!text || !text.trim()) {
        return match;
      }
      const decoded = decodeEntities(text);
      try {
        const rendered = katex.renderToString(decoded, {
          throwOnError: false,
          displayMode: true,
          output: "html",
        });
        return `<div class="kb-katex"><div class="kb-katex-display"><span>${rendered}</span></div></div>`;
      } catch {
        return `<div class="kb-katex"><div class="kb-katex-display"><span style="color:#dc2626">公式渲染失败：${decoded}</span></div></div>`;
      }
    },
  );
}
