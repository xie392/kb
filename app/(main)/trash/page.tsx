import Link from "next/link";
import { articles } from "@/lib/mock-data";
import { formatDate } from "@/lib/format";

export default function TrashPage() {
  // Mock：回收站内容（正常数据里没有，这里演示空态 + 恢复交互）
  const trash = articles.filter((a) => a.id === "none");

  return (
    <div className="max-w-[1000px] mx-auto px-6 py-10">
      <header className="mb-8 text-center pt-4 fade-up">
        <h1 className="font-hand-display text-[40px] font-bold text-[#213183]">回收站</h1>
        <p className="mt-2 text-[14px] text-[#615d59]">
          删除的笔记会在这里保留，可恢复或永久删除
        </p>
      </header>

      {trash.length > 0 ? (
        <div className="divide-y divide-hairline">
          {trash.map((article, i) => (
            <div
              key={article.id}
              className="flex items-center gap-4 py-4 fade-up opacity-70"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <svg className="w-4 h-4 text-[#a39e98] shrink-0" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M3.5 4.5h9M6.5 4.5V3.5A1 1 0 0 1 7.5 2.5h1a1 1 0 0 1 1 1v1m-5 0l.5 9a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1l.5-9" />
              </svg>
              <span className="text-[13px] text-[#a39e98] tabular-nums w-16 shrink-0">
                {formatDate(article.updatedAt)}
              </span>
              <span className="text-[15px] text-[#31302e] line-through truncate flex-1">
                {article.title}
              </span>
              <button className="text-[12.5px] text-primary hover:underline shrink-0">恢复</button>
              <button className="text-[12.5px] text-red-400 hover:underline shrink-0">永久删除</button>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-16 text-center fade-up">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-canvas border border-[#e6e6e6] grid place-items-center mb-4">
            <svg className="w-6 h-6 text-[#a39e98]" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M4 6h12M8 6V4.5A1.5 1.5 0 0 1 9.5 3h1A1.5 1.5 0 0 1 12 4.5V6m-7 0l.6 10a1.5 1.5 0 0 0 1.5 1.4h5.8a1.5 1.5 0 0 0 1.5-1.4L15 6" />
            </svg>
          </div>
          <div className="text-[14px] text-[#615d59]">回收站是空的</div>
          <p className="mt-2 text-[12.5px] text-[#a39e98]">
            删除的笔记会暂时保留在这里，随时可以恢复
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 mt-6 h-9 px-5 rounded-full bg-primary text-white text-[13px] font-medium hover:bg-primary-active transition-colors"
          >
            返回首页
          </Link>
        </div>
      )}
    </div>
  );
}
