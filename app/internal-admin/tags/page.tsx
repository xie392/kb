"use client";

import { useState } from "react";
import { api } from "@/trpc/client";

const TAG_COLORS = ["#0075de", "#ff64c8", "#62aef0", "#2a9d99", "#dd5b00", "#d6b6f6"];

export default function AdminTagsPage() {
  const utils = api.useUtils();
  const [msg, setMsg] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  const { data: tags } = api.tag.list.useQuery();
  const invalidate = () => utils.tag.list.invalidate();

  const create = api.tag.create.useMutation({
    onSuccess: () => { invalidate(); setNewName(""); show("已新增标签"); },
    onError: (e) => show(e.message),
  });
  const update = api.tag.update.useMutation({
    onSuccess: () => { invalidate(); setEditingId(null); show("已保存标签名称"); },
    onError: (e) => show(e.message),
  });
  const remove = api.tag.delete.useMutation({
    onSuccess: () => { invalidate(); show("已删除标签"); },
    onError: (e) => show(e.message),
  });
  const cleanEmpty = api.tag.cleanEmpty.useMutation({
    onSuccess: (res) => { invalidate(); show(`已清理 ${res.removed} 个空标签`); },
  });

  const show = (text: string) => {
    setMsg(text);
    setTimeout(() => setMsg(null), 2500);
  };

  const startEdit = (id: string, name: string) => {
    setEditingId(id);
    setEditName(name);
  };

  const saveEdit = () => {
    if (!editingId) return;
    const name = editName.trim();
    if (!name) return show("请输入标签名称");
    update.mutate({ id: editingId, name });
  };

  const emptyCount = tags?.filter((t) => t._count.articles === 0).length ?? 0;

  return (
    <div className="p-8 w-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-hand-display text-[32px] font-bold text-[#213183]">标签管理</h2>
          <p className="font-hand-body text-[15px] text-[#a39e98] mt-0.5">
            共 {tags?.length ?? 0} 个标签 · 全局通用
          </p>
        </div>
        <div className="flex items-center gap-2">
          {emptyCount > 0 && (
            <button
              onClick={() => cleanEmpty.mutate()}
              className="h-10 px-4 bg-white sketch-border font-hand-display text-[15px] font-bold text-[#615d59] hover:text-[#0075de] rotate-[0.5deg] hover:rotate-0 transition-transform"
            >
              清理 {emptyCount} 个空标签
            </button>
          )}
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="标签名称"
            className="h-10 px-3 bg-white sketch-border font-hand-body text-[14px] text-[#31302e] placeholder:text-[#a39e98] outline-none"
          />
          <button
            onClick={() => {
              if (!newName.trim()) return;
              create.mutate({ name: newName.trim() });
            }}
            className="h-10 px-4 bg-[#0075de] text-white font-hand-display text-[16px] font-bold sketch-border sketch-shadow rotate-[-1deg] hover:rotate-0 transition-transform"
          >
            ＋ 新增
          </button>
        </div>
      </div>

      {msg && (
        <div className="mb-4 sticky-note sketch-border px-4 py-2 rotate-[-1deg] w-fit fade-up">
          <span className="font-hand-display text-[16px] font-bold text-[#2a9d99]">✓ {msg}</span>
        </div>
      )}

      {/* 标签列表 */}
      <div className="bg-white sketch-border sketch-shadow p-5 fade-up">
        {tags && tags.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {tags.map((tag, i) => (
              <div
                key={tag.id}
                className="flex items-center gap-3 px-4 py-3.5 sketch-dashed hover:bg-[#f6f5f4] transition-colors group"
              >
                <span
                  className="w-8 h-8 grid place-items-center text-white font-hand-display text-[15px] font-bold sketch-border rotate-[-3deg] shrink-0"
                  style={{ backgroundColor: TAG_COLORS[i % TAG_COLORS.length] }}
                >
                  {tag.name[0]}
                </span>
                {editingId === tag.id ? (
                  <>
                    <input
                      autoFocus
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") saveEdit();
                        if (e.key === "Escape") setEditingId(null);
                      }}
                      className="flex-1 h-9 px-3 bg-white sketch-border font-hand-body text-[14px] text-[#31302e] outline-none"
                    />
                    <button
                      onClick={saveEdit}
                      className="font-hand-body text-[13px] text-[#0075de] hover:text-[#005bab] transition-colors"
                    >
                      保存
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="font-hand-body text-[13px] text-[#a39e98] hover:text-[#615d59] transition-colors"
                    >
                      取消
                    </button>
                  </>
                ) : (
                  <>
                    <div className="flex-1 min-w-0">
                      <div className="font-hand-display text-[17px] font-bold text-[#31302e] truncate">#{tag.name}</div>
                      <div className="font-hand-body text-[12px] text-[#a39e98] tabular-nums">
                        {tag._count.articles} 篇笔记
                      </div>
                    </div>
                    <button
                      onClick={() => startEdit(tag.id, tag.name)}
                      className="font-hand-body text-[13px] text-[#a39e98] hover:text-[#0075de] opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      编辑
                    </button>
                    <button
                      onClick={() => remove.mutate({ id: tag.id })}
                      className="font-hand-body text-[13px] text-red-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      删除
                    </button>
                  </>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="py-14 text-center font-hand-display text-[22px] font-bold text-[#a39e98]">
            还没有标签，先新增一个吧
          </div>
        )}
      </div>
    </div>
  );
}
