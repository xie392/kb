"use client";

import type { Editor } from "@tiptap/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { HandHighlighter, HandPalette } from "./hand-icons";
import { ToolbarBtn } from "./toolbar";

interface ColorMenuProps {
  editor: Editor;
  mode: "text" | "highlight";
}

interface ColorOption {
  label: string;
  value: string;
}

const TEXT_COLORS: ColorOption[] = [
  { label: "默认黑", value: "#171717" },
  { label: "灰色", value: "#737373" },
  { label: "红色", value: "#dc2626" },
  { label: "橙色", value: "#ea580c" },
  { label: "黄色", value: "#ca8a04" },
  { label: "绿色", value: "#16a34a" },
  { label: "蓝色", value: "#2563eb" },
  { label: "紫色", value: "#7c3aed" },
];

const HIGHLIGHT_COLORS: ColorOption[] = [
  { label: "黄色", value: "#fef08a" },
  { label: "绿色", value: "#bbf7d0" },
  { label: "蓝色", value: "#bfdbfe" },
  { label: "紫色", value: "#ddd6fe" },
  { label: "红色", value: "#fecaca" },
  { label: "灰色", value: "#e5e5e5" },
];

function ColorGrid({
  colors,
  activeColor,
  onSelect,
}: {
  colors: ColorOption[];
  activeColor?: string;
  onSelect: (color: string) => void;
}) {
  return (
    <div className="grid grid-cols-4 gap-1 p-2">
      {colors.map((color) => (
        <button
          key={color.value}
          type="button"
          title={color.label}
          aria-label={color.label}
          className="flex h-8 w-8 items-center justify-center rounded-md transition-colors hover:bg-canvas-soft"
          onClick={() => onSelect(color.value)}
        >
          <span
            className={cn(
              "block h-5 w-5 rounded-full border border-hairline",
              activeColor === color.value && "ring-2 ring-primary ring-offset-1"
            )}
            style={{ backgroundColor: color.value }}
          />
        </button>
      ))}
    </div>
  );
}

function MenuIcon({ children, color }: { children: React.ReactNode; color?: string }) {
  return (
    <span className="relative flex h-4 w-4 items-center justify-center">
      {children}
      {color && (
        <span
          className="absolute -bottom-0.5 left-0 h-0.5 w-full rounded-full"
          style={{ backgroundColor: color }}
        />
      )}
    </span>
  );
}

export function ColorMenu({ editor, mode }: ColorMenuProps) {
  const isText = mode === "text";
  const activeColor = isText
    ? (editor.getAttributes("textStyle").color as string | undefined)
    : (editor.getAttributes("highlight").color as string | undefined);

  const clear = () => {
    if (isText) {
      editor.chain().focus().unsetColor().run();
    } else {
      editor.chain().focus().unsetHighlight().run();
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <ToolbarBtn
            title={isText ? "文字颜色" : "高亮颜色"}
            active={isText ? Boolean(activeColor) : editor.isActive("highlight")}
            onClick={() => {}}
          />
        }
      >
        <MenuIcon color={activeColor}>
          {isText ? <HandPalette className="h-4 w-4" /> : <HandHighlighter className="h-4 w-4" />}
        </MenuIcon>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-44">
        <div className="px-3 pt-2 pb-1 text-xs font-medium text-ink-muted">
          {isText ? "文字颜色" : "高亮颜色"}
        </div>
        <ColorGrid
          colors={isText ? TEXT_COLORS : HIGHLIGHT_COLORS}
          activeColor={activeColor}
          onSelect={(color) => {
            if (isText) {
              editor.chain().focus().setColor(color).run();
            } else {
              editor.chain().focus().setHighlight({ color }).run();
            }
          }}
        />
        <button
          type="button"
          className="mx-2 mb-2 w-[calc(100%-16px)] rounded-md px-2 py-1.5 text-left text-xs text-ink-muted transition-colors hover:bg-canvas-soft hover:text-ink-secondary"
          onClick={clear}
        >
          清除{isText ? "文字颜色" : "高亮"}
        </button>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
