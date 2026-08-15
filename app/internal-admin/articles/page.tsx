"use client";

import { useState } from "react";
import { articles } from "@/lib/mock-data";
import { formatDate } from "@/lib/format";

type StatusFilter = "all" | "normal" | "trash";

const statusTabs: { id: StatusFilter; label: string }[] = [
  { id: "all", label: "全部" },
  { id: "normal", label: "正常" },
  { id: "trash", label: "回收站" },
];

export default function AdminArticlesPage() {
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    setSelected((prev) =>
      prev.size === articles.length ? new Set() : new Set(articles.map((a) => a.id))
    );
  };

  const hasSelection = selected.size > 0;

  return (
    <div className="p-8 w-full">
      {/* 页头 */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-[22px] font-bold tracking-[-0.25px] text-ink">文章管理</h2>
          <p className="text-[13px] text-[#a39e98] mt-0.5">共 {articles.length} 篇文章</p>
        </div>
        <button className="flex items-center gap-1.5 h-9 px-4 rounded-full bg-primary text-white text-[13.5px] font-medium hover:bg-primary-active transition-colors">
          <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10 4a1 1 0 0 1 1 1v4h4a1 1 0 1 1 0 2h-4v4a1 1 0 1 1-2 0v-4H5a1 1 0 1 1 0-2h4V5a1 1 0 0 1 1-1z" />
          </svg>
          新增文章
        </button>
      </div>

      {/* 状态筛选 */}
      <div className="flex items-center gap-1 mb-4">
        {statusTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={`px-3.5 h-8 rounded-full text-[13px] border transition-colors ${
              filter === tab.id
                ? "border-primary bg-primary/5 text-primary font-medium"
                : "border-[#e6e6e6] bg-canvas text-[#615d59] hover:text-ink hover:border-ink-faint"
            }`}
          >
            {tab.label}
            <span className="ml-1.5 text-[11px] tabular-nums opacity-70">
              {tab.id === "all" ? articles.length : tab.id === "normal" ? articles.length : 2}
            </span>
          </button>
        ))}
        <div className="flex-1" />
        {/* 搜索 */}
        <div className="relative">
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
            placeholder="搜索标题/内容…"
            className="h-8 w-[220px] pl-9 pr-3 rounded-[8px] bg-canvas border border-[#e6e6e6] text-[13px] placeholder:text-[#a39e98] outline-none focus:border-[#0075de] transition-colors"
          />
        </div>
      </div>

      {/* 批量操作栏 */}
      <div
        className={`flex items-center gap-2 mb-4 transition-all duration-200 ${
          hasSelection ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-1 pointer-events-none h-0 overflow-hidden"
        }`}
      >
        <span className="text-[13px] text-[#31302e]">
          已选 <span className="font-semibold text-primary">{selected.size}</span> 项
        </span>
        <span className="w-px h-4 bg-hairline" />
        <button className="text-[12.5px] text-[#615d59] hover:text-[#0075de] transition-colors">批量迁移分类</button>
        <span className="w-px h-4 bg-hairline" />
        <button className="text-[12.5px] text-[#615d59] hover:text-[#0075de] transition-colors">批量添加标签</button>
        <span className="w-px h-4 bg-hairline" />
        <button className="text-[12.5px] text-[#615d59] hover:text-[#0075de] transition-colors">批量设公开</button>
        <span className="w-px h-4 bg-hairline" />
        <button className="text-[12.5px] text-[#615d59] hover:text-[#0075de] transition-colors">批量导出</button>
        <div className="flex-1" />
        <button className="text-[12.5px] text-red-400 hover:text-red-500 transition-colors">批量删除</button>
      </div>

      {/* 文章表格 */}
      <div className="card overflow-hidden fade-up">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-[#f6f5f4] border-b border-[#e6e6e6]">
              <th className="w-10 px-4 py-3">
                <input
                  type="checkbox"
                  checked={selected.size === articles.length && articles.length > 0}
                  onChange={toggleAll}
                  className="w-3.5 h-3.5 rounded-sm border-[#e6e6e6] accent-[#0075de] cursor-pointer"
                />
              </th>
              <th className="px-3 py-3 text-[11px] font-semibold tracking-[0.125px] text-[#615d59] uppercase">标题</th>
              <th className="px-3 py-3 text-[11px] font-semibold tracking-[0.125px] text-[#615d59] uppercase">分类</th>
              <th className="px-3 py-3 text-[11px] font-semibold tracking-[0.125px] text-[#615d59] uppercase">标签</th>
              <th className="px-3 py-3 text-[11px] font-semibold tracking-[0.125px] text-[#615d59] uppercase">权限</th>
              <th className="px-3 py-3 text-[11px] font-semibold tracking-[0.125px] text-[#615d59] uppercase">状态</th>
              <th className="px-3 py-3 text-[11px] font-semibold tracking-[0.125px] text-[#615d59] uppercase">更新时间</th>
              <th className="px-4 py-3 text-right text-[11px] font-semibold tracking-[0.125px] text-[#615d59] uppercase">操作</th>
            </tr>
          </thead>
          <tbody>
            {articles.map((a) => (
              <tr
                key={a.id}
                className="border-b border-[#e6e6e6] last:border-0 hover:bg-[#f6f5f4]/50 transition-colors"
              >
                <td className="px-4 py-3.5">
                  <input
                    type="checkbox"
                    checked={selected.has(a.id)}
                    onChange={() => toggleSelect(a.id)}
                    className="w-3.5 h-3.5 rounded-sm border-[#e6e6e6] accent-[#0075de] cursor-pointer"
                  />
                </td>
                <td className="px-3 py-3.5">
                  <div className="flex items-center gap-2">
                    {a.isPinned && (
                      <svg className="w-3 h-3 text-primary shrink-0" viewBox="0 0 16 16" fill="currentColor">
                        <path d="M9.5 1.5l5 5-1.8 1.8-.6-.6-1.7 1.7.6.6-1.4 1.4-5-5 1.4-1.4.6.6 1.7-1.7-.6-.6L9.5 1.5zM4 12l-2 3 3-2-1-1z" />
                      </svg>
                    )}
                    <span className="text-[13.5px] text-ink font-medium truncate max-w-[260px]">
                      {a.title}
                    </span>
                  </div>
                </td>
                <td className="px-3 py-3.5">
                  <span
                    className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[5px] text-[11px]"
                    style={{ backgroundColor: `${a.categoryColor}14`, color: a.categoryColor }}
                  >
                    <span className="sticker-dot" style={{ width: 6, height: 6, backgroundColor: a.categoryColor }} />
                    {a.category}
                  </span>
                </td>
                <td className="px-3 py-3.5">
                  <div className="flex items-center gap-1 flex-wrap max-w-[140px]">
                    {a.tags.slice(0, 2).map((t) => (
                      <span key={t} className="text-[11px] text-[#a39e98]">#{t}</span>
                    ))}
                    {a.tags.length > 2 && (
                      <span className="text-[11px] text-[#a39e98]">+{a.tags.length - 2}</span>
                    )}
                  </div>
                </td>
                <td className="px-3 py-3.5">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] border ${
                      a.visibility === "public"
                        ? "border-primary/25 text-primary bg-primary/5"
                        : "border-[#e6e6e6] text-[#a39e98]"
                    }`}
                  >
                    {a.visibility === "public" ? "公开" : "私有"}
                  </span>
                </td>
                <td className="px-3 py-3.5">
                  <span className="inline-flex items-center gap-1.5 text-[12px] text-sticker-green">
                    <span className="w-1.5 h-1.5 rounded-full bg-sticker-green" />
                    正常
                  </span>
                </td>
                <td className="px-3 py-3.5 text-[12px] text-[#a39e98] tabular-nums whitespace-nowrap">
                  {formatDate(a.updatedAt)}
                </td>
                <td className="px-4 py-3.5">
                  <div className="flex items-center justify-end gap-1">
                    <button className="px-2 py-1 rounded-[6px] text-[12px] text-[#615d59] hover:bg-[#f6f5f4] hover:text-ink transition-colors">编辑</button>
                    <button className="px-2 py-1 rounded-[6px] text-[12px] text-[#615d59] hover:bg-[#f6f5f4] hover:text-ink transition-colors">置顶</button>
                    <button className="px-2 py-1 rounded-[6px] text-[12px] text-red-400 hover:bg-red-50 hover:text-red-500 transition-colors">删除</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 分页 */}
      <div className="mt-4 flex items-center justify-between">
        <span className="text-[12px] text-[#a39e98]">共 {articles.length} 条 · 第 1/1 页</span>
        <div className="flex items-center gap-1">
          <button className="w-8 h-8 rounded-[8px] border border-[#e6e6e6] bg-canvas text-[#615d59] grid place-items-center text-[13px] hover:text-ink transition-colors" disabled>
            ‹
          </button>
          <button className="w-8 h-8 rounded-[8px] bg-primary text-white grid place-items-center text-[13px]">1</button>
          <button className="w-8 h-8 rounded-[8px] border border-[#e6e6e6] bg-canvas text-[#615d59] grid place-items-center text-[13px] hover:text-ink transition-colors" disabled>
            ›
          </button>
        </div>
      </div>
    </div>
  );
}
