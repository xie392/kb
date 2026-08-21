"use client";

import { useCallback } from "react";
import type { Editor } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import { ColumnLayout } from "./columns";
import { ToolbarDivider } from "../toolbar";
import {
  HandPanelLeft,
  HandPanelRight,
  HandColumnsTwo,
  HandTrash,
} from "../hand-icons-extra";

/** 选中 columns 节点时显示的浮动菜单：切换三种布局 */
export function ColumnsMenu({ editor }: { editor: Editor | null }) {
  const shouldShow = useCallback(
    ({ editor: ed }: { editor: Editor }) => ed.isActive("columns"),
    []
  );

  if (!editor) return null;

  const layout = (editor.getAttributes("columns").layout as ColumnLayout) ?? ColumnLayout.TwoColumn;
  const setLayout = (l: ColumnLayout) =>
    editor.chain().focus().setLayout(l).run();

  return (
    <BubbleMenu
      editor={editor}
      pluginKey="kb-columns-menu"
      shouldShow={shouldShow}
      options={{ placement: "top", offset: 8 }}
      className="flex items-center gap-0.5 rounded-lg border border-hairline bg-white px-1 py-1 sketch-border sketch-shadow"
    >
      <MenuBtn title="左侧栏 + 主内容" active={layout === ColumnLayout.SidebarLeft} onClick={() => setLayout(ColumnLayout.SidebarLeft)}>
        <HandPanelLeft className="h-4 w-4" />
      </MenuBtn>
      <MenuBtn title="两栏平分" active={layout === ColumnLayout.TwoColumn} onClick={() => setLayout(ColumnLayout.TwoColumn)}>
        <HandColumnsTwo className="h-4 w-4" />
      </MenuBtn>
      <MenuBtn title="主内容 + 右侧栏" active={layout === ColumnLayout.SidebarRight} onClick={() => setLayout(ColumnLayout.SidebarRight)}>
        <HandPanelRight className="h-4 w-4" />
      </MenuBtn>
      <ToolbarDivider />
      <MenuBtn title="删除多栏" onClick={() => editor.chain().focus().deleteNode("columns").run()}>
        <HandTrash className="h-4 w-4" />
      </MenuBtn>
    </BubbleMenu>
  );
}

function MenuBtn({
  title,
  active,
  onClick,
  children,
}: {
  title: string;
  active?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={`flex h-7 w-7 items-center justify-center rounded-md transition-colors ${
        active ? "bg-primary/10 text-primary" : "text-ink-secondary hover:bg-canvas-soft"
      }`}
    >
      {children}
    </button>
  );
}
