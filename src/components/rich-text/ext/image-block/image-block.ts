import { ReactNodeViewRenderer } from "@tiptap/react";
import Image from "@tiptap/extension-image";
import type { Range } from "@tiptap/core";

import { ImageBlockView } from "./image-block-view";

/* ─── ImageBlock 节点 ───
 * 照搬自 demo/knloop-web-dev，并补充 caption 字段与 parseHTML 隔离：
 * - 与现有 CustomImage（inline `image`）共存，parseHTML 只认 `div[data-type="image-block"]`，
 *   不会与 `<img>` 标签冲突，旧数据仍走 CustomImage。
 * - width 用百分比字符串（"25"/"50"/"100" 等），与 demo 一致。
 * - align：left / center / right。
 * - caption：可选说明文字，由 NodeView 内部就地编辑。
 */

export interface ImageBlockAttrs {
  src: string;
  width: string;
  align: "left" | "center" | "right";
  alt?: string;
  caption?: string | null;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    imageBlock: {
      setImageBlock: (attributes: { src: string; alt?: string }) => ReturnType;
      setImageBlockAt: (attributes: { src: string; pos: number | Range }) => ReturnType;
      setImageBlockAlign: (align: "left" | "center" | "right") => ReturnType;
      setImageBlockWidth: (width: number) => ReturnType;
      setImageBlockCaption: (caption: string | null) => ReturnType;
    };
  }
}

export const ImageBlock = Image.extend({
  name: "imageBlock",

  group: "block",

  defining: true,

  isolating: true,

  selectable: true,

  allowGapCursor: true,

  addAttributes() {
    return {
      src: {
        default: "",
        parseHTML: (el) => {
          const root = el as HTMLElement;
          const img = root.querySelector("img");
          return (img?.getAttribute("src") ?? root.getAttribute("src") ?? "") as string;
        },
        renderHTML: (a) => ({ src: a.src }),
      },
      width: {
        default: "100%",
        parseHTML: (el) =>
          (el as HTMLElement).getAttribute("data-width") ?? "100%",
        renderHTML: (a) => ({ "data-width": a.width }),
      },
      align: {
        default: "center",
        parseHTML: (el) =>
          (el as HTMLElement).getAttribute("data-align") ?? "center",
        renderHTML: (a) => ({ "data-align": a.align }),
      },
      alt: {
        default: undefined,
        parseHTML: (el) => (el as HTMLElement).getAttribute("alt") ?? undefined,
        renderHTML: (a) => (a.alt ? { alt: a.alt } : {}),
      },
      caption: {
        default: null,
        parseHTML: (el) => {
          const cap = (el as HTMLElement).querySelector(".kb-ib-caption");
          return cap ? (cap.textContent ?? null) : null;
        },
        renderHTML: () => ({}),
      },
    };
  },

  parseHTML() {
    return [{ tag: "div[data-type='image-block']" }];
  },

  renderHTML({ HTMLAttributes }) {
    const attrs = HTMLAttributes as Record<string, unknown>;
    const align = (attrs["data-align"] as string) ?? "center";
    const width = (attrs["data-width"] as string) ?? "100%";
    return [
      "div",
      {
        "data-type": "image-block",
        "data-align": align,
        "data-width": width,
      },
      ["img", { src: attrs.src, alt: attrs.alt ?? "" }],
    ];
  },

  addCommands() {
    return {
      setImageBlock:
        (attrs) =>
        ({ commands }) =>
          commands.insertContent({
            type: "imageBlock",
            attrs: { src: attrs.src, alt: attrs.alt },
          }),
      setImageBlockAt:
        (attrs) =>
        ({ commands }) =>
          commands.insertContentAt(attrs.pos, {
            type: "imageBlock",
            attrs: { src: attrs.src },
          }),
      setImageBlockAlign:
        (align) =>
        ({ commands }) =>
          commands.updateAttributes("imageBlock", { align }),
      setImageBlockWidth:
        (width) =>
        ({ commands }) =>
          commands.updateAttributes("imageBlock", {
            width: `${Math.max(0, Math.min(100, width))}%`,
          }),
      setImageBlockCaption:
        (caption) =>
        ({ commands }) =>
          commands.updateAttributes("imageBlock", { caption }),
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer(ImageBlockView);
  },
});

export default ImageBlock;
