"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { FloatingMenu } from "@tiptap/react/menus";
import type { Editor } from "@tiptap/react";
import {
  filterInsertActions,
  getInsertActions,
  getSlashCommandState,
  type SlashCommandState,
} from "./insert-actions";
import { cn } from "@/lib/utils";

interface SlashMenuProps {
  editor: Editor | null;
  /** 有值时"图片"动作走本地文件选择（上传后插入图片） */
  onUploadImage?: (file: File) => Promise<string>;
}

const INACTIVE: SlashCommandState = {
  active: false,
  query: "",
  from: 0,
  to: 0,
  key: "",
};

export function SlashMenu({ editor, onUploadImage }: SlashMenuProps) {
  const [slash, setSlash] = useState<SlashCommandState>(INACTIVE);
  const [activeIndex, setActiveIndex] = useState(0);
  const [hiddenKey, setHiddenKey] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const allActions = useMemo(
    () =>
      editor
        ? getInsertActions({
            editor,
            openImagePicker: onUploadImage ? () => fileRef.current?.click() : undefined,
            clearSlashQuery: true,
          })
        : [],
    [editor, onUploadImage]
  );
  const actions = useMemo(
    () => filterInsertActions(allActions, slash.query),
    [allActions, slash.query]
  );

  useEffect(() => {
    if (!editor) return;
    const syncSlash = () => {
      setSlash(getSlashCommandState(editor));
      setActiveIndex(0);
    };
    syncSlash();
    editor.on("update", syncSlash);
    editor.on("selectionUpdate", syncSlash);
    return () => {
      editor.off("update", syncSlash);
      editor.off("selectionUpdate", syncSlash);
    };
  }, [editor]);

  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!listRef.current) return;
    const el = listRef.current.children[activeIndex] as HTMLElement | undefined;
    if (el) el.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  useEffect(() => {
    if (!editor) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      const currentSlash = getSlashCommandState(editor);
      if (!currentSlash.active || hiddenKey === currentSlash.key || actions.length === 0)
        return;

      if (event.key === "ArrowDown") {
        event.preventDefault();
        setActiveIndex((index) => (index + 1) % actions.length);
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        setActiveIndex((index) => (index - 1 + actions.length) % actions.length);
      } else if (event.key === "Enter") {
        event.preventDefault();
        actions[Math.min(activeIndex, actions.length - 1)]?.run();
      } else if (event.key === "Escape") {
        event.preventDefault();
        setHiddenKey(currentSlash.key);
      }
    };

    editor.view.dom.addEventListener("keydown", handleKeyDown, true);
    return () => editor.view.dom.removeEventListener("keydown", handleKeyDown, true);
  }, [activeIndex, actions, editor, hiddenKey]);

  if (!editor) return null;

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !onUploadImage || !editor) return;
    if (!file.type.startsWith("image/")) {
      window.alert("请选择图片文件（JPG/PNG/GIF/WebP）");
      return;
    }
    try {
      const url = await onUploadImage(file);
      if (url) editor.chain().focus().setImage({ src: url }).run();
    } catch (err) {
      window.alert(`上传失败：${err instanceof Error ? err.message : "未知错误"}`);
    }
  };

  return (
    <>
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
      <FloatingMenu
        editor={editor}
        options={{ placement: "bottom-start", offset: 8 }}
        className="z-50 w-60 rounded-lg border border-hairline bg-white sketch-border sketch-shadow p-1.5"
        shouldShow={({ editor: currentEditor }) => {
          const currentSlash = getSlashCommandState(currentEditor);
          return currentSlash.active && hiddenKey !== currentSlash.key;
        }}
      >
        {actions.length === 0 ? (
          <div className="px-2 py-3 text-center text-xs text-ink-muted">
            没有找到命令
          </div>
        ) : (
          <div ref={listRef} className="scrollbar-wide flex max-h-[380px] flex-col gap-0.5 overflow-y-auto overscroll-contain pr-1">
            {actions.map((item, index) => (
              <div key={item.id}>
                {index > 0 && item.group !== actions[index - 1]?.group && (
                  <div className="my-1 h-px bg-hairline" />
                )}
                <button
                  type="button"
                  onClick={() => item.run()}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-[13px] text-ink-secondary transition-colors hover:bg-canvas-soft",
                    activeIndex === index && "bg-canvas-soft"
                  )}
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-canvas-soft text-ink-muted">
                    {item.icon}
                  </span>
                  {item.label}
                </button>
              </div>
            ))}
          </div>
        )}
      </FloatingMenu>
    </>
  );
}
