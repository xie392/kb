"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { mergeAttributes, Node, nodeInputRule } from "@tiptap/core";
import {
  ReactNodeViewRenderer,
  NodeViewWrapper,
  type NodeViewProps,
} from "@tiptap/react";
import { cn } from "@/lib/utils";

/* ─── Iframe 嵌入 ───
 * 借鉴 demo/knloop-frontend-main 的 iframe 节点，改造为手绘风格。
 * 属性：url / width / height
 * 空 url 时显示 URL 输入卡片；有 url 时渲染 iframe，支持拖拽改尺寸。
 */

export interface IframeAttrs {
  url: string | null;
  width: string;
  height: number;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    iframe: {
      setIframe: (attrs?: Partial<IframeAttrs>) => ReturnType;
    };
  }
}

export const Iframe = Node.create({
  name: "iframe",
  content: "",
  marks: "",
  group: "block",
  selectable: true,
  atom: true,
  draggable: true,

  addOptions() {
    return { HTMLAttributes: { class: "kb-iframe" } };
  },

  addAttributes() {
    return {
      url: {
        default: null as string | null,
        parseHTML: (el) =>
          (el as HTMLElement).getAttribute("data-url") ??
          (el as HTMLIFrameElement).getAttribute("src") ??
          null,
        renderHTML: (a) => (a.url ? { "data-url": a.url } : {}),
      },
      width: {
        default: "100%",
        parseHTML: (el) => (el as HTMLElement).getAttribute("data-width") ?? "100%",
        renderHTML: (a) => ({ "data-width": a.width }),
      },
      height: {
        default: 360,
        parseHTML: (el) =>
          Number((el as HTMLElement).getAttribute("data-height")) || 360,
        renderHTML: (a) => ({ "data-height": a.height }),
      },
    };
  },

  parseHTML() {
    return [{ tag: "div.kb-iframe" }];
  },

  renderHTML({ HTMLAttributes }) {
    const attrs = HTMLAttributes as Record<string, unknown>;
    return [
      "div",
      mergeAttributes(this.options.HTMLAttributes, {
        "data-url": attrs["data-url"] ?? "",
        "data-width": attrs["data-width"] ?? "100%",
        "data-height": attrs["data-height"] ?? 360,
      }),
    ];
  },

  addCommands() {
    return {
      setIframe:
        (attrs) =>
        ({ chain, state }) => {
          const sel = state.selection;
          // @ts-expect-error node 在 NodeSelection 上
          if (sel.node?.type?.name === this.name) {
            return chain().focus().updateAttributes(this.name, attrs ?? {}).run();
          }
          return chain()
            .focus()
            .insertContent({ type: this.name, attrs: { url: attrs?.url ?? null } })
            .run();
        },
    };
  },

  addInputRules() {
    return [
      nodeInputRule({
        find: /^\$iframe\$$/,
        type: this.type,
        getAttributes: () => ({ url: null }),
      }),
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(IframeView);
  },
});

function IframeView(props: NodeViewProps) {
  const { editor, node, updateAttributes, selected } = props;
  const attrs = node.attrs as IframeAttrs;
  const { url, width, height } = attrs;
  const isEditable = editor.isEditable;

  const [draftUrl, setDraftUrl] = useState(url ?? "");
  const [editing, setEditing] = useState(!url);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const [dragH, setDragH] = useState<number | null>(null);

  useEffect(() => {
    setDraftUrl(url ?? "");
    if (url) setEditing(false);
  }, [url]);

  const commitUrl = () => {
    const u = draftUrl.trim();
    if (!u) return;
    updateAttributes({ url: u });
    setEditing(false);
  };

  const onResizeDown = useCallback(
    (e: React.MouseEvent) => {
      if (!isEditable) return;
      e.preventDefault();
      e.stopPropagation();
      const startY = e.clientY;
      const startH = wrapRef.current?.getBoundingClientRect().height ?? height;

      const onMove = (ev: MouseEvent) => {
        const dy = ev.clientY - startY;
        const next = Math.max(160, Math.round(startH + dy));
        setDragH(next);
      };
      const onUp = () => {
        document.removeEventListener("mousemove", onMove);
        document.removeEventListener("mouseup", onUp);
        setDragH((finalH) => {
          if (finalH !== null) updateAttributes({ height: finalH });
          return null;
        });
      };
      document.addEventListener("mousemove", onMove);
      document.addEventListener("mouseup", onUp);
    },
    [isEditable, height, updateAttributes],
  );

  const effectiveH = dragH ?? height;

  return (
    <NodeViewWrapper
      className={cn("kb-iframe", selected && "is-selected")}
      data-has-url={url ? "true" : "false"}
    >
      <div ref={wrapRef} className="kb-iframe-inner" style={{ width, height: effectiveH }}>
        {url && !editing ? (
          <iframe
            src={url}
            className="kb-iframe-frame"
            title="iframe 嵌入"
            loading="lazy"
            sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-presentation"
            allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
          />
        ) : (
          <div className="kb-iframe-empty">
            <div className="kb-iframe-empty-title">嵌入网页 / 视频</div>
            <input
              autoFocus
              value={draftUrl}
              onChange={(e) => setDraftUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") commitUrl();
                if (e.key === "Escape") setEditing(!!url);
              }}
              placeholder="粘贴 B 站 / YouTube / 网页链接"
              className="kb-iframe-input"
            />
            <div className="kb-iframe-empty-actions">
              {url && (
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => setEditing(false)}
                  className="kb-iframe-btn-ghost"
                >
                  取消
                </button>
              )}
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={commitUrl}
                className="kb-iframe-btn-primary"
              >
                嵌入
              </button>
            </div>
          </div>
        )}
        {url && !editing && isEditable && (
          <>
            <span
              role="button"
              aria-label="拖拽调整高度"
              title="拖拽调整高度"
              onMouseDown={onResizeDown}
              className="kb-iframe-handle"
            />
            <button
              type="button"
              title="编辑链接"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => setEditing(true)}
              className="kb-iframe-edit"
            >
              改链接
            </button>
          </>
        )}
      </div>
    </NodeViewWrapper>
  );
}

export default Iframe;
