"use client";

import { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export interface TagOption {
  id: string;
  name: string;
  _count?: { articles: number };
}

interface Props {
  options: TagOption[];
  value: string[];
  onChange: (ids: string[]) => void;
  onCreate: (name: string) => Promise<string | null>;
}

/**
 * 可搜索、可创建的多选标签选择器（类似 el-select allow-create）
 * 基于 shadcn Popover（Base UI），样式保持手绘线框风格
 */
export default function TagSelect({ options, value, onChange, onCreate }: Props) {
  const [open, setOpen] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [creating, setCreating] = useState(false);

  const kw = keyword.trim().toLowerCase();
  const filtered = options.filter((t) => t.name.toLowerCase().includes(kw));
  const exactExists = options.some((t) => t.name.toLowerCase() === kw);
  const canCreate = kw.length > 0 && !exactExists;

  // 触发器最多显示前 3 个，其余合并为 +N（避免换行）
  const MAX_VISIBLE = 3;
  const visibleTags = value
    .map((id) => options.find((o) => o.id === id))
    .filter((t): t is TagOption => !!t)
    .slice(0, MAX_VISIBLE);
  const hiddenTags = value
    .map((id) => options.find((o) => o.id === id))
    .filter((t): t is TagOption => !!t)
    .slice(MAX_VISIBLE);
  const extraCount = hiddenTags.length;

  const toggle = (id: string) => {
    onChange(value.includes(id) ? value.filter((v) => v !== id) : [...value, id]);
  };

  const handleCreate = async () => {
    if (!canCreate || creating) return;
    setCreating(true);
    const id = await onCreate(keyword.trim());
    setCreating(false);
    if (id) {
      if (!value.includes(id)) onChange([...value, id]);
      // 保持弹层打开并清空输入，方便继续添加下一个标签
      setKeyword("");
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      {/* 触发器：已选 chips（单行，超出合并为 +N） */}
      <PopoverTrigger
        render={
          <div className="relative flex items-center gap-1.5 min-h-[28px] max-w-[280px] px-2.5 pr-8 py-1 bg-white border border-[#e6e6e6] rounded-md cursor-pointer text-left overflow-hidden" />
        }
        nativeButton={false}
      >
        {visibleTags.map((t) => (
          <span
            key={t.id}
            className="h-6 inline-flex items-center gap-1 px-2 text-[12px] rounded-full bg-[#0075de]/8 text-[#0075de] border border-[#0075de]/30 shrink-0"
          >
            #{t.name}
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={(e) => {
                e.stopPropagation();
                toggle(t.id);
              }}
              className="hover:text-[#0075de] leading-none"
            >
              &times;
            </button>
          </span>
        ))}
        {extraCount > 0 && (
          <Tooltip>
            <TooltipTrigger
              render={
                <span className="h-6 inline-flex items-center px-2 text-[12px] text-[#615d59] bg-[#f6f5f4] border border-[#e6e6e6] rounded-full shrink-0 cursor-default">
                  +{extraCount}
                </span>
              }
            />
            <TooltipContent
              side="top"
              className="max-w-xs rounded-md bg-[#31302e] text-white border-none text-[12px] px-3 py-1.5"
            >
              <span className="font-medium">已选 {extraCount} 个：</span>
              <span className="text-[#d8d4cd]">{hiddenTags.map((t) => t.name).join("、")}</span>
            </TooltipContent>
          </Tooltip>
        )}
        {value.length === 0 && (
          <span className="text-[12px] text-[#c5c0b9] truncate">搜索或创建标签…</span>
        )}
        {/* 清空已选（绝对定位固定在右侧，不随 chips 数量移动） */}
        {value.length > 0 && (
          <button
            type="button"
            title="清空已选标签"
            onMouseDown={(e) => e.preventDefault()}
            onClick={(e) => {
              e.stopPropagation();
              onChange([]);
            }}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 w-5 h-5 grid place-items-center rounded text-[#a39e98] hover:bg-[#f6f5f4] hover:text-[#31302e]"
          >
            <svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <path d="M4 4l8 8M12 4l-8 8" />
            </svg>
          </button>
        )}
      </PopoverTrigger>

      {/* 下拉面板 */}
      <PopoverContent
        align="start"
        sideOffset={4}
        className="w-64 p-1"
      >
        <div className="px-1 pb-1.5">
          <input
            autoFocus
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                if (canCreate) handleCreate();
              } else if (e.key === "Escape") {
                setOpen(false);
              }
            }}
            placeholder="搜索或创建标签…"
            className="w-full h-7 px-2.5 text-[12px] text-[#615d59] bg-[#f6f5f4] border border-transparent rounded-md outline-none focus:border-[#0075de]/40 placeholder:text-[#c5c0b9]"
          />
        </div>
        <div className="max-h-[200px] overflow-y-auto">
          {filtered.map((t) => {
            const selected = value.includes(t.id);
            return (
              <button
                key={t.id}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => toggle(t.id)}
                className={`flex items-center w-full text-left px-2.5 py-1.5 text-[12px] rounded-md transition-colors ${
                  selected
                    ? "bg-[#0075de]/8 text-[#0075de] font-medium"
                    : "text-[#31302e] hover:bg-[#f6f5f4]"
                }`}
              >
                <span className="truncate">
                  #{t.name}
                  {typeof t._count?.articles === "number" && (
                    <span className="ml-1.5 text-[#a39e98] font-normal">{t._count.articles}</span>
                  )}
                </span>
                {selected && (
                  <svg
                    className="ml-auto shrink-0"
                    width="13"
                    height="13"
                    viewBox="0 0 16 16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M3 8.5l3.5 3.5L13 4.5" />
                  </svg>
                )}
              </button>
            );
          })}
          {filtered.length === 0 && !canCreate && (
            <div className="px-2.5 py-1.5 text-[12px] text-[#a39e98]">
              {kw ? "无匹配标签" : "输入关键词搜索标签"}
            </div>
          )}
          {canCreate && (
            <>
              <div className="h-px bg-[#e6e6e6] mx-1" />
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={handleCreate}
                disabled={creating}
                className="block w-full text-left px-2.5 py-1.5 text-[12px] text-[#0075de] rounded-md hover:bg-[#f6f5f4] transition-colors disabled:opacity-50"
              >
                {creating ? "创建中…" : `+ 创建 "#${keyword.trim()}"`}
              </button>
            </>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
