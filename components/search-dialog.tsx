"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { api } from "@/trpc/client";
import { formatDate } from "@/lib/format";

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
  const [open, setOpen] = useState(false);
  const [keyword, setKeyword] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const { data, isFetching } = api.search.search.useQuery(
    { q: keyword },
    { enabled: open && keyword.trim().length > 0 }
  );
  const hits = data?.items ?? [];

  // 打开时聚焦输入框
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 60);
    } else {
      setKeyword("");
    }
  }, [open]);

  // Esc 关闭 + Cmd+K 开合
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // 点击外部关闭
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  const kw = keyword.trim();

  return (
    <>
      {/* 触发按钮 */}
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-3.5 py-1.5 bg-white sketch-border sketch-shadow font-hand-display text-[16px] text-[#615d59] hover:text-[#0075de] hover:-translate-y-0.5 transition-all rotate-[0.5deg]"
        aria-label="搜索"
      >
        <svg className="w-4 h-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8">
          <circle cx="9" cy="9" r="5.5" />
          <path d="M13.5 13.5L17 17" strokeLinecap="round" />
        </svg>
        搜索
        <kbd className="hidden sm:inline font-hand-body text-[12px] text-[#a39e98] border border-[#e6e6e6] rounded px-1">
          ⌘K
        </kbd>
      </button>

      {/* 弹窗 */}
      {open && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4">
          <div
            ref={panelRef}
            className="relative w-full max-w-[620px] bg-[#fbfaf6] sketch-border sketch-shadow fade-up overflow-hidden"
          >
            {/* 输入行 */}
            <div className="flex items-center gap-3 px-5 h-[60px] border-b-2 border-dashed border-[#e6e6e6]">
              <svg className="w-5 h-5 text-[#615d59]" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8">
                <circle cx="9" cy="9" r="5.5" />
                <path d="M13.5 13.5L17 17" strokeLinecap="round" />
              </svg>
              <input
                ref={inputRef}
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="搜索标题、正文、分类或标签…"
                className="flex-1 h-full bg-transparent font-hand-display text-[20px] text-[#31302e] placeholder:text-[#a39e98] outline-none border-none"
              />
              <button
                onClick={() => setOpen(false)}
                className="font-hand-body text-[14px] text-[#a39e98] hover:text-[#31302e] px-2"
              >
                Esc 关闭
              </button>
            </div>

            {/* 结果区 */}
            <div className="max-h-[50vh] overflow-y-auto">
              {!kw ? (
                <div className="py-12 text-center">
                  <div className="font-hand-display text-[24px] font-bold text-[#a39e98] rotate-[-1deg]">
                    输入关键词开始搜索
                  </div>
                  <div className="mt-2 font-hand-body text-[14px] text-[#a39e98]">
                    支持标题、正文摘要、分类、标签
                  </div>
                </div>
              ) : isFetching ? (
                <div className="py-12 text-center">
                  <div className="font-hand-display text-[20px] font-bold text-[#a39e98]">
                    搜索中…
                  </div>
                </div>
              ) : hits.length === 0 ? (
                <div className="py-12 text-center">
                  <div className="font-hand-display text-[24px] font-bold text-[#a39e98] rotate-[-1deg]">
                    没有找到「{keyword}」
                  </div>
                  <div className="mt-2 font-hand-body text-[14px] text-[#a39e98]">
                    换个关键词试试？
                  </div>
                </div>
              ) : (
                <ul className="divide-y divide-dashed divide-[#e6e6e6]">
                  {hits.map((a) => (
                    <li key={a.id}>
                      <Link
                        href={`/article/${a.id}`}
                        onClick={() => setOpen(false)}
                        className="group flex items-start gap-3 px-5 py-4 hover:bg-white transition-colors"
                      >
                        <span className="w-2 h-2 rounded-full rotate-12 mt-2 shrink-0 bg-[#62aef0]" />
                        <div className="flex-1 min-w-0">
                          <span className="font-hand-body text-[12px] text-[#a39e98]">
                            {formatDate(String(a.updatedAt))}
                          </span>
                          <div className="mt-0.5 font-hand-display text-[19px] font-bold text-[#31302e] group-hover:text-[#0075de] transition-colors">
                            {highlight(a.title, keyword)}
                          </div>
                          {a.summary && (
                            <div className="mt-0.5 font-hand-body text-[14px] text-[#615d59] line-clamp-1">
                              {highlight(a.summary, keyword)}
                            </div>
                          )}
                        </div>
                        <span className="font-hand-display text-[16px] text-[#0075de] opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-1">
                          →
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
