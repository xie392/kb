/**
 * 富文本编辑器（基于 Tiptap）—— 对外统一入口
 *
 * 模块自包含：编辑器扩展、工具栏、浮层工具条、图片/代码块/表格节点均在本目录内，
 * 复制整个 `rich-text/` 目录即可迁移到其他项目。目录内部使用相对导入。
 *
 * 外部依赖：
 * - @tiptap/* 系列包（react / starter-kit / markdown / 各扩展）
 * - @tiptap/pm（ProseMirror 状态）
 * - lowlight（代码块语法高亮）
 * - shadcn 的 `@/components/ui/alert-dialog`（图片上传错误提示弹窗）
 *
 * 用法：
 * ```tsx
 * const editor = useArticleEditor({ value, onChange, onOutline, placeholder });
 * <EditorToolbar editor={editor} onUploadImage={uploadFn} />
 * <EditorArea editor={editor} />
 * ```
 */
export { useArticleEditor } from "./use-editor";
export type { UseArticleEditorOptions } from "./use-editor";
export { EditorToolbar, ToolbarBtn, ToolbarDivider } from "./toolbar";
export { EditorArea } from "./editor-area";
export { CustomImage } from "./image-node";
export { CustomCodeBlock, MarkdownPaste } from "@tipkit/extensions";
export type {
  ImageAlign,
  ImageStyle,
  ImageAttrs,
  OutlineItem,
  ToolbarAction,
} from "./types";
