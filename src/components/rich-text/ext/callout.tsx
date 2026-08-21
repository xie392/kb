"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { mergeAttributes, Node as TiptapNode, wrappingInputRule } from "@tiptap/core";
import { ReactNodeViewRenderer, NodeViewWrapper, NodeViewContent, type NodeViewProps } from "@tiptap/react";
import { cn } from "@/lib/utils";
import { emojisToName } from "./emoji-data";

/* ─── Callout 提示框 ───
 * 借鉴 demo/knloop-frontend-main 的 callout 节点，改造为手绘线框风格。
 * 预设 5 种风格：info(蓝) / success(绿) / warning(黄) / danger(红) / note(灰)
 * 属性：variant / emoji / text（text 由 NodeViewContent 直接承载段落）
 */

export type CalloutVariant = "info" | "success" | "warning" | "danger" | "note";

interface CalloutStyle {
  label: string;
  emoji: string;
  textColor: string;
  borderColor: string;
  backgroundColor: string;
}

export const CALLOUT_VARIANTS: Record<CalloutVariant, CalloutStyle> = {
  info: {
    label: "信息",
    emoji: "💡",
    textColor: "#1e40af",
    borderColor: "#93c5fd",
    backgroundColor: "#eff6ff",
  },
  success: {
    label: "成功",
    emoji: "✅",
    textColor: "#166534",
    borderColor: "#86efac",
    backgroundColor: "#f0fdf4",
  },
  warning: {
    label: "警告",
    emoji: "⚠️",
    textColor: "#854d0e",
    borderColor: "#fcd34d",
    backgroundColor: "#fefce8",
  },
  danger: {
    label: "危险",
    emoji: "🔥",
    textColor: "#991b1b",
    borderColor: "#fca5a5",
    backgroundColor: "#fef2f2",
  },
  note: {
    label: "备注",
    emoji: "📝",
    textColor: "#3f3f46",
    borderColor: "#d4d4d8",
    backgroundColor: "#f4f4f5",
  },
};

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    callout: {
      setCallout: () => ReturnType;
      setCalloutVariant: (variant: CalloutVariant) => ReturnType;
      setCalloutEmoji: (emoji: string) => ReturnType;
    };
  }
}

