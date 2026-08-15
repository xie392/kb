"use client";

import { useState } from "react";
import { tags } from "@/lib/mock-data";

const tagData = tags.map((name, i) => ({
  name,
  count: [5, 4, 3, 2, 2, 1][i] ?? 1,
  color: ["#0075de", "#ff64c8", "#62aef0", "#2a9d99", "#dd5b00", "#d6b6f6"][i],
}));

export default function AdminTagsPage() {
  const [query, setQuery] = useState("");

  const filtered = tagData.filter((t) => t.name.toLowerCase().includes(query.toLowerCase()));
  const emptyTags = tagData.filter((t) => t.count === 0);

  return (
    <div className="p-8 w-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-[22px] font-bold tracking-[-0.25px] text-ink">标签管理</h2>
          <p className="text-[13px] text-[#a39e98] mt-0.5">共 {tagData.length} 个标签 · 全局通用</p>
        </div>
        <button className="flex items-center gap-1.5 h-9 px-4 rounded-full bg-primary text-white text-[13.5px] font-medium hover:bg-primary-active transition-colors">
          <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10 4a1 1 0 0 1 1 1v4h4a1 1 0 1 1 0 2h-4v4a1 1 0 1 1-2 0v-4H5a1 1 0 1 1 0-2h4V5a1 1 0 0 1 1-1z" />
          </svg>
          新增标签
        </button>
      </div>

      {/* 工具栏 */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-[320px]">
          <svg
            className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#a39e98]"
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <circle cx="9" cy="9" r="5.5" />
            <path d="M13.5 13.5L17 17" strokeLinecap="round" />
          </svg>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜索标签…"
            className="h-8 w-full pl-9 pr-3 rounded-[8px] bg-canvas border border-[#e6e6e6] text-[13px] placeholder:text-[#a39e98] outline-none focus:border-[#0075de] transition-colors"
          />
        </div>
        {emptyTags.length > 0 && (
          <button className="text-[12.5px] text-[#615d59] hover:text-[#0075de] transition-colors">
            清理 {emptyTags.length} 个空标签
          </button>
        )}
      </div>

      {/* 标签列表 */}
      <div className="card p-5 fade-up">
        {filtered.length === 0 ? (
          <div className="py-12 text-center">
            <div className="text-[14px] text-[#a39e98]">没有匹配的标签</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filtered.map((tag) => (
              <div
                key={tag.name}
                className="flex items-center gap-3 px-4 py-3.5 sketch-border border border-[#e6e6e6] hover:border-primary/25 hover:shadow-[var(--shadow-soft)] transition-all group"
              >
                <span
                  className="w-8 h-8 rounded-[8px] grid place-items-center text-[13px] font-bold text-white"
                  style={{ backgroundColor: tag.color }}
                >
                  {tag.name[0]}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-[13.5px] font-medium text-ink truncate">#{tag.name}</div>
                  <div className="text-[11px] text-[#a39e98] tabular-nums mt-0.5">
                    {tag.count} 篇笔记
                  </div>
                </div>
                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="w-7 h-7 rounded-[6px] grid place-items-center text-[#615d59] hover:bg-[#f6f5f4] hover:text-ink transition-colors" title="编辑">
                    <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M11.3 2.3a1.5 1.5 0 0 1 2.1 2.1L5.5 12.3 2.5 13l.7-3L11.3 2.3z" />
                    </svg>
                  </button>
                  <button className="w-7 h-7 rounded-[6px] grid place-items-center text-[#615d59] hover:bg-red-50 hover:text-red-500 transition-colors" title="删除">
                    <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M3.5 4.5h9M6.5 4.5V3.5A1 1 0 0 1 7.5 2.5h1a1 1 0 0 1 1 1v1m-5 0l.5 9a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1l.5-9" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
