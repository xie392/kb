"use client";

import { useMemo, useRef, useState } from "react";
import type { Editor } from "@tiptap/react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { ToolbarAction } from "./types";
import { TablePicker } from "./table-controls";
import {
  IconUndo,
  IconRedo,
  IconH1,
  IconH2,
  IconH3,
  IconParagraph,
  IconBold,
  IconItalic,
  IconUnderline,
  IconStrike,
  IconHighlight,
  IconCode,
  IconClearFormat,
  IconUl,
  IconOl,
  IconTaskList,
  IconQuote,
  IconCodeBlock,
  IconAlignLeft,
  IconAlignCenter,
  IconAlignRight,
  IconHr,
  IconImage,
  IconLink,
  IconSpinner,
} from "./icons";

/* ─── 工具栏基础组件 ─── */

export function ToolbarBtn({
  active,
  disabled,
  onClick,
  title,
  children,
}: {
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={`w-8 h-8 rounded-[6px] grid place-items-center transition-all duration-150 ${
        active
          ? "bg-[#0075de]/10 text-[#0075de]"
          : "text-[#615d59] hover:bg-[#f0efec] hover:text-[#31302e]"
      } ${disabled ? "opacity-30 cursor-not-allowed" : "cursor-pointer"}`}
    >
      {children}
    </button>
  );
}

export function ToolbarDivider() {
  return <div className="w-px h-5 bg-[#e6e6e6] mx-1 shrink-0" />;
}

/* ─── 工具栏分组数据 ─── */

interface ToolbarImageOpts {
  /** 有值时图片按钮改为触发本地文件选择（上传后返回图片 URL） */
  openImagePicker?: () => void;
  /** 上传中状态 */
  uploading?: boolean;
}

export function buildToolbarGroups(editor: Editor, opts?: ToolbarImageOpts): ToolbarAction[][] {
  return [
    [
      { title: "撤销", onClick: () => editor.chain().focus().undo().run(), icon: <IconUndo /> },
      { title: "重做", onClick: () => editor.chain().focus().redo().run(), icon: <IconRedo /> },
    ],
    [
      { title: "标题 1", active: editor.isActive("heading", { level: 1 }), onClick: () => editor.chain().focus().toggleHeading({ level: 1 }).run(), icon: <IconH1 /> },
      { title: "标题 2", active: editor.isActive("heading", { level: 2 }), onClick: () => editor.chain().focus().toggleHeading({ level: 2 }).run(), icon: <IconH2 /> },
      { title: "标题 3", active: editor.isActive("heading", { level: 3 }), onClick: () => editor.chain().focus().toggleHeading({ level: 3 }).run(), icon: <IconH3 /> },
      { title: "正文", active: editor.isActive("paragraph"), onClick: () => editor.chain().focus().setParagraph().run(), icon: <IconParagraph /> },
    ],
    [
      { title: "加粗", active: editor.isActive("bold"), onClick: () => editor.chain().focus().toggleBold().run(), icon: <IconBold /> },
      { title: "斜体", active: editor.isActive("italic"), onClick: () => editor.chain().focus().toggleItalic().run(), icon: <IconItalic /> },
      { title: "下划线", active: editor.isActive("underline"), onClick: () => editor.chain().focus().toggleUnderline().run(), icon: <IconUnderline /> },
      { title: "删除线", active: editor.isActive("strike"), onClick: () => editor.chain().focus().toggleStrike().run(), icon: <IconStrike /> },
      { title: "高亮", active: editor.isActive("highlight"), onClick: () => editor.chain().focus().toggleHighlight().run(), icon: <IconHighlight /> },
      { title: "行内代码", active: editor.isActive("code"), onClick: () => editor.chain().focus().toggleCode().run(), icon: <IconCode /> },
      { title: "清除格式", onClick: () => editor.chain().focus().clearNodes().unsetAllMarks().run(), icon: <IconClearFormat /> },
    ],
    [
      { title: "无序列表", active: editor.isActive("bulletList"), onClick: () => editor.chain().focus().toggleBulletList().run(), icon: <IconUl /> },
      { title: "有序列表", active: editor.isActive("orderedList"), onClick: () => editor.chain().focus().toggleOrderedList().run(), icon: <IconOl /> },
      { title: "任务列表", active: editor.isActive("taskList"), onClick: () => editor.chain().focus().toggleTaskList().run(), icon: <IconTaskList /> },
      { title: "引用", active: editor.isActive("blockquote"), onClick: () => editor.chain().focus().toggleBlockquote().run(), icon: <IconQuote /> },
      { title: "代码块", active: editor.isActive("codeBlock"), onClick: () => editor.chain().focus().toggleCodeBlock().run(), icon: <IconCodeBlock /> },
    ],
    [
      { title: "左对齐", active: editor.isActive({ textAlign: "left" }), onClick: () => editor.chain().focus().setTextAlign("left").run(), icon: <IconAlignLeft /> },
      { title: "居中", active: editor.isActive({ textAlign: "center" }), onClick: () => editor.chain().focus().setTextAlign("center").run(), icon: <IconAlignCenter /> },
      { title: "右对齐", active: editor.isActive({ textAlign: "right" }), onClick: () => editor.chain().focus().setTextAlign("right").run(), icon: <IconAlignRight /> },
    ],
    [
      { title: "分割线", onClick: () => editor.chain().focus().setHorizontalRule().run(), icon: <IconHr /> },
      { title: opts?.uploading ? "上传中…" : "图片", onClick: () => {
        if (opts?.openImagePicker) {
          opts.openImagePicker();
          return;
        }
        const url = window.prompt("图片 URL（或 base64 数据）");
        if (url) editor.chain().focus().setImage({ src: url }).run();
      }, icon: opts?.uploading ? <IconSpinner /> : <IconImage /> },
      { title: "链接", onClick: () => {
        const prev = editor.getAttributes("link").href as string | undefined;
        const url = window.prompt("链接 URL", prev ?? "https://");
        if (url === null) return;
        if (url === "") { editor.chain().focus().extendMarkRange("link").unsetLink().run(); return; }
        editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
      }, active: editor.isActive("link"), icon: <IconLink /> },
    ],
  ];
}

