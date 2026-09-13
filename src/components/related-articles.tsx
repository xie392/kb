import Link from "next/link";

type RelatedItem = {
  id: string;
  title: string;
  categoryName: string | null;
  updatedAt: Date;
  tagNames: string[];
};

/** 文章详情底部的「相关阅读」：按共享标签/同分类推荐 */
export default function RelatedArticles({ items }: { items: RelatedItem[] }) {
  if (items.length === 0) return null;

  return (
    <section className="mt-10">
      <div className="flex items-center gap-3 mb-4">
        <h2 className="font-hand-display text-[22px] font-bold text-ink-secondary marker-underline inline-block rotate-[-0.5deg]">
          相关阅读
        </h2>
        <span className="flex-1 pencil-line h-[2px]" />
      </div>
      <div className="grid sm:grid-cols-3 gap-4">
        {items.map((a, i) => (
          <Link
            key={a.id}
            href={`/article/${a.id}`}
            className={`sticky-note sketch-border px-4 py-3 transition-transform group hover:rotate-0 ${
              i % 2 ? "rotate-[0.8deg]" : "rotate-[-0.8deg]"
            }`}
          >
            <div className="font-hand-body text-[13px] text-sticker-pink">
              【{a.categoryName ?? "未分类"}】
            </div>
            <div className="mt-1 font-hand-display text-[17px] font-bold text-sticker-brown line-clamp-2 group-hover:text-primary transition-colors">
              {a.title}
            </div>
            {a.tagNames.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-x-2 gap-y-0.5">
                {a.tagNames.slice(0, 3).map((t) => (
                  <span key={t} className="font-hand-body text-[12px] text-ink-faint">
                    #{t}
                  </span>
                ))}
              </div>
            )}
          </Link>
        ))}
      </div>
    </section>
  );
}
