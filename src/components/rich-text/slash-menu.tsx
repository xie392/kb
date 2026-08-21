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
      if (url) editor.chain().focus().setImageBlock({ src: url }).run();
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
        className="z-50 w-72 rounded-lg border border-hairline bg-white sketch-border sketch-shadow p-1.5"
        shouldShow={({ editor: currentEditor }) => {
          const currentSlash = getSlashCommandState(currentEditor);
          return currentSlash.active && hiddenKey !== currentSlash.key;
        }}
      >
        {actions.length === 0 ? (
          <div className="px-3 py-6 text-center">
            <div className="text-[13px] text-ink-muted">没有找到命令</div>
            <div className="mt-0.5 text-[11px] text-ink-faint">试试输入 {slash.query ? `"/${slash.query}"` : "其他关键词"} 或按 ESC 退出</div>
          </div>
        ) : (
          <div ref={listRef} className="scrollbar-wide flex max-h-[400px] flex-col gap-0.5 overflow-y-auto overscroll-contain pr-1">
            {(() => {
              const groups: { name: string; items: typeof actions }[] = [];
              for (const a of actions) {
                const last = groups[groups.length - 1];
                if (last && last.name === a.group) last.items.push(a);
                else groups.push({ name: a.group, items: [a] });
              }
              let flatIndex = 0;
              return groups.map((g) => (
                <div key={g.name}>
                  <div className="px-2 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-wider text-ink-faint font-hand-display">
                    {g.name}
                  </div>
                  {g.items.map((item) => {
                    const idx = flatIndex++;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => item.run()}
                        onMouseEnter={() => setActiveIndex(idx)}
                        className={cn(
                          "flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-left transition-colors",
                          activeIndex === idx
                            ? "bg-primary/8 ring-1 ring-primary/30"
                            : "hover:bg-canvas-soft"
                        )}
                      >
                        <span
                          className={cn(
                            "flex h-8 w-8 shrink-0 items-center justify-center rounded-md transition-colors",
                            activeIndex === idx
                              ? "bg-primary/15 text-primary"
                              : "bg-canvas-soft text-ink-muted"
                          )}
                        >
                          {item.icon}
                        </span>
                        <span className="flex flex-1 flex-col">
                          <span
                            className={cn(
                              "text-[13px] font-medium",
                              activeIndex === idx ? "text-primary" : "text-ink-secondary"
                            )}
                          >
                            {item.label}
                          </span>
                          {item.description && (
                            <span className="text-[11px] text-ink-faint truncate">
                              {item.description}
                            </span>
                          )}
                        </span>
                      </button>
                    );
                  })}
                </div>
              ));
            })()}
          </div>
        )}
      </FloatingMenu>
    </>
  );
}
