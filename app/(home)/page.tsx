import Link from "next/link";
import { articles, categories } from "@/lib/mock-data";
import { formatDate } from "@/lib/format";
import HandChart from "@/components/hand-chart";

function HandPost({ article, index }: { article: (typeof articles)[0]; index: number }) {
  return (
    <Link
      href={`/article/${article.id}`}
      className="group flex items-start gap-4 py-4 px-4 hover:bg-white/60 transition-colors fade-up"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <span className="w-10 h-10 shrink-0 grid place-items-center sketch-border sketch-shadow bg-white font-hand-display text-[18px] font-bold text-[#213183] rotate-[-3deg]">
        {String(index + 1).padStart(2, "0")}
      </span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className="font-hand-body text-[14px] px-1.5"
            style={{ color: article.categoryColor }}
          >
            【{article.category}】
          </span>
          {article.isPinned && (
            <span className="marker-highlight font-hand-display text-[13px] text-[#523410] rotate-[-1deg]">
              ★ 置顶
            </span>
          )}
          <span className="font-hand-body text-[13px] text-[#a39e98]">
            {formatDate(article.updatedAt)}
          </span>
        </div>
        <h3 className="mt-1 font-hand-display text-[24px] font-bold leading-snug text-[#31302e] group-hover:text-[#0075de] transition-colors marker-underline inline-block">
          {article.title}
        </h3>
        <p className="mt-1 font-hand-body text-[15px] text-[#615d59] leading-relaxed line-clamp-2">
          {article.summary}
        </p>
        <div className="mt-2 flex items-center gap-2 flex-wrap">
          {article.tags.map((t) => (
            <span key={t} className="font-hand-body text-[13px] text-[#a39e98]">
              #{t}
            </span>
          ))}
          <span className="font-hand-display text-[14px] text-[#0075de] opacity-0 group-hover:opacity-100 transition-opacity">
            阅读 →
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function HomePage() {
  const featured = articles.filter((a) => a.isPinned || a.isFavorite).slice(0, 3);
  const rest = articles.filter((a) => !featured.includes(a));

  return (
    <div className="graph-paper min-h-screen font-hand-body text-[#31302e]">
      {/* ─── 手绘 Hero：标签页 + 便签 + 手绘标题 ─── */}
      <section className="max-w-[1000px] mx-auto px-6 pt-14 pb-10 text-center">
        {/* 手写大标题 */}
        <h1 className="font-hand-display text-[64px] sm:text-[80px] font-bold leading-none text-[#213183] rotate-[-2deg] inline-block">
          我的知识库
          <span className="block w-full h-[6px] mt-2 rotate-[-1deg]" style={{
            background: "repeating-linear-gradient(90deg, rgba(0,117,222,0.55) 0 8px, transparent 8px 14px)",
            borderRadius: "3px",
          }} />
        </h1>

        <p className="mt-6 font-hand-body text-[20px] text-[#615d59] max-w-md mx-auto">
          记录碎片化的想法，<span className="marker-highlight">沉淀系统化的知识</span>
        </p>

        {/* 手绘统计（便签风） */}
        <div className="mt-10 flex items-center justify-center gap-6 flex-wrap">
          {[
            { v: "42", l: "笔记总数" },
            { v: "3", l: "分类" },
            { v: "6", l: "标签" },
            { v: "7", l: "收藏" },
          ].map((s, i) => (
            <div
              key={s.l}
              className="sticky-note sketch-border px-5 py-3 rotate-[-2deg] fade-up"
              style={{ animationDelay: `${i * 100}ms`, transform: `rotate(${[-2, 1, -1, 2][i]}deg)` }}
            >
              <div className="font-hand-display text-[34px] font-bold text-[#523410] leading-none">
                {s.v}
              </div>
              <div className="mt-1 font-hand-body text-[14px] text-[#793400]">{s.l}</div>
            </div>
          ))}
        </div>

        {/* 分类手绘胶囊 */}
        <div className="mt-10 flex items-center justify-center gap-3 flex-wrap fade-up" style={{ animationDelay: "200ms" }}>
          {categories.map((c, i) => (
            <Link
              key={c.id}
              href={`/categories#${c.id}`}
              className={`font-hand-display text-[18px] px-4 py-1.5 bg-white sketch-border sketch-shadow hover:-translate-y-0.5 transition-transform ${
                i % 2 ? "rotate-[1deg]" : "rotate-[-1deg]"
              }`}
            >
              <span style={{ color: c.color }}>●</span> {c.name}
              <span className="text-[#a39e98] text-[14px]"> ({c.count})</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ─── 便签注释（侧边手绘注释）─── */}
      <div className="relative max-w-[1000px] mx-auto px-6">
        <div className="hidden lg:block sticky-note sketch-border-2 px-4 py-3 rotate-[3deg] absolute -left-16 top-8 w-[140px] fade-up">
          <div className="font-hand-display text-[16px] font-bold text-[#523410]">✏️ 提示</div>
          <div className="mt-1 font-hand-body text-[13px] text-[#793400] leading-snug">
            点击卡片进入完整笔记
          </div>
        </div>

        {/* ─── 图表占位符（手绘）─── */}
        <div className="mb-10 sketch-dashed p-4 flex items-center gap-6 rotate-[-0.5deg] fade-up" style={{ animationDelay: "100ms" }}>
          <div className="flex-1 min-w-0">
            <div className="font-hand-display text-[20px] font-bold text-[#31302e] marker-underline inline-block">
              近 30 天笔记增长
            </div>
            <div className="mt-3"><HandChart /></div>
          </div>
          <div className="hidden sm:block sticky-note sketch-border px-3 py-2 rotate-[2deg] shrink-0">
            <div className="font-hand-body text-[13px] text-[#523410]">手绘占位图表</div>
            <div className="font-hand-body text-[12px] text-[#a39e98]">接入真实数据后替换</div>
          </div>
        </div>
      </div>

      {/* ─── 精选（手绘卡片 + 标签页变体）─── */}
      <section className="max-w-[1000px] mx-auto px-6 pb-14">
        <div className="flex items-center gap-3 mb-4">
          <span className="font-hand-display text-[24px] font-bold text-[#213183] marker-underline inline-block">
            精选笔记
          </span>
          <span className="flex-1 pencil-line h-[2px]" />
        </div>

        {/* 标签页变体 */}
        <div className="flex items-end gap-1 mb-0 pl-3">
          <span className="sketch-tab font-hand-display text-[15px] font-bold text-[#0075de]">全部</span>
          {categories.slice(0, 2).map((c) => (
            <span key={c.id} className="sketch-tab font-hand-body text-[14px] text-[#a39e98] opacity-70" style={{ top: 0 }}>
              {c.name}
            </span>
          ))}
        </div>

        <div className="bg-white sketch-border sketch-shadow p-5 grid grid-cols-1 md:grid-cols-3 gap-5 -mt-[1px]">
          {featured.map((article, i) => (
            <Link
              key={article.id}
              href={`/article/${article.id}`}
              className="group sketch-dashed p-4 hover:bg-[#f6f5f4] transition-colors fade-up flex flex-col"
              style={{ animationDelay: `${i * 90}ms` }}
            >
              <span
                className="font-hand-body text-[13px]"
                style={{ color: article.categoryColor }}
              >
                【{article.category}】
              </span>
              <h3 className="mt-1.5 font-hand-display text-[20px] font-bold leading-snug text-[#31302e] group-hover:text-[#0075de] transition-colors">
                {article.title}
              </h3>
              <p className="mt-1.5 font-hand-body text-[14px] text-[#615d59] leading-relaxed line-clamp-2 flex-1">
                {article.summary}
              </p>
              <div className="mt-2 flex items-center justify-between">
                <span className="font-hand-body text-[13px] text-[#a39e98]">
                  {formatDate(article.updatedAt)}
                </span>
                <span className="font-hand-display text-[14px] text-[#0075de]">→</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ─── 全部文章（手绘列表）─── */}
      <section className="max-w-[1000px] mx-auto px-6 pb-16">
        <div className="flex items-center gap-3 mb-4">
          <span className="font-hand-display text-[24px] font-bold text-[#213183] marker-underline inline-block">
            全部文章
          </span>
          <span className="font-hand-body text-[15px] text-[#a39e98]">{rest.length} 篇</span>
          <span className="flex-1 pencil-line h-[2px]" />
          <Link href="/favorites" className="font-hand-display text-[16px] text-[#0075de] hover:underline">
            收藏夹 →
          </Link>
        </div>

        <div className="bg-white sketch-border sketch-shadow divide-y divide-dashed divide-[#e6e6e6]">
          {rest.map((article, i) => (
            <HandPost key={article.id} article={article} index={i} />
          ))}
        </div>
      </section>
    </div>
  );
}
