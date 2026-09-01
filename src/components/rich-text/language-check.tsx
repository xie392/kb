"use client";

import { useEffect, useState } from "react";
import type { Editor } from "@tiptap/react";
import { languageToolKey } from "@tipkit/extensions";
import { X } from "lucide-react";

/**
 * 语法检查面板 —— 基于 @tipkit/extensions 的 LanguageTool 命令层自建 UI。
 * 注意：默认 check 走 LanguageTool 公共 API（会把文档内容外发），
 * 如需避免外发，请在 use-editor.ts 的 LanguageTool.configure({ check }) 注入自有检查函数。
 */
export function LanguageCheckPanel({
  editor,
  onClose,
}: {
  editor: Editor | null;
  onClose: () => void;
}) {
  const [, force] = useState(0);

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

  /* 检查/清除/忽略不需要抢焦点；采纳建议需要把光标移到错误位置才 focus */
  const quietChain = () => editor.chain();
  const applyChain = () => editor.chain().focus();
  const st = languageToolKey.getState(editor.state);
  const checking = st?.checking ?? false;
  const error = st?.error ?? null;
  const matches = st?.matches ?? [];

  return (
    <div
      className="tk-lt-panel w-80 p-3 bg-card rounded-lg sketch-border sketch-shadow"
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-[13px] font-medium">语法检查</span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            disabled={checking}
            onClick={() => quietChain().checkLanguageTool().run()}
            className="h-7 px-2 text-[12px] rounded border border-hairline disabled:opacity-40 hover:bg-canvas-soft"
          >
            {checking ? "检查中…" : matches.length ? "重新检查" : "检查全文"}
          </button>
          {matches.length > 0 && (
            <button
              type="button"
              onClick={() => quietChain().clearLanguageToolMatches().run()}
              className="h-7 px-2 text-[12px] rounded border border-hairline text-ink-muted hover:bg-canvas-soft"
            >
              清除
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label="关闭语法检查"
            className="h-7 w-7 grid place-items-center rounded hover:bg-canvas-soft text-ink-muted"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="max-h-72 overflow-y-auto">
        {checking && (
          <div className="py-4 text-center text-[12px] text-ink-faint">正在检查语法…</div>
        )}
        {!checking && error && (
          <div className="py-2 px-2 text-[12px] text-red-600">检查失败：{error}</div>
        )}
        {!checking && !error && matches.length === 0 && (
          <div className="py-4 text-center text-[12px] text-ink-faint">暂无问题，点击"检查全文"开始</div>
        )}
        {!checking &&
          matches.map((m, i) => {
            const reps = m.replacements ?? [];
            return (
              <div
                key={`${i}-${m.from}`}
                className="mb-1.5 rounded border border-hairline bg-canvas-soft/60 p-2"
              >
                <div className="text-[12px] text-ink-secondary leading-snug mb-1">
                  {m.shortMessage ?? m.message}
                </div>
                {reps.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1">
                    {reps.slice(0, 3).map((r) => (
                      <button
                        key={r.value}
                        type="button"
                        onClick={() => applyChain().applyLanguageToolSuggestion(i, r.value).run()}
                        className="h-6 px-2 text-[12px] rounded border border-primary/30 text-primary hover:bg-primary/10"
                      >
                        {r.value}
                      </button>
                    ))}
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => quietChain().dismissLanguageToolMatch(i).run()}
                  className="mt-1 text-[11px] text-ink-faint hover:text-ink-secondary"
                >
                  忽略
                </button>
              </div>
            );
          })}
      </div>
    </div>
  );
}
