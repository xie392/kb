import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { LinkCardView } from "./link-card-view";

export interface LinkCardAttrs {
  href: string;
  title: string;
  description?: string;
  image?: string | null;
  favicon?: string | null;
}

/** 链接卡片节点：把链接渲染为标题 + 描述 + 缩略图/Logo 的卡片 */
export const LinkCard = Node.create({
  name: "linkCard",
  group: "block",
  atom: true,
  selectable: true,
  draggable: true,

  addAttributes() {
    return {
      href: {
        default: null,
        parseHTML: (el) => el.getAttribute("data-href") ?? el.getAttribute("href"),
      },
      title: {
        default: "",
        parseHTML: (el) => el.querySelector(".kb-link-card-title")?.textContent ?? "",
      },
      description: {
        default: "",
        parseHTML: (el) => el.querySelector(".kb-link-card-desc")?.textContent ?? "",
      },
      image: {
        default: null,
        parseHTML: (el) => el.querySelector("img.kb-link-card-thumb")?.getAttribute("src") ?? null,
      },
      favicon: {
        default: null,
        parseHTML: (el) => el.querySelector("img.kb-link-card-logo")?.getAttribute("src") ?? null,
      },
    };
  },

  parseHTML() {
    return [{ tag: "div[data-link-card]" }];
  },

  renderHTML({ HTMLAttributes, node }) {
    const { href, title, description, image, favicon } = node.attrs as LinkCardAttrs;
    const descStr = description != null ? String(description) : "";
    const titleStr = String(title || href || "");
    const hrefStr = String(href || "");
    const thumb = image
      ? ["img", { class: "kb-link-card-thumb", src: image, alt: titleStr }]
      : favicon
        ? ["img", { class: "kb-link-card-logo", src: favicon, alt: "" }]
        : ["span", { class: "kb-link-card-thumb kb-link-card-thumb--empty" }];
    return [
      "div",
      mergeAttributes(HTMLAttributes, {
        "data-link-card": "",
        class: "kb-link-card",
        "data-href": hrefStr,
      }),
      thumb,
      [
        "div",
        { class: "kb-link-card-body" },
        ["div", { class: "kb-link-card-title" }, titleStr],
        ...(descStr
          ? [["div", { class: "kb-link-card-desc" }, descStr]]
          : []),
        ["div", { class: "kb-link-card-url" }, hrefStr],
      ],
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(LinkCardView);
  },
});
