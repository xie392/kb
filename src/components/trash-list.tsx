"use client";

import { useState } from "react";
import { api } from "@/trpc/client";
import { formatDate } from "@/lib/format";
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

export default function TrashList({ initial }: { initial: { id: string; title: string; updatedAt: string }[] }) {
  const utils = api.useUtils();
  const [items, setItems] = useState(initial);
  const [msg, setMsg] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const restore = api.article.restore.useMutation({
    onSuccess: async (_, vars) => {
      setItems((prev) => prev.filter((a) => !vars.ids.includes(a.id)));
      await utils.article.list.invalidate();
      showMsg("已恢复");
    },
  });
  const hardDelete = api.article.hardDelete.useMutation({
    onSuccess: async (_, vars) => {
      setItems((prev) => prev.filter((a) => !vars.ids.includes(a.id)));
      await utils.article.list.invalidate();
      showMsg("已永久删除");
    },
  });

  const showMsg = (m: string) => {
    setMsg(m);
    setTimeout(() => setMsg(null), 2000);
  };

  return (
    <div>
      {msg && (
        <div aria-live="polite" className="mb-4 sticky-note sketch-border px-4 py-2 rotate-[-1deg] w-fit fade-up">
          <span className="font-hand-display text-[16px] font-bold text-sticker-teal">✓ {msg}</span>
        </div>
      )}
      <div className="bg-white sketch-border sketch-shadow divide-y divide-dashed divide-hairline">
        {items.length > 0 ? (
          items.map((article, i) => (
            <div
              key={article.id}
              className="flex items-center gap-3 sm:gap-4 py-4 px-4 sm:px-5 fade-up opacity-70"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <svg className="w-4 h-4 text-ink-faint shrink-0" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M3.5 4.5h9M6.5 4.5V3.5A1 1 0 0 1 7.5 2.5h1a1 1 0 0 1 1 1v1m-5 0l.5 9a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1l.5-9" />
              </svg>
              <span className="hidden sm:inline font-hand-body text-[14px] text-ink-faint tabular-nums w-20 shrink-0">
                {formatDate(article.updatedAt)}
              </span>
              <span className="font-hand-body text-[16px] text-ink-muted line-through truncate flex-1">
                {article.title}
              </span>
              <Button
                onClick={() => restore.mutate({ ids: [article.id] })}
                variant="ghost"
                className="px-1.5 h-auto text-[15px] font-hand-display text-primary hover:underline shrink-0"
              >
                恢复
              </Button>
              <Button
                onClick={() => setConfirmId(article.id)}
                variant="ghost"
                className="px-1.5 h-auto text-[15px] font-hand-display text-red-400 hover:underline shrink-0"
              >
                永久删除
              </Button>
            </div>
          ))
        ) : (
          <div className="py-16 text-center">
            <div className="mx-auto w-14 h-14 rounded-full bg-white sketch-border sketch-shadow grid place-items-center mb-4 rotate-[-4deg]">
              <svg className="w-6 h-6 text-ink-faint" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M4 6h12M8 6V4.5A1.5 1.5 0 0 1 9.5 3h1A1.5 1.5 0 0 1 12 4.5V6m-7 0l.6 10a1.5 1.5 0 0 0 1.5 1.4h5.8a1.5 1.5 0 0 0 1.5-1.4L15 6" />
              </svg>
            </div>
            <div className="font-hand-display text-[24px] font-bold text-ink-faint rotate-[-1deg]">
              回收站是空的
            </div>
            <p className="mt-2 font-hand-body text-[14px] text-ink-faint">
              删除的笔记会暂时保留在这里，随时可以恢复
            </p>
          </div>
        )}
      </div>

      <AlertDialog
        open={confirmId !== null}
        onOpenChange={(open) => {
          if (!open) setConfirmId(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-hand-display text-[18px] font-bold text-ink-secondary">
              确认永久删除？
            </AlertDialogTitle>
            <AlertDialogDescription className="text-[13px] text-ink-muted">
              删除后不可恢复，确定要永久删除这篇笔记吗？
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
                if (confirmId) hardDelete.mutate({ ids: [confirmId] });
                setConfirmId(null);
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
