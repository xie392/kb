"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/trpc/client";
import { formatDate } from "@/lib/format";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

// 将命中关键词用 mark 高亮
function highlight(text: string, keyword: string) {
  if (!keyword) return text;
  const idx = text.toLowerCase().indexOf(keyword.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-[#ffe483]/70 px-0.5 rounded-[2px] text-inherit">
        {text.slice(idx, idx + keyword.length)}
      </mark>
      {text.slice(idx + keyword.length)}
    </>
  );
}

export default function SearchDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [keyword, setKeyword] = useState("");

  const { data, isFetching } = api.search.search.useQuery(
    { q: keyword },
    { enabled: open && keyword.trim().length > 0 }
  );
  const hits = data?.items ?? [];

  // 关闭时清空关键词
  useEffect(() => {
    if (!open) setKeyword("");
  }, [open]);

  // ⌘K / Ctrl+K 全局开合（Esc 关闭、点击外部关闭由 Dialog 内置处理）
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const kw = keyword.trim();

  return (
    <>
      {/* 触发按钮 */}
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-3.5 py-1.5 bg-white sketch-border sketch-shadow font-hand-display text-[16px] text-ink-muted hover:text-primary hover:-translate-y-0.5 transition-[color,transform] rotate-[0.5deg]"
        aria-label="搜索"
      >
        <svg aria-hidden="true" className="w-4 h-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8">
          <circle cx="9" cy="9" r="5.5" />
          <path d="M13.5 13.5L17 17" strokeLinecap="round" />
        </svg>
        搜索
        <kbd className="hidden sm:inline font-hand-body text-[12px] text-ink-faint border border-hairline rounded px-1">
          ⌘K
        </kbd>
      </button>

      {/* 搜索弹窗：Dialog + Command 实现，手绘视觉沿用 ui/command 默认 */}
      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        title="搜索"
        description="搜索标题、正文、分类或标签…"
      >
        <Command shouldFilter={false}>
          <CommandInput
            autoFocus
            value={keyword}
            onValueChange={setKeyword}
            placeholder="搜索标题、正文、分类或标签…"
          />
          <CommandList>
            {!kw ? (
              <div className="py-12 text-center">
                <div className="font-hand-display text-[24px] font-bold text-ink-faint rotate-[-1deg]">
                  输入关键词开始搜索
                </div>
                <div className="mt-2 font-hand-body text-[14px] text-ink-faint">
                  支持标题、正文摘要、分类、标签
                </div>
              </div>
            ) : isFetching ? (
              <div className="py-12 text-center">
                <div className="font-hand-display text-[20px] font-bold text-ink-faint">
                  搜索中…
                </div>
              </div>
            ) : hits.length === 0 ? (
              <CommandEmpty>
                <div className="font-hand-display text-[24px] font-bold text-ink-faint rotate-[-1deg]">
                  没有找到「{keyword}」
                </div>
                <div className="mt-2 font-hand-body text-[14px] text-ink-faint">
                  换个关键词试试？
                </div>
              </CommandEmpty>
            ) : (
              <CommandGroup>
                {hits.map((a) => (
                  <CommandItem
                    key={a.id}
                    value={String(a.id)}
                    onSelect={() => {
                      setOpen(false);
                      router.push(`/article/${a.id}`);
                    }}
                    className="items-start gap-3 px-5 py-4"
                  >
                    <span className="w-2 h-2 rounded-full rotate-12 mt-2 shrink-0 bg-sticker-sky" />
                    <div className="flex-1 min-w-0">
                      <span className="font-hand-body text-[12px] text-ink-faint">
                        {formatDate(String(a.updatedAt))}
                      </span>
                      <div className="mt-0.5 font-hand-display text-[19px] font-bold text-ink-secondary">
                        {highlight(a.title, keyword)}
                      </div>
                      {a.summary && (
                        <div className="mt-0.5 font-hand-body text-[14px] text-ink-muted line-clamp-1">
                          {highlight(a.summary, keyword)}
                        </div>
                      )}
                    </div>
                    <span className="font-hand-display text-[16px] text-primary opacity-0 group-hover/command-item:opacity-100 transition-opacity shrink-0 mt-1">
                      →
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </CommandDialog>
    </>
  );
}
