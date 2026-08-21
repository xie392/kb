"use client";

import { useMemo, useState } from "react";
import { mergeAttributes, Node, nodeInputRule } from "@tiptap/core";
import {
  ReactNodeViewRenderer,
  NodeViewWrapper,
  type NodeViewProps,
} from "@tiptap/react";
import katex from "katex";
import "katex/dist/katex.min.css";
import { cn } from "@/lib/utils";

/* ─── Katex 数学公式 ───
 * 借鉴 demo/knloop-frontend-main 的 katex 节点，改造为手绘风格。
 * 属性：text（LaTeX 源码）
 * 节点上点击编辑按钮 → 弹出 textarea 编辑源码 → 失焦/ESC 回写
 */

export interface KatexAttrs {
  text: string;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    katex: {
      setKatex: (attrs?: Partial<KatexAttrs>) => ReturnType;
    };
  }
}

export const Katex = Node.create({
  name: "katex",
  group: "block",
  selectable: true,
  atom: true,
  draggable: true,

  addOptions() {
    return { HTMLAttributes: { class: "kb-katex" } };
  },

  addAttributes() {
    return {
      text: {
        default: "",
        parseHTML: (el) => (el as HTMLElement).getAttribute("data-text") ?? "",
        renderHTML: (a) => ({ "data-text": a.text }),
      },
    };
  },

  parseHTML() {
    return [{ tag: "div.kb-katex" }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(this.options.HTMLAttributes, {
        "data-text": (HTMLAttributes as Record<string, unknown>)["data-text"] ?? "",
      }),
    ];
  },

  addCommands() {
    return {
      setKatex:
        (attrs) =>
        ({ chain }) =>
          chain()
            .focus()
            .insertContent({ type: "katex", attrs: { text: attrs?.text ?? "" } })
            .run(),
    };
  },

  addInputRules() {
    return [
      nodeInputRule({
        find: /^\$\$katex\$\$$/,
        type: this.type,
        getAttributes: () => ({ text: "" }),
      }),
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(KatexView);
  },
});

function KatexView(props: NodeViewProps) {
  const { editor, node, updateAttributes, selected } = props;
  const attrs = node.attrs as KatexAttrs;
  const text = attrs.text ?? "";
  const isEditable = editor.isEditable;
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(text);

  const html = useMemo(() => {
    if (!text.trim()) return "";
    try {
      return katex.renderToString(text, {
        throwOnError: false,
        displayMode: true,
        output: "html",
      });
    } catch {
      return `<span style="color:#dc2626">公式渲染失败：${text}</span>`;
    }
  }, [text]);

  const openEditor = () => {
    setDraft(text);
    setEditing(true);
  };
  const commit = () => {
    updateAttributes({ text: draft });
    setEditing(false);
  };

  return (
    <NodeViewWrapper
      className={cn("kb-katex", selected && "is-selected")}
      data-empty={!text.trim() ? "true" : "false"}
      contentEditable={false}
    >
      {editing ? (
        <div className="kb-katex-editor">
          <textarea
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") setEditing(false);
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) commit();
            }}
            placeholder="输入 LaTeX 公式，如 \frac{1}{2} 或 e^{i\pi}+1=0"
            className="kb-katex-textarea"
            rows={3}
          />
          <div className="kb-katex-editor-actions">
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => setEditing(false)}
              className="kb-katex-btn-ghost"
            >
              取消
            </button>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={commit}
              className="kb-katex-btn-primary"
            >
              保存 (⌘↵)
            </button>
          </div>
        </div>
      ) : (
        <div className="kb-katex-display" onDoubleClick={isEditable ? openEditor : undefined}>
          {text.trim() ? (
            <span dangerouslySetInnerHTML={{ __html: html }} />
          ) : (
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={openEditor}
              className="kb-katex-placeholder"
            >
              + 输入数学公式
            </button>
          )}
          {isEditable && text.trim() && (
            <button
              type="button"
              title="编辑公式"
              onMouseDown={(e) => e.preventDefault()}
              onClick={openEditor}
              className="kb-katex-edit"
            >
              编辑
            </button>
          )}
        </div>
      )}
    </NodeViewWrapper>
  );
}

export default Katex;
