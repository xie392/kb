/**
 * 去除 HTML 末尾的空段落（TrailingNode 注入或历史遗留），避免只读页底部留白。
 * 编辑态与只读态共用同一份实现，避免两处正则各自漂移。
 */
export function trimTrailingEmptyParagraphs(html: string): string {
  return html
    ? html.replace(
        /(?:<p(?:\s[^>]*)?>(?:<br\s*\/?>|\s|&nbsp;|&#xA0;)*<\/p>\s*)+$/i,
        "",
      )
    : html;
}
