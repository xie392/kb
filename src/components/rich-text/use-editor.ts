"use client";

import { useEffect, useRef } from "react";
import { useEditor, type Editor } from "@tiptap/react";
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

import { MarkdownPaste } from "./markdown-paste";
import { CustomBold, CustomItalic, CustomStrike, CustomCode } from "./markdown-marks";
import { MarkdownLink } from "./markdown-link";
import { CustomCodeBlock } from "./code-block-node";
import { CustomImage } from "./image-node";
import { LinkCard } from "./link-card";
import { ImageBlock } from "./ext/image-block";
import { CodeBackfillConvert } from "./ext/code-backfill-convert";
import { LinkBackfillConvert } from "./ext/link-backfill-convert";

import { FontSize } from "./ext/font-size";
import { TrailingNode } from "./ext/trailing-node";
import { Selection } from "./ext/selection";
import { Columns, Column } from "./ext/columns";
import { Details, DetailsSummary, DetailsContent } from "./ext/details";
import { TableOfContentsNode } from "./ext/toc-node";
import { FileHandler } from "./ext/file-handler";
import { BlockHandles } from "./ext/block-handles";
import { Callout } from "./ext/callout";
import { Iframe } from "./ext/iframe";
import { Katex } from "./ext/katex";
import { Attachment } from "./ext/attachment";

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

export interface UseArticleEditorOptions {
  value: string;
  onChange: (html: string) => void;
  onOutline?: (items: OutlineItem[]) => void;
  placeholder?: string;
  /** 拖拽/粘贴图片时的上传回调（不传则退化为 base64 嵌入） */
  onUploadImage?: (file: File) => Promise<string>;
}

/** 创建编辑器实例：编排全部扩展，并把 HTML / 大纲变化回传给外部 */
export function useArticleEditor(options: UseArticleEditorOptions) {
  const { value, onChange, onOutline, placeholder, onUploadImage } = options;

  const lastInternalHTML = useRef<string>("");
  const randomTextRef = useRef<string>(pickPlaceholder());
  const lastPlaceholderPos = useRef<number>(-1);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
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
      // 行内 markdown 输入规则（safeMarkInputRule 规避崩溃）
      CustomBold,
      CustomItalic,
      CustomStrike,
      CustomCode,
      // 回填式代码标记：先打 `` 再回填内容，方向键离开时自动转 code
      CodeBackfillConvert,
      // 代码块（lowlight 语法高亮）
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
      // 表格
      Table.configure({ resizable: true, lastColumnResizable: false }),
      TableRow,
      TableHeader,
      TableCell,
      // 媒体：CustomImage 处理旧 inline 数据兼容；新插入图片走 ImageBlock（块级，照搬 demo）
      CustomImage,
      ImageBlock,
      LinkCard,
      MarkdownLink,
      // 回填式链接：IME/某些场景 input rule 未触发时，空格/回车兜底转换
      LinkBackfillConvert,
      // 高级结构
      Columns,
      Column,
      Details,
      DetailsSummary,
      DetailsContent,
      TableOfContentsNode,
      // 块级富内容（借鉴 demo/knloop-frontend-main，改造为手绘风格）
      Callout,
      Iframe,
      Katex,
      Attachment,
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
    ],
    content: value || "",
    editorProps: {
      attributes: {
        class: "prose-kb focus:outline-hidden",
      },
      scrollThreshold: { top: 8, right: 8, bottom: 44, left: 8 },
      scrollMargin: { top: 8, right: 8, bottom: 44, left: 8 },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      lastInternalHTML.current = html;
      onChange(html);
      emitOutline(editor);
    },
    onCreate: ({ editor }) => {
      emitOutline(editor);
    },
  });

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
    if (editor && value && value !== lastInternalHTML.current) {
      editor.commands.setContent(value, { emitUpdate: false });
      emitOutline(editor);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor, value]);

  return editor;
}
