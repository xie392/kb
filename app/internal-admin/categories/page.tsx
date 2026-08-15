"use client";

import { useState } from "react";
import { api } from "@/trpc/client";

export default function AdminCategoriesPage() {
  const utils = api.useUtils();
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [newName, setNewName] = useState("");
  const [newParent, setNewParent] = useState<string>("");

  const { data: cats } = api.category.tree.useQuery();
  const invalidate = () => utils.category.tree.invalidate();

  const create = api.category.create.useMutation({
    onSuccess: () => { invalidate(); setNewName(""); show("已新增分类", "ok"); },
    onError: (e) => show(e.message, "err"),
  });
  const remove = api.category.delete.useMutation({
    onSuccess: () => { invalidate(); show("已删除分类", "ok"); },
    onError: (e) => show(e.message, "err"),
  });

  const show = (text: string, type: "ok" | "err") => {
    setMsg({ type, text });
    setTimeout(() => setMsg(null), 2500);
  };

  return (
    <div className="p-8 w-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-hand-display text-[32px] font-bold text-[#213183]">分类管理</h2>
          <p className="font-hand-body text-[15px] text-[#a39e98] mt-0.5">管理分类层级结构与排序</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={newParent}
            onChange={(e) => setNewParent(e.target.value)}
            className="h-10 px-3 bg-white sketch-border font-hand-body text-[14px] text-[#31302e] outline-none"
          >
            <option value="">作为一级分类</option>
            {cats?.map((c) => (
              <option key={c.id} value={c.id}>作为 {c.name} 的子分类</option>
            ))}
          </select>
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="分类名称"
            className="h-10 px-3 bg-white sketch-border font-hand-body text-[14px] text-[#31302e] placeholder:text-[#a39e98] outline-none"
          />
          <button
            onClick={() => {
              if (!newName.trim()) return show("请输入分类名称", "err");
              create.mutate({ name: newName.trim(), parentId: newParent || null });
            }}
            className="h-10 px-4 bg-[#0075de] text-white font-hand-display text-[16px] font-bold sketch-border sketch-shadow rotate-[-1deg] hover:rotate-0 transition-transform"
          >
            ＋ 新增
          </button>
        </div>
      </div>

      {msg && (
        <div className={`mb-4 sticky-note sketch-border px-4 py-2 rotate-[-1deg] w-fit fade-up`}>
          <span className={`font-hand-display text-[16px] font-bold ${msg.type === "ok" ? "text-[#2a9d99]" : "text-red-500"}`}>
            {msg.type === "ok" ? "✓" : "✗"} {msg.text}
          </span>
        </div>
      )}

      {/* 分类树 */}
      <div className="bg-white sketch-border sketch-shadow divide-y divide-dashed divide-[#e6e6e6] fade-up">
        {cats?.map((cat) => (
          <div key={cat.id}>
            <div className="flex items-center gap-3 px-5 py-4 hover:bg-[#f6f5f4]/60 transition-colors group">
              <span className="w-8 h-8 grid place-items-center text-white font-hand-display text-[15px] font-bold sketch-border rotate-[-3deg] bg-[#0075de]">
                {cat.name[0]}
              </span>
              <span className="font-hand-display text-[20px] font-bold text-[#31302e] flex-1">{cat.name}</span>
              <span className="font-hand-body text-[14px] text-[#a39e98] tabular-nums">{cat.count} 篇</span>
              <button
                onClick={() => remove.mutate({ id: cat.id })}
                className="font-hand-body text-[14px] text-red-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                删除
              </button>
            </div>
            {cat.children?.map((child) => (
              <div key={child.id} className="flex items-center gap-3 pl-[56px] pr-5 py-3 hover:bg-[#f6f5f4]/60 transition-colors group">
                <span className="font-hand-body text-[14px] text-[#a39e98]">└</span>
                <span className="font-hand-display text-[18px] font-bold text-[#615d59] flex-1">{child.name}</span>
                <span className="font-hand-body text-[14px] text-[#a39e98] tabular-nums">{child.count} 篇</span>
                <button
                  onClick={() => remove.mutate({ id: child.id })}
                  className="font-hand-body text-[14px] text-red-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  删除
                </button>
              </div>
            ))}
          </div>
        ))}
        {!cats?.length && (
          <div className="py-14 text-center font-hand-display text-[22px] font-bold text-[#a39e98]">
            还没有分类，先新增一个吧
          </div>
        )}
      </div>
    </div>
  );
}
