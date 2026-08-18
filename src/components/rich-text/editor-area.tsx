"use client";

import { EditorContent } from "@tiptap/react";
import type { Editor } from "@tiptap/react";
import { BlockMenu } from "./block-menu";
import { SlashMenu } from "./slash-menu";

interface EditorAreaProps {
  editor: Editor | null;
  /** 传入后 "/" 菜单的"图片"动作支持本地上传 */
  onUploadImage?: (file: File) => Promise<string>;
}

/* 纯编辑区组件（不含工具栏） */
export function EditorArea({ editor, onUploadImage }: EditorAreaProps) {
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
      <SlashMenu editor={editor} onUploadImage={onUploadImage} />
    </div>
  );
}