export const Callout = TiptapNode.create({
  name: "callout",
  content: "paragraph+",
  group: "block",
  defining: true,
  selectable: true,
  draggable: true,

  addOptions() {
    return { HTMLAttributes: { class: "kb-callout" } };
  },

  addAttributes() {
    return {
      variant: {
        default: "info" as CalloutVariant,
        parseHTML: (el) =>
          (el as HTMLElement).getAttribute("data-variant") ?? "info",
        renderHTML: (a) => ({ "data-variant": a.variant }),
      },
      emoji: {
        default: null as string | null,
        parseHTML: (el) =>
          (el as HTMLElement).getAttribute("data-emoji") ?? null,
        renderHTML: (a) => (a.emoji ? { "data-emoji": a.emoji } : {}),
      },
    };
  },

  parseHTML() {
    return [{ tag: "div.kb-callout" }];
  },

  renderHTML({ HTMLAttributes }) {
    const attrs = HTMLAttributes as Record<string, unknown>;
    const variant = (attrs["data-variant"] as CalloutVariant) ?? "info";
    const style = CALLOUT_VARIANTS[variant] ?? CALLOUT_VARIANTS.info;
    const emoji = (attrs["data-emoji"] as string) ?? style.emoji;
    return [
      "div",
      mergeAttributes(this.options.HTMLAttributes, {
        "data-variant": variant,
        "data-emoji": emoji,
        style: `color:${style.textColor};border-color:${style.borderColor};background:${style.backgroundColor}`,
      }),
      0,
    ];
  },

  addCommands() {
    return {
      setCallout:
        () =>
        ({ commands, state }) => {
          const { selection } = state;
          if (selection.empty) {
            return commands.insertContent({
              type: "callout",
              attrs: { variant: "info" },
              content: [{ type: "paragraph" }],
            });
          }
          return commands.toggleWrap("callout");
        },
      setCalloutVariant:
        (variant) =>
        ({ commands }) =>
          commands.updateAttributes("callout", { variant }),
      setCalloutEmoji:
        (emoji) =>
        ({ commands }) =>
          commands.updateAttributes("callout", { emoji }),
    };
  },

  addInputRules() {
    return [
      wrappingInputRule({
        find: /^>!$/,
        type: this.type,
        getAttributes: () => ({ variant: "info" }),
      }),
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(CalloutView);
  },
});

function CalloutView(props: NodeViewProps) {
  const { editor, node, updateAttributes, selected } = props;
  const attrs = node.attrs as { variant: CalloutVariant; emoji: string | null };
  const variant = attrs.variant ?? "info";
  const style = CALLOUT_VARIANTS[variant] ?? CALLOUT_VARIANTS.info;
  const emoji = attrs.emoji ?? style.emoji;

  const [emojiOpen, setEmojiOpen] = useState(false);
  const [variantOpen, setVariantOpen] = useState(false);
  const emojiBtnRef = useRef<HTMLButtonElement | null>(null);
  const emojiPanelRef = useRef<HTMLDivElement | null>(null);
  const variantRef = useRef<HTMLDivElement | null>(null);
  const [emojiQuery, setEmojiQuery] = useState("");

  useEffect(() => {
    if (!emojiOpen) return;
    const onDown = (e: MouseEvent) => {
      if (
        emojiPanelRef.current &&
        !emojiPanelRef.current.contains(e.target as Node) &&
        emojiBtnRef.current &&
        !emojiBtnRef.current.contains(e.target as Node)
      ) {
        setEmojiOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setEmojiOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [emojiOpen]);

  useEffect(() => {
    if (!variantOpen) return;
    const onDown = (e: MouseEvent) => {
      if (variantRef.current && !variantRef.current.contains(e.target as Node)) {
        setVariantOpen(false);
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [variantOpen]);

  const filteredEmojis = useMemo(() => {
    const q = emojiQuery.trim().toLowerCase();
    if (!q) return emojisToName.slice(0, 64);
    return emojisToName.filter((e) => e.name.includes(q)).slice(0, 64);
  }, [emojiQuery]);

  const pickEmoji = useCallback(
    (e: string) => {
      updateAttributes({ emoji: e });
      setEmojiOpen(false);
      setEmojiQuery("");
    },
    [updateAttributes],
  );

  return (
    <NodeViewWrapper
      className={cn("kb-callout", selected && "is-selected")}
      data-variant={variant}
      data-emoji={emoji}
      style={{
        color: style.textColor,
        borderColor: style.borderColor,
        background: style.backgroundColor,
      }}
    >
      <div className="kb-callout-aside">
        <button
          ref={emojiBtnRef}
          type="button"
          title="更换图标"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => editor.isEditable && setEmojiOpen((v) => !v)}
          className="kb-callout-emoji"
        >
          {emoji}
        </button>
        {emojiOpen && (
          <div
            ref={emojiPanelRef}
            className="kb-callout-emoji-panel"
            onMouseDown={(e) => e.preventDefault()}
          >
            <input
              autoFocus
              value={emojiQuery}
              onChange={(e) => setEmojiQuery(e.target.value)}
              placeholder="搜索 emoji（英文）"
              className="kb-callout-emoji-input"
            />
            <div className="kb-callout-emoji-grid">
              {filteredEmojis.length === 0 ? (
                <div className="kb-callout-emoji-empty">没有匹配</div>
              ) : (
                filteredEmojis.map((it) => (
                  <button
                    key={it.name}
                    type="button"
                    title={`:${it.name}:`}
                    onClick={() => pickEmoji(it.emoji)}
                    className="kb-callout-emoji-cell"
                  >
                    {it.emoji}
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>
      <NodeViewContent className="kb-callout-content" />
      {editor.isEditable && (
        <div ref={variantRef} className="kb-callout-switcher">
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => setVariantOpen((v) => !v)}
            className="kb-callout-switcher-btn"
            title="切换风格"
          >
            {style.label} ▾
          </button>
          {variantOpen && (
            <div className="kb-callout-variant-panel">
              {(Object.keys(CALLOUT_VARIANTS) as CalloutVariant[]).map((v) => {
                const s = CALLOUT_VARIANTS[v];
                return (
                  <button
                    key={v}
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      updateAttributes({ variant: v });
                      setVariantOpen(false);
                    }}
                    className={cn(
                      "kb-callout-variant-cell",
                      v === variant && "is-active",
                    )}
                    style={{
                      color: s.textColor,
                      borderColor: s.borderColor,
                      background: s.backgroundColor,
                    }}
                  >
                    <span>{s.emoji}</span>
                    <span>{s.label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </NodeViewWrapper>
  );
}

export default Callout;
