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
import { trimTrailingEmptyParagraphs } from "@/lib/html";

// 用于标记客户端挂载完成，避免 hydration mismatch（服务端无 editor，
// 客户端挂载后 TipTap 会修改 DOM 结构，#418 就是这个原因）
function useIsMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}

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
  const trimmedContent = trimTrailingEmptyParagraphs(content);
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
  const { editor, content } = useContext(Ctx);
  const mounted = useIsMounted();

  // 注意：这里曾给标题注入 id 供目录锚点使用，现已移除。
  // 原因：标题 id 写在 ProseMirror 托管的 DOM 上，而 UniqueID 扩展挂载后会用
  // 重试事务补 `data-id`，ProseMirror 随之重渲染标题节点，手写的 id 会被抹掉，
  // 导致目录高亮与点击跳转同时失效。
  // 目录现已改为按「文档顺序 + 索引」定位正文标题（见 article-toc.tsx），不再依赖 id。

  // hydration 期间保持和服务端一致的原始 HTML 输出，等客户端挂载完成后
  // 再替换为 TipTap 编辑器渲染，避免 DOM 结构不一致导致 React #418 错误
  if (!mounted || !editor) {
    return (
      <div className="tk-theme-sketch tk-readonly">
        <div className="tk-editor">
          <div
            className="tk-prosemirror prose-kb"
            dangerouslySetInnerHTML={{ __html: content }}
            suppressHydrationWarning
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
  const { outline } = useContext(Ctx);
  const mounted = useIsMounted();
  const items = useMemo<TocItem[]>(
    () => outline.map((it) => ({ id: it.id, text: it.text, level: it.level })),
    [outline],
  );

  // hydration 未完成时显示骨架，避免初始 outline 为空导致闪烁或不匹配
  if (!mounted || outline.length === 0) return <TocSkeleton />;
  return <ArticleToc items={items} />;
}
