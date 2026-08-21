"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BubbleMenu } from "@tiptap/react/menus";
import type { Editor } from "@tiptap/react";
import { useEditorState } from "@tiptap/react";
import { NodeSelection, type EditorState } from "@tiptap/pm/state";
import { ToolbarDivider } from "./toolbar";
import { TableGlobalToolbar, TableCellToolbar, TableGrip, TableContextMenu, tableShouldShow } from "./table-controls";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { ImageAlign, ImageStyle } from "./types";
import {
  IconRotate,
  IconAlignLeft,
  IconAlignCenter,
  IconAlignRight,
  IconImageStyle,
  IconReset,
  IconDelete,
} from "./icons";

function MenuBtn({
  active,
  disabled,
  title,
  onClick,
  children,
}: {
  active?: boolean;
  disabled?: boolean;
  title: string;
  onClick: () => void;
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
            disabled={disabled}
            onMouseDown={(e) => e.preventDefault()}
            onClick={onClick}
            className={`transition-colors ${
              active ? "bg-primary/10 text-primary" : ""
            } ${disabled ? "opacity-30 cursor-not-allowed pointer-events-none" : ""}`}
          >
            {children}
          </Button>
        }
      />
      <TooltipContent side="bottom">{title}</TooltipContent>
    </Tooltip>
  );
}

/* 块级浮动工具条（选中图片/表格等节点时显示） */
function BlockMenu({ editor }: { editor: Editor }) {
  const [scrollTarget, setScrollTarget] = useState<HTMLElement | Window>(window);
  const [styleOpen, setStyleOpen] = useState(false);
  const styleWrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
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

  useEffect(() => {
    if (!styleOpen) return;
    const onDown = (e: MouseEvent) => {
      if (styleWrapRef.current && !styleWrapRef.current.contains(e.target as Node)) {
        setStyleOpen(false);
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [styleOpen]);

  // 直接从编辑器状态派生选中节点的类型/属性，避免在 effect 中 setState 造成死循环
  const { nodeType, imgAttrs } = useEditorState({
    editor,
    selector: ({ editor }) => {
      const sel = editor.state.selection;
      if (!(sel instanceof NodeSelection)) {
        return { nodeType: null, imgAttrs: null };
      }
      const node = sel.node;
      return {
        nodeType: node.type.name,
        imgAttrs:
          node.type.name === "image"
            ? {
                align: (node.attrs.align as ImageAlign) ?? "center",
                rotation: (node.attrs.rotation as number) ?? 0,
                imgStyle: (node.attrs.imgStyle as ImageStyle) ?? "none",
                displayWidth: (node.attrs.displayWidth as number | null) ?? null,
              }
            : null,
      };
    },
  });

  const bubbleOptions = useMemo(
    () => ({ placement: "top" as const, offset: 8, scrollTarget }),
    [scrollTarget]
  );

  const shouldShow = useCallback(
    ({ state }: { state: EditorState }) => {
      if (!(state.selection instanceof NodeSelection)) return false;
      const name = state.selection.node.type.name;
      // imageBlock 由 ImageBlockMenu 接管，table 由 TableGlobalToolbar 接管
      return name !== "table" && name !== "imageBlock";
    },
    []
  );

  const setImageAttr = (patch: Partial<{ align: ImageAlign; rotation: number; imgStyle: ImageStyle; displayWidth: number | null }>) =>
    editor.chain().focus().updateAttributes("image", patch).run();

  const isDefault =
    imgAttrs?.align === "center" &&
    imgAttrs?.rotation === 0 &&
    imgAttrs?.imgStyle === "none" &&
    (imgAttrs?.displayWidth === null || imgAttrs?.displayWidth === 100);

  const styleLabels: Record<ImageStyle, string> = { none: "无样式", border: "描边", shadow: "阴影" };

  return (
    <>
      <BubbleMenu
        editor={editor}
        shouldShow={tableShouldShow.global}
        options={bubbleOptions}
      >
        <TableGlobalToolbar editor={editor} />
      </BubbleMenu>
      <BubbleMenu
        editor={editor}
        shouldShow={tableShouldShow.cell}
        options={bubbleOptions}
      >
        <TableCellToolbar editor={editor} />
      </BubbleMenu>
      <TableGrip editor={editor} />
      <TableContextMenu editor={editor} />
      <BubbleMenu
        editor={editor}
        shouldShow={shouldShow}
        options={bubbleOptions}
      >
      <TooltipProvider delay={100}>
      <div className="flex items-center gap-0.5 px-1 py-1 bg-white rounded-lg border border-hairline shadow-lg">
        {nodeType === "image" && imgAttrs && (
          <>
            <MenuBtn title="向左旋转 90°" onClick={() => setImageAttr({ rotation: (imgAttrs.rotation - 90) % 360 })}>
              <IconRotate />
            </MenuBtn>
            <ToolbarDivider />
            <MenuBtn title="左对齐" active={imgAttrs.align === "left"} onClick={() => setImageAttr({ align: "left" })}>
              <IconAlignLeft />
            </MenuBtn>
            <MenuBtn title="居中" active={imgAttrs.align === "center"} onClick={() => setImageAttr({ align: "center" })}>
              <IconAlignCenter />
            </MenuBtn>
            <MenuBtn title="右对齐" active={imgAttrs.align === "right"} onClick={() => setImageAttr({ align: "right" })}>
              <IconAlignRight />
            </MenuBtn>
            <ToolbarDivider />
            <div ref={styleWrapRef} className="relative">
              <MenuBtn
                title="样式"
                active={imgAttrs.imgStyle !== "none"}
                onClick={() => setStyleOpen((v) => !v)}
              >
                <IconImageStyle />
              </MenuBtn>
              {styleOpen && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1.5 min-w-[110px] bg-white rounded-lg border border-hairline shadow-lg py-1 z-50">
                  {(["none", "border", "shadow"] as ImageStyle[]).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => { setImageAttr({ imgStyle: s }); setStyleOpen(false); }}
                      className={`w-full text-left px-3 py-1.5 text-[13px] transition-colors ${
                        imgAttrs.imgStyle === s
                          ? "text-primary bg-primary/5 font-medium"
                          : "text-ink-muted hover:bg-canvas-soft"
                      }`}
                    >
                      {styleLabels[s]}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <MenuBtn title="复原"
              disabled={isDefault}
              onClick={() => setImageAttr({ align: "center", rotation: 0, imgStyle: "none", displayWidth: null })}
            >
              <IconReset />
            </MenuBtn>
            <ToolbarDivider />
          </>
        )}
        <MenuBtn title="删除" onClick={() => editor.chain().focus().deleteSelection().run()}>
          <IconDelete />
        </MenuBtn>
      </div>
      </TooltipProvider>
      </BubbleMenu>
    </>
  );
}

export { BlockMenu };
