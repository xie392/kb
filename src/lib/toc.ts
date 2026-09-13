/**
 * 目录条目类型。
 *
 * 正文大纲由 TipTap 侧生成（见 rich-text/use-editor.ts 的 emitOutline），
 * id 仅为稳定 key，不用于 DOM 查询 —— 目录按「文档顺序 + 索引」定位标题，
 * 详见 components/article-toc.tsx。
 */
export interface TocItem {
  id: string;
  text: string;
  level: number;
}
