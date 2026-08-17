"use client";

import { useState } from "react";
import Link from "next/link";
import { api } from "@/trpc/client";
import { formatDate } from "@/lib/format";
import { ADMIN_HOME } from "@/lib/config";

type StatusFilter = "normal" | "trash";
type Row = {
  id: string;
  title: string;
  categoryName: string | null;
  tagNames: string[];
  visibility: string;
  isPinned: boolean;
  updatedAt: string;
};

const statusTabs: { id: StatusFilter; label: string }[] = [
  { id: "normal", label: "正常" },
  { id: "trash", label: "回收站" },
];

export default function AdminArticlesPage() {
  const [filter, setFilter] = useState<StatusFilter>("normal");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [visibilityUpdatingId, setVisibilityUpdatingId] = useState<string | null>(null);

  const { data, isFetching } = api.article.list.useQuery({
    status: filter,
    page: 1,
    pageSize: 100,
  });
  const rows: Row[] = (data?.items ?? []).map((a) => ({
    ...a,
    updatedAt: String(a.updatedAt),
  }));

  const utils = api.useUtils();
  const invalidate = () => utils.article.list.invalidate();

  const softDelete = api.article.softDelete.useMutation({
    onSuccess: () => {
      setSelected(new Set());
      invalidate();
    },
  });
  const restore = api.article.restore.useMutation({ onSuccess: () => { setSelected(new Set()); invalidate(); } });
  const hardDelete = api.article.hardDelete.useMutation({ onSuccess: () => { setSelected(new Set()); invalidate(); } });
  const batch = api.article.batch.useMutation({ onSuccess: () => { setSelected(new Set()); invalidate(); } });
  const updateVisibility = api.article.batch.useMutation({
    onMutate: ({ ids }) => setVisibilityUpdatingId(ids[0] ?? null),
    onSuccess: invalidate,
    onSettled: () => setVisibilityUpdatingId(null),
  });

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };
  const toggleAll = () => {
    setSelected((prev) => (prev.size === rows.length ? new Set() : new Set(rows.map((a) => a.id))));
  };
  const hasSelection = selected.size > 0;
  const selectedIds = [...selected];

  return (
    <div className="p-8 w-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-hand-display text-[32px] font-bold text-[#213183]">文章管理</h2>
          <p className="font-hand-body text-[15px] text-[#a39e98] mt-0.5">
            共 {data?.total ?? 0} 篇{isFetching ? "（加载中…）" : ""}
          </p>
        </div>
        <Link
          href={`${ADMIN_HOME}/articles/new`}
          className="h-10 px-4 bg-[#0075de] text-white font-hand-display text-[17px] font-bold sketch-border sketch-shadow rotate-[-1deg] hover:rotate-0 transition-transform"
        >
          ＋ 新增文章
        </Link>
      </div>

      {/* 状态筛选 */}
      <div className="flex items-center gap-1 mb-4">
        {statusTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={`font-hand-display text-[17px] px-4 py-1.5 transition-colors ${
              filter === tab.id
                ? "bg-white sketch-border sketch-shadow text-[#0075de] font-bold"
                : "text-[#615d59] hover:text-[#0075de]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 批量操作栏 */}
      {hasSelection && (
        <div className="flex items-center gap-3 mb-4 bg-white sketch-border sketch-shadow px-4 py-2.5 fade-up">
          <span className="font-hand-display text-[15px] font-bold text-[#0075de]">
            已选 {selected.size} 项
          </span>
          <span className="w-px h-5 bg-[#e6e6e6]" />
          {filter === "normal" ? (
            <>
              <button onClick={() => batch.mutate({ ids: selectedIds, isPinned: true })} className="font-hand-body text-[14px] text-[#615d59] hover:text-[#0075de]">
                批量置顶
              </button>
              <button onClick={() => batch.mutate({ ids: selectedIds, visibility: "public" })} className="font-hand-body text-[14px] text-[#615d59] hover:text-[#0075de]">
                批量公开
              </button>
              <button onClick={() => batch.mutate({ ids: selectedIds, visibility: "private" })} className="font-hand-body text-[14px] text-[#615d59] hover:text-[#0075de]">
                批量私有
              </button>
              <button onClick={() => softDelete.mutate({ ids: selectedIds })} className="font-hand-body text-[14px] text-red-400 hover:text-red-500">
                移入回收站
              </button>
            </>
          ) : (
            <>
              <button onClick={() => restore.mutate({ ids: selectedIds })} className="font-hand-body text-[14px] text-[#2a9d99] hover:underline">
                批量恢复
              </button>
              <button onClick={() => hardDelete.mutate({ ids: selectedIds })} className="font-hand-body text-[14px] text-red-400 hover:text-red-500">
                永久删除
              </button>
            </>
          )}
        </div>
      )}

      {/* 文章表格 */}
      <div className="bg-white sketch-border sketch-shadow overflow-hidden fade-up">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-[#f6f5f4] border-b-2 border-dashed border-[#e6e6e6]">
              <th className="w-10 px-4 py-3">
                <input type="checkbox" checked={selected.size === rows.length && rows.length > 0} onChange={toggleAll} className="w-4 h-4 accent-[#0075de] cursor-pointer" />
              </th>
              <th className="px-3 py-3 font-hand-display text-[14px] font-bold text-[#615d59]">标题</th>
              <th className="px-3 py-3 font-hand-display text-[14px] font-bold text-[#615d59]">分类</th>
              <th className="px-3 py-3 font-hand-display text-[14px] font-bold text-[#615d59]">标签</th>
              <th className="px-3 py-3 font-hand-display text-[14px] font-bold text-[#615d59]">权限</th>
              <th className="px-3 py-3 font-hand-display text-[14px] font-bold text-[#615d59]">更新时间</th>
              <th className="px-4 py-3 text-right font-hand-display text-[14px] font-bold text-[#615d59]">操作</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((a) => (
              <tr key={a.id} className="border-b border-dashed border-[#e6e6e6] last:border-0 hover:bg-[#f6f5f4]/60 transition-colors">
                <td className="px-4 py-3.5">
                  <input type="checkbox" checked={selected.has(a.id)} onChange={() => toggleSelect(a.id)} className="w-4 h-4 accent-[#0075de] cursor-pointer" />
                </td>
                <td className="px-3 py-3.5">
                  <div className="flex items-center gap-2">
                    {a.isPinned && <span className="text-[#0075de]">★</span>}
                    <span className="font-hand-display text-[17px] font-bold text-[#31302e] truncate max-w-[240px]">
                      {a.title}
                    </span>
                  </div>
                </td>
                <td className="px-3 py-3.5 font-hand-body text-[14px] text-[#ff64c8]">
                  {a.categoryName ?? "未分类"}
                </td>
                <td className="px-3 py-3.5">
                  <div className="flex items-center gap-1 flex-wrap max-w-[140px]">
                    {a.tagNames.slice(0, 2).map((t) => (
                      <span key={t} className="font-hand-body text-[12px] text-[#a39e98]">#{t}</span>
                    ))}
                    {a.tagNames.length > 2 && <span className="font-hand-body text-[12px] text-[#a39e98]">+{a.tagNames.length - 2}</span>}
                  </div>
                </td>
                <td className="px-3 py-3.5">
                  <select
                    value={a.visibility}
                    disabled={visibilityUpdatingId === a.id}
                    onChange={(e) =>
                      updateVisibility.mutate({
                        ids: [a.id],
                        visibility: e.target.value as "private" | "public",
                      })
                    }
                    className={`font-hand-body text-[13px] bg-transparent border border-dashed rounded px-1.5 py-0.5 cursor-pointer outline-none transition-colors ${
                      a.visibility === "public"
                        ? "text-[#0075de] border-[#0075de]/40 hover:border-[#0075de]"
                        : "text-[#a39e98] border-[#e6e6e6] hover:border-[#a39e98]"
                    } disabled:opacity-50 disabled:cursor-wait`}
                  >
                    <option value="private">私有</option>
                    <option value="public">公开</option>
                  </select>
                </td>
                <td className="px-3 py-3.5 font-hand-body text-[13px] text-[#a39e98] whitespace-nowrap">
                  {formatDate(a.updatedAt)}
                </td>
                <td className="px-4 py-3.5">
                  <div className="flex items-center justify-end gap-2">
                    {filter === "normal" ? (
                      <>
                        <Link href={`${ADMIN_HOME}/articles/${a.id}/edit`} className="font-hand-body text-[13px] text-[#615d59] hover:text-[#0075de]">
                          编辑
                        </Link>
                        <button onClick={() => batch.mutate({ ids: [a.id], isPinned: !a.isPinned })} className="font-hand-body text-[13px] text-[#615d59] hover:text-[#0075de]">
                          {a.isPinned ? "取消置顶" : "置顶"}
                        </button>
                        <button onClick={() => softDelete.mutate({ ids: [a.id] })} className="font-hand-body text-[13px] text-red-400 hover:text-red-500">
                          删除
                        </button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => restore.mutate({ ids: [a.id] })} className="font-hand-body text-[13px] text-[#2a9d99] hover:underline">
                          恢复
                        </button>
                        <button onClick={() => hardDelete.mutate({ ids: [a.id] })} className="font-hand-body text-[13px] text-red-400 hover:text-red-500">
                          永久删除
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {rows.length === 0 && !isFetching && (
              <tr>
                <td colSpan={7} className="px-4 py-14 text-center">
                  <div className="font-hand-display text-[22px] font-bold text-[#a39e98] rotate-[-1deg]">
                    暂无{filter === "trash" ? "回收站" : ""}文章
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
