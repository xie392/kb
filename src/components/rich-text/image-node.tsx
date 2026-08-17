"use client";

import { useState } from "react";
import Image from "@tiptap/extension-image";
import { ReactNodeViewRenderer, NodeViewWrapper } from "@tiptap/react";
import type { ImageAlign, ImageStyle } from "./types";

/* ─── 图片节点（支持对齐、旋转、描边、阴影） ───
 * 属性通过 data-* 输出到 DOM，视觉由 CSS 按属性选择器控制。
 * 这样 updateAttributes 后 ProseMirror 能把变更同步到 DOM（节点级
 * renderHTML 仅在首次插入时执行，属性级 renderHTML 返回 {} 会导致更新不落 DOM）。
 */

/** 兼容旧数据：从内联 style 中解析 对齐 / 旋转 / 样式 */
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
    const rad = (rot * Math.PI) / 180;
    const sin = Math.abs(Math.sin(rad));
    const cos = Math.abs(Math.cos(rad));
    const boxW = Math.round(w * cos + h * sin);
    const boxH = Math.round(w * sin + h * cos);
    const textAlign =
      align === "left" ? "left" : align === "right" ? "right" : "center";
    let wrapStyle = `text-align:${textAlign};`;
    let imgStyle: string | undefined;
    if (w && h && boxW && boxH) {
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

/* 图片 NodeView：wrapper 内的定位容器按旋转后的包围盒预留布局空间，
 * 图片绝对居中并旋转，避免 transform 悬浮覆盖相邻内容。 */
function ImageView(props: {
  node: { attrs: Record<string, unknown> };
  updateAttributes: (patch: Record<string, unknown>) => void;
  selected?: boolean;
}) {
  const { node, selected, updateAttributes } = props;
  const attrs = node.attrs as {
    src?: string;
    alt?: string;
    title?: string;
    width?: number | null;
    height?: number | null;
    align?: ImageAlign;
    rotation?: number;
    imgStyle?: ImageStyle;
  };
  const align = attrs.align ?? "center";
  const rotation = ((attrs.rotation ?? 0) % 360 + 360) % 360;
  const imgStyle = attrs.imgStyle ?? "none";
  const storedW = Number(attrs.width) || 0;
  const storedH = Number(attrs.height) || 0;

  const [size, setSize] = useState<{ w: number; h: number } | null>(
    storedW && storedH ? { w: storedW, h: storedH } : null,
  );

  const rad = (rotation * Math.PI) / 180;
  const sin = Math.abs(Math.sin(rad));
  const cos = Math.abs(Math.cos(rad));
  const boxW = size ? size.w * cos + size.h * sin : 0;
  const boxH = size ? size.w * sin + size.h * cos : 0;
  const textAlign =
    align === "left" ? "left" : align === "right" ? "right" : "center";

  const wrapStyle: React.CSSProperties = {
    textAlign,
    width: boxW ? `${Math.round(boxW)}px` : undefined,
    maxWidth: "100%",
    aspectRatio: boxW && boxH ? `${boxW} / ${boxH}` : undefined,
  };
  const imgCss: React.CSSProperties = size
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
    : { maxWidth: "100%", height: "auto" };

  return (
    <NodeViewWrapper
      as="div"
      className="kb-img-wrap"
      style={wrapStyle}
      data-align={align}
      data-selected={selected ? "true" : undefined}
    >
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
      />
    </NodeViewWrapper>
  );
}
