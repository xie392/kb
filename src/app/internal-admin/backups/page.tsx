"use client";

import { useEffect, useState } from "react";
import { api } from "@/trpc/client";
import { formatBytes } from "@/lib/format";
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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Row = { name: string; createdAt: string; size: number };

const PAGE_SIZE = 20;
const EVERY_DAYS_OPTIONS = [
  { value: "1", label: "每天" },
  { value: "2", label: "每 2 天" },
  { value: "3", label: "每 3 天" },
  { value: "7", label: "每周" },
];

function formatTime(iso: string): string {
  return new Date(iso).toLocaleString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

export default function AdminBackupsPage() {
  const utils = api.useUtils();
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [keyword, setKeyword] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [page, setPage] = useState(1);

  // 恢复 / 删除目标
  const [restoreTarget, setRestoreTarget] = useState<Row | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Row | null>(null);

  // 自动备份计划
  const { data: schedule } = api.backup.getSchedule.useQuery();
  const [enabled, setEnabled] = useState(false);
  const [time, setTime] = useState("02:00");
  const [everyDays, setEveryDays] = useState("1");
  useEffect(() => {
    if (schedule) {
      setEnabled(schedule.enabled);
      setTime(schedule.time);
      setEveryDays(String(schedule.everyDays));
    }
  }, [schedule]);

  const { data, isFetching } = api.backup.list.useQuery({
    keyword: searchKeyword,
    page,
    pageSize: PAGE_SIZE,
  });
  const rows: Row[] = data?.items ?? [];
  const invalidate = () => utils.backup.list.invalidate();

  const show = (text: string, type: "ok" | "err" = "ok") => {
    setMsg({ type, text });
    setTimeout(() => setMsg(null), 2500);
  };

  const create = api.backup.create.useMutation({
    onSuccess: () => {
      invalidate();
      show("备份已创建", "ok");
    },
    onError: (e) => show(e.message, "err"),
  });

  const download = async (row: Row) => {
    const data = await utils.backup.download.fetch({ name: row.name });
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = row.name;
    a.click();
    URL.revokeObjectURL(url);
    show("已开始下载", "ok");
  };

  const restore = api.backup.restore.useMutation({
    onSuccess: () => {
      invalidate();
      setRestoreTarget(null);
      show("已恢复到所选备份", "ok");
    },
    onError: (e) => {
      setRestoreTarget(null);
      show(e.message, "err");
    },
  });

  const remove = api.backup.delete.useMutation({
    onSuccess: () => {
      invalidate();
      setDeleteTarget(null);
      show("已删除备份", "ok");
    },
    onError: (e) => {
      setDeleteTarget(null);
      show(e.message, "err");
    },
  });

  const saveSchedule = api.backup.updateSchedule.useMutation({
    onSuccess: () => {
      utils.backup.getSchedule.invalidate();
      show("自动备份计划已保存", "ok");
    },
    onError: (e) => show(e.message, "err"),
  });

  const doSaveSchedule = () => {
    saveSchedule.mutate({
      enabled,
      time,
      everyDays: Number(everyDays),
    });
  };

  const totalPages = Math.max(1, Math.ceil((data?.total ?? 0) / PAGE_SIZE));

  return (
    <div className="p-8 w-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-hand-display text-[32px] font-bold text-secondary">备份管理</h2>
          <p className="font-hand-body text-[15px] text-ink-faint mt-0.5">
            全量 JSON 数据备份 · 不包含账号与附件文件（附件保留在存储目录）
          </p>
        </div>
        <Button
          onClick={() => create.mutate()}
          disabled={create.isPending}
          className="h-10 px-4 text-[17px] font-bold rotate-[-1deg]"
        >
          {create.isPending ? "备份中…" : "＋ 立即备份"}
        </Button>
      </div>

      {msg && (
        <div className="mb-4 sticky-note sketch-border px-4 py-2 rotate-[-1deg] w-fit fade-up">
          <span className={`font-hand-display text-[16px] font-bold ${msg.type === "ok" ? "text-sticker-teal" : "text-red-500"}`}>
            {msg.type === "ok" ? "✓" : "✗"} {msg.text}
          </span>
        </div>
      )}

      {/* 自动备份计划 */}
      <section className="bg-white sketch-border sketch-shadow p-6 mb-5 fade-up">
        <h3 className="font-hand-display text-[22px] font-bold text-ink-secondary marker-underline inline-block mb-4">
          自动备份计划
        </h3>
        <div className="flex flex-wrap items-end gap-x-8 gap-y-4">
          <label className="flex items-center gap-2.5 cursor-pointer select-none">
            <Checkbox
              checked={enabled}
              onCheckedChange={(v) => setEnabled(!!v)}
            />
            <span className="font-hand-display text-[16px] font-bold text-ink-secondary">
              启用自动备份
            </span>
          </label>
          <div>
            <label className="block font-hand-display text-[14px] font-bold text-ink-muted mb-1">
              执行时间
            </label>
            <Input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-32 h-9"
            />
          </div>
          <div>
            <label className="block font-hand-display text-[14px] font-bold text-ink-muted mb-1">
              执行周期
            </label>
            <Select value={everyDays} onValueChange={(v) => v && setEveryDays(v)}>
              <SelectTrigger className="h-9 px-3 text-[14px] text-ink-secondary">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {EVERY_DAYS_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            onClick={doSaveSchedule}
            disabled={saveSchedule.isPending}
            variant="outline"
            className="h-10 px-4 text-[15px] font-bold text-ink-secondary rotate-[0.5deg]"
          >
            保存计划
          </Button>
        </div>
        <p className="mt-3 font-hand-body text-[12px] text-ink-faint">
          默认关闭；开启后服务每 60 秒检查一次，到达设定的执行时间且距上次备份满一个周期时自动创建备份。旧备份自动清理，仅保留最近 30 份（可用环境变量 BACKUP_MAX_KEEP 调整）。
        </p>
      </section>

      {/* 搜索栏 */}
      <div className="flex items-center gap-3 mb-4 bg-white sketch-border sketch-shadow px-4 py-3 fade-up">
        <span className="font-hand-display text-[15px] font-bold text-ink-muted shrink-0">搜索</span>
        <Input
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              setSearchKeyword(keyword.trim());
              setPage(1);
            }
          }}
          placeholder="按备份时间 / 文件名搜索"
          className="flex-1 h-9"
        />
        <Button
          onClick={() => {
            setSearchKeyword(keyword.trim());
            setPage(1);
          }}
          className="h-9 px-4 text-[15px] font-bold rotate-[0.5deg]"
        >
          搜索
        </Button>
        <Button
          onClick={() => {
            setKeyword("");
            setSearchKeyword("");
            setPage(1);
          }}
          variant="outline"
          className="h-9 px-4 text-[15px] font-bold text-ink-muted rotate-[-0.5deg]"
        >
          重置
        </Button>
      </div>

      {/* 备份历史表格 */}
      <div className="bg-white sketch-border sketch-shadow overflow-hidden fade-up">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-canvas-soft border-b-2 border-dashed border-hairline">
              <th className="px-4 py-3 font-hand-display text-[14px] font-bold text-ink-muted">备份时间</th>
              <th className="w-24 px-3 py-3 font-hand-display text-[14px] font-bold text-ink-muted">大小</th>
              <th className="w-28 px-3 py-3 font-hand-display text-[14px] font-bold text-ink-muted">文件名</th>
              <th className="w-56 px-4 py-3 text-right font-hand-display text-[14px] font-bold text-ink-muted">操作</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.name} className="border-b border-dashed border-hairline last:border-0 hover:bg-canvas-soft/60 transition-colors">
                <td className="px-4 py-3 font-hand-body text-[13px] text-ink-faint tabular-nums whitespace-nowrap">
                  {formatTime(r.createdAt)}
                </td>
                <td className="px-3 py-3 font-hand-body text-[13px] text-ink-faint tabular-nums whitespace-nowrap">
                  {formatBytes(r.size)}
                </td>
                <td className="px-3 py-3">
                  <span className="font-hand-body text-[12px] text-ink-faint truncate max-w-36 block" title={r.name}>
                    {r.name}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2.5">
                    <Button onClick={() => download(r)} variant="ghost" className="px-1.5 h-auto text-[13px] text-ink-muted">下载</Button>
                    <Button onClick={() => setRestoreTarget(r)} variant="ghost" className="px-1.5 h-auto text-[13px] text-primary">恢复</Button>
                    <Button onClick={() => setDeleteTarget(r)} variant="ghost" className="px-1.5 h-auto text-[13px] text-red-400 hover:text-red-500">删除</Button>
                  </div>
                </td>
              </tr>
            ))}
            {rows.length === 0 && !isFetching && (
              <tr>
                <td colSpan={4} className="px-4 py-14 text-center">
                  <div className="font-hand-display text-[22px] font-bold text-ink-faint rotate-[-1deg]">
                    暂无备份{searchKeyword ? "（可尝试重置搜索）" : "，点击右上角立即备份"}
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 分页 */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 fade-up">
          <span className="font-hand-body text-[14px] text-ink-faint">
            第 {page} / {totalPages} 页 · 共 {data?.total ?? 0} 份
          </span>
          <div className="flex items-center gap-2">
            <Button disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))} variant="outline" className="h-9 px-4 text-[14px] font-bold text-ink-muted disabled:opacity-40">
              上一页
            </Button>
            <Button disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))} variant="outline" className="h-9 px-4 text-[14px] font-bold text-ink-muted disabled:opacity-40">
              下一页
            </Button>
          </div>
        </div>
      )}

      {/* 恢复确认 */}
      <AlertDialog open={!!restoreTarget} onOpenChange={(o) => { if (!o) setRestoreTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-hand-display text-[18px] font-bold text-ink-secondary">
              恢复备份
            </AlertDialogTitle>
            <AlertDialogDescription className="text-[13px] text-ink-muted">
              恢复将<b className="text-red-500">覆盖</b>当前全部文章、分类、标签与附件记录（不含账号），且不可撤销。
              确定要恢复到「
              <span className="font-semibold text-ink-secondary">{restoreTarget?.name}</span>
              」吗？
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel variant="outline" className="text-ink-muted">
              取消
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={restore.isPending}
              onClick={() => restoreTarget && restore.mutate({ name: restoreTarget.name })}
            >
              {restore.isPending ? "恢复中…" : "确认恢复"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 删除确认 */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => { if (!o) setDeleteTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-hand-display text-[18px] font-bold text-ink-secondary">
              删除备份
            </AlertDialogTitle>
            <AlertDialogDescription className="text-[13px] text-ink-muted">
              确定删除备份「
              <span className="font-semibold text-ink-secondary">{deleteTarget?.name}</span>
              」吗？删除后无法找回。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel variant="outline" className="text-ink-muted">
              取消
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={remove.isPending}
              onClick={() => deleteTarget && remove.mutate({ name: deleteTarget.name })}
            >
              删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
