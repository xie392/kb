"use client";

import { useEffect, useRef, useState } from "react";
import type { Editor } from "@tiptap/react";
import { searchAndReplaceKey } from "@tipkit/extensions";
import { X } from "lucide-react";

/**
 * 查找替换面板 —— 基于 @tipkit/extensions 的 SearchAndReplace 命令层自建 UI。
 *
 * 注意：setSearchTerm / replaceSearchMatch / replaceAllSearchMatches 执行时不能调用
 * chain().focus()，否则会把焦点从输入框抢回 ProseMirror，触发 Popover 失焦关闭。
 * 只有“上一个/下一个/Enter 跳转”这类需要移动光标的操作才 focus 编辑器。
 */
export function FindReplacePanel({
  editor,
  onClose,
}: {
  editor: Editor | null;
  onClose: () => void;
}) {
  const [term, setTerm] = useState("");
  const [replace, setReplace] = useState("");
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [, force] = useState(0);
  const findInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!editor) return;
    const refresh = () => force((n) => n + 1);
    editor.on("update", refresh);
    editor.on("selectionUpdate", refresh);
    return () => {
      editor.off("update", refresh);
      editor.off("selectionUpdate", refresh);
    };
  }, [editor]);

  if (!editor) return null;

  /* 不抢焦点的命令链：仅设置/替换搜索词，保持输入框焦点 */
  const quietChain = () => editor.chain();
  /* 跳转类操作：需要移动光标到匹配位置时才 focus */
  const jumpChain = () => editor.chain().focus();

  const st = searchAndReplaceKey.getState(editor.state);
  const count = st?.matches.length ?? 0;
  const active = st?.activeIndex ?? -1;
  const hasTerm = term.trim().length > 0;

  return (
    <div
      className="tk-find-replace w-72 p-3 bg-card rounded-lg sketch-border sketch-shadow"
      /* 拦截 mousedown 防止点击面板自身导致 Popover 外部点击关闭 */
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div className="flex items-center gap-2 mb-2">
        <input
          ref={findInputRef}
          value={term}
          onChange={(e) => {
            const v = e.target.value;
            setTerm(v);
            quietChain().setSearchTerm(v, { caseSensitive }).run();
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              jumpChain().nextSearchMatch().run();
            } else if (e.key === "Escape") {
              e.preventDefault();
              onClose();
            }
          }}
          placeholder="查找"
          autoFocus
          className="flex-1 min-w-0 h-7 px-2 text-[13px] rounded border border-hairline bg-canvas-soft outline-none focus:border-primary"
        />
        <button
          type="button"
          onClick={() => {
            setCaseSensitive((v) => {
              const next = !v;
              quietChain().setSearchTerm(term, { caseSensitive: next }).run();
              return next;
            });
          }}
          className={`h-7 px-2 text-[11px] rounded border transition-colors ${
            caseSensitive ? "border-primary text-primary bg-canvas-soft" : "border-hairline text-ink-muted"
          }`}
        >
          Aa
        </button>
        <button
          type="button"
          onClick={onClose}
          aria-label="关闭查找替换"
          className="h-7 w-7 grid place-items-center rounded hover:bg-canvas-soft text-ink-muted"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="flex items-center gap-1 mb-2">
        <span className="text-[12px] text-ink-faint tabular-nums min-w-10">
          {hasTerm ? `${count ? active + 1 : 0}/${count}` : ""}
        </span>
        <button
          type="button"
          disabled={!count}
          onClick={() => jumpChain().previousSearchMatch().run()}
          className="flex-1 h-7 text-[13px] rounded border border-hairline disabled:opacity-40 hover:bg-canvas-soft"
        >
          上一个
        </button>
        <button
          type="button"
          disabled={!count}
          onClick={() => jumpChain().nextSearchMatch().run()}
          className="flex-1 h-7 text-[13px] rounded border border-hairline disabled:opacity-40 hover:bg-canvas-soft"
        >
          下一个
        </button>
      </div>

      <div className="flex items-center gap-1">
        <input
          value={replace}
          onChange={(e) => setReplace(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              quietChain().replaceSearchMatch(replace).run();
              /* 替换后保持焦点在查找输入框 */
              findInputRef.current?.focus();
            }
          }}
          placeholder="替换为"
          className="flex-1 min-w-0 h-7 px-2 text-[13px] rounded border border-hairline bg-canvas-soft outline-none focus:border-primary"
        />
        <button
          type="button"
          disabled={!count}
          onClick={() => quietChain().replaceSearchMatch(replace).run()}
          className="h-7 px-2 text-[13px] rounded border border-hairline disabled:opacity-40 hover:bg-canvas-soft"
        >
          替换
        </button>
        <button
          type="button"
          disabled={!count}
          onClick={() => quietChain().replaceAllSearchMatches(replace).run()}
          className="h-7 px-2 text-[13px] rounded border border-hairline disabled:opacity-40 hover:bg-canvas-soft"
        >
          全部
        </button>
      </div>
    </div>
  );
}
