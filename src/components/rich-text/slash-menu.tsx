"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import type { Editor } from "@tiptap/react";
import {
  filterInsertActions,
  getInsertActions,
  getSlashCommandState,
  type InsertAction,
  type SlashCommandState,
} from "./insert-actions";
import { getPreview, PREVIEW_WIDTH as PREVIEW_W, PREVIEW_GAP } from "./insert-preview";
import { cn } from "@/lib/utils";

interface SlashMenuProps {
  editor: Editor | null;
  onUploadImage?: (file: File) => Promise<string>;
}

const INACTIVE: SlashCommandState = {
  active: false,
  query: "",
  from: 0,
  to: 0,
  key: "",
};

const MENU_WIDTH = 288;
const MENU_MAX_HEIGHT = 340;
const OFFSET = 8;

export function SlashMenu({ editor, onUploadImage }: SlashMenuProps) {
  const [slash, setSlash] = useState<SlashCommandState>(INACTIVE);
  const [activeIndex, setActiveIndex] = useState(0);
  const [hiddenKey, setHiddenKey] = useState("");
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

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

  const updatePosition = useCallback(() => {
    if (!editor) return;
    const currentSlash = getSlashCommandState(editor);
    if (!currentSlash.active || hiddenKey === currentSlash.key) {
      setPos(null);
      return;
    }
    const coords = editor.view.coordsAtPos(currentSlash.from);
    const vh = window.innerHeight;
    const vw = window.innerWidth;

    let top = coords.bottom + OFFSET;
    let left = coords.left;

    if (menuRef.current) {
      const menuH = menuRef.current.offsetHeight || MENU_MAX_HEIGHT;
      const menuW = menuRef.current.offsetWidth || MENU_WIDTH;
      if (top + menuH > vh - 12) {
        top = coords.top - menuH - OFFSET;
      }
      if (left + menuW > vw - 12) {
        left = vw - menuW - 12;
      }
      if (left < 12) left = 12;
    }

    setPos({ top, left });
  }, [editor, hiddenKey]);

  useEffect(() => {
    if (!editor) return;
    const syncSlash = () => {
      setSlash(getSlashCommandState(editor));
      setActiveIndex(0);
      requestAnimationFrame(updatePosition);
    };
    syncSlash();
    editor.on("update", syncSlash);
    editor.on("selectionUpdate", syncSlash);
    return () => {
      editor.off("update", syncSlash);
      editor.off("selectionUpdate", syncSlash);
    };
  }, [editor, updatePosition]);

  useEffect(() => {
    if (!slash.active || hiddenKey === slash.key) {
      setPos(null);
      return;
    }
    requestAnimationFrame(updatePosition);

    const onScroll = () => updatePosition();
    const onResize = () => updatePosition();
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onResize);
    };
  }, [slash.active, slash.key, hiddenKey, updatePosition]);

  const listRef = useRef<HTMLDivElement>(null);
  const [previewPos, setPreviewPos] = useState<{ top: number } | null>(null);
  const isVisible = slash.active && hiddenKey !== slash.key && pos !== null;

  useEffect(() => {
    if (!listRef.current || !isVisible) return;
    const el = listRef.current.querySelector(`[data-idx="${activeIndex}"]`) as HTMLElement | null;
    if (el) {
      el.scrollIntoView({ block: "nearest" });
      requestAnimationFrame(() => {
        const listRect = listRef.current!.getBoundingClientRect();
        const itemRect = el.getBoundingClientRect();
        setPreviewPos({ top: itemRect.top - listRect.top });
      });
    }
  }, [activeIndex, isVisible]);

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

  useEffect(() => {
    if (!editor) return;
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        const currentSlash = getSlashCommandState(editor);
        if (currentSlash.active) setHiddenKey(currentSlash.key);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [editor]);

  if (!editor) return null;

  const visible = isVisible;

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

  const groups: { name: string; items: typeof actions }[] = [];
  for (const a of actions) {
    const last = groups[groups.length - 1];
    if (last && last.name === a.group) last.items.push(a);
    else groups.push({ name: a.group, items: [a] });
  }

  let activeAction: InsertAction | null = null;
  let i = 0;
  for (const g of groups) {
    for (const item of g.items) {
      if (i === activeIndex) { activeAction = item; break; }
      i++;
    }
    if (activeAction) break;
  }
  const preview = visible && activeAction ? getPreview(activeAction.id) : null;
  const previewLeftRight =
    visible && pos !== null ? pos.left + MENU_WIDTH + PREVIEW_GAP : 0;
  const previewLeftLeft =
    visible && pos !== null ? pos.left - PREVIEW_W - PREVIEW_GAP : 0;
  const previewOnRight =
    visible && pos !== null && typeof window !== "undefined"
      ? pos.left + MENU_WIDTH + PREVIEW_GAP + PREVIEW_W + 16 < window.innerWidth
      : true;
  const previewLeft = previewOnRight ? previewLeftRight : previewLeftLeft;
  const previewTop =
    visible && pos !== null && previewPos !== null && typeof window !== "undefined"
      ? Math.min(pos.top + previewPos.top - 4, window.innerHeight - 160)
      : 0;

  const menu = visible ? (
    <div
      ref={menuRef}
      className="z-[9999] w-72 overflow-hidden rounded-lg border border-hairline bg-white sketch-border sketch-shadow"
      style={{
        position: "fixed",
        top: pos!.top,
        left: pos!.left,
        maxHeight: MENU_MAX_HEIGHT,
      }}
      onMouseDown={(e) => e.preventDefault()}
    >
      {actions.length === 0 ? (
        <div className="px-3 py-8 text-center">
          <div className="text-[13px] text-ink-muted">没有找到命令</div>
          <div className="mt-1 text-[11px] text-ink-faint">试试其他关键词或按 ESC 退出</div>
        </div>
      ) : (
        <>
          <div
            ref={listRef}
            className="overflow-y-auto overscroll-contain py-1"
            style={{ maxHeight: MENU_MAX_HEIGHT - 38 }}
          >
            {(() => {
              let flatIndex = 0;
              return groups.map((g) => (
                <div key={g.name}>
                  <div className="px-3 pt-2.5 pb-1 text-[11px] font-medium text-ink-faint font-hand-display">
                    {g.name}
                  </div>
                  {g.items.map((item) => {
                    const idx = flatIndex++;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        data-idx={idx}
                        onClick={() => item.run()}
                        onMouseEnter={() => setActiveIndex(idx)}
                        className={cn(
                          "flex w-full items-center gap-2.5 px-3 py-1.5 text-left transition-colors",
                          activeIndex === idx
                            ? "bg-canvas-soft"
                            : "hover:bg-canvas-soft/60"
                        )}
                      >
                        <span
                          className={cn(
                            "flex h-5 w-5 shrink-0 items-center justify-center text-ink-muted",
                            activeIndex === idx && "text-ink-secondary"
                          )}
                        >
                          {item.icon}
                        </span>
                        <span
                          className={cn(
                            "flex-1 text-[13.5px]",
                            activeIndex === idx
                              ? "font-medium text-ink"
                              : "text-ink-secondary"
                          )}
                        >
                          {item.label}
                        </span>
                        {item.shortcut && (
                          <span className="shrink-0 text-[11px] font-mono text-ink-faint">
                            {item.shortcut}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              ));
            })()}
          </div>
          <div className="flex items-center justify-between border-t border-hairline px-3 py-2">
            <span className="text-[12px] text-ink-faint">关闭菜单</span>
            <kbd className="rounded bg-canvas-soft px-1.5 py-0.5 text-[10px] font-mono text-ink-muted">
              esc
            </kbd>
          </div>
        </>
      )}
    </div>
  ) : null;

  return (
    <>
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
      {typeof document !== "undefined" && menu ? createPortal(menu, document.body) : null}
      {typeof document !== "undefined" && preview ? (
        createPortal(
          <div
            className="z-[9998] pointer-events-none"
            style={{
              position: "fixed",
              top: previewTop,
              left: previewLeft,
              width: PREVIEW_W,
              transition: "top 0.08s ease-out",
            }}
          >
            <div className="overflow-hidden rounded-lg bg-ink p-2 shadow-lg">
              {preview.node}
              <div className="mt-1.5 px-1 pb-0.5 text-[11px] font-medium text-white/90">
                {preview.title}
              </div>
            </div>
          </div>,
          document.body
        )
      ) : null}
    </>
  );
}
