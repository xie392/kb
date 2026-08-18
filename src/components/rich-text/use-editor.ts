"use client";

import { useEffect } from "react";
import { useEditor, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Highlight from "@tiptap/extension-highlight";
import TextAlign from "@tiptap/extension-text-align";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
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
import { CustomCodeBlock } from "./code-block-node";
import { CustomImage } from "./image-node";
import type { OutlineItem } from "./types";

export interface UseArticleEditorOptions {
  value: string;
  onChange: (html: string) => void;
  onOutline?: (items: OutlineItem[]) => void;
  placeholder?: string;
}

/** 创建编辑器实例：编排全部扩展，并把 HTML / 大纲变化回传给外部 */
export function useArticleEditor(options: UseArticleEditorOptions) {
  const { value, onChange, onOutline, placeholder } = options;

  const editor = useEditor({
    // 显式关闭 Tiptap 的 SSR 默认提示；编辑器在服务端不渲染、客户端挂载后再创建
    immediatelyRender: false,
    extensions: [
      // StarterKit 新版本内置了 link/underline，这里关闭，避免与下方显式扩展重复注册
      StarterKit.configure({
        heading: { levels: [1, 2, 3, 4, 5, 6] },
        codeBlock: false,
        link: false,
        underline: false,
      }),
      CustomCodeBlock,
      Underline,
      Highlight.configure({ multicolor: true }),
      Subscript,
      Superscript,
      TextStyle,
      Color,
      TextAlign.configure({ types: ["heading", "paragraph", "taskItem"] }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Table.configure({ resizable: true, lastColumnResizable: false }),
      TableRow,
      TableHeader,
      TableCell,
      CustomImage,
      Link.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder: placeholder ?? "开始写作…" }),
      Markdown,
      MarkdownPaste,
    ],
    content: value || "",
    editorProps: {
      attributes: {
        class: "prose-kb focus:outline-hidden",
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
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

  // 外部 value 变化时同步
  useEffect(() => {
    if (editor && value && editor.getHTML() !== value) {
      editor.commands.setContent(value, { emitUpdate: false });
      emitOutline(editor);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor, value]);

  return editor;
}