/* ─── 独立工具栏组件（可放在任意位置） ─── */

export function EditorToolbar({
  editor,
  onUploadImage,
}: {
  editor: Editor | null;
  /** 传入后图片按钮变为"本地上传"，返回图片 URL */
  onUploadImage?: (file: File) => Promise<string>;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [errMsg, setErrMsg] = useState<string | null>(null);

  const groups = useMemo(
    () =>
      editor
        ? buildToolbarGroups(editor, {
            openImagePicker: onUploadImage ? () => fileRef.current?.click() : undefined,
            uploading,
          })
        : [],
    [editor, onUploadImage, uploading]
  );

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // 允许重复选择同一文件
    if (!file || !onUploadImage || !editor) return;
    if (!file.type.startsWith("image/")) {
      setErrMsg("请选择图片文件（JPG/PNG/GIF/WebP）");
      return;
    }
    setUploading(true);
    try {
      const url = await onUploadImage(file);
      if (url) editor.chain().focus().setImage({ src: url }).run();
    } catch (err) {
      setErrMsg(`上传失败：${err instanceof Error ? err.message : "未知错误"}`);
    } finally {
      setUploading(false);
    }
  };

  if (!editor) return null;

  return (
    <div className="flex items-center gap-0.5 px-3 py-1.5 border-b border-[#e6e6e6] bg-white flex-wrap">
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
      {groups.map((group, gi) => (
        <div key={gi} className="flex items-center gap-0.5">
          {gi > 0 && <ToolbarDivider />}
          {group.map((btn) => (
            <ToolbarBtn
              key={btn.title}
              title={btn.title}
              active={"active" in btn ? !!btn.active : false}
              onClick={btn.onClick}
            >
              {btn.icon}
            </ToolbarBtn>
          ))}
        </div>
      ))}
      <ToolbarDivider />
      <TablePicker editor={editor} />

      {/* 错误提示弹窗 */}
      <AlertDialog
        open={!!errMsg}
        onOpenChange={(open) => {
          if (!open) setErrMsg(null);
        }}
      >
        <AlertDialogContent className="rounded-xl border border-[#e6e6e6] bg-white shadow-lg">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-hand-display text-[18px] font-bold text-[#31302e]">
              提示
            </AlertDialogTitle>
            <AlertDialogDescription className="text-[13px] text-[#615d59]">{errMsg}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction
              className="bg-[#0075de] text-white hover:bg-[#005bab]"
              onClick={() => setErrMsg(null)}
            >
              知道了
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
