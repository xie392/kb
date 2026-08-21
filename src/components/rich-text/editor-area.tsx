"use client";

import { EditorContent } from "@tiptap/react";
import type { Editor } from "@tiptap/react";
import { BlockMenu } from "./block-menu";
import { SlashMenu } from "./slash-menu";
import { TextMenu } from "./text-menu";
import { LinkBubble } from "./link-bubble";
import { LinkDialogHost } from "./link-dialog";
import { ColumnsMenu } from "./ext/columns-menu";
import { EmojiSuggestion } from "./ext/emoji-suggestion";
import { ImageBlockMenu } from "./ext/image-block";

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
      <ImageBlockMenu editor={editor} />
      <TextMenu editor={editor} />
      <ColumnsMenu editor={editor} />
      <SlashMenu editor={editor} onUploadImage={onUploadImage} />
      <EmojiSuggestion editor={editor} />
      <LinkBubble editor={editor} />
      <LinkDialogHost editor={editor} />
    </div>
  );
}
