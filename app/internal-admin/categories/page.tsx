"use client";

import { useState } from "react";
import { categories } from "@/lib/mock-data";

export default function AdminCategoriesPage() {
  const [open, setOpen] = useState<Record<string, boolean>>({ work: true });
  const toggle = (id: string) => setOpen((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <div className="p-8 w-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-[22px] font-bold tracking-[-0.25px] text-ink">分类管理</h2>
          <p className="text-[13px] text-[#a39e98] mt-0.5">管理分类层级结构与排序</p>
        </div>
        <button className="flex items-center gap-1.5 h-9 px-4 rounded-full bg-primary text-white text-[13.5px] font-medium hover:bg-primary-active transition-colors">
          <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10 4a1 1 0 0 1 1 1v4h4a1 1 0 1 1 0 2h-4v4a1 1 0 1 1-2 0v-4H5a1 1 0 1 1 0-2h4V5a1 1 0 0 1 1-1z" />
          </svg>
          新增分类
        </button>
      </div>

      {/* 分类树 */}
      <div className="card divide-y divide-hairline fade-up">
        {categories.map((cat) => (
          <div key={cat.id}>
            <div className="flex items-center gap-3 px-5 py-4 hover:bg-[#f6f5f4]/50 transition-colors group">
              <button
                onClick={() => toggle(cat.id)}
                className="w-6 h-6 grid place-items-center text-[#a39e98] hover:text-ink transition-colors"
              >
                <svg
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${open[cat.id] ? "rotate-90" : ""}`}
                  viewBox="0 0 12 12"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path d="M4.5 2.5L8 6l-3.5 3.5" strokeLinecap="round" />
                </svg>
              </button>
              <span className="sticker-dot" style={{ backgroundColor: cat.color }} />
              <span className="text-[14.5px] font-medium text-ink flex-1">{cat.name}</span>
              <span className="text-[12px] text-[#a39e98] tabular-nums">{cat.count} 篇</span>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="px-2 py-1 rounded-[6px] text-[12px] text-[#615d59] hover:bg-[#f6f5f4] hover:text-ink transition-colors">添加子分类</button>
                <button className="px-2 py-1 rounded-[6px] text-[12px] text-[#615d59] hover:bg-[#f6f5f4] hover:text-ink transition-colors">编辑</button>
                <button className="px-2 py-1 rounded-[6px] text-[12px] text-red-400 hover:bg-red-50 hover:text-red-500 transition-colors">删除</button>
              </div>
            </div>
            {open[cat.id] && (
              <div className="pb-2">
                {cat.children?.map((child) => (
                  <div
                    key={child.id}
                    className="flex items-center gap-3 pl-[60px] pr-5 py-3 hover:bg-[#f6f5f4]/50 transition-colors group"
                  >
                    <span className="text-[#a39e98] text-[13px]">└</span>
                    <span className="text-[13.5px] text-[#31302e] flex-1">{child.name}</span>
                    <span className="text-[12px] text-[#a39e98] tabular-nums">{child.count} 篇</span>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="px-2 py-1 rounded-[6px] text-[12px] text-[#615d59] hover:bg-[#f6f5f4] hover:text-ink transition-colors">编辑</button>
                      <button className="px-2 py-1 rounded-[6px] text-[12px] text-red-400 hover:bg-red-50 hover:text-red-500 transition-colors">删除</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 删除校验提示 */}
      <div className="mt-6 card p-4 flex items-start gap-3 fade-up" style={{ animationDelay: "100ms" }}>
        <svg className="w-4 h-4 text-sticker-orange shrink-0 mt-0.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M8 2L14 13.5H2L8 2z" strokeLinejoin="round" />
          <path d="M8 6.5v3M8 11.5h.01" strokeLinecap="round" />
        </svg>
        <div className="text-[12.5px] text-[#615d59] leading-relaxed">
          <span className="font-medium text-[#31302e]">删除保护</span>
          ：分类下有子分类或笔记时不可直接删除，需先迁移或清空。该提示会出现在删除确认框中。
        </div>
      </div>
    </div>
  );
}
