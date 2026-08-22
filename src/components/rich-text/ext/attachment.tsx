"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { mergeAttributes, Node } from "@tiptap/core";
import {
  ReactNodeViewRenderer,
  NodeViewWrapper,
  type NodeViewProps,
} from "@tiptap/react";
import { api } from "@/trpc/client";
import { cn } from "@/lib/utils";

/* ─── Attachment 附件 ───
 * 借鉴 demo/knloop-frontend-main 的 attachment 节点，改造为手绘风格 + 对接本项目 tRPC 上传。
 * 属性：fileName / fileSize / fileType / fileExt / url / hasTrigger / error
 * 空 url 时显示「点击选择文件」上传卡片；上传中显示进度；上传完成展示文件卡片，可下载。
 */

export interface AttachmentAttrs {
  fileName: string | null;
  fileSize: number | null;
  fileType: string | null;
  fileExt: string | null;
  url: string | null;
  hasTrigger: boolean;
  error: string | null;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    attachment: {
      setAttachment: (attrs?: Partial<AttachmentAttrs>) => ReturnType;
    };
  }
}

export const Attachment = Node.create({
  name: "attachment",
  content: "",
  marks: "",
  group: "block",
  selectable: true,
  atom: true,
  draggable: true,

  addOptions() {
    return { HTMLAttributes: { class: "kb-attachment" } };
  },

  addAttributes() {
    return {
      fileName: {
        default: null,
        parseHTML: (el) => (el as HTMLElement).getAttribute("data-filename") ?? null,
        renderHTML: (a) => (a.fileName ? { "data-filename": a.fileName } : {}),
      },
      fileSize: {
        default: null,
        parseHTML: (el) =>
          Number((el as HTMLElement).getAttribute("data-filesize")) || null,
        renderHTML: (a) =>
          a.fileSize ? { "data-filesize": String(a.fileSize) } : {},
      },
      fileType: {
        default: null,
        parseHTML: (el) => (el as HTMLElement).getAttribute("data-filetype") ?? null,
        renderHTML: (a) => (a.fileType ? { "data-filetype": a.fileType } : {}),
      },
      fileExt: {
        default: null,
        parseHTML: (el) => (el as HTMLElement).getAttribute("data-fileext") ?? null,
        renderHTML: (a) => (a.fileExt ? { "data-fileext": a.fileExt } : {}),
      },
      url: {
        default: null,
        parseHTML: (el) => (el as HTMLElement).getAttribute("data-url") ?? null,
        renderHTML: (a) => (a.url ? { "data-url": a.url } : {}),
      },
      hasTrigger: {
        default: false,
        parseHTML: (el) =>
          (el as HTMLElement).getAttribute("data-has-trigger") === "true",
        renderHTML: () => ({}),
      },
      error: {
        default: null,
        parseHTML: () => null,
        renderHTML: () => ({}),
      },
    };
  },

  parseHTML() {
    return [{ tag: "div.kb-attachment" }];
  },

  renderHTML({ HTMLAttributes }) {
    const attrs = HTMLAttributes as Record<string, unknown>;
    const fileName = (attrs["data-filename"] as string) || "";
    const fileSize = Number(attrs["data-filesize"]) || null;
    const fileExt = (attrs["data-fileext"] as string) || null;
    const url = (attrs["data-url"] as string) || "";
    const baseAttrs = mergeAttributes(this.options.HTMLAttributes, {
      "data-filename": fileName,
      "data-filesize": attrs["data-filesize"] ?? "",
      "data-filetype": attrs["data-filetype"] ?? "",
      "data-fileext": fileExt ?? "",
      "data-url": url,
    });
    if (!url) {
      return ["div", baseAttrs];
    }
    const displayName = fileName && fileExt ? `${fileName}.${fileExt}` : fileName || "未命名文件";
    const iconClass = fileIconClass(fileExt);
    const sizeText = normalizeFileSize(fileSize);
    return [
      "div",
      baseAttrs,
      [
        "a",
        {
          class: "kb-att-card",
          href: url,
          target: "_blank",
          rel: "noopener noreferrer",
          download: displayName,
        },
        ["span", { class: `kb-att-icon ${iconClass}`, "aria-hidden": "true" }],
        [
          "div",
          { class: "kb-att-meta" },
          ["div", { class: "kb-att-name", title: displayName }, displayName],
          ["div", { class: "kb-att-size" }, sizeText],
        ],
        [
          "div",
          { class: "kb-att-actions" },
          ["span", { class: "kb-att-btn" }, "下载"],
        ],
      ],
    ];
  },

  addCommands() {
    return {
      setAttachment:
        (attrs) =>
        ({ chain }) =>
          chain()
            .focus()
            .insertContent({ type: "attachment", attrs: { ...attrs } })
            .run(),
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer(AttachmentView);
  },
});

function normalizeFileSize(bytes: number | null): string {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  let i = 0;
  let n = bytes;
  while (n >= 1024 && i < units.length - 1) {
    n /= 1024;
    i++;
  }
  return `${n.toFixed(n < 10 && i > 0 ? 1 : 0)} ${units[i]}`;
}

function splitExt(name: string): { base: string; ext: string } {
  const dot = name.lastIndexOf(".");
  if (dot <= 0) return { base: name, ext: "" };
  return { base: name.slice(0, dot), ext: name.slice(dot + 1).toLowerCase() };
}

function fileIconClass(ext: string | null): string {
  if (!ext) return "kb-att-icon-file";
  const e = ext.toLowerCase();
  if (["pdf"].includes(e)) return "kb-att-icon-pdf";
  if (["doc", "docx"].includes(e)) return "kb-att-icon-doc";
  if (["xls", "xlsx", "csv"].includes(e)) return "kb-att-icon-xls";
  if (["ppt", "pptx"].includes(e)) return "kb-att-icon-ppt";
  if (["zip", "rar", "7z", "tar", "gz"].includes(e)) return "kb-att-icon-zip";
  if (["mp4", "mov", "avi", "mkv", "webm"].includes(e)) return "kb-att-icon-video";
  if (["mp3", "wav", "flac", "aac"].includes(e)) return "kb-att-icon-audio";
  if (["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(e))
    return "kb-att-icon-img";
  if (["txt", "md", "markdown"].includes(e)) return "kb-att-icon-txt";
  return "kb-att-icon-file";
}

function AttachmentView(props: NodeViewProps) {
  const { editor, node, updateAttributes, selected } = props;
  const attrs = node.attrs as AttachmentAttrs;
  const { fileName, fileSize, fileExt, url, hasTrigger } = attrs;
  const isEditable = editor.isEditable;

  const inputRef = useRef<HTMLInputElement | null>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [errMsg, setErrMsg] = useState<string | null>(null);

  const uploadMut = api.attachment.create.useMutation();

  const selectFile = useCallback(() => {
    if (!isEditable || url || progress !== null) return;
    inputRef.current?.click();
  }, [isEditable, url, progress]);

  // 首次挂载且无 url 时自动触发选择（与 demo 行为一致，避免节点变成「死节点」）
  useEffect(() => {
    if (!url && !hasTrigger && isEditable && progress === null) {
      // 延迟到下一帧，避免编辑器初始渲染期间触发原生 click 被拦截
      const t = window.setTimeout(() => {
        updateAttributes({ hasTrigger: true });
        selectFile();
      }, 60);
      return () => window.clearTimeout(t);
    }
  }, [url, hasTrigger, isEditable, progress, selectFile, updateAttributes]);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // 允许重复选择同一文件
    if (!file) return;
    setErrMsg(null);
    setProgress(0);
    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error("文件读取失败"));
        reader.onprogress = (ev) => {
          if (ev.lengthComputable) setProgress(Math.round((ev.loaded / ev.total) * 60));
        };
        reader.readAsDataURL(file);
      });
      setProgress(70);
      const rec = await uploadMut.mutateAsync({ name: file.name, data: dataUrl });
      const { base, ext } = splitExt(rec.name ?? file.name);
      updateAttributes({
        fileName: base,
        fileSize: rec.size ?? file.size,
        fileType: rec.mimeType ?? file.type,
        fileExt: ext,
        url: rec.url,
        error: null,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "未知错误";
      setErrMsg(`上传失败：${msg}`);
      updateAttributes({ error: msg });
    } finally {
      setProgress(null);
    }
  };

  const triggerDownload = () => {
    if (!url) return;
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName && fileExt ? `${fileName}.${fileExt}` : fileName ?? "";
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const displayName = fileName && fileExt ? `${fileName}.${fileExt}` : fileName ?? "未命名文件";
  const iconClass = fileIconClass(fileExt);

  let content: React.ReactNode;
  if (url) {
    content = (
      <div className="kb-att-card" onClick={isEditable ? undefined : triggerDownload}>
        <span className={cn("kb-att-icon", iconClass)} aria-hidden="true" />
        <div className="kb-att-meta">
          <div className="kb-att-name" title={displayName}>{displayName}</div>
          <div className="kb-att-size">{normalizeFileSize(fileSize)}</div>
        </div>
        <div className="kb-att-actions">
          <button
            type="button"
            title="下载"
            onMouseDown={(e) => e.preventDefault()}
            onClick={triggerDownload}
            className="kb-att-btn"
          >
            下载
          </button>
        </div>
      </div>
    );
  } else if (progress !== null) {
    content = (
      <div className="kb-att-uploading">
        <span className="kb-att-spinner" aria-hidden="true" />
        <span>上传中… {progress}%</span>
        <div className="kb-att-progress">
          <div className="kb-att-progress-bar" style={{ width: `${progress}%` }} />
        </div>
      </div>
    );
  } else if (errMsg) {
    content = (
      <div className="kb-att-error" onClick={selectFile}>
        <span>{errMsg}</span>
        <span className="kb-att-retry">点击重试</span>
      </div>
    );
  } else {
    content = (
      <div className="kb-att-empty" onClick={selectFile}>
        <span className="kb-att-empty-icon" aria-hidden="true">＋</span>
        <span>点击上传附件</span>
        <span className="kb-att-empty-hint">支持 PDF / Office / 图片 / 压缩包等</span>
      </div>
    );
  }

  return (
    <NodeViewWrapper
      className={cn("kb-attachment", selected && "is-selected")}
      data-has-url={url ? "true" : "false"}
    >
      {content}
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        onChange={handleFile}
      />
    </NodeViewWrapper>
  );
}

export default Attachment;
