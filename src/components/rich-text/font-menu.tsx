"use client";

import { useState } from "react";
import type { Editor } from "@tiptap/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { HandChevronDown } from "./hand-icons";
import { HandFontFamily, HandFontSize } from "./hand-icons-extra";
import { ToolbarBtn } from "./toolbar";

interface Option {
  label: string;
  value: string;
}

const FONT_FAMILIES: Option[] = [
  { label: "默认", value: "" },
  { label: "系统无衬线", value: "ui-sans-serif, system-ui, -apple-system, 'PingFang SC', 'Microsoft YaHei', sans-serif" },
  { label: "系统衬线", value: "ui-serif, Georgia, 'Songti SC', 'STSong', 'SimSun', serif" },
  { label: "等宽", value: "ui-monospace, 'SF Mono', Menlo, Monaco, Consolas, monospace" },
  { label: "楷体", value: "'KaiTi', 'STKaiti', 'Kaiti SC', serif" },
  { label: "黑体", value: "'Heiti SC', 'Microsoft YaHei', 'PingFang SC', sans-serif" },
  { label: "宋体", value: "'Songti SC', 'STSong', 'SimSun', serif" },
];

const FONT_SIZES: Option[] = [
  { label: "默认", value: "" },
  { label: "12px", value: "12px" },
  { label: "14px", value: "14px" },
  { label: "16px", value: "16px" },
  { label: "18px", value: "18px" },
  { label: "20px", value: "20px" },
  { label: "24px", value: "24px" },
  { label: "28px", value: "28px" },
  { label: "32px", value: "32px" },
  { label: "36px", value: "36px" },
  { label: "42px", value: "42px" },
  { label: "48px", value: "48px" },
];

/* 字体选择器 */
export function FontFamilyPicker({ editor }: { editor: Editor }) {
  const [open, setOpen] = useState(false);
  const current = (editor.getAttributes("textStyle").fontFamily as string | undefined) ?? "";

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger
        render={
          <ToolbarBtn title="字体" onClick={() => {}} className="w-fit px-2">
            <span className="flex items-center gap-1 text-[12px]">
              <HandFontFamily className="h-4 w-4" />
              <span className="truncate max-w-[60px]">
                {FONT_FAMILIES.find((f) => f.value === current)?.label ?? "字体"}
              </span>
              <HandChevronDown className="h-3.5 w-3.5 opacity-60" />
            </span>
          </ToolbarBtn>
        }
      />
      <DropdownMenuContent align="start" className="w-44">
        {FONT_FAMILIES.map((opt) => (
          <DropdownMenuItem
            key={opt.label}
            onClick={() => {
              if (opt.value) {
                editor.chain().focus().setFontFamily(opt.value).run();
              } else {
                editor.chain().focus().unsetFontFamily().run();
              }
              setOpen(false);
            }}
            style={{ fontFamily: opt.value || undefined }}
            className={cn(current === opt.value && "bg-primary/10 text-primary")}
          >
            {opt.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/* 字号选择器 */
export function FontSizePicker({ editor }: { editor: Editor }) {
  const [open, setOpen] = useState(false);
  const current = (editor.getAttributes("textStyle").fontSize as string | undefined) ?? "";

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger
        render={
          <ToolbarBtn title="字号" onClick={() => {}} className="w-fit px-2">
            <span className="flex items-center gap-1 text-[12px]">
              <HandFontSize className="h-4 w-4" />
              <span className="truncate max-w-[40px]">{current || "字号"}</span>
              <HandChevronDown className="h-3.5 w-3.5 opacity-60" />
            </span>
          </ToolbarBtn>
        }
      />
      <DropdownMenuContent align="start" className="w-32">
        {FONT_SIZES.map((opt) => (
          <DropdownMenuItem
            key={opt.label}
            onClick={() => {
              if (opt.value) {
                editor.chain().focus().setFontSize(opt.value).run();
              } else {
                editor.chain().focus().unsetFontSize().run();
              }
              setOpen(false);
            }}
            className={cn(current === opt.value && "bg-primary/10 text-primary")}
          >
            {opt.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/* 字数统计（读取 CharacterCount 扩展存储） */
export function CharCount({ editor }: { editor: Editor }) {
  const chars = (editor.storage.characterCount as any)?.characters?.() ?? 0;
  const words = (editor.storage.characterCount as any)?.words?.() ?? 0;
  return (
    <span
      className="hidden md:inline-flex items-center gap-1 px-2 text-[11px] text-ink-faint"
      title={`${words} 词 / ${chars} 字符`}
    >
      <HandFontSize className="h-3 w-3 opacity-60" />
      {chars > 0 ? `${chars} 字` : "空"}
    </span>
  );
}
