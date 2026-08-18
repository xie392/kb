"use client";

import { useState } from "react";
import { api } from "@/trpc/client";
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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function AdminCategoriesPage() {
  const utils = api.useUtils();
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [newName, setNewName] = useState("");
  const [newParent, setNewParent] = useState<string>("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<NonNullable<typeof cats>[number] | null>(null);

  const { data: cats } = api.category.tree.useQuery();
  const invalidate = () => utils.category.tree.invalidate();

  const create = api.category.create.useMutation({
    onSuccess: () => { invalidate(); setNewName(""); show("已新增分类", "ok"); },
    onError: (e) => show(e.message, "err"),
  });
  const update = api.category.update.useMutation({
    onSuccess: () => { invalidate(); setEditingId(null); show("已保存分类名称", "ok"); },
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

  const startEdit = (c: NonNullable<typeof cats>[number]) => {
    setEditingId(c.id);
    setEditName(c.name);
  };

  const saveEdit = () => {
    if (!editingId) return;
    const name = editName.trim();
    if (!name) return show("请输入分类名称", "err");
    update.mutate({ id: editingId, name });
  };

  const confirmDelete = (c: NonNullable<typeof cats>[number]) => setDeleteTarget(c);

  // 扁平化所有分类（含任意层级子分类），用于"作为 X 的子分类"下拉
  const flatOptions: { id: string; label: string }[] = [];
  const walk = (list: typeof cats, depth: number) => {
    list?.forEach((c) => {
      flatOptions.push({ id: c.id, label: `${"　".repeat(depth)}${c.name}` });
      if (c.children) walk(c.children, depth + 1);
    });
  };
  walk(cats, 0);

  // 递归渲染分类树（任意层级）
  const renderNode = (c: NonNullable<typeof cats>[number], depth: number): React.ReactNode => (
    <div key={c.id}>
      <div
        className="flex items-center gap-3 hover:bg-canvas-soft/60 transition-colors group"
        style={{ paddingLeft: 20 + depth * 36, paddingTop: depth === 0 ? 16 : 12, paddingBottom: depth === 0 ? 16 : 12, paddingRight: 20 }}
      >
        {depth === 0 ? (
          <span className="w-8 h-8 grid place-items-center text-white font-hand-display text-[15px] font-bold sketch-border rotate-[-3deg] bg-primary shrink-0">
            {c.name[0]}
          </span>
        ) : (
          <span className="font-hand-body text-[14px] text-ink-faint w-5 shrink-0">└</span>
        )}
        {editingId === c.id ? (
          <>
            <Input
              autoFocus
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") saveEdit();
                if (e.key === "Escape") setEditingId(null);
              }}
              className="flex-1 h-9"
            />
            <Button
              onClick={saveEdit}
              variant="ghost"
              className="px-1.5 h-auto text-[14px] text-primary"
            >
              保存
            </Button>
            <Button
              onClick={() => setEditingId(null)}
              variant="ghost"
              className="px-1.5 h-auto text-[14px] text-ink-faint"
            >
              取消
            </Button>
          </>
        ) : (
          <>
            <span
              className={`font-hand-display font-bold flex-1 truncate ${depth === 0 ? "text-[20px] text-ink-secondary" : "text-[17px] text-ink-muted"}`}
            >
              {c.name}
            </span>
            <span className="font-hand-body text-[14px] text-ink-faint tabular-nums shrink-0">{c.count} 篇</span>
            <Button
              onClick={() => startEdit(c)}
              variant="ghost"
              className="px-1.5 h-auto text-[14px] text-ink-faint opacity-0 group-hover:opacity-100"
            >
              编辑
            </Button>
            <Button
              onClick={() => confirmDelete(c)}
              variant="ghost"
              className="px-1.5 h-auto text-[14px] text-red-400 hover:text-red-500 opacity-0 group-hover:opacity-100"
            >
              删除
            </Button>
          </>
        )}
      </div>
      {c.children?.map((child) => renderNode(child, depth + 1))}
    </div>
  );

  return (
    <div className="p-8 w-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-hand-display text-[32px] font-bold text-secondary">分类管理</h2>
          <p className="font-hand-body text-[15px] text-ink-faint mt-0.5">管理分类层级结构与排序</p>
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={newParent}
            onValueChange={(v) => setNewParent(v ?? "")}
          >
            <SelectTrigger className="data-[size=default]:h-10 px-3 text-[14px] text-ink-secondary">
              <SelectValue placeholder="作为一级分类" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">作为一级分类</SelectItem>
              {flatOptions.map((c) => (
                <SelectItem key={c.id} value={c.id}>作为 {c.label} 的子分类</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="分类名称"
            className="h-10 w-36"
          />
          <Button
            onClick={() => {
              if (!newName.trim()) return show("请输入分类名称", "err");
              create.mutate({ name: newName.trim(), parentId: newParent || null });
            }}
            className="h-10 px-4 text-[16px] font-bold rotate-[-1deg]"
          >
            ＋ 新增
          </Button>
        </div>
      </div>

      {msg && (
        <div className={`mb-4 sticky-note sketch-border px-4 py-2 rotate-[-1deg] w-fit fade-up`}>
          <span className={`font-hand-display text-[16px] font-bold ${msg.type === "ok" ? "text-sticker-teal" : "text-red-500"}`}>
            {msg.type === "ok" ? "✓" : "✗"} {msg.text}
          </span>
        </div>
      )}

      {/* 分类树 */}
      <div className="bg-white sketch-border sketch-shadow divide-y divide-dashed divide-hairline fade-up">
        {cats?.map((cat) => renderNode(cat, 0))}
        {!cats?.length && (
          <div className="py-14 text-center font-hand-display text-[22px] font-bold text-ink-faint">
            还没有分类，先新增一个吧
          </div>
        )}
      </div>

      {/* 删除确认弹窗 */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-hand-display text-[18px] font-bold text-ink-secondary">
              删除分类
            </AlertDialogTitle>
            <AlertDialogDescription className="text-[13px] text-ink-muted">
              {deleteTarget &&
                (deleteTarget.count > 0 ? (
                  <>
                    分类「<span className="font-semibold text-ink-secondary">{deleteTarget.name}</span>」
                    下有{" "}
                    <span className="font-semibold text-red-500">{deleteTarget.count}</span>{" "}
                    篇文章，请先删除该分类下的文章后再删除该分类。
                  </>
                ) : (
                  <>
                    确定删除分类「
                    <span className="font-semibold text-ink-secondary">{deleteTarget.name}</span>
                    」吗？该分类下没有文章，删除后不可恢复。
                  </>
                ))}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel variant="outline" className="text-ink-muted">
              取消
            </AlertDialogCancel>
            {deleteTarget && deleteTarget.count === 0 && (
              <AlertDialogAction
                variant="destructive"
                onClick={() => {
                  remove.mutate({ id: deleteTarget.id });
                  setDeleteTarget(null);
                }}
              >
                删除
              </AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
