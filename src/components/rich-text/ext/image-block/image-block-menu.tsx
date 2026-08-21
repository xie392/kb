"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { BubbleMenu } from "@tiptap/react/menus";
import type { Editor } from "@tiptap/react";
import { useEditorState } from "@tiptap/react";
import { NodeSelection, type EditorState } from "@tiptap/pm/state";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { IconAlignLeft, IconAlignCenter, IconAlignRight, IconDelete } from "../../icons";
import { ImageBlockWidth } from "./image-block-width";

/* ─── ImageBlock 浮层菜单 ───
 * 照搬 demo 的「选中图片即弹出对齐 + 宽度滑块」交互，
 * 在末尾追加删除按钮。当 NodeSelection 命中 imageBlock 时显示。
 */

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
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={title}
            onMouseDown={(e) => e.preventDefault()}
            onClick={onClick}
            className={cn(
              "rounded-[6px] transition-colors duration-150",
              active && "bg-primary/10 text-primary",
            )}
          />
        }
      >
        {children}
      </TooltipTrigger>
      <TooltipContent side="bottom">{title}</TooltipContent>
    </Tooltip>
  );
}

function Divider() {
  return <span className="mx-0.5 h-4 w-px bg-hairline" />;
}

export interface ImageBlockMenuProps {
  editor: Editor | null;
}

export function ImageBlockMenu({ editor }: ImageBlockMenuProps) {
  const [scrollTarget, setScrollTarget] = useState<HTMLElement | Window>(window);

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

  const state = useEditorState({
    editor,
    selector: ({ editor: ed }) => {
      if (!ed) return null;
      const sel = ed.state.selection;
      if (!(sel instanceof NodeSelection) || sel.node.type.name !== "imageBlock") {
        return null;
      }
      const attrs = sel.node.attrs as {
        align?: "left" | "center" | "right";
        width?: string;
      };
      return {
        isLeft: attrs.align === "left",
        isCenter: attrs.align === "center",
        isRight: attrs.align === "right",
        width: parseInt(attrs.width ?? "100%", 10) || 100,
      };
    },
  });

  const shouldShow = useCallback(
    ({ state }: { state: EditorState }) => {
      const sel = state.selection;
      if (!(sel instanceof NodeSelection)) return false;
      return sel.node.type.name === "imageBlock";
    },
    [],
  );

  const bubbleOptions = useMemo(
    () => ({ placement: "top" as const, offset: 8, scrollTarget }),
    [scrollTarget],
  );

  if (!editor) return null;

  const chain = () => editor.chain().focus(undefined, { scrollIntoView: false });

  return (
    <BubbleMenu
      editor={editor}
      pluginKey="kb-image-block-menu"
      shouldShow={shouldShow}
      options={bubbleOptions}
      updateDelay={0}
    >
      <TooltipProvider delay={100}>
        <div className="flex items-center gap-0.5 px-1 py-1 bg-white rounded-lg border border-hairline sketch-border sketch-shadow">
          {state && (
            <>
              <MenuBtn
                title="左对齐"
                active={state.isLeft}
                onClick={() => chain().setImageBlockAlign("left").run()}
              >
                <IconAlignLeft />
              </MenuBtn>
              <MenuBtn
                title="居中"
                active={state.isCenter}
                onClick={() => chain().setImageBlockAlign("center").run()}
              >
                <IconAlignCenter />
              </MenuBtn>
              <MenuBtn
                title="右对齐"
                active={state.isRight}
                onClick={() => chain().setImageBlockAlign("right").run()}
              >
                <IconAlignRight />
              </MenuBtn>
              <Divider />
              <ImageBlockWidth
                value={state.width}
                onChange={(v) => chain().setImageBlockWidth(v).run()}
              />
              <Divider />
            </>
          )}
          <MenuBtn
            title="删除"
            onClick={() => editor.chain().focus().deleteSelection().run()}
          >
            <IconDelete />
          </MenuBtn>
        </div>
      </TooltipProvider>
    </BubbleMenu>
  );
}

export default ImageBlockMenu;
