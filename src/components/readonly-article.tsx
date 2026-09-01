"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { EditorContent, type Editor } from "@tiptap/react";
import { useArticleEditor } from "@/components/rich-text/use-editor";
import type { OutlineItem } from "@/components/rich-text/types";
import ArticleToc from "@/components/article-toc";
import type { TocItem } from "@/lib/toc";

interface ReadonlyArticleCtx {
  editor: Editor | null;
  outline: OutlineItem[];
  content: string;
}

const Ctx = createContext<ReadonlyArticleCtx>({ editor: null, outline: [], content: "" });

/** 包裹正文与 TOC，共享同一个只读编辑器实例（保持原 DOM 结构，TOC 可在 article 卡片外） */
export function ReadonlyArticleProvider({
  content,
  children,
}: {
  content: string;
  children: ReactNode;
}) {
  const [outline, setOutline] = useState<OutlineItem[]>([]);
  // 入口统一去除尾部空段落，兼容历史被 TrailingNode 污染的数据
  const trimmedContent = content
    ? content.replace(/(?:<p(?:\s[^>]*)?>(?:<br\s*\/?>|\s|&nbsp;|&#xA0;)*<\/p>\s*)+$/i, "")
    : content;
  const editor = useArticleEditor({
    value: trimmedContent,
    editable: false,
    onOutline: setOutline,
  });

  const value = useMemo(
    () => ({ editor, outline, content: trimmedContent }),
    [editor, outline, trimmedContent],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

/** 正文渲染区：放在 article 卡片内 */
export function ReadonlyArticleContent() {
  const { editor, outline, content } = useContext(Ctx);

  // 编辑器渲染后给标题注入 id，供 TOC 锚点与 IntersectionObserver 使用
  useEffect(() => {
    if (!editor || outline.length === 0) return;

    const headingEls = Array.from(
      editor.view.dom.querySelectorAll<HTMLElement>("h1, h2, h3, h4, h5, h6"),
    );
    headingEls.forEach((el, idx) => {
      const item = outline[idx];
      if (item) el.id = item.id;
    });

    return () => {
      headingEls.forEach((el) => el.removeAttribute("id"));
    };
  }, [editor, outline]);

  // 编辑器未初始化时，直接用服务端 HTML 渲染占位，高度完全匹配避免跳动。
  // 必须给占位套上 tk-prosemirror prose-kb（与编辑器挂载后的 class 一致），
  // 否则 SSR/首屏这段原始 HTML 没有正文排版样式，会出现"先无样式、等一下才有"的闪烁。
  if (!editor) {
    return (
      <div className="tk-theme-sketch tk-readonly">
        <div className="tk-editor">
          <div
            className="tk-prosemirror prose-kb"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="tk-theme-sketch tk-readonly">
      <div className="tk-editor">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}

function TocSkeleton() {
  return (
    <aside className="hidden xl:block w-50 shrink-0 sticky top-20 self-start max-h-[calc(100vh-100px)] overflow-y-auto">
      <div>
        <div className="font-hand-display text-[17px] font-bold text-secondary mb-2 flex items-center gap-2">
          <span className="w-5 h-5 grid place-items-center sketch-border-2 bg-white text-[12px] rotate-[2deg]">
            ¶
          </span>
          <div className="w-16 h-[14px] bg-hairline/40 rounded-sm animate-pulse rotate-[-1deg]" />
        </div>
        <nav className="sketch-dashed p-1.5 bg-white/50">
          <ul className="space-y-0 list-none">
            {[...Array(5)].map((_, i) => (
              <li key={i}>
                <div
                  className="block py-0.5 px-1.5 rounded-xs"
                  style={{ paddingLeft: `${Math.min(i, 2) * 8 + 6}px` }}
                >
                  <div
                    className="h-[12px] bg-hairline/40 rounded-sm animate-pulse"
                    style={{ width: `${85 - i * 8}%`, transform: `rotate(${(i % 2 ? 0.3 : -0.2)}deg)` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </aside>
  );
}

/** 目录：放在 article 卡片外，保持 sticky 定位 */
export function ReadonlyArticleToc() {
  const { editor, outline } = useContext(Ctx);
  const items = useMemo<TocItem[]>(
    () => outline.map((it) => ({ id: it.id, text: it.text, level: it.level })),
    [outline],
  );

  // 编辑器未初始化时显示骨架占位，避免布局偏移
  if (!editor) return <TocSkeleton />;

  return <ArticleToc items={items} />;
}
