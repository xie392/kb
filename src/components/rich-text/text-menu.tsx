"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  HandPalette,
  HandHighlighter,
  HandEraser,
  HandSubscript,
  HandSuperscript,
  HandChevronDown,
  HandParagraph,
  HandHeading,
  HandList,
  HandListOrdered,
  HandTaskList,
  HandQuote,
  HandCodeBlock,
} from "./hand-icons";
import { IconAlignLeft, IconAlignCenter, IconAlignRight } from "./icons";
import { openLinkDialog } from "./link-dialog";
import { cn } from "@/lib/utils";

/* ─── 内嵌按钮：与 link-bubble/block-menu 风格统一 ─── */
function MenuBtn({
  title,
  onClick,
  active,
  disabled,
  children,
}: {
  title: string;
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
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
            disabled={disabled}
            className={cn(
              "flex h-7 w-7 items-center justify-center rounded-md text-ink-secondary transition-colors",
              "hover:bg-canvas-soft hover:text-ink",
              active && "bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary",
              disabled && "opacity-30 cursor-not-allowed pointer-events-none"
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

/* ─── 段落样式下拉（P / H1-3 / 列表 / 引用 / 代码块） ─── */
const BLOCK_TYPES = [
  { id: "paragraph", label: "正文", icon: HandParagraph, level: 0 },
  { id: "h1", label: "标题 1", icon: HandHeading, level: 1 },
  { id: "h2", label: "标题 2", icon: HandHeading, level: 2 },
  { id: "h3", label: "标题 3", icon: HandHeading, level: 3 },
  { id: "bullet", label: "无序列表", icon: HandList, level: 0 },
  { id: "ordered", label: "有序列表", icon: HandListOrdered, level: 0 },
  { id: "task", label: "任务列表", icon: HandTaskList, level: 0 },
  { id: "quote", label: "引用", icon: HandQuote, level: 0 },
  { id: "codeBlock", label: "代码块", icon: HandCodeBlock, level: 0 },
] as const;

function BlockTypePicker({ editor }: { editor: Editor }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const active = useEditorState({
    editor,
    selector: ({ editor: ed }) => {
      const items = BLOCK_TYPES.map((t) => {
        if (t.id === "paragraph") return { id: t.id, active: ed.isActive("paragraph") };
        if (t.id.startsWith("h")) return { id: t.id, active: ed.isActive("heading", { level: t.level }) };
        if (t.id === "bullet") return { id: t.id, active: ed.isActive("bulletList") };
        if (t.id === "ordered") return { id: t.id, active: ed.isActive("orderedList") };
        if (t.id === "task") return { id: t.id, active: ed.isActive("taskList") };
        if (t.id === "quote") return { id: t.id, active: ed.isActive("blockquote") };
        if (t.id === "codeBlock") return { id: t.id, active: ed.isActive("codeBlock") };
        return { id: t.id, active: false };
      });
      const cur = items.find((i) => i.active);
      return { currentId: cur?.id ?? "paragraph" };
    },
  }).currentId;

  const currentDef = BLOCK_TYPES.find((t) => t.id === active) ?? BLOCK_TYPES[0];
  const CurrentIcon = currentDef.icon;

  const run = (id: typeof BLOCK_TYPES[number]["id"]) => {
    const c = editor.chain().focus();
    if (id === "paragraph") c.setParagraph().run();
    else if (id === "h1") c.toggleHeading({ level: 1 }).run();
    else if (id === "h2") c.toggleHeading({ level: 2 }).run();
    else if (id === "h3") c.toggleHeading({ level: 3 }).run();
    else if (id === "bullet") c.toggleBulletList().run();
    else if (id === "ordered") c.toggleOrderedList().run();
    else if (id === "task") c.toggleTaskList().run();
    else if (id === "quote") c.toggleBlockquote().run();
    else if (id === "codeBlock") c.toggleCodeBlock().run();
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        title="段落样式"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex h-7 items-center gap-1 rounded-md px-1.5 text-ink-secondary transition-colors",
          "hover:bg-canvas-soft hover:text-ink",
          active !== "paragraph" && "bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary"
        )}
      >
        <CurrentIcon className="h-4 w-4" level={currentDef.level || 1} />
        <HandChevronDown className="h-3 w-3 opacity-60" />
      </button>
      {open && (
        <div className="absolute left-0 top-full z-50 mt-1.5 min-w-[156px] rounded-lg border border-hairline bg-white p-1 sketch-border sketch-shadow">
          {BLOCK_TYPES.map((t) => {
            const Icon = t.icon;
            const isActive = active === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => run(t.id)}
                className={cn(
                  "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-[13px] transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-ink-secondary hover:bg-canvas-soft hover:text-ink"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" level={t.level || 1} />
                <span className="truncate">{t.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ─── 颜色选择下拉（文本色 / 高亮色） ─── */
const TEXT_COLORS = [
  { label: "默认", value: "" },
  { label: "深灰", value: "#525252" },
  { label: "红", value: "#dc2626" },
  { label: "橙", value: "#ea580c" },
  { label: "黄", value: "#ca8a04" },
  { label: "绿", value: "#16a34a" },
  { label: "蓝", value: "#2563eb" },
  { label: "紫", value: "#7c3aed" },
];

const HIGHLIGHT_COLORS = [
  { label: "黄", value: "#fef08a" },
  { label: "绿", value: "#bbf7d0" },
  { label: "蓝", value: "#bfdbfe" },
  { label: "紫", value: "#ddd6fe" },
  { label: "红", value: "#fecaca" },
  { label: "灰", value: "#e5e5e5" },
];

function ColorPopover({
  title,
  currentColor,
  onPick,
  onClear,
  children,
  colors,
}: {
  title: string;
  currentColor?: string;
  onPick: (c: string) => void;
  onClear: () => void;
  children: React.ReactNode;
  colors: typeof TEXT_COLORS | typeof HIGHLIGHT_COLORS;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <Tooltip>
        <TooltipTrigger
          render={
            <button
              type="button"
              title={title}
              aria-label={title}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => setOpen((v) => !v)}
              className={cn(
                "relative flex h-7 w-7 items-center justify-center rounded-md text-ink-secondary transition-colors",
                "hover:bg-canvas-soft hover:text-ink",
                currentColor && "text-primary"
              )}
            >
              {children}
              <span
                className="absolute bottom-0.5 left-1/2 h-[3px] w-3.5 -translate-x-1/2 rounded-full"
                style={{
                  backgroundColor: currentColor || (colors === HIGHLIGHT_COLORS ? "#fef08a" : "currentColor"),
                }}
              />
            </button>
          }
        />
        <TooltipContent side="bottom">{title}</TooltipContent>
      </Tooltip>
      {open && (
        <div className="absolute left-0 top-full z-50 mt-1.5 rounded-lg border border-hairline bg-white p-2 sketch-border sketch-shadow">
          <div className="grid grid-cols-4 gap-1">
            {colors.map((c) => (
              <button
                key={c.label}
                type="button"
                title={c.label}
                aria-label={c.label}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  if ("value" in c && c.value === "") onClear();
                  else onPick((c as { value: string }).value);
                  setOpen(false);
                }}
                className="flex h-7 w-7 items-center justify-center rounded-md transition-colors hover:bg-canvas-soft"
              >
                <span
                  className={cn(
                    "block h-5 w-5 rounded-full border border-hairline",
                    currentColor === (c as { value: string }).value &&
                      "ring-2 ring-primary ring-offset-1"
                  )}
                  style={{ backgroundColor: (c as { value: string }).value || "transparent" }}
                />
              </button>
            ))}
          </div>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              onClear();
              setOpen(false);
            }}
            className="mt-1 w-full rounded-md px-2 py-1 text-left text-[12px] text-ink-muted hover:bg-canvas-soft"
          >
            清除
          </button>
        </div>
      )}
    </div>
  );
}

/* ─── TextMenu 主体 ─── */
export function TextMenu({ editor }: { editor: Editor | null }) {
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
        isSub: ed.isActive("subscript"),
        isSup: ed.isActive("superscript"),
        isLink: ed.isActive("link"),
        isAlignLeft: ed.isActive({ textAlign: "left" }),
        isAlignCenter: ed.isActive({ textAlign: "center" }),
        isAlignRight: ed.isActive({ textAlign: "right" }),
        currentColor: (ed.getAttributes("textStyle").color as string) || "",
        currentHighlight: (ed.getAttributes("highlight").color as string) || "",
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
          <BlockTypePicker editor={editor} />
          <MenuDivider />

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

          <ColorPopover
            title="文字颜色"
            currentColor={states.currentColor}
            colors={TEXT_COLORS}
            onPick={(c) => chain().setColor(c).run()}
            onClear={() => chain().unsetColor().run()}
          >
            <HandPalette className="h-4 w-4" />
          </ColorPopover>
          <ColorPopover
            title="背景高亮"
            currentColor={states.currentHighlight}
            colors={HIGHLIGHT_COLORS}
            onPick={(c) => chain().setHighlight({ color: c }).run()}
            onClear={() => chain().unsetHighlight().run()}
          >
            <HandHighlighter className="h-4 w-4" />
          </ColorPopover>

          <MenuDivider />

          <MenuBtn title="链接 ⌘K" active={states.isLink} onClick={() => openLinkDialog()}>
            <HandLink className="h-4 w-4" />
          </MenuBtn>

          <MenuBtn
            title="左对齐"
            active={states.isAlignLeft}
            onClick={() => chain().setTextAlign("left").run()}
          >
            <IconAlignLeft />
          </MenuBtn>
          <MenuBtn
            title="居中"
            active={states.isAlignCenter}
            onClick={() => chain().setTextAlign("center").run()}
          >
            <IconAlignCenter />
          </MenuBtn>
          <MenuBtn
            title="右对齐"
            active={states.isAlignRight}
            onClick={() => chain().setTextAlign("right").run()}
          >
            <IconAlignRight />
          </MenuBtn>

          <MenuDivider />

          <MenuBtn title="上标" active={states.isSup} onClick={() => chain().toggleSuperscript().run()}>
            <HandSuperscript className="h-4 w-4" />
          </MenuBtn>
          <MenuBtn title="下标" active={states.isSub} onClick={() => chain().toggleSubscript().run()}>
            <HandSubscript className="h-4 w-4" />
          </MenuBtn>
          <MenuBtn
            title="清除格式"
            onClick={() =>
              chain()
                .unsetBold()
                .unsetItalic()
                .unsetUnderline()
                .unsetStrike()
                .unsetCode()
                .unsetColor()
                .unsetHighlight()
                .unsetSuperscript()
                .unsetSubscript()
                .run()
            }
          >
            <HandEraser className="h-4 w-4" />
          </MenuBtn>
        </div>
      </TooltipProvider>
    </BubbleMenu>
  );
}
