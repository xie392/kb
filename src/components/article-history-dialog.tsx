"use client";

import { useState } from "react";
import { api } from "@/trpc/client";
import { formatDate } from "@/lib/format";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { History, RotateCcw } from "lucide-react";
import { toast } from "sonner";

interface Props {
  articleId: string;
  /** 回滚成功后回填标题/正文/摘要到编辑器 */
  onRestored: (data: { title: string; content: string; summary: string }) => void;
}

/** 文章历史版本：查看最近 30 版并可一键回滚（当前版本会自动备份，可再回滚） */
export default function ArticleHistoryDialog({ articleId, onRestored }: Props) {
  const [open, setOpen] = useState(false);
  const utils = api.useUtils();

  const { data, isFetching } = api.article.revisions.useQuery(
    { id: articleId },
    { enabled: open },
  );

  const restore = api.article.restoreRevision.useMutation({
    onSuccess: (updated) => {
      toast.success("已回滚到该版本");
      onRestored({ title: updated.title, content: updated.content, summary: updated.summary ?? "" });
      utils.article.revisions.invalidate({ id: articleId });
      setOpen(false);
    },
    onError: (e) => toast.error(`回滚失败：${e.message}`),
  });

  const items = data?.items ?? [];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="ghost" size="icon" aria-label="历史版本" className="text-ink-muted hover:text-ink-secondary">
            <History className="w-4 h-4" />
          </Button>
        }
      />
      <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>历史版本</DialogTitle>
          <DialogDescription>
            每次保存前自动留存上一版，最多保留 30 版。回滚会先把你当前的版本存为新的一版。
          </DialogDescription>
        </DialogHeader>

        {isFetching ? (
          <div className="py-8 text-center font-hand-body text-[14px] text-ink-faint">加载中…</div>
        ) : items.length === 0 ? (
          <div className="py-8 text-center font-hand-display text-[18px] text-ink-faint rotate-[-1deg]">
            还没有历史版本
          </div>
        ) : (
          <ul className="list-none space-y-2">
            {items.map((r) => (
              <li
                key={r.id}
                className="flex items-start gap-3 px-3 py-2 sketch-border bg-canvas-soft/40"
              >
                <div className="min-w-0 flex-1">
                  <div className="font-hand-body text-[12px] text-ink-faint">
                    {formatDate(String(r.createdAt))}
                  </div>
                  <div className="mt-0.5 font-hand-display text-[16px] font-bold text-ink-secondary line-clamp-1">
                    {r.title}
                  </div>
                  {r.preview && (
                    <div className="mt-0.5 font-hand-body text-[13px] text-ink-muted line-clamp-2">
                      {r.preview}…
                    </div>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={restore.isPending}
                  onClick={() => restore.mutate({ revisionId: r.id })}
                  className="shrink-0 gap-1 text-[13px]"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  回滚
                </Button>
              </li>
            ))}
          </ul>
        )}
      </DialogContent>
    </Dialog>
  );
}
