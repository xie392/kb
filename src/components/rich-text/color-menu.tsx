"use client";

import * as React from "react";
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

const GRAY_SCALE = [
  "#000000",
  "#434343",
  "#595959",
  "#8c8c8c",
  "#bfbfbf",
  "#d9d9d9",
  "#e8e8e8",
  "#f0f0f0",
  "#ffffff",
];

const HUES = [
  { name: "红", text: ["#5c0011", "#a8071a", "#cf1322", "#f5222d", "#ff7875", "#ffa39e"], highlight: ["#fff1f0", "#ffccc7", "#ffa39e", "#ff7875", "#ff4d4f", "#f5222d"] },
  { name: "橙红", text: ["#610b00", "#ad2102", "#d4380d", "#fa541c", "#ff9c6e", "#ffbb96"], highlight: ["#fff2e8", "#ffd8bf", "#ffbb96", "#ff9c6e", "#ff7a45", "#fa541c"] },
  { name: "橙", text: ["#612500", "#ad4e00", "#d46b08", "#fa8c16", "#ffc069", "#ffd591"], highlight: ["#fff7e6", "#ffe7ba", "#ffd591", "#ffc069", "#ffa940", "#fa8c16"] },
  { name: "金", text: ["#613400", "#ad6800", "#d48806", "#faad14", "#ffd666", "#ffe58f"], highlight: ["#fffbe6", "#fff1b8", "#ffe58f", "#ffd666", "#ffc53d", "#faad14"] },
  { name: "青柠", text: ["#254000", "#5b8c00", "#7cb305", "#a0d911", "#d3f261", "#eaff8f"], highlight: ["#fcffe6", "#f4ffb8", "#eaff8f", "#d3f261", "#bae637", "#a0d911"] },
  { name: "绿", text: ["#092b00", "#237804", "#389e0d", "#52c41a", "#95de64", "#b7eb8f"], highlight: ["#f6ffed", "#d9f7be", "#b7eb8f", "#95de64", "#73d13d", "#52c41a"] },
  { name: "青", text: ["#002329", "#006d75", "#08979c", "#13c2c2", "#5cdbd3", "#87e8de"], highlight: ["#e6fffb", "#b5f5ec", "#87e8de", "#5cdbd3", "#36cfc9", "#13c2c2"] },
  { name: "蓝", text: ["#002766", "#0050b3", "#096dd9", "#1890ff", "#69c0ff", "#91d5ff"], highlight: ["#e6f7ff", "#bae7ff", "#91d5ff", "#69c0ff", "#40a9ff", "#1890ff"] },
  { name: "紫", text: ["#120338", "#391085", "#531dab", "#722ed1", "#b37feb", "#d3adf7"], highlight: ["#f9f0ff", "#efdbff", "#d3adf7", "#b37feb", "#9254de", "#722ed1"] },
  { name: "品红", text: ["#520339", "#9e1068", "#c41d7f", "#eb2f96", "#ff85c0", "#ffadd2"], highlight: ["#fff0f6", "#ffd6e7", "#ffadd2", "#ff85c0", "#f759ab", "#eb2f96"] },
];

const TEXT_GRID: string[][] = HUES[0].text.map((_, rowIdx) =>
  HUES.map((h) => h.text[rowIdx])
);

const HIGHLIGHT_GRID: string[][] = HUES[0].highlight.map((_, rowIdx) =>
  HUES.map((h) => h.highlight[rowIdx])
);

const STORAGE_KEY = "kb-editor-recent-colors";
const MAX_RECENT = 10;

function loadRecent(mode: "text" | "highlight"): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(`${STORAGE_KEY}-${mode}`);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function saveRecent(mode: "text" | "highlight", color: string) {
  if (typeof window === "undefined") return;
  try {
    const list = loadRecent(mode).filter((c) => c.toLowerCase() !== color.toLowerCase());
    list.unshift(color);
    window.localStorage.setItem(
      `${STORAGE_KEY}-${mode}`,
      JSON.stringify(list.slice(0, MAX_RECENT))
    );
  } catch {
    // ignore
  }
}

function norm(c?: string): string | undefined {
  return c?.toLowerCase();
}

interface SwatchProps {
  color: string;
  active?: boolean;
  onClick?: () => void;
  title?: string;
}

