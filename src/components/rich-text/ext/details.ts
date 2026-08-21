import { Node, mergeAttributes } from "@tiptap/core";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    details: {
      setDetails: () => ReturnType;
    };
  }
}

/** 折叠块容器：基于 <details> 实现，summary + 多个内容块 */
export const Details = Node.create({
  name: "details",

  group: "block",

  content: "detailsSummary detailsContent+",

  isolating: true,

  addAttributes() {
    return {
      open: {
        default: true,
        parseHTML: (el) => (el as HTMLElement).getAttribute("open") !== null,
        renderHTML: (attrs) => (attrs.open ? { open: "open" } : {}),
      },
    };
  },

  parseHTML() {
    return [{ tag: "details[data-type='details']" }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "details",
      mergeAttributes(HTMLAttributes, { "data-type": "details", class: "kb-details" }),
      0,
    ];
  },

  addCommands() {
    return {
      setDetails:
        () =>
        ({ commands }) =>
          commands.insertContent({
            type: "details",
            attrs: { open: true },
            content: [
              { type: "detailsSummary", content: [{ type: "text", text: "折叠标题" }] },
              {
                type: "detailsContent",
                content: [{ type: "paragraph" }],
              },
            ],
          }),
    };
  },

  addNodeView() {
    return ({ node, HTMLAttributes }) => {
      const dom = document.createElement("details");
      dom.setAttribute("data-type", "details");
      dom.className = "kb-details";
      if (node.attrs.open) dom.setAttribute("open", "open");
      Object.entries(HTMLAttributes).forEach(([k, v]) => {
        if (v != null && typeof v === "string") dom.setAttribute(k, v);
      });
      dom.addEventListener("toggle", () => {
        // 由浏览器原生切换，无需写回 attrs，避免循环
      });
      return {
        dom,
        contentDOM: dom,
        ignoreMutation: (mutation) =>
          mutation.type === "attributes" && (mutation as MutationRecord).attributeName === "open",
      };
    };
  },
});

/** 折叠块标题：渲染为 <summary>，仅一行 */
export const DetailsSummary = Node.create({
  name: "detailsSummary",

  content: "inline*",

  defining: true,

  selectable: false,

  draggable: false,

  parseHTML() {
    return [{ tag: "summary[data-type='summary']" }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "summary",
      mergeAttributes(HTMLAttributes, { "data-type": "summary", class: "kb-details-summary" }),
      0,
    ];
  },
});

/** 折叠块正文：可放任意 block */
export const DetailsContent = Node.create({
  name: "detailsContent",

  content: "block+",

  defining: true,

  selectable: false,

  draggable: false,

  parseHTML() {
    return [{ tag: "div[data-type='details-content']" }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(HTMLAttributes, { "data-type": "details-content", class: "kb-details-content" }),
      0,
    ];
  },
});

export default Details;
