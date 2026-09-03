"use client";

import { useEffect, useRef } from "react";
import type { Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Highlight from "@tiptap/extension-highlight";
import TextAlign from "@tiptap/extension-text-align";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import FontFamily from "@tiptap/extension-font-family";
import Typography from "@tiptap/extension-typography";
import CharacterCount from "@tiptap/extension-character-count";
import { Dropcursor } from "@tiptap/extension-dropcursor";
import Focus from "@tiptap/extension-focus";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import { Table } from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { Markdown } from "@tiptap/markdown";

import {
  MarkdownPaste,
  CustomBold,
  CustomItalic,
  CustomStrike,
  CustomCode,
  MarkdownLink,
  CodeBackfillConvert,
  LinkBackfillConvert,
  FontSize,
  TrailingNode,
  Selection,
  ListInputRules,
  CustomCodeBlock,
  Columns,
  Column,
  Details,
  DetailsSummary,
  DetailsContent,
  TableOfContentsNode,
  FileHandler,
  BlockHandles,
  Callout,
  Iframe,
  Katex,
  Attachment,
  ImageBlock,
  Status,
  Video,
  Emoji,
  createFootnoteExtensions,
  TableReadonlyResize,
  UniqueID,
  SearchAndReplace,
  LanguageTool,
  AiGeneration,
  Canvas,
} from "@tipkit/extensions";
import { createT, useTipKitEditor, useEditorDeps, zh } from "@tipkit/core";
import { LinkCard } from "./link-card";

import type { OutlineItem } from "./types";

const PLACEHOLDER_TEXTS = [
  "开始写作…",
  "记录此刻的想法…",
  "有什么新发现？",
  "今天学到了什么？",
  "写点什么吧…",
  "随便写写，不用完美…",
  "整理一下思路…",
  "这一刻值得记录…",
];

function pickPlaceholder(): string {
  return PLACEHOLDER_TEXTS[Math.floor(Math.random() * PLACEHOLDER_TEXTS.length)]!;
}

/** 去除 HTML 末尾的空段落（TrailingNode 注入或历史遗留），避免只读页底部留白 */
function trimTrailingEmptyParagraphs(html: string): string {
  return html.replace(/(?:<p(?:\s[^>]*)?>(?:<br\s*\/?>|\s|&nbsp;|&#xA0;)*<\/p>\s*)+$/i, "");
}

export interface UseArticleEditorOptions {
  value: string;
  onChange?: (html: string) => void;
  onOutline?: (items: OutlineItem[]) => void;
  placeholder?: string;
  /** 拖拽/粘贴图片时的上传回调（不传则退化为 base64 嵌入） */
  onUploadImage?: (file: File) => Promise<string>;
  /** 是否可编辑，默认 true；false 时渲染只读内容（剔除块手柄/占位/输入规则等编辑态扩展） */
  editable?: boolean;
}

/** 创建编辑器实例：编排全部扩展，并把 HTML / 大纲变化回传给外部 */
export function useArticleEditor(options: UseArticleEditorOptions) {
  const { value, onChange, onOutline, placeholder, onUploadImage, editable = true } = options;
  // 入口统一 trim 尾部空段落：兼容历史数据（已被 TrailingNode 污染）与新内容
  const trimmedValue = value ? trimTrailingEmptyParagraphs(value) : value;

  /* 从 EditorProvider 读取注入的 deps（含 i18n t、uploadAttachment、ai 等），
   * 未包裹 Provider 时 useEditorDeps 会返回 { t: defaultT(中文) }，天然兜底。 */
  const deps = useEditorDeps();
  const t = deps.t ?? createT(zh);

  const lastInternalHTML = useRef<string>("");
  const randomTextRef = useRef<string>(pickPlaceholder());
  const lastPlaceholderPos = useRef<number>(-1);

  // 内容扩展（节点/标记）：编辑态与只读态共用，保证渲染结构一致
  const contentExtensions = [
    // StarterKit：禁用内置 Bold/Italic/Strike/Code（用下方自定义版，
    // 规避 Tiptap 3.x markInputRule 的 addMark 崩溃 bug）。
    StarterKit.configure({
      heading: { levels: [1, 2, 3, 4, 5, 6] },
      codeBlock: false,
      bold: false,
      italic: false,
      strike: false,
      code: false,
      link: false,
      underline: false,
      trailingNode: false,
      dropcursor: false,
    }),
    // 行内 markdown 标记（safeMarkInputRule 规避崩溃）
    CustomBold,
    CustomItalic,
    CustomStrike,
    CustomCode,
    // 代码块（lowlight 语法高亮，NodeView 自带复制/主题切换工具栏）
    CustomCodeBlock,
    // 行内/块级基础
    Underline,
    Highlight.configure({ multicolor: true }),
    Subscript,
    Superscript,
    TextStyle,
    Color,
    FontFamily,
    FontSize,
    Typography,
    TextAlign.configure({ types: ["heading", "paragraph"] }),
    // 列表 / 任务
    TaskList,
    TaskItem.configure({ nested: true }),
    // 表格（只读时 resizable 仍注册列宽，但不可拖拽）
    Table.configure({ resizable: editable, lastColumnResizable: false }),
    TableRow,
    TableHeader,
    TableCell,
    // 媒体
    ImageBlock,
    LinkCard,
    MarkdownLink,
    // 高级结构
    Columns,
    Column,
    Details,
    DetailsSummary,
    DetailsContent,
    TableOfContentsNode.configure({ scrollOffset: 80 }),
    // 块级富内容（借鉴 demo/knloop-frontend-main，改造为手绘风格）
    Callout,
    Iframe,
    Katex,
    Attachment,
    // tipkit 0.3.0 新增节点（编辑态与只读态共用，保证渲染结构一致）
    Status,
    Video,
    Emoji,
    ...createFootnoteExtensions(),
    Canvas,
    // 只读态表格列宽拖拽（编辑态内部自动让位于内置 columnResizing）
    TableReadonlyResize,
    // 节点自动 id：供目录跳转/评论锚点/协同定位
    UniqueID.configure({
      types: ["heading", "paragraph", "blockquote", "listItem", "taskItem", "codeBlock", "imageBlock", "callout"],
    }),
  ];

  // 纯编辑态扩展：只读时全部剔除，避免不必要的 JS 与交互
  const editingExtensions = editable
    ? [
        // 回填式代码标记：先打 `` 再回填内容，方向键离开时自动转 code
        CodeBackfillConvert,
        // 回填式链接：IME/某些场景 input rule 未触发时，空格/回车兜底转换
        LinkBackfillConvert,
        // 编辑器体验
        Placeholder.configure({
          placeholder: ({ pos }) => {
            if (placeholder) return placeholder;
            if (pos !== lastPlaceholderPos.current) {
              lastPlaceholderPos.current = pos;
              randomTextRef.current = pickPlaceholder();
            }
            return randomTextRef.current;
          },
          showOnlyCurrent: true,
          includeChildren: false,
        }),
        TrailingNode,
        Selection,
        ListInputRules,
        CharacterCount.configure({ limit: 100000 }),
        Dropcursor.configure({ width: 2, class: "kb-dropcursor" }),
        Focus.configure({ mode: "all" }),
        // Notion 风格块级双柄（+ 插入 / ⋮⋮ 拖拽）
        BlockHandles,
        // 拖拽/粘贴图片自动上传 → 走 ImageBlock 命令（块级模式）
        FileHandler.configure({
          allowedMimeTypes: ["image/png", "image/jpeg", "image/gif", "image/webp"],
          onUpload: onUploadImage,
          onInsertImage: (ed, src, pos) => {
            if (typeof pos === "number") {
              ed.chain().focus().setImageBlockAt({ src, pos }).run();
            } else {
              ed.chain().focus().setImageBlock({ src }).run();
            }
          },
        }),
        // markdown 粘贴 / 序列化
        Markdown,
        MarkdownPaste,
        // tipkit 0.3.0 新增编辑态功能（只读时剔除）
        SearchAndReplace,
        // 语法检查：默认走公共 API（有内容外发风险），建议注入自有 check 覆盖
        LanguageTool.configure({}),
        // AI 流式生成（headless 命令层，UI 走 @tipkit/ui 的 AiMenu + EditorDeps.ai）
        AiGeneration,
      ]
    : [];

  /* 使用 TipKit 标准 hook useTipKitEditor 创建实例（@tipkit/core 无头入口）：
   * 自带 Placeholder / editable 同步，扩展编排在下方传入。
   * 自定义 Placeholder（随机多文案）会按同名扩展覆盖 useTipKitEditor 内置的默认
   * Placeholder —— 依赖 tipkit 的 useTipKitEditor 对同名扩展做去重（见 tipkit 侧改动）。 */
  const editor = useTipKitEditor({
    extensions: [...contentExtensions, ...editingExtensions],
    content: trimmedValue || "",
    editable,
    editorProps: {
      // 必须保留 tk-prosemirror：tipkit 主题的正文样式（含 .tk-toc-list{list-style:none}）
      // 都挂在 .tk-theme-sketch .tk-editor .tk-prosemirror 下。
      // 注：useTipKitEditor 用对象展开合并 attributes.class，会把这里的 class 整体覆盖
      // 掉默认的 tk-prosemirror，因此必须显式带上，否则 tipkit 正文样式失效。
      // prose-kb 启用 editor.css 的富文本排版（66215a1 迁移时被误删，需保留）。
      attributes: { class: "tk-prosemirror prose-kb focus:outline-hidden" },
      scrollThreshold: { top: 8, right: 8, bottom: 44, left: 8 },
      scrollMargin: { top: 8, right: 8, bottom: 44, left: 8 },
    },
    onUpdate: (ed) => {
      // TrailingNode 扩展会在文档末尾追加空 <p> 以保证编辑时最后一行可点击，
      // 但该空节点会被 getHTML 序列化进内容，保存后只读页也会渲染出底部空白。
      // 此处序列化后统一 trim 尾部空段落，避免污染持久化数据。
      const raw = ed.getHTML();
      const html = raw.replace(/(?:<p(?:\s[^>]*)?>(?:<br\s*\/?>|\s|&nbsp;|&#xA0;)*<\/p>\s*)+$/i, "");
      lastInternalHTML.current = html;
      onChange?.(html);
      emitOutline(ed);
    },
    onCreate: (ed) => {
      emitOutline(ed);
    },
  });

  /* 按 TipKit 约定，把 deps.t 挂到 editor.__tipkitT，供原生 NodeView（Details/BlockHandles/Status 等）
   * 读取翻译；语言切换时同步更新并派发 tipkit:langChange 事件刷新 tooltip。
   * 这一步等价于 <TipKitEditor> 组件内部的 i18n 注入逻辑。 */
  useEffect(() => {
    if (!editor) return;
    (editor as unknown as { __tipkitT?: typeof t }).__tipkitT = t;
    editor.view.dom.dispatchEvent(new CustomEvent("tipkit:langChange"));
  }, [editor, t]);

  function emitOutline(ed: Editor) {
    if (!onOutline) return;
    const items: OutlineItem[] = [];
    ed.state.doc.descendants((node) => {
      if (node.type.name === "heading") {
        items.push({
          id: `h-${items.length}`,
          text: node.textContent.slice(0, 40) || "（空标题）",
          level: node.attrs.level as number,
        });
      }
      return true;
    });
    onOutline(items);
  }

  useEffect(() => {
    if (!editor) return;
    if (!trimmedValue || trimmedValue === lastInternalHTML.current) return;
    // 推迟到微任务队列，避免在 React 渲染周期内同步调用 setContent 触发 flushSync 报错
    const raf = requestAnimationFrame(() => {
      editor.commands.setContent(trimmedValue, { emitUpdate: false });
      emitOutline(editor);
    });
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor, trimmedValue]);

  return editor;
}