function Swatch({ color, active, onClick, title }: SwatchProps) {
  return (
    <button
      type="button"
      title={title ?? color}
      aria-label={title ?? color}
      className="flex h-5 w-5 items-center justify-center rounded-sm transition-transform hover:scale-110"
      onMouseDown={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
    >
      <span
        className={cn(
          "block h-4 w-4 rounded-[3px] border border-hairline",
          active && "ring-2 ring-primary ring-offset-1"
        )}
        style={{ backgroundColor: color }}
      />
    </button>
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

function ColorPalette({
  grid,
  activeColor,
  onPick,
}: {
  grid: string[][];
  activeColor?: string;
  onPick: (color: string) => void;
}) {
  const active = norm(activeColor);
  return (
    <div className="flex flex-col gap-0.5">
      {grid.map((row, ri) => (
        <div key={ri} className="flex gap-0.5">
          {row.map((color) => (
            <Swatch
              key={color}
              color={color}
              active={active === color.toLowerCase()}
              onClick={() => onPick(color)}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

export function ColorMenu({ editor, mode }: ColorMenuProps) {
  const isText = mode === "text";
  const activeColor = isText
    ? (editor.getAttributes("textStyle").color as string | undefined)
    : (editor.getAttributes("highlight").color as string | undefined);

  const [recent, setRecent] = React.useState<string[]>([]);
  const [open, setOpen] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (open) setRecent(loadRecent(mode));
  }, [open, mode]);

  const clear = React.useCallback(() => {
    if (isText) {
      editor.chain().focus().unsetColor().run();
    } else {
      editor.chain().focus().unsetHighlight().run();
    }
  }, [editor, isText]);

  const applyColor = React.useCallback(
    (color: string) => {
      if (isText) {
        editor.chain().focus().setColor(color).run();
      } else {
        editor.chain().focus().setHighlight({ color }).run();
      }
      saveRecent(mode, color);
      setRecent(loadRecent(mode));
    },
    [editor, isText, mode]
  );

  const onCustomColor = (e: React.ChangeEvent<HTMLInputElement>) => {
    const color = e.target.value;
    if (color) applyColor(color);
  };

  const grid = isText ? TEXT_GRID : HIGHLIGHT_GRID;
  const defaultColor = isText ? "#000000" : "transparent";
  const active = norm(activeColor);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
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
      <DropdownMenuContent align="start" className="w-auto p-2" sideOffset={4}>
        <div className="mb-1.5 text-xs font-medium text-ink-muted">
          {isText ? "文字颜色" : "高亮颜色"}
        </div>

        <div className="mb-2 flex gap-0.5">
          <Swatch
            color={defaultColor}
            active={!activeColor}
            onClick={clear}
            title={isText ? "默认颜色" : "无高亮"}
          />
          {GRAY_SCALE.map((color) => (
            <Swatch
              key={color}
              color={color}
              active={active === color.toLowerCase()}
              onClick={() => applyColor(color)}
            />
          ))}
        </div>

        <ColorPalette grid={grid} activeColor={activeColor} onPick={applyColor} />

        {recent.length > 0 && (
          <div className="mt-2 border-t border-hairline pt-2">
            <div className="mb-1 text-[11px] text-ink-faint">最近使用</div>
            <div className="flex flex-wrap gap-0.5">
              {recent.map((color) => (
                <Swatch
                  key={color}
                  color={color}
                  active={active === color.toLowerCase()}
                  onClick={() => applyColor(color)}
                />
              ))}
            </div>
          </div>
        )}

        <div className="mt-2 flex items-center gap-1 border-t border-hairline pt-2">
          <button
            type="button"
            className="flex flex-1 items-center gap-1.5 rounded-md px-1.5 py-1 text-xs text-ink-muted transition-colors hover:bg-canvas-soft"
            onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onClick={(e) => {
              e.stopPropagation();
              fileInputRef.current?.click();
            }}
          >
            <span
              className="h-3.5 w-3.5 rounded-full border border-hairline"
              style={{
                background: "conic-gradient(red, yellow, lime, aqua, blue, magenta, red)",
              }}
            />
            更多颜色
          </button>
          {activeColor && (
            <button
              type="button"
              className="rounded-md px-1.5 py-1 text-xs text-ink-muted transition-colors hover:bg-canvas-soft"
              onClick={clear}
            >
              清除{isText ? "颜色" : "高亮"}
            </button>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="color"
          className="sr-only"
          onChange={onCustomColor}
          value={activeColor ?? "#000000"}
        />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
