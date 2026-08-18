"use client";

import { useRef, useState } from "react";
import { api } from "@/trpc/client";
import { formatBytes, formatDate } from "@/lib/format";
import { ATTACH_LIMITS, classifyExt } from "@/lib/attachment-config";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Row = {
  id: string;
  name: string;
  url: string;
  mimeType: string;
  size: number;
  kind: string;
  createdAt: string;
};
type KindFilter = "all" | "image" | "file";

const PAGE_SIZE = 20;

export default function AdminAttachmentsPage() {
  const utils = api.useUtils();
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [keyword, setKeyword] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [kind, setKind] = useState<KindFilter>("all");
  const [page, setPage] = useState(1);

  // 上传
  const [uploadOpen, setUploadOpen] = useState(false);
  const [picked, setPicked] = useState<File | null>(null);
  const [uploadErr, setUploadErr] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 重命名 / 预览 / 删除
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [preview, setPreview] = useState<Row | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Row | null>(null);

  const { data, isFetching } = api.attachment.list.useQuery({
    keyword: searchKeyword,
    kind,
    page,
    pageSize: PAGE_SIZE,
  });
  const rows: Row[] = (data?.items ?? []).map((a) => ({ ...a, createdAt: String(a.createdAt) }));
  const invalidate = () => utils.attachment.list.invalidate();

  const show = (text: string, type: "ok" | "err" = "ok") => {
    setMsg({ type, text });
    setTimeout(() => setMsg(null), 2500);
  };

  const create = api.attachment.create.useMutation({
    onSuccess: () => {
      invalidate();
      setUploadOpen(false);
      setPicked(null);
      setUploadErr(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      show("上传成功");
    },
    onError: (e) => setUploadErr(e.message),
  });
  const rename = api.attachment.rename.useMutation({
    onSuccess: () => {
      invalidate();
      setRenamingId(null);
      show("已重命名");
    },
    onError: (e) => show(e.message, "err"),
  });
  const remove = api.attachment.delete.useMutation({
    onSuccess: () => {
      invalidate();
      setDeleteTarget(null);
      show("已删除附件");
    },
    onError: (e) => show(e.message, "err"),
  });

  const pickFile = (file: File | null) => {
    setUploadErr(null);
    if (!file) return;
    const dot = file.name.lastIndexOf(".");
    const ext = dot > 0 ? file.name.slice(dot + 1).toLowerCase() : "";
    const kind2 = classifyExt(ext);
    if (kind2 === "reject") {
      setPicked(null);
      setUploadErr(`禁止上传危险文件类型 .${ext}`);
      return;
    }
    const limit = kind2 === "image" ? ATTACH_LIMITS.image : ATTACH_LIMITS.file;
    if (file.size > limit.maxBytes) {
      setPicked(null);
      setUploadErr(`${kind2 === "image" ? "图片" : "文件"}不能超过 ${limit.label}`);
      return;
    }
    setPicked(file);
  };

  const startUpload = () => {
    if (!picked) return;
    setUploading(true);
    const reader = new FileReader();
    reader.onload = () => {
      create.mutate(
        { name: picked.name, data: String(reader.result) },
        { onSettled: () => setUploading(false) }
      );
    };
    reader.onerror = () => {
      setUploading(false);
      setUploadErr("读取文件失败");
    };
    reader.readAsDataURL(picked);
  };

  const startRename = (r: Row) => {
    setRenamingId(r.id);
    setRenameValue(r.name);
  };
  const saveRename = () => {
    if (!renamingId) return;
    const name = renameValue.trim();
    if (!name) return show("文件名不能为空", "err");
    rename.mutate({ id: renamingId, name });
  };

  const copyLink = async (r: Row) => {
    try {
      await navigator.clipboard.writeText(`${location.origin}${r.url}`);
      show("链接已复制");
    } catch {
      show("复制失败", "err");
    }
  };

  const totalPages = Math.max(1, Math.ceil((data?.total ?? 0) / PAGE_SIZE));

  return (
    <div className="p-8 w-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-hand-display text-[32px] font-bold text-[#213183]">附件管理</h2>
          <p className="font-hand-body text-[15px] text-[#a39e98] mt-0.5">
            共 {data?.total ?? 0} 个附件 · 图片 ≤ {ATTACH_LIMITS.image.label}，其他文件 ≤ {ATTACH_LIMITS.file.label} · 禁止可执行/脚本文件
          </p>
        </div>
        <Button
          onClick={() => setUploadOpen(true)}
          className="h-10 px-4 text-[17px] font-bold rotate-[-1deg]"
        >
          ＋ 上传附件
        </Button>
      </div>

      {msg && (
        <div className={`mb-4 sticky-note sketch-border px-4 py-2 rotate-[-1deg] w-fit fade-up`}>
          <span className={`font-hand-display text-[16px] font-bold ${msg.type === "ok" ? "text-[#2a9d99]" : "text-red-500"}`}>
            {msg.type === "ok" ? "✓" : "✗"} {msg.text}
          </span>
        </div>
      )}

      {/* 搜索栏 */}
      <div className="flex items-center gap-3 mb-4 bg-white sketch-border sketch-shadow px-4 py-3 fade-up">
        <span className="font-hand-display text-[15px] font-bold text-[#615d59] shrink-0">搜索</span>
        <Input
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              setSearchKeyword(keyword.trim());
              setPage(1);
            }
          }}
          placeholder="按文件名搜索"
          className="flex-1 h-9"
        />
        <Select
          value={kind}
          onValueChange={(v) => {
            if (v) {
              setKind(v as KindFilter);
              setPage(1);
            }
          }}
        >
          <SelectTrigger className="data-[size=default]:h-9 px-3 text-[14px] text-[#31302e]">
            <SelectValue placeholder="全部类型" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部类型</SelectItem>
            <SelectItem value="image">仅图片</SelectItem>
            <SelectItem value="file">仅文件</SelectItem>
          </SelectContent>
        </Select>
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
            setKind("all");
            setPage(1);
          }}
          variant="outline"
          className="h-9 px-4 text-[15px] font-bold text-[#615d59] rotate-[-0.5deg]"
        >
          重置
        </Button>
      </div>

      {/* 附件表格 */}
      <div className="bg-white sketch-border sketch-shadow overflow-hidden fade-up">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-[#f6f5f4] border-b-2 border-dashed border-[#e6e6e6]">
              <th className="w-16 px-4 py-3 font-hand-display text-[14px] font-bold text-[#615d59]">预览</th>
              <th className="px-3 py-3 font-hand-display text-[14px] font-bold text-[#615d59]">文件名</th>
              <th className="w-20 px-3 py-3 font-hand-display text-[14px] font-bold text-[#615d59]">类型</th>
              <th className="w-24 px-3 py-3 font-hand-display text-[14px] font-bold text-[#615d59]">大小</th>
              <th className="w-32 px-3 py-3 font-hand-display text-[14px] font-bold text-[#615d59]">上传时间</th>
              <th className="w-52 px-4 py-3 text-right font-hand-display text-[14px] font-bold text-[#615d59]">操作</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((a) => (
              <tr key={a.id} className="border-b border-dashed border-[#e6e6e6] last:border-0 hover:bg-[#f6f5f4]/60 transition-colors">
                <td className="px-4 py-3">
                  {a.kind === "image" ? (
                    <img
                      src={a.url}
                      alt={a.name}
                      className="w-11 h-11 object-cover sketch-border shrink-0"
                    />
                  ) : (
                    <span className="w-11 h-11 grid place-items-center bg-[#f6f5f4] sketch-border shrink-0">
                      <svg className="w-5 h-5 text-[#a39e98]" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M11 3H6a1.5 1.5 0 0 0-1.5 1.5v11A1.5 1.5 0 0 0 6 17h8a1.5 1.5 0 0 0 1.5-1.5V8l-4.5-5z" strokeLinejoin="round" />
                        <path d="M11 3v4.5h4.5" strokeLinejoin="round" />
                      </svg>
                    </span>
                  )}
                </td>
                <td className="px-3 py-3 min-w-0">
                  {renamingId === a.id ? (
                    <div className="flex items-center gap-2">
                      <Input
                        autoFocus
                        value={renameValue}
                        onChange={(e) => setRenameValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") saveRename();
                          if (e.key === "Escape") setRenamingId(null);
                        }}
                        className="h-9 w-[240px]"
                      />
                      <Button onClick={saveRename} variant="ghost" className="px-1.5 h-auto text-[13px] text-[#0075de]">保存</Button>
                      <Button onClick={() => setRenamingId(null)} variant="ghost" className="px-1.5 h-auto text-[13px] text-[#a39e98]">取消</Button>
                    </div>
                  ) : (
                    <span className="font-hand-display text-[16px] font-bold text-[#31302e] truncate max-w-[260px] block" title={a.name}>
                      {a.name}
                    </span>
                  )}
                </td>
                <td className="px-3 py-3">
                  <span
                    className={`font-hand-body text-[12px] px-2 py-0.5 sketch-border ${
                      a.kind === "image" ? "text-[#0075de] bg-[#eaf4ff]" : "text-[#ff64c8] bg-[#fff0f9]"
                    }`}
                  >
                    {a.kind === "image" ? "图片" : "文件"}
                  </span>
                </td>
                <td className="px-3 py-3 font-hand-body text-[13px] text-[#a39e98] tabular-nums whitespace-nowrap">
                  {formatBytes(a.size)}
                </td>
                <td className="px-3 py-3 font-hand-body text-[13px] text-[#a39e98] whitespace-nowrap">
                  {formatDate(a.createdAt)}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2.5">
                    <Button onClick={() => setPreview(a)} variant="ghost" className="px-1.5 h-auto text-[13px] text-[#615d59]">预览</Button>
                    <Button onClick={() => copyLink(a)} variant="ghost" className="px-1.5 h-auto text-[13px] text-[#615d59]">复制链接</Button>
                    <Button onClick={() => startRename(a)} variant="ghost" className="px-1.5 h-auto text-[13px] text-[#615d59]">重命名</Button>
                    <Button onClick={() => setDeleteTarget(a)} variant="ghost" className="px-1.5 h-auto text-[13px] text-red-400 hover:text-red-500">删除</Button>
                  </div>
                </td>
              </tr>
            ))}
            {rows.length === 0 && !isFetching && (
              <tr>
                <td colSpan={6} className="px-4 py-14 text-center">
                  <div className="font-hand-display text-[22px] font-bold text-[#a39e98] rotate-[-1deg]">
                    暂无附件{searchKeyword || kind !== "all" ? "（可尝试重置搜索）" : "，先上传一个吧"}
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
          <span className="font-hand-body text-[14px] text-[#a39e98]">
            第 {page} / {totalPages} 页 · 共 {data?.total ?? 0} 个
          </span>
          <div className="flex items-center gap-2">
            <Button disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))} variant="outline" className="h-9 px-4 text-[14px] font-bold text-[#615d59] disabled:opacity-40">
              上一页
            </Button>
            <Button disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))} variant="outline" className="h-9 px-4 text-[14px] font-bold text-[#615d59] disabled:opacity-40">
              下一页
            </Button>
          </div>
        </div>
      )}

      {/* 上传弹窗 */}
      <Dialog open={uploadOpen} onOpenChange={(o) => { setUploadOpen(o); if (!o) { setPicked(null); setUploadErr(null); } }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-hand-display text-[18px] font-bold text-[#31302e]">上传附件</DialogTitle>
            <DialogDescription className="font-hand-body text-[13px] text-[#a39e98]">
              图片 ≤ {ATTACH_LIMITS.image.label}（JPG/PNG/GIF/WebP），其他文件 ≤ {ATTACH_LIMITS.file.label}；禁止上传可执行、脚本等危险文件。
            </DialogDescription>
          </DialogHeader>

          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={(e) => pickFile(e.target.files?.[0] ?? null)}
          />
          {!picked ? (
            <button
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                pickFile(e.dataTransfer.files?.[0] ?? null);
              }}
              className="h-40 grid place-items-center bg-[#f6f5f4] sketch-dashed border-dashed border-2 border-[#d8d3cc] text-center hover:bg-[#f1f0ee] transition-colors"
            >
              <span className="font-hand-display text-[16px] font-bold text-[#a39e98]">
                点击选择或拖拽文件到此处
              </span>
            </button>
          ) : (
            <div className="flex items-center gap-3 bg-[#f6f5f4] sketch-border px-4 py-3">
              <span className="w-10 h-10 grid place-items-center bg-white sketch-border shrink-0">
                <svg className="w-5 h-5 text-[#0075de]" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M11 3H6a1.5 1.5 0 0 0-1.5 1.5v11A1.5 1.5 0 0 0 6 17h8a1.5 1.5 0 0 0 1.5-1.5V8l-4.5-5z" strokeLinejoin="round" />
                  <path d="M11 3v4.5h4.5" strokeLinejoin="round" />
                </svg>
              </span>
              <div className="flex-1 min-w-0">
                <div className="font-hand-display text-[15px] font-bold text-[#31302e] truncate">{picked.name}</div>
                <div className="font-hand-body text-[12px] text-[#a39e98] tabular-nums">
                  {formatBytes(picked.size)} · {picked.type || "未知类型"}
                </div>
              </div>
              <Button onClick={() => { setPicked(null); setUploadErr(null); if (fileInputRef.current) fileInputRef.current.value = ""; }} variant="ghost" className="px-1.5 h-auto text-[13px] text-[#a39e98] hover:text-red-500">
                更换
              </Button>
            </div>
          )}

          {uploadErr && (
            <div className="font-hand-body text-[13px] text-red-500">✗ {uploadErr}</div>
          )}

          <div className="flex justify-end gap-2 mt-1">
            <Button
              onClick={() => setUploadOpen(false)}
              disabled={uploading}
              variant="outline"
              className="h-9 px-4 text-[14px] font-bold text-[#615d59] disabled:opacity-40"
            >
              取消
            </Button>
            <Button
              onClick={startUpload}
              disabled={!picked || uploading}
              className="h-9 px-4 text-[14px] font-bold rotate-[-1deg] disabled:opacity-40"
            >
              {uploading ? "上传中…" : "开始上传"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* 预览弹窗 */}
      <Dialog open={!!preview} onOpenChange={(o) => { if (!o) setPreview(null); }}>
        <DialogContent className={preview?.kind === "image" ? "max-w-lg" : "max-w-sm"}>
          <DialogHeader>
            <DialogTitle className="font-hand-display text-[18px] font-bold text-[#31302e]">附件预览</DialogTitle>
            <DialogDescription className="font-hand-body text-[13px] text-[#a39e98] break-all">
              {preview?.name}
            </DialogDescription>
          </DialogHeader>
          {preview?.kind === "image" ? (
            <img src={preview.url} alt={preview.name} className="w-full max-h-[60vh] object-contain sketch-border bg-[#f6f5f4]" />
          ) : (
            <div className="h-40 grid place-items-center bg-[#f6f5f4] sketch-dashed">
              <div className="text-center">
                <div className="font-hand-display text-[20px] font-bold text-[#a39e98]">非图片文件</div>
                <div className="font-hand-body text-[13px] text-[#a39e98] mt-1">
                  {formatBytes(preview?.size ?? 0)} · {preview?.mimeType}
                </div>
              </div>
            </div>
          )}
          <div className="flex justify-end gap-2">
            <Button
              render={<a href={preview?.url} download={preview?.name} />}
              className="h-9 px-4 text-[14px] font-bold rotate-[-1deg]"
            >
              下载
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* 删除确认 */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => { if (!o) setDeleteTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-hand-display text-[18px] font-bold text-[#31302e]">
              删除附件
            </AlertDialogTitle>
            <AlertDialogDescription className="text-[13px] text-[#615d59]">
              确定删除附件「
              <span className="font-semibold text-[#31302e]">{deleteTarget?.name}</span>
              」吗？删除后文件将无法恢复。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel variant="outline" className="text-[#615d59]">
              取消
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => deleteTarget && remove.mutate({ id: deleteTarget.id })}
            >
              删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
