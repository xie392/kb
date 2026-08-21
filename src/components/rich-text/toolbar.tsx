"use client";

import { useEffect, useRef, useState } from "react";
import type { Editor } from "@tiptap/react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { ToolbarAction } from "./types";
import { TablePicker } from "./table-controls";
import { ColorMenu } from "./color-menu";
import { InsertMenu } from "./insert-menu";
import { BlockStyleMenu } from "./block-style-menu";
import { EmojiPicker } from "./ext/emoji-picker";
import { AlignMenu } from "./align-menu";
import {
  HandBold,
  HandCode,
  HandEraser,
  HandImage,
  HandIndentDecrease,
  HandIndentIncrease,
  HandItalic,
  HandLink,
  HandList,
  HandListOrdered,
  HandMinus,
  HandQuote,
  HandRedo,
  HandCodeBlock,
  HandStrike,
  HandSubscript,
  HandSuperscript,
  HandTaskList,
  HandUnderline as HandUnderlineIcon,
  HandUndo,
} from "./hand-icons";
import { openLinkDialog } from "./link-dialog";
import { IconAlignLeft, IconAlignCenter, IconAlignRight } from "./icons";

export function ToolbarBtn({
  active,
  disabled,
  onClick,
  title,
  children,
  className,
}: {
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  title: string;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={title}
            disabled={disabled}
            onMouseDown={(e) => e.preventDefault()}
            onClick={onClick}
            className={cn(
              "rounded-[6px] transition-colors duration-150",
              active && "bg-primary/10 text-primary",
              disabled ? "opacity-30 cursor-not-allowed" : "cursor-pointer",
              className
            )}
          />
        }
      >
        {children}
      </TooltipTrigger>
      <TooltipContent side="bottom">{title}</TooltipContent>
    </Tooltip>
  );
}

export function ToolbarDivider() {
  return <div className="w-px h-5 bg-hairline mx-1 shrink-0" />;
}

interface ToolbarImageOpts {
  openImagePicker?: () => void;
  uploading?: boolean;
}

export function buildToolbarGroups(editor: Editor, opts?: ToolbarImageOpts): ToolbarAction[][] {
  const listItemType = editor.isActive("taskItem") ? "taskItem" : "listItem";
  const canLift = editor.can().chain().focus().liftListItem(listItemType).run();
  const canSink = editor.can().chain().focus().sinkListItem(listItemType).run();
  return [
    [
      { title: "撤销", onClick: () => editor.chain().focus().undo().run(), icon: <HandUndo className="h-4 w-4" /> },
      { title: "重做", onClick: () => editor.chain().focus().redo().run(), icon: <HandRedo className="h-4 w-4" /> },
    ],
    [
      { title: "加粗", active: editor.isActive("bold"), onClick: () => editor.chain().focus().toggleBold().run(), icon: <HandBold className="h-4 w-4" /> },
      { title: "斜体", active: editor.isActive("italic"), onClick: () => editor.chain().focus().toggleItalic().run(), icon: <HandItalic className="h-4 w-4" /> },
      { title: "下划线", active: editor.isActive("underline"), onClick: () => editor.chain().focus().toggleUnderline().run(), icon: <HandUnderlineIcon className="h-4 w-4" /> },
      { title: "删除线", active: editor.isActive("strike"), onClick: () => editor.chain().focus().toggleStrike().run(), icon: <HandStrike className="h-4 w-4" /> },
      { title: "行内代码", active: editor.isActive("code"), onClick: () => editor.chain().focus().toggleCode().run(), icon: <HandCode className="h-4 w-4" /> },
      { title: "上标", active: editor.isActive("superscript"), onClick: () => editor.chain().focus().toggleSuperscript().run(), icon: <HandSuperscript className="h-4 w-4" /> },
      { title: "下标", active: editor.isActive("subscript"), onClick: () => editor.chain().focus().toggleSubscript().run(), icon: <HandSubscript className="h-4 w-4" /> },
    ],
    [
      { title: "无序列表", active: editor.isActive("bulletList"), onClick: () => editor.chain().focus().toggleBulletList().run(), icon: <HandList className="h-4 w-4" /> },
      { title: "有序列表", active: editor.isActive("orderedList"), onClick: () => editor.chain().focus().toggleOrderedList().run(), icon: <HandListOrdered className="h-4 w-4" /> },
      { title: "任务列表", active: editor.isActive("taskList"), onClick: () => editor.chain().focus().toggleTaskList().run(), icon: <HandTaskList className="h-4 w-4" /> },
      { title: "减少缩进", disabled: !canLift, onClick: () => editor.chain().focus().liftListItem(listItemType).run(), icon: <HandIndentDecrease className="h-4 w-4" /> },
      { title: "增加缩进", disabled: !canSink, onClick: () => editor.chain().focus().sinkListItem(listItemType).run(), icon: <HandIndentIncrease className="h-4 w-4" /> },
    ],
    [
      { title: "左对齐", active: editor.isActive({ textAlign: "left" }), onClick: () => editor.chain().focus().setTextAlign("left").run(), icon: <IconAlignLeft /> },
      { title: "居中", active: editor.isActive({ textAlign: "center" }), onClick: () => editor.chain().focus().setTextAlign("center").run(), icon: <IconAlignCenter /> },
      { title: "右对齐", active: editor.isActive({ textAlign: "right" }), onClick: () => editor.chain().focus().setTextAlign("right").run(), icon: <IconAlignRight /> },
    ],
    [
      { title: "引用", active: editor.isActive("blockquote"), onClick: () => editor.chain().focus().toggleBlockquote().run(), icon: <HandQuote className="h-4 w-4" /> },
      { title: "分割线", onClick: () => editor.chain().focus().setHorizontalRule().run(), icon: <HandMinus className="h-4 w-4" /> },
      { title: "代码块", active: editor.isActive("codeBlock"), onClick: () => editor.chain().focus().toggleCodeBlock().run(), icon: <HandCodeBlock className="h-4 w-4" /> },
      { title: "清除格式", onClick: () => editor.chain().focus().clearNodes().unsetAllMarks().run(), icon: <HandEraser className="h-4 w-4" /> },
    ],
    [
      { title: opts?.uploading ? "上传中…" : "图片", onClick: () => {
        if (opts?.openImagePicker) {
          opts.openImagePicker();
          return;
        }
        const url = window.prompt("图片 URL（或 base64 数据）");
        if (url) editor.chain().focus().setImageBlock({ src: url }).run();
      }, icon: opts?.uploading ? <LoaderIcon /> : <HandImage className="h-4 w-4" /> },
      { title: "链接", onClick: () => openLinkDialog(), active: editor.isActive("link"), icon: <HandLink className="h-4 w-4" /> },
    ],
  ];
}

