"use client";

import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import ArticleHistoryDialog from "@/components/article-history-dialog";
import { List } from "lucide-react";

interface Props {
  isEdit: boolean;
  title: string;
  saving: boolean;
  showToc: boolean;
  onToggleToc: () => void;
  onBack: () => void;
  onSave: () => void;
  visibility: "private" | "public";
  onVisibilityChange: (v: "private" | "public") => void;
  /** 编辑态才有：历史版本入口 */
  articleId?: string;
  onRestored: (data: { title: string; content: string; summary: string }) => void;
}

/** 编辑器顶部固定操作栏：返回 / 历史版本 / 大纲开关 / 可见性 / 保存 */
export default function EditorTopBar({
  isEdit,
  title,
  saving,
  showToc,
  onToggleToc,
  onBack,
  onSave,
  visibility,
  onVisibilityChange,
  articleId,
  onRestored,
}: Props) {
  return (
    <div className="sticky top-0 z-30 shrink-0 bg-canvas/95 backdrop-blur-sm border-b border-hairline">
      <div className="px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onBack}
                  aria-label="返回"
                  className="hover:text-ink-secondary"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10 3L5 8l5 5" />
                  </svg>
                </Button>
              }
            />
            <TooltipContent>返回</TooltipContent>
          </Tooltip>
          <span className="text-[14px] text-ink-faint">{isEdit ? "编辑文章" : "写笔记"}</span>
        </div>

        <div className="flex items-center gap-3">
          {/* 历史版本（仅编辑态） */}
          {isEdit && articleId && (
            <ArticleHistoryDialog articleId={articleId} onRestored={onRestored} />
          )}

          {/* 大纲开关 */}
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onToggleToc}
                  className={showToc ? "text-primary" : "text-ink-muted hover:text-ink-secondary"}
                >
                  <List className="w-4 h-4" />
                </Button>
              }
            />
            <TooltipContent>{showToc ? "隐藏大纲" : "显示大纲"}</TooltipContent>
          </Tooltip>

          {/* 权限切换 */}
          <Tooltip>
            <TooltipTrigger
              render={
                <div className="flex items-center gap-0 p-0.5 bg-canvas-soft rounded-full border border-hairline">
                  {(["private", "public"] as const).map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => onVisibilityChange(v)}
                      className={`px-3 h-7 text-[13px] font-medium rounded-full transition-all ${
                        visibility === v
                          ? "bg-white text-primary shadow-xs border border-hairline"
                          : "text-ink-muted hover:text-ink-secondary"
                      }`}
                    >
                      {v === "private" ? "私有" : "公开"}
                    </button>
                  ))}
                </div>
              }
            />
            <TooltipContent>文章可见性：私有仅自己可见，公开可被搜索引擎收录</TooltipContent>
          </Tooltip>

          {/* 保存按钮 */}
          {saving ? (
            <span className="text-[13px] text-ink-faint flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M2 8a6 6 0 1 1 11 3.5" strokeLinecap="round" />
              </svg>
              保存中…
            </span>
          ) : (
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    type="button"
                    onClick={onSave}
                    disabled={!title.trim()}
                    className="px-4 disabled:bg-hairline disabled:text-ink-faint disabled:opacity-100"
                  >
                    保存
                  </Button>
                }
              />
              <TooltipContent>保存文章 (⌘S)</TooltipContent>
            </Tooltip>
          )}
        </div>
      </div>
    </div>
  );
}
