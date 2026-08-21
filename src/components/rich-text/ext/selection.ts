import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "@tiptap/pm/view";

/** 编辑器失焦后保留选区视觉（虚线高亮），方便定位 */
export const Selection = Extension.create({
  name: "selection",

  addProseMirrorPlugins() {
    const { editor } = this;
    return [
      new Plugin({
        key: new PluginKey("selection"),
        props: {
          decorations(state) {
            if (state.selection.empty) return null;
            if (editor.isFocused) return null;
            return DecorationSet.create(state.doc, [
              Decoration.inline(state.selection.from, state.selection.to, {
                class: "kb-selection-blur",
              }),
            ]);
          },
        },
      }),
    ];
  },
});

export default Selection;
