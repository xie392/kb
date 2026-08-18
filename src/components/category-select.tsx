"use client";

import { useEffect, useRef, useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export interface CategoryOption {
  id: string;
  name: string;
  count?: number;
  children?: CategoryOption[];
}

interface Props {
  options: CategoryOption[];
  value: string;
  onChange: (id: string) => void;
  onCreate: (name: string, parentId: string | null) => Promise<string | null>;
}

/**
 * 树形分类选择器：可搜索、可创建顶级分类、任意层级分类下均可创建子分类
 * 弹层/定位/焦点管理基于 shadcn Popover（Base UI）
 */
export default function CategorySelect({ options, value, onChange, onCreate }: Props) {
  const [open, setOpen] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [creatingChildOf, setCreatingChildOf] = useState<string | null>(null); // 正在哪个分类下创建子分类
  const [createName, setCreateName] = useState("");
  const [busy, setBusy] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const createInputRef = useRef<HTMLInputElement>(null);

  // 打开时聚焦搜索框
  useEffect(() => {
    if (open) setTimeout(() => searchRef.current?.focus(), 40);
  }, [open]);

  const kw = keyword.trim().toLowerCase();

  const findCategory = (list: CategoryOption[], id: string): CategoryOption | null => {
    for (const c of list) {
      if (c.id === id) return c;
      if (c.children) {
        const hit = findCategory(c.children, id);
        if (hit) return hit;
      }
    }
    return null;
  };

  // 按关键词过滤：命中父分类则保留整棵子树，命中子分类则保留该子分类
  const filterTree = (list: CategoryOption[]): CategoryOption[] => {
    const out: CategoryOption[] = [];
    for (const c of list) {
      const children = c.children ? filterTree(c.children) : [];
      if (children.length > 0) {
        out.push({ ...c, children });
      } else if (c.name.toLowerCase().includes(kw)) {
        out.push(c);
      }
    }
    return out;
  };

  const filtered = kw ? filterTree(options) : options;
  const canCreateTop = kw.length > 0 && !options.some((c) => c.name.toLowerCase() === kw);
  const selected = findCategory(options, value);

  const handleCreate = async (name: string, parentId: string | null) => {
    const n = name.trim();
    if (!n || busy) return;
    setBusy(true);
    const id = await onCreate(n, parentId);
    setBusy(false);
    if (id) {
      onChange(id);
      setKeyword("");
      setCreateName("");
      setCreatingChildOf(null);
      setOpen(false);
    }
  };

  const startCreateChild = (parentId: string) => {
    setCreatingChildOf(parentId);
    setCreateName("");
    setTimeout(() => createInputRef.current?.focus(), 30);
  };

  // 递归渲染分类节点（任意层级，每级都可创建子分类）
  const renderNode = (c: CategoryOption, depth: number) => (
    <div key={c.id}>
      <div className="group relative flex items-center">
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => {
            onChange(c.id);
            setOpen(false);
          }}
          className={`flex-1 flex items-center gap-1.5 text-left pl-3 pr-7 py-1.5 text-[12px] transition-colors ${
            value === c.id
              ? "bg-[#0075de]/8 text-[#0075de] font-medium"
              : "text-[#31302e] hover:bg-[#f6f5f4]"
          }`}
          style={{ paddingLeft: 12 + depth * 16 }}
        >
          {depth > 0 ? (
            <svg className="w-2.5 h-2.5 text-[#c5c0b9] shrink-0" viewBox="0 0 16 16" fill="currentColor">
              <path d="M4 3h8a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" opacity="0.5" />
            </svg>
          ) : (
            <svg className="w-3 h-3 text-[#a39e98] shrink-0" viewBox="0 0 16 16" fill="currentColor">
              <rect x="3" y="3" width="10" height="10" rx="1.5" opacity="0.6" />
            </svg>
          )}
          <span className="truncate">{c.name}</span>
          {typeof c.count === "number" && c.count > 0 && (
            <span className="text-[#a39e98] text-[11px] shrink-0">{c.count}</span>
          )}
        </button>
        {/* 创建子分类 */}
        <button
          type="button"
          title={`在「${c.name}」下创建子分类`}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => startCreateChild(c.id)}
          className="absolute right-1.5 top-1/2 -translate-y-1/2 w-5 h-5 grid place-items-center rounded text-[#0075de] opacity-0 group-hover:opacity-100 hover:bg-[#0075de]/10 transition-opacity"
        >
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <path d="M8 3v10M3 8h10" />
          </svg>
        </button>
      </div>

      {/* 行内创建子分类输入 */}
      {creatingChildOf === c.id && (
        <div className="flex items-center gap-1.5 py-1.5 pr-3" style={{ paddingLeft: 28 + depth * 16 }}>
          <svg className="w-2.5 h-2.5 text-[#c5c0b9] shrink-0" viewBox="0 0 16 16" fill="currentColor">
            <path d="M4 3h8a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" opacity="0.5" />
          </svg>
          <input
            ref={createInputRef}
            type="text"
            value={createName}
            onChange={(e) => setCreateName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleCreate(createName, c.id);
              } else if (e.key === "Escape") {
                setCreatingChildOf(null);
              }
            }}
            placeholder={`在「${c.name}」下新建…`}
            className="flex-1 h-6 px-2 text-[12px] text-[#31302e] bg-[#f6f5f4] border border-[#0075de]/40 rounded outline-none placeholder:text-[#c5c0b9]"
          />
        </div>
      )}

      {/* 子分类（递归） */}
      {c.children?.map((child) => renderNode(child, depth + 1))}
    </div>
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      {/* 触发器 */}
      <PopoverTrigger className="h-7 px-2.5 flex items-center gap-2 text-[12px] text-[#615d59] bg-white border border-[#e6e6e6] rounded-md outline-none focus:border-[#0075de]/50 cursor-pointer hover:bg-[#f6f5f4]/60 transition-colors">
        <span className={selected ? "text-[#31302e]" : "text-[#a39e98]"}>
          {selected ? selected.name : "未分类"}
        </span>
        <svg
          className={`w-3 h-3 text-[#a39e98] transition-transform ${open ? "rotate-180" : ""}`}
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M4 6l4 4 4-4" />
        </svg>
      </PopoverTrigger>

      {/* 下拉面板 */}
      <PopoverContent
        align="start"
        sideOffset={4}
        className="w-64 p-1"
      >
        {/* 搜索框 */}
        <div className="px-1 pb-1.5">
          <input
            ref={searchRef}
            type="text"
            value={keyword}
            onChange={(e) => {
              setKeyword(e.target.value);
              setCreatingChildOf(null);
            }}
            onKeyDown={(e) => {
              if (e.key === "Escape") setOpen(false);
            }}
            placeholder="搜索分类…"
            className="w-full h-7 px-2.5 text-[12px] text-[#615d59] bg-[#f6f5f4] border border-transparent rounded-md outline-none focus:border-[#0075de]/40 placeholder:text-[#c5c0b9]"
          />
        </div>

        {/* 分类树 */}
        <div className="max-h-[220px] overflow-y-auto">
          {filtered.length === 0 && (
            <div className="px-3 py-2 text-[12px] text-[#a39e98]">
              {kw ? "无匹配分类" : "暂无分类"}
            </div>
          )}
          {filtered.map((c) => renderNode(c, 0))}
        </div>

        {/* 底部：创建顶级分类 */}
        <div className="border-t border-[#e6e6e6] mt-1 pt-1">
          {canCreateTop ? (
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => handleCreate(keyword, null)}
              disabled={busy}
              className="w-full text-left px-2.5 py-1.5 text-[12px] text-[#0075de] rounded-md hover:bg-[#f6f5f4] transition-colors disabled:opacity-50"
            >
              {busy ? "创建中…" : `+ 创建分类 "${keyword.trim()}"`}
            </button>
          ) : (
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                setCreatingChildOf("__top__");
                setCreateName("");
                setKeyword("");
                setTimeout(() => createInputRef.current?.focus(), 30);
              }}
              className="w-full text-left px-2.5 py-1.5 text-[12px] text-[#615d59] rounded-md hover:bg-[#f6f5f4] hover:text-[#0075de] transition-colors"
            >
              ＋ 新建分类
            </button>
          )}
          {creatingChildOf === "__top__" && (
            <div className="px-1 pb-1 pt-0.5">
              <input
                ref={createInputRef}
                type="text"
                value={createName}
                onChange={(e) => setCreateName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleCreate(createName, null);
                  } else if (e.key === "Escape") {
                    setCreatingChildOf(null);
                  }
                }}
                placeholder="输入分类名，回车创建"
                className="w-full h-6 px-2 text-[12px] text-[#31302e] bg-[#f6f5f4] border border-[#0075de]/40 rounded outline-none placeholder:text-[#c5c0b9]"
              />
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
