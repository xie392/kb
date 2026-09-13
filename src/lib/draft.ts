"use client";

/**
 * 本地草稿：文章编辑器未保存内容的暂存与恢复。
 * 存 localStorage（单机/单用户场景足够），保留 7 天，避免刷新或误关页面丢内容。
 */

const PREFIX = "kb:draft:";
const MAX_AGE = 7 * 24 * 60 * 60 * 1000;

export type ArticleDraft = {
  title: string;
  content: string;
  categoryId: string;
  visibility: "private" | "public";
  tagIds: string[];
  savedAt: number;
};

/** 新建与编辑各自独立的草稿键 */
export function draftKey(articleId?: string): string {
  return articleId ? `${PREFIX}article:${articleId}` : `${PREFIX}new`;
}

/** 读取草稿；超过 7 天自动清理并返回 null */
export function loadDraft(key: string): ArticleDraft | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    const draft = JSON.parse(raw) as ArticleDraft;
    if (!draft || typeof draft !== "object") return null;
    if (Date.now() - (draft.savedAt ?? 0) > MAX_AGE) {
      window.localStorage.removeItem(key);
      return null;
    }
    return draft;
  } catch {
    return null;
  }
}

export function saveDraft(
  key: string,
  draft: Omit<ArticleDraft, "savedAt">
): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      key,
      JSON.stringify({ ...draft, savedAt: Date.now() })
    );
  } catch {
    // 隐私模式 / 配额不足时静默失败，不影响正常编辑
  }
}

export function clearDraft(key: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}

/** 草稿状态的稳定序列化，用于判断内容是否发生变化 */
export function serializeDraftState(s: {
  title: string;
  content: string;
  categoryId: string;
  visibility: string;
  tagIds: string[];
}): string {
  return JSON.stringify([s.title, s.content, s.categoryId, s.visibility, s.tagIds]);
}
