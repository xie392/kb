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
}

const Ctx = createContext<ReadonlyArticleCtx>({ editor: null, outline: [] });

/** 包裹正文与 TOC，共享同一个只读编辑器实例（保持原 DOM 结构，TOC 可在 article 卡片外） */
export function ReadonlyArticleProvider({
  content,
  children,
}: {
  content: string;
  children: ReactNode;
}) {
  const [outline, setOutline] = useState<OutlineItem[]>([]);
  const editor = useArticleEditor({
    value: content,
    editable: false,
    onOutline: setOutline,
  });

  const value = useMemo(() => ({ editor, outline }), [editor, outline]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

/** 正文渲染区：放在 article 卡片内 */
export function ReadonlyArticleContent() {
  const { editor, outline } = useContext(Ctx);

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

  return (
    <div className="tk-theme-sketch tk-readonly">
      <div className="tk-editor">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}

/** 目录：放在 article 卡片外，保持 sticky 定位 */
export function ReadonlyArticleToc() {
  const { outline } = useContext(Ctx);
  const items = useMemo<TocItem[]>(
    () => outline.map((it) => ({ id: it.id, text: it.text, level: it.level })),
    [outline],
  );
  return <ArticleToc items={items} />;
}
