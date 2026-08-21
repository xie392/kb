"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { BubbleMenu } from "@tiptap/react/menus";
import type { Editor } from "@tiptap/react";
import { useEditorState } from "@tiptap/react";
import { NodeSelection } from "@tiptap/pm/state";
import { CellSelection } from "@tiptap/pm/tables";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  HandBold,
  HandItalic,
  HandStrike,
  HandUnderline as HandUnderlineIcon,
  HandCode,
  HandLink,
} from "./hand-icons";
import { openLinkDialog } from "./link-dialog";
import { cn } from "@/lib/utils";

function MenuBtn({
  title,
  onClick,
  active,
  children,
}: {
  title: string;
  onClick: () => void;
  active?: boolean;
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
            className={cn(
              "flex h-7 w-7 items-center justify-center rounded-md text-ink-secondary transition-colors",
              "hover:bg-canvas-soft hover:text-ink",
              active && "bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary"
            )}
          >
            {children}
          </button>
        }
      />
      <TooltipContent side="bottom">{title}</TooltipContent>
    </Tooltip>
  );
}

function MenuDivider() {
  return <span className="mx-0.5 h-4 w-px bg-hairline" />;
}

export function TextMenu({ editor }: { editor: Editor | null }) {
  const [scrollTarget, setScrollTarget] = useState<HTMLElement | Window | undefined>(undefined);

  useEffect(() => {
    if (!editor) return;
    let el: HTMLElement | null = editor.view.dom.parentElement;
    while (el) {
      const oy = getComputedStyle(el).overflowY;
      if (oy === "auto" || oy === "scroll") {
        setScrollTarget(el);
        return;
      }
      el = el.parentElement;
    }
    setScrollTarget(window);
  }, [editor]);

  const states = useEditorState({
    editor,
    selector: ({ editor: ed }) => {
      if (!ed) return null;
      return {
        isBold: ed.isActive("bold"),
        isItalic: ed.isActive("italic"),
        isUnderline: ed.isActive("underline"),
        isStrike: ed.isActive("strike"),
        isCode: ed.isActive("code"),
        isLink: ed.isActive("link"),
      };
    },
  });

  const shouldShow = useCallback(
    ({ state }: { state: Editor["state"] }) => {
      if (!editor?.isEditable) return false;
      const sel = state.selection;
      if (sel.empty) return false;
      if (sel instanceof NodeSelection) return false;
      if (sel instanceof CellSelection) return false;
      const { from, to } = sel;
      const text = state.doc.textBetween(from, to, "\n", "\n").trim();
      return text.length > 0;
    },
    [editor]
  );

  const bubbleOptions = useMemo(
    () => ({ placement: "top" as const, offset: 8, scrollTarget }),
    [scrollTarget]
  );

  if (!editor || !states) return null;

  const chain = () => editor.chain().focus();

  return (
    <BubbleMenu
      editor={editor}
      pluginKey="kb-text-menu"
      shouldShow={shouldShow}
      options={bubbleOptions}
      updateDelay={120}
    >
      <TooltipProvider delay={200}>
        <div className="flex items-center gap-0.5 rounded-lg border border-hairline bg-white px-1.5 py-1 sketch-border sketch-shadow">
          <MenuBtn title="加粗 ⌘B" active={states.isBold} onClick={() => chain().toggleBold().run()}>
            <HandBold className="h-4 w-4" />
          </MenuBtn>
          <MenuBtn title="斜体 ⌘I" active={states.isItalic} onClick={() => chain().toggleItalic().run()}>
            <HandItalic className="h-4 w-4" />
          </MenuBtn>
          <MenuBtn title="下划线 ⌘U" active={states.isUnderline} onClick={() => chain().toggleUnderline().run()}>
            <HandUnderlineIcon className="h-4 w-4" />
          </MenuBtn>
          <MenuBtn title="删除线" active={states.isStrike} onClick={() => chain().toggleStrike().run()}>
            <HandStrike className="h-4 w-4" />
          </MenuBtn>
          <MenuBtn title="行内代码" active={states.isCode} onClick={() => chain().toggleCode().run()}>
            <HandCode className="h-4 w-4" />
          </MenuBtn>

          <MenuDivider />

          <MenuBtn title="链接 ⌘K" active={states.isLink} onClick={() => openLinkDialog()}>
            <HandLink className="h-4 w-4" />
          </MenuBtn>
        </div>
      </TooltipProvider>
    </BubbleMenu>
  );
}
