"use client";

import { EditorContent } from "@tiptap/react";
import type { Editor } from "@tiptap/react";
import { BlockMenu } from "./block-menu";

/* 纯编辑区组件（不含工具栏） */
export function EditorArea({ editor }: { editor: Editor | null }) {
  if (!editor) {
    return (
      <div className="animate-pulse space-y-3 p-8">
        <div className="h-4 bg-[#f0efec] rounded w-3/4" />
        <div className="h-4 bg-[#f0efec] rounded w-1/2" />
        <div className="h-4 bg-[#f0efec] rounded w-2/3" />
      </div>
    );
  }

  return (
    <div className="px-6 py-4">
      <EditorContent editor={editor} />
      <BlockMenu editor={editor} />
    </div>
  );
}
