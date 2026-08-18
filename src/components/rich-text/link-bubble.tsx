"use client";

import { BubbleMenu } from "@tiptap/react/menus";
import type { Editor } from "@tiptap/react";
import { useEditorState } from "@tiptap/react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { HandExternalLink, HandPencil, HandUnlink } from "./hand-icons";
import { openLinkDialog } from "./link-dialog";

function BubbleBtn({
  title,
  onClick,
  children,
}: {
  title: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <button
            type="button"
            title={title}
            aria-label={title}
            onMouseDown={(e) => e.preventDefault()}
            onClick={onClick}
            className="flex h-7 w-7 items-center justify-center rounded-md text-ink-secondary transition-colors hover:bg-canvas-soft"
          >
            {children}
          </button>
        }
      />
      <TooltipContent side="bottom">{title}</TooltipContent>
    </Tooltip>
  );
}

/* 选中/点击链接时显示的编辑小工具栏 */
export function LinkBubble({ editor }: { editor: Editor | null }) {
  const href =
    useEditorState({
      editor,
      selector: ({ editor: ed }) =>
        ed ? ((ed.getAttributes("link").href as string) ?? "") : "",
    }) ?? "";

  if (!editor) return null;

  return (
    <TooltipProvider delay={100}>
      <BubbleMenu
        editor={editor}
        pluginKey="kb-link-bubble-menu"
        options={{ placement: "top", offset: 8 }}
        shouldShow={({ editor: currentEditor }) =>
          currentEditor.isEditable && currentEditor.isActive("link")
        }
        className="flex items-center gap-0.5 rounded-lg border border-hairline bg-white px-1.5 py-1 sketch-border sketch-shadow"
      >
        <span className="max-w-40 truncate px-1 text-xs text-ink-muted">{href}</span>
        <span className="mx-0.5 h-4 w-px bg-hairline" />
        <BubbleBtn title="编辑链接" onClick={() => openLinkDialog()}>
          <HandPencil className="h-3.5 w-3.5" />
        </BubbleBtn>
        <BubbleBtn
          title="打开链接"
          onClick={() => {
            if (href) window.open(href, "_blank", "noopener,noreferrer");
          }}
        >
          <HandExternalLink className="h-3.5 w-3.5" />
        </BubbleBtn>
        <BubbleBtn
          title="取消链接"
          onClick={() => editor.chain().focus().extendMarkRange("link").unsetLink().run()}
        >
          <HandUnlink className="h-3.5 w-3.5" />
        </BubbleBtn>
      </BubbleMenu>
    </TooltipProvider>
  );
}
