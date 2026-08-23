"use client";

import { EditorContent } from "@tiptap/react";
import type { Editor } from "@tiptap/react";
import {
  SlashMenu,
  EmojiSuggestion,
  TextMenu,
  LinkBubble,
  LinkDialogHost,
  BlockBubbleMenu,
  BlockHandleMenu,
  TableControls,
} from "@tipkit/ui";
import { TooltipProvider } from "@tipkit/components";
import {
  Bold,
  ChevronDownSquare,
  Code2,
  Columns2,
  Frame,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Image as ImageIcon,
  Link,
  List,
  ListChecks,
  ListOrdered,
  ListTree,
  Minus,
  Paperclip,
  Quote,
  Sigma,
  Smile,
  Table2,
  Text,
  TriangleAlert,
  type LucideIcon,
} from "lucide-react";

const SLASH_ICONS: Record<string, LucideIcon> = {
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Text,
  List,
  ListOrdered,
  ListChecks,
  Quote,
  Code2,
  Table2,
  Minus,
  Image: ImageIcon,
  Link,
  Columns2,
  ChevronDownSquare,
  ListTree,
  TriangleAlert,
  Sigma,
  Frame,
  Paperclip,
  Smile,
};

function renderSlashIcon(icon: string) {
  const Icon = SLASH_ICONS[icon];
  return Icon ? <Icon className="w-4 h-4" /> : null;
}

interface EditorAreaProps {
  editor: Editor | null;
  /** 传入后 "/" 菜单的"图片"动作支持本地上传 */
  onUploadImage?: (file: File) => Promise<string>;
}

/* 纯编辑区组件（不含工具栏）—— 浮层菜单全部使用 @tipkit/ui */
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
    <div className="tk-editor">
      <TooltipProvider delayDuration={300}>
        <EditorContent editor={editor} />
        <SlashMenu editor={editor} onUploadImage={onUploadImage} iconRenderer={renderSlashIcon} />
        <EmojiSuggestion editor={editor} />
        <TextMenu editor={editor} />
        <LinkBubble editor={editor} />
        <LinkDialogHost editor={editor} />
        <BlockBubbleMenu editor={editor} />
        <BlockHandleMenu editor={editor} />
        <TableControls editor={editor} />
      </TooltipProvider>
    </div>
  );
}
