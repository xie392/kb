import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";

export interface TrailingNodeOptions {
  node: string;
  notAfter: string[];
}

/** 在文档末尾自动追加一个空段落，便于点击空白处继续输入 */
export const TrailingNode = Extension.create<TrailingNodeOptions>({
  name: "trailingNode",

  addOptions() {
    return {
      node: "paragraph",
      notAfter: ["paragraph"],
    };
  },

  addProseMirrorPlugins() {
    const pluginKey = new PluginKey(this.name);
    const disabledNodes = Object.values(this.editor.schema.nodes).filter((node) =>
      this.options.notAfter.includes(node.name)
    );

    const nodeEqualsType = ({ node, types }: { node: any; types: any[] }) =>
      (Array.isArray(types) && types.includes(node.type)) || node.type === types;

    return [
      new Plugin({
        key: pluginKey,
        appendTransaction: (_, __, state) => {
          const { doc, tr, schema } = state;
          const shouldInsertNodeAtEnd = pluginKey.getState(state) as boolean;
          const endPosition = doc.content.size;
          const type = schema.nodes[this.options.node];

          if (!shouldInsertNodeAtEnd || !type) return;
          return tr.insert(endPosition, type.create());
        },
        state: {
          init: (_, state) => {
            const lastNode = state.tr.doc.lastChild;
            return !nodeEqualsType({ node: lastNode, types: disabledNodes });
          },
          apply: (tr, value) => {
            if (!tr.docChanged) return value;
            const lastNode = tr.doc.lastChild;
            return !nodeEqualsType({ node: lastNode, types: disabledNodes });
          },
        },
      }),
    ];
  },
});

export default TrailingNode;