function LoaderIcon() {
  return <span className="animate-spin h-4 w-4 rounded-full border-2 border-ink-muted border-t-transparent" />;
}

export function EditorToolbar({
  editor,
  onUploadImage,
}: {
  editor: Editor | null;
  onUploadImage?: (file: File) => Promise<string>;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [errMsg, setErrMsg] = useState<string | null>(null);
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    if (!editor) return;
    const update = () => forceUpdate((n) => n + 1);
    editor.on("selectionUpdate", update);
    editor.on("transaction", update);
    return () => {
      editor.off("selectionUpdate", update);
      editor.off("transaction", update);
    };
  }, [editor]);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !onUploadImage || !editor) return;
    if (!file.type.startsWith("image/")) {
      setErrMsg("请选择图片文件（JPG/PNG/GIF/WebP）");
      return;
    }
    setUploading(true);
    try {
      const url = await onUploadImage(file);
      if (url) editor.chain().focus().setImageBlock({ src: url }).run();
    } catch (err) {
      setErrMsg(`上传失败：${err instanceof Error ? err.message : "未知错误"}`);
    } finally {
      setUploading(false);
    }
  };

  if (!editor) return null;

  const listItemType = editor.isActive("taskItem") ? "taskItem" : "listItem";
  const canLift = editor.can().chain().focus().liftListItem(listItemType).run();
  const canSink = editor.can().chain().focus().sinkListItem(listItemType).run();

  return (
    <TooltipProvider delay={100}>
      <div className="flex items-center gap-0.5 px-3 py-1.5 border-b border-hairline bg-white flex-wrap">
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />

        <InsertMenu editor={editor} openImagePicker={onUploadImage ? () => fileRef.current?.click() : undefined} />

        <ToolbarDivider />

        <ToolbarBtn title="撤销" onClick={() => editor.chain().focus().undo().run()}>
          <HandUndo className="h-4 w-4" />
        </ToolbarBtn>
        <ToolbarBtn title="重做" onClick={() => editor.chain().focus().redo().run()}>
          <HandRedo className="h-4 w-4" />
        </ToolbarBtn>

        <ToolbarDivider />

        <BlockStyleMenu editor={editor} />

        <ToolbarBtn title="加粗 ⌘B" active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}>
          <HandBold className="h-4 w-4" />
        </ToolbarBtn>
        <ToolbarBtn title="斜体 ⌘I" active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}>
          <HandItalic className="h-4 w-4" />
        </ToolbarBtn>
        <ToolbarBtn title="下划线 ⌘U" active={editor.isActive("underline")} onClick={() => editor.chain().focus().toggleUnderline().run()}>
          <HandUnderlineIcon className="h-4 w-4" />
        </ToolbarBtn>
        <ToolbarBtn title="删除线" active={editor.isActive("strike")} onClick={() => editor.chain().focus().toggleStrike().run()}>
          <HandStrike className="h-4 w-4" />
        </ToolbarBtn>
        <ToolbarBtn title="行内代码" active={editor.isActive("code")} onClick={() => editor.chain().focus().toggleCode().run()}>
          <HandCode className="h-4 w-4" />
        </ToolbarBtn>

        <ColorMenu editor={editor} mode="text" />
        <ColorMenu editor={editor} mode="highlight" />

        <ToolbarDivider />

        <ToolbarBtn title="无序列表" active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()}>
          <HandList className="h-4 w-4" />
        </ToolbarBtn>
        <ToolbarBtn title="有序列表" active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
          <HandListOrdered className="h-4 w-4" />
        </ToolbarBtn>
        <ToolbarBtn title="任务列表" active={editor.isActive("taskList")} onClick={() => editor.chain().focus().toggleTaskList().run()}>
          <HandTaskList className="h-4 w-4" />
        </ToolbarBtn>
        <ToolbarBtn title="减少缩进" disabled={!canLift} onClick={() => editor.chain().focus().liftListItem(listItemType).run()}>
          <HandIndentDecrease className="h-4 w-4" />
        </ToolbarBtn>
        <ToolbarBtn title="增加缩进" disabled={!canSink} onClick={() => editor.chain().focus().sinkListItem(listItemType).run()}>
          <HandIndentIncrease className="h-4 w-4" />
        </ToolbarBtn>

        <AlignMenu editor={editor} />

        <ToolbarDivider />

        <ToolbarBtn title="引用" active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
          <HandQuote className="h-4 w-4" />
        </ToolbarBtn>
        <ToolbarBtn title="代码块" active={editor.isActive("codeBlock")} onClick={() => editor.chain().focus().toggleCodeBlock().run()}>
          <HandCodeBlock className="h-4 w-4" />
        </ToolbarBtn>
        <ToolbarBtn title="分割线" onClick={() => editor.chain().focus().setHorizontalRule().run()}>
          <HandMinus className="h-4 w-4" />
        </ToolbarBtn>

        <ToolbarDivider />

        <ToolbarBtn title={uploading ? "上传中…" : "图片"} onClick={() => {
          if (onUploadImage) fileRef.current?.click();
          else {
            const url = window.prompt("图片 URL（或 base64 数据）");
            if (url) editor.chain().focus().setImageBlock({ src: url }).run();
          }
        }}>
          {uploading ? <LoaderIcon /> : <HandImage className="h-4 w-4" />}
        </ToolbarBtn>
        <ToolbarBtn title="链接 ⌘K" active={editor.isActive("link")} onClick={() => openLinkDialog()}>
          <HandLink className="h-4 w-4" />
        </ToolbarBtn>
        <TablePicker editor={editor} />
        <EmojiPicker editor={editor} />

        <ToolbarBtn title="上标" active={editor.isActive("superscript")} onClick={() => editor.chain().focus().toggleSuperscript().run()}>
          <HandSuperscript className="h-4 w-4" />
        </ToolbarBtn>
        <ToolbarBtn title="下标" active={editor.isActive("subscript")} onClick={() => editor.chain().focus().toggleSubscript().run()}>
          <HandSubscript className="h-4 w-4" />
        </ToolbarBtn>
        <ToolbarBtn title="清除格式" onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}>
          <HandEraser className="h-4 w-4" />
        </ToolbarBtn>

        <AlertDialog
          open={!!errMsg}
          onOpenChange={(open) => {
            if (!open) setErrMsg(null);
          }}
        >
          <AlertDialogContent className="rounded-xl border border-hairline bg-white shadow-lg">
            <AlertDialogHeader>
              <AlertDialogTitle className="font-hand-display text-[18px] font-bold text-ink-secondary">
                提示
              </AlertDialogTitle>
              <AlertDialogDescription className="text-[13px] text-ink-muted">{errMsg}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction
                className="bg-primary text-white hover:bg-primary-active"
                onClick={() => setErrMsg(null)}
              >
                知道了
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </TooltipProvider>
  );
}
