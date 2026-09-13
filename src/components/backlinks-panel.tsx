import Link from "next/link";
import { formatDate } from "@/lib/format";

export type BacklinkItem = {
  id: string;
  title: string;
  summary: string | null;
  visibility: string;
  updatedAt: Date;
  categoryName: string | null;
};

/**
 * 文章详情底部的「反向链接」：列出所有通过 [[标题]] 引用了本文的笔记。
 * 纯展示组件（服务端渲染），数据由 page 通过 getArticleLinks 注入。
 */
export default function BacklinksPanel({ items }: { items: BacklinkItem[] }) {
  if (items.length === 0) return null;

  return (
    <section className="mt-10">
      <div className="flex items-center gap-3 mb-4">
        <h2 className="font-hand-display text-[22px] font-bold text-ink-secondary marker-underline inline-block rotate-[-0.5deg]">
          反向链接
        </h2>
        <span className="font-hand-body text-[14px] text-sticker-pink">↩ {items.length}</span>
        <span className="flex-1 pencil-line h-[2px]" />
      </div>
      <ul className="space-y-3 list-none">
        {items.map((a, i) => (
          <li key={a.id}>
            <Link
              href={`/article/${a.id}`}
              className={`group flex items-start gap-3 px-4 py-3 bg-white sketch-border transition-transform hover:-translate-y-0.5 ${
                i % 2 ? "rotate-[0.4deg]" : "rotate-[-0.4deg]"
              }`}
            >
              <span className="mt-1.5 w-2 h-2 shrink-0 rotate-12 bg-sticker-sky" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 font-hand-body text-[13px] text-ink-faint">
                  <span className="text-sticker-pink">【{a.categoryName ?? "未分类"}】</span>
                  <span>{formatDate(a.updatedAt.toISOString())}</span>
                  {a.visibility !== "public" && <span className="text-ink-faint">· 私有</span>}
                </div>
                <div className="mt-0.5 font-hand-display text-[18px] font-bold text-ink-secondary group-hover:text-primary transition-colors line-clamp-1">
                  {a.title}
                </div>
                {a.summary && (
                  <div className="mt-0.5 font-hand-body text-[14px] text-ink-muted line-clamp-1">
                    {a.summary}
                  </div>
                )}
              </div>
              <span className="shrink-0 mt-1 font-hand-display text-[16px] text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                →
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
