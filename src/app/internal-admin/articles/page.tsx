"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { api } from "@/trpc/client";
import { formatDate } from "@/lib/format";
import { ADMIN_HOME } from "@/lib/config";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

const visibilityLabel: Record<string, string> = {
  public: "公开",
  private: "私有",
};

const PAGE_SIZE = 20;

export default function AdminArticlesPage() {
  const [filter, setFilter] = useState<StatusFilter>("normal");
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [keyword, setKeyword] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [visibilityUpdatingId, setVisibilityUpdatingId] = useState<string | null>(null);
  const [pendingHardDelete, setPendingHardDelete] = useState<string[] | null>(null);

  // 搜索防抖
  useEffect(() => {
    const timer = setTimeout(() => {
      setKeyword(searchInput);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const { data, isFetching } = api.article.list.useQuery({
    status: filter,
    page,
    pageSize: PAGE_SIZE,
    keyword: keyword || undefined,
  });
  const rows: Row[] = (data?.items ?? []).map((a) => ({
    ...a,
    updatedAt: String(a.updatedAt),
  }));
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

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
          <h2 className="font-hand-display text-[32px] font-bold text-secondary">文章管理</h2>
          <p className="font-hand-body text-[15px] text-ink-faint mt-0.5">
            共 {data?.total ?? 0} 篇{isFetching ? "（加载中…）" : ""}
          </p>
        </div>
        <Button
          render={<Link href={`${ADMIN_HOME}/articles/new`} />}
          className="h-10 px-4 text-[17px] font-bold rotate-[-1deg]"
        >
          ＋ 新增文章
        </Button>
      </div>

      {/* 状态筛选 */}
      <div className="flex items-center gap-1 mb-4">
        {statusTabs.map((tab) => (
          <Button
            key={tab.id}
            onClick={() => {
              setFilter(tab.id);
              setPage(1);
              setSelected(new Set());
            }}
            variant={filter === tab.id ? "outline" : "ghost"}
            className={`px-4 text-[17px] font-hand-display ${
              filter === tab.id
                ? "text-primary font-bold"
                : "text-ink-muted hover:text-primary"
            }`}
          >
            {tab.label}
          </Button>
        ))}
      </div>

      {/* 搜索框 */}
      <div className="mb-4">
        <Input
          type="search"
          placeholder="搜索文章标题..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="max-w-sm h-10 font-hand-body text-[15px]"
        />
      </div>

      {/* 批量操作栏 */}
      {hasSelection && (
        <div className="flex items-center gap-3 mb-4 bg-white sketch-border sketch-shadow px-4 py-2.5 fade-up">
          <span className="font-hand-display text-[15px] font-bold text-primary">
            已选 {selected.size} 项
          </span>
          <span className="w-px h-5 bg-hairline" />
          {filter === "normal" ? (
            <>
              <Button onClick={() => batch.mutate({ ids: selectedIds, isPinned: true })} variant="ghost" className="px-1.5 h-auto text-[14px] text-ink-muted">
                批量置顶
              </Button>
              <Button onClick={() => batch.mutate({ ids: selectedIds, visibility: "public" })} variant="ghost" className="px-1.5 h-auto text-[14px] text-ink-muted">
                批量公开
              </Button>
              <Button onClick={() => batch.mutate({ ids: selectedIds, visibility: "private" })} variant="ghost" className="px-1.5 h-auto text-[14px] text-ink-muted">
                批量私有
              </Button>
              <Button onClick={() => softDelete.mutate({ ids: selectedIds })} variant="ghost" className="px-1.5 h-auto text-[14px] text-red-400 hover:text-red-500">
                移入回收站
              </Button>
            </>
          ) : (
            <>
              <Button onClick={() => restore.mutate({ ids: selectedIds })} variant="ghost" className="px-1.5 h-auto text-[14px] text-sticker-teal hover:underline">
                批量恢复
              </Button>
              <Button onClick={() => setPendingHardDelete(selectedIds)} variant="ghost" className="px-1.5 h-auto text-[14px] text-red-400 hover:text-red-500">
                永久删除
              </Button>
            </>
          )}
        </div>
      )}

      {/* 文章表格 */}
      <div className="bg-white sketch-border sketch-shadow overflow-hidden fade-up">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-canvas-soft border-b-2 border-dashed border-hairline">
              <th className="w-10 px-4 py-3">
                <Checkbox
                  checked={selected.size === rows.length && rows.length > 0}
                  onCheckedChange={toggleAll}
                  className="cursor-pointer"
                  aria-label="全选"
                />
              </th>
              <th className="px-3 py-3 font-hand-display text-[14px] font-bold text-ink-muted">标题</th>
              <th className="px-3 py-3 font-hand-display text-[14px] font-bold text-ink-muted">分类</th>
              <th className="px-3 py-3 font-hand-display text-[14px] font-bold text-ink-muted">标签</th>
              <th className="px-3 py-3 font-hand-display text-[14px] font-bold text-ink-muted">权限</th>
              <th className="px-3 py-3 font-hand-display text-[14px] font-bold text-ink-muted">更新时间</th>
              <th className="px-4 py-3 text-right font-hand-display text-[14px] font-bold text-ink-muted">操作</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((a) => (
              <tr key={a.id} className="border-b border-dashed border-hairline last:border-0 hover:bg-canvas-soft/60 transition-colors">
                <td className="px-4 py-3.5">
                  <Checkbox
                    checked={selected.has(a.id)}
                    onCheckedChange={() => toggleSelect(a.id)}
                    className="cursor-pointer"
                    aria-label={`选择 ${a.title}`}
                  />
                </td>
                <td className="px-3 py-3.5">
                  <div className="flex items-center gap-2">
                    {a.isPinned && <span className="text-primary">★</span>}
                    <Link
                      href={`/article/${a.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-hand-display text-[17px] font-bold text-ink-secondary truncate max-w-60 hover:text-primary hover:underline transition-colors"
                      title={a.title}
                    >
                      {a.title}
                    </Link>
                  </div>
                </td>
                <td className="px-3 py-3.5 font-hand-body text-[14px] text-sticker-pink">
                  {a.categoryName ?? "未分类"}
                </td>
                <td className="px-3 py-3.5">
                  <div className="flex items-center gap-1 flex-wrap max-w-35">
                    {a.tagNames.slice(0, 2).map((t) => (
                      <span key={t} className="font-hand-body text-[12px] text-ink-faint">#{t}</span>
                    ))}
                    {a.tagNames.length > 2 && <span className="font-hand-body text-[12px] text-ink-faint">+{a.tagNames.length - 2}</span>}
                  </div>
                </td>
                <td className="px-3 py-3.5">
                  <Select
                    value={a.visibility}
                    disabled={visibilityUpdatingId === a.id}
                    onValueChange={(v) => {
                      if (v) updateVisibility.mutate({ ids: [a.id], visibility: v as "private" | "public" });
                    }}
                  >
                    <SelectTrigger
                      size="sm"
                      className={`px-1.5 text-[13px] ${
                        a.visibility === "public"
                          ? "text-primary"
                          : "text-ink-faint"
                      } disabled:opacity-50 disabled:cursor-wait`}
                    >
                      <span>{visibilityLabel[a.visibility]}</span>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="private">私有</SelectItem>
                      <SelectItem value="public">公开</SelectItem>
                    </SelectContent>
                  </Select>
                </td>
                <td className="px-3 py-3.5 font-hand-body text-[13px] text-ink-faint whitespace-nowrap">
                  {formatDate(a.updatedAt)}
                </td>
                <td className="px-4 py-3.5">
                  <div className="flex items-center justify-end gap-2">
                    {filter === "normal" ? (
                      <>
                        <Button
                          render={<Link href={`${ADMIN_HOME}/articles/${a.id}/edit`} />}
                          variant="ghost"
                          className="px-1.5 h-auto text-[13px] text-ink-muted"
                        >
                          编辑
                        </Button>
                        <Button onClick={() => batch.mutate({ ids: [a.id], isPinned: !a.isPinned })} variant="ghost" className="px-1.5 h-auto text-[13px] text-ink-muted">
                          {a.isPinned ? "取消置顶" : "置顶"}
                        </Button>
                        <Button onClick={() => softDelete.mutate({ ids: [a.id] })} variant="ghost" className="px-1.5 h-auto text-[13px] text-red-400 hover:text-red-500">
                          删除
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button onClick={() => restore.mutate({ ids: [a.id] })} variant="ghost" className="px-1.5 h-auto text-[13px] text-sticker-teal hover:underline">
                          恢复
                        </Button>
                        <Button onClick={() => setPendingHardDelete([a.id])} variant="ghost" className="px-1.5 h-auto text-[13px] text-red-400 hover:text-red-500">
                          永久删除
                        </Button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {rows.length === 0 && !isFetching && (
              <tr>
                <td colSpan={7} className="px-4 py-14 text-center">
                  <div className="font-hand-display text-[22px] font-bold text-ink-faint rotate-[-1deg]">
                    暂无{filter === "trash" ? "回收站" : ""}文章
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 分页 */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 px-1">
          <span className="font-hand-body text-[13px] text-ink-faint">
            共 {total} 篇，第 {page} / {totalPages} 页
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              disabled={page <= 1 || isFetching}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="h-8 px-3 text-[13px] font-hand-body"
            >
              上一页
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
              .map((p, idx, arr) => (
                <span key={p} className="flex items-center">
                  {idx > 0 && arr[idx - 1] !== p - 1 && (
                    <span className="px-1 text-ink-faint">…</span>
                  )}
                  <Button
                    variant={p === page ? "outline" : "ghost"}
                    size="sm"
                    disabled={isFetching}
                    onClick={() => setPage(p)}
                    className={`h-8 w-8 p-0 text-[13px] font-hand-body ${
                      p === page ? "text-primary font-bold" : "text-ink-muted"
                    }`}
                  >
                    {p}
                  </Button>
                </span>
              ))}
            <Button
              variant="ghost"
              size="sm"
              disabled={page >= totalPages || isFetching}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="h-8 px-3 text-[13px] font-hand-body"
            >
              下一页
            </Button>
          </div>
        </div>
      )}

      <AlertDialog
        open={pendingHardDelete !== null}
        onOpenChange={(open) => {
          if (!open) setPendingHardDelete(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-hand-display text-[18px] font-bold text-ink-secondary">
              确认永久删除？
            </AlertDialogTitle>
            <AlertDialogDescription className="text-[13px] text-ink-muted">
              {pendingHardDelete && pendingHardDelete.length > 1
                ? `将永久删除 ${pendingHardDelete.length} 篇文章，删除后不可恢复。`
                : "删除后不可恢复，确定要永久删除这篇文章吗？"}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel variant="ghost" className="text-[14px] text-ink-muted hover:text-ink-secondary">
              取消
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              className="text-[14px] font-bold"
              onClick={() => {
                if (pendingHardDelete) hardDelete.mutate({ ids: pendingHardDelete });
                setPendingHardDelete(null);
              }}
            >
              永久删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
