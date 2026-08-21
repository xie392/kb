import { Node, mergeAttributes } from "@tiptap/core";

export enum ColumnLayout {
  SidebarLeft = "sidebar-left",
  SidebarRight = "sidebar-right",
  TwoColumn = "two-column",
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    columns: {
      setColumns: () => ReturnType;
      setLayout: (layout: ColumnLayout) => ReturnType;
    };
  }
}

/** 多栏容器：包含两个 column 子节点，layout 控制主侧栏布局 */
export const Columns = Node.create({
  name: "columns",

  group: "block",

  content: "column column",

  defining: true,

  isolating: true,

  addAttributes() {
    return {
      layout: {
        default: ColumnLayout.TwoColumn,
      },
    };
  },

  addCommands() {
    return {
      setColumns:
        () =>
        ({ commands }) =>
          commands.insertContent(
            '<div data-type="columns"><div data-type="column" data-position="left"><p></p></div><div data-type="column" data-position="right"><p></p></div></div>'
          ),
      setLayout:
        (layout: ColumnLayout) =>
        ({ commands }) =>
          commands.updateAttributes("columns", { layout }),
    };
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      { "data-type": "columns", class: `kb-columns layout-${HTMLAttributes.layout}` },
      0,
    ];
  },

  parseHTML() {
    return [{ tag: "div[data-type='columns']" }];
  },
});

/** 单个列：内部可放任意 block，通过 position 区分左右 */
export const Column = Node.create({
  name: "column",

  content: "block+",

  isolating: true,

  addAttributes() {
    return {
      position: {
        default: "",
        parseHTML: (element) => (element as HTMLElement).getAttribute("data-position") ?? "",
        renderHTML: (attributes) => ({ "data-position": attributes.position }),
      },
    };
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(HTMLAttributes, { "data-type": "column", class: "kb-column" }),
      0,
    ];
  },

  parseHTML() {
    return [{ tag: "div[data-type='column']" }];
  },
});

export default Columns;
