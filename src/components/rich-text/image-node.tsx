"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "@tiptap/extension-image";
import { ReactNodeViewRenderer, NodeViewWrapper } from "@tiptap/react";
import type { ImageAlign, ImageStyle } from "./types";

/* ─── 图片节点（支持对齐、旋转、描边、阴影、宽度拖拽、说明文字） ───
 * 属性通过 data-* 输出到 DOM，视觉由 CSS 按属性选择器控制。
 * displayWidth 控制实际显示宽度百分比（rotation 包围盒计算仍用原始 width/height）。
 * caption 为可选说明文字，在图片下方以 contentEditable 形式就地编辑。
 */

function parseLegacyStyle(el: HTMLElement) {
  const s = el.getAttribute("style") ?? "";
  const align: ImageAlign = s.includes("float:left")
    ? "left"
    : s.includes("float:right")
      ? "right"
      : "center";
  const rotMatch = s.match(/rotate\((-?\d+(?:\.\d+)?)deg\)/);
  const rotation = rotMatch ? Number(rotMatch[1]) : 0;
  const imgStyle: ImageStyle = s.includes("box-shadow:")
    ? "shadow"
    : s.includes("border:")
      ? "border"
      : "none";
  return { align, rotation, imgStyle };
}

function numAttr(el: HTMLElement, name: string): number | null {
  const v = el.getAttribute(name);
  if (v === null) return null;
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : null;
}

function readImageEl(el: HTMLElement): HTMLImageElement | null {
  if (el.tagName === "IMG") return el as HTMLImageElement;
  const img = el.querySelector("img");
  return img as HTMLImageElement | null;
}

/** 从 data-display-width 属性解析百分比数值 */
function parseDisplayWidth(el: HTMLElement): number | null {
  const raw =
    el.getAttribute("data-display-width") ??
    readImageEl(el)?.getAttribute("data-display-width");
  if (raw === null) return null;
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 && n <= 100 ? n : null;
}

export const CustomImage = Image.configure({ allowBase64: true }).extend({
  parseHTML() {
    return [{ tag: "span.kb-img-wrap" }, { tag: "img[src]" }];
  },
  addAttributes() {
    return {
      ...this.parent?.(),
      src: {
        default: null,
        parseHTML: (el) => readImageEl(el as HTMLElement)?.getAttribute("src") ?? null,
      },
      alt: {
        default: null,
        parseHTML: (el) => readImageEl(el as HTMLElement)?.getAttribute("alt") ?? null,
      },
      title: {
        default: null,
        parseHTML: (el) => readImageEl(el as HTMLElement)?.getAttribute("title") ?? null,
      },
      width: {
        default: null,
        parseHTML: (el) => {
          const img = readImageEl(el as HTMLElement);
          return img ? numAttr(img, "width") : null;
        },
        renderHTML: (a) => (a.width ? { width: a.width } : {}),
      },
      height: {
        default: null,
        parseHTML: (el) => {
          const img = readImageEl(el as HTMLElement);
          return img ? numAttr(img, "height") : null;
        },
        renderHTML: (a) => (a.height ? { height: a.height } : {}),
      },
      align: {
        default: "center",
        parseHTML: (el) => {
          const root = el as HTMLElement;
          const img = readImageEl(root);
          return (
            root.getAttribute("data-align") ??
            img?.getAttribute("data-align") ??
            parseLegacyStyle(img ?? root).align
          ) as ImageAlign;
        },
        renderHTML: (a) => ({ "data-align": a.align }),
      },
      rotation: {
        default: 0,
        parseHTML: (el) => {
          const img = readImageEl(el as HTMLElement);
          if (!img) return 0;
          const d = img.getAttribute("data-rotation");
          if (d !== null) return Number(d) || 0;
          return parseLegacyStyle(img).rotation;
        },
        renderHTML: (a) =>
          a.rotation ? { "data-rotation": String(a.rotation) } : {},
      },
      imgStyle: {
        default: "none",
        parseHTML: (el) => {
          const img = readImageEl(el as HTMLElement);
          if (!img) return "none";
          return (
            (img.getAttribute("data-style") as ImageStyle | null) ??
            parseLegacyStyle(img).imgStyle
          );
        },
        renderHTML: (a) =>
          a.imgStyle && a.imgStyle !== "none"
            ? { "data-style": a.imgStyle }
            : {},
      },
      displayWidth: {
        default: null,
        parseHTML: (el) => parseDisplayWidth(el as HTMLElement),
        renderHTML: (a) =>
          a.displayWidth && a.displayWidth < 100
            ? { "data-display-width": String(a.displayWidth) }
            : {},
      },
      caption: {
        default: null,
        parseHTML: (el) => {
          const root = el as HTMLElement;
          const cap = root.querySelector(".kb-img-caption");
          return cap ? (cap.textContent ?? null) : null;
        },
        renderHTML: () => ({}), // caption 在 NodeView 内部渲染，不输出到静态 HTML
      },
    };
  },
  addNodeView() {
    return ReactNodeViewRenderer(ImageView);
  },
  renderHTML({ HTMLAttributes }) {
    const attrs = HTMLAttributes as Record<string, unknown>;
    const align = (attrs["data-align"] as ImageAlign) ?? "center";
    const rot = Number(attrs["data-rotation"]) || 0;
    const w = Number(attrs.width) || 0;
    const h = Number(attrs.height) || 0;
    const displayWidth = Number(attrs["data-display-width"]) || 100;
    const rad = (rot * Math.PI) / 180;
    const sin = Math.abs(Math.sin(rad));
    const cos = Math.abs(Math.cos(rad));
    const boxW = Math.round(w * cos + h * sin);
    const boxH = Math.round(w * sin + h * cos);
    const textAlign =
      align === "left" ? "left" : align === "right" ? "right" : "center";
    let wrapStyle = `text-align:${textAlign};`;
    let imgStyle: string | undefined;
    // 当 displayWidth < 100 时直接用百分比宽度（此时不计算旋转包围盒，
    // 因为带缩放的图片通常不旋转，二者组合视觉过于复杂）
    if (displayWidth && displayWidth < 100) {
      wrapStyle += `width:${displayWidth}%;max-width:${displayWidth}%;`;
      imgStyle = `width:100%;height:auto;border-radius:12px;`;
      if (rot) imgStyle += `transform:rotate(${rot}deg);`;
    } else if (rot && w && h && boxW && boxH) {
      // 仅在有旋转时用绝对定位 + aspect-ratio 预留旋转包围盒；无旋转走流式布局
      wrapStyle += `width:${boxW}px;max-width:100%;aspect-ratio:${boxW} / ${boxH};`;
      imgStyle = [
        `width:${((w / boxW) * 100).toFixed(4)}%`,
        "height:auto",
        "position:absolute",
        "top:50%",
        "left:50%",
        "max-width:none",
        "margin:0",
        `transform:translate(-50%,-50%) rotate(${rot}deg)`,
      ].join(";");
    }
    return [
      "div",
      { class: "kb-img-wrap", "data-align": align, style: wrapStyle },
      ["img", { ...attrs, style: imgStyle }],
    ];
  },
});

interface ImageViewProps {
  node: { attrs: Record<string, unknown> };
  updateAttributes: (patch: Record<string, unknown>) => void;
  selected?: boolean;
  editor: { isEditable: boolean };
}

/* 图片 NodeView：wrapper 内的定位容器按旋转后的包围盒预留布局空间，
 * 图片绝对居中并旋转，避免 transform 悬浮覆盖相邻内容。
 * 选中时显示右下角拖拽手柄，调整 displayWidth 百分比。 */
function ImageView(props: ImageViewProps) {
  const { node, selected, updateAttributes, editor } = props;
  const attrs = node.attrs as {
    src?: string;
    alt?: string;
    title?: string;
    width?: number | null;
    height?: number | null;
    align?: ImageAlign;
    rotation?: number;
    imgStyle?: ImageStyle;
    displayWidth?: number | null;
    caption?: string | null;
  };
  const align = attrs.align ?? "center";
  const rotation = ((attrs.rotation ?? 0) % 360 + 360) % 360;
  const imgStyle = attrs.imgStyle ?? "none";
  const storedW = Number(attrs.width) || 0;
  const storedH = Number(attrs.height) || 0;
  const displayWidth = attrs.displayWidth ?? 100;
  const caption = attrs.caption ?? "";

  const [size, setSize] = useState<{ w: number; h: number } | null>(
    storedW && storedH ? { w: storedW, h: storedH } : null,
  );
  const [dragWidth, setDragWidth] = useState<number | null>(null);
  const [editingCaption, setEditingCaption] = useState(false);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const captionRef = useRef<HTMLDivElement | null>(null);

  const rad = (rotation * Math.PI) / 180;
  const sin = Math.abs(Math.sin(rad));
  const cos = Math.abs(Math.cos(rad));
  const boxW = size ? size.w * cos + size.h * sin : 0;
  const boxH = size ? size.w * sin + size.h * cos : 0;
  const textAlign =
    align === "left" ? "left" : align === "right" ? "right" : "center";

  // 使用 displayWidth 控制显示宽度，rotation 包围盒计算仅当未缩放时生效
  const usingPercent = displayWidth < 100;
  // 有旋转且未缩放时用绝对定位 + aspect-ratio 预留旋转包围盒；
  // 无旋转时一律走流式布局，避免 position:absolute 撑不起高度导致覆盖相邻块。
  const useAbsoluteBox = !usingPercent && rotation !== 0 && size !== null;
  const wrapStyle: React.CSSProperties = usingPercent
    ? { textAlign, width: `${displayWidth}%`, maxWidth: `${displayWidth}%` }
    : useAbsoluteBox
      ? {
          textAlign,
          width: boxW ? `${Math.round(boxW)}px` : undefined,
          maxWidth: "100%",
          aspectRatio: boxW && boxH ? `${boxW} / ${boxH}` : undefined,
        }
      : { textAlign, maxWidth: "100%" };
  const imgCss: React.CSSProperties = usingPercent
    ? {
        width: "100%",
        height: "auto",
        transform: rotation ? `rotate(${rotation}deg)` : undefined,
        borderRadius: 12,
      }
    : useAbsoluteBox && size
      ? {
          width: `${((size.w / boxW) * 100).toFixed(4)}%`,
          height: "auto",
          position: "absolute",
          top: "50%",
          left: "50%",
          maxWidth: "none",
          margin: 0,
          transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
        }
      : { maxWidth: "100%", height: "auto", borderRadius: 12 };

  /* ─── 拖拽手柄：计算 wrap 容器宽度变化为百分比 ─── */
  const onHandleDown = useCallback(
    (e: React.MouseEvent) => {
      if (!editor.isEditable) return;
      e.preventDefault();
      e.stopPropagation();
      const startX = e.clientX;
      const startW = wrapRef.current?.getBoundingClientRect().width ?? 0;
      const containerW =
        wrapRef.current?.parentElement?.getBoundingClientRect().width ?? startW;
      const startPercent = (startW / containerW) * 100 || displayWidth;

      const onMove = (ev: MouseEvent) => {
        const dx = ev.clientX - startX;
        const next = Math.max(
          15,
          Math.min(100, startPercent + (dx / containerW) * 100),
        );
        setDragWidth(Math.round(next));
      };
      const onUp = () => {
        document.removeEventListener("mousemove", onMove);
        document.removeEventListener("mouseup", onUp);
        setDragWidth((finalW) => {
          if (finalW !== null) {
            updateAttributes({ displayWidth: finalW });
          }
          return null;
        });
      };
      document.addEventListener("mousemove", onMove);
      document.addEventListener("mouseup", onUp);
    },
    [editor.isEditable, displayWidth, updateAttributes],
  );

  /* ─── caption 编辑：失焦回写 ─── */
  useEffect(() => {
    if (editingCaption && captionRef.current) {
      captionRef.current.textContent = caption;
      captionRef.current.focus();
    }
  }, [editingCaption, caption]);

  const commitCaption = () => {
    setEditingCaption(false);
    const text = captionRef.current?.textContent ?? "";
    updateAttributes({ caption: text.trim() ? text : null });
  };

  const effectiveWidth = dragWidth ?? displayWidth;

  return (
    <NodeViewWrapper
      as="div"
      className="kb-img-wrap"
      style={wrapStyle}
      data-align={align}
      data-selected={selected ? "true" : undefined}
    >
      <div ref={wrapRef} className="kb-img-inner" style={{ position: "relative", display: "inline-block", width: "100%" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={attrs.src ?? undefined}
          alt={attrs.alt ?? undefined}
          title={attrs.title ?? undefined}
          data-align={align}
          data-rotation={String(rotation)}
          data-style={imgStyle}
          style={imgCss}
          onLoad={(e) => {
            const el = e.currentTarget;
            const nw = el.naturalWidth || el.width;
            const nh = el.naturalHeight || el.height;
            if (nw && nh) {
              setSize({ w: nw, h: nh });
              if (!storedW || !storedH) {
                updateAttributes({ width: Math.round(nw), height: Math.round(nh) });
              }
            }
          }}
          draggable={false}
        />
        {selected && editor.isEditable && (
          <span
            role="button"
            aria-label="拖拽调整宽度"
            title="拖拽调整宽度"
            onMouseDown={onHandleDown}
            className="kb-img-handle"
          />
        )}
      </div>
      {(editingCaption || caption) && (
        <div
          ref={captionRef}
          contentEditable={editor.isEditable && editingCaption}
          suppressContentEditableWarning
          data-placeholder="图片说明…"
          className="kb-img-caption"
          onBlur={commitCaption}
          onClick={(e) => {
            if (editor.isEditable && !editingCaption) {
              e.stopPropagation();
              setEditingCaption(true);
            }
          }}
        />
      )}
      {selected && editor.isEditable && !caption && !editingCaption && (
        <button
          type="button"
          className="kb-img-add-caption"
          onMouseDown={(e) => e.preventDefault()}
          onClick={(e) => {
            e.stopPropagation();
            setEditingCaption(true);
          }}
        >
          + 添加说明
        </button>
      )}
      {selected && editor.isEditable && (
        <span className="kb-img-width-tag">{Math.round(effectiveWidth)}%</span>
      )}
    </NodeViewWrapper>
  );
}
