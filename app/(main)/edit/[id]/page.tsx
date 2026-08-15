"use client";

import { useState } from "react";
import Link from "next/link";
import { categories, tags } from "@/lib/mock-data";

const toolbarGroups = [
  [
    { label: "H1", action: "h1" },
    { label: "H2", action: "h2" },
    { label: "H3", action: "h3" },
  ],
  [
    { label: "B", action: "bold", icon: "bold" },
    { label: "I", action: "italic", icon: "italic" },
    { label: "U", action: "underline", icon: "underline" },
    { label: "S", action: "strike", icon: "strike" },
  ],
  [
    { label: "列表", action: "bullet-list", icon: "list" },
    { label: "编号", action: "ordered-list", icon: "ordered" },
    { label: "引用", action: "quote", icon: "quote" },
    { label: "代码", action: "code", icon: "code" },
  ],
];

function ToolbarButton({ label, icon }: { label: string; icon?: string }) {
  return (
    <button
      type="button"
      title={label}
      className="min-w-[30px] h-[30px] px-1.5 rounded-[6px] text-[13px] text-[#615d59] hover:bg-[#f6f5f4] hover:text-[#31302e] transition-colors grid place-items-center"
    >
      {icon === "bold" && <span className="font-bold">B</span>}
      {icon === "italic" && <span className="italic">I</span>}
      {icon === "underline" && <span className="underline underline-offset-2">U</span>}
      {icon === "strike" && <span className="line-through">S</span>}
      {icon === "list" && (
        <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M3 4.5h10M3 8h10M3 11.5h10" strokeLinecap="round" />
          <circle cx="6.5" cy="4.5" r="0.5" fill="currentColor" />
        </svg>
      )}
      {icon === "ordered" && (
        <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M6 4.5h7M6 8h7M6 11.5h7" strokeLinecap="round" />
          <path d="M2.5 3.5v3M2.5 6.5c.8.5 1.5.9 1.5 1.8 0 .9-.9 1.2-1.5.9M2.5 11.5c.7.3 1.5 0 1.5-.7s-.7-.9-1.5-1.2" />
        </svg>
      )}
      {icon === "quote" && (
        <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
          <path d="M4 4c-1.7 1-2.5 2.8-2.5 5v3h4v-4H3.5c.2-1.3 1-2.3 2-2.9L4 4zm7 0c-1.7 1-2.5 2.8-2.5 5v3h4v-4h-2c.2-1.3 1-2.3 2-2.9L11 4z" />
        </svg>
      )}
      {icon === "code" && (
        <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M6 4L2.5 8 6 12M10 4l3.5 4L10 12" strokeLinecap="round" />
        </svg>
      )}
      {!icon && <span className="text-[11px] font-semibold">{label}</span>}
    </button>
  );
}

export default function EditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [title, setTitle] = useState("Next.js App Router 数据获取模式总结");
  const [visibility, setVisibility] = useState<"private" | "public">("private");
  const [category, setCategory] = useState("study-code");
  const [selectedTags, setSelectedTags] = useState<string[]>(["Next.js", "React"]);
  const [saved, setSaved] = useState(true);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const showDraft = !saved;

  return (
    <div className="min-h-screen flex flex-col">
      {/* 顶部工具栏 */}
      <div className="sticky top-0 z-20 bg-[#fbfaf6]/95 backdrop-blur-sm border-b-2 border-dashed border-[#e6e6e6]">
        <div className="flex items-center gap-3 px-6 h-14">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-[13px] text-[#615d59] hover:text-[#31302e] transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M10 3.5L5.5 8l4.5 4.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            返回
          </Link>
          <span className="text-[12px] text-[#a39e98]">写笔记</span>

          <div className="flex-1" />

          {/* 权限切换 */}
          <div className="flex items-center gap-1 p-1 rounded-[8px] bg-[#f6f5f4] border border-[#e6e6e6]">
            <button
              type="button"
              onClick={() => setVisibility("private")}
              className={`px-3 h-7 rounded-[6px] text-[12.5px] transition-colors ${
                visibility === "private"
                  ? "bg-canvas text-ink shadow-[var(--shadow-soft)] font-medium"
                  : "text-[#615d59] hover:text-[#31302e]"
              }`}
            >
              <span className="inline-flex items-center gap-1.5">
                <svg className="w-3 h-3" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="3.5" y="7" width="9" height="6" rx="1.5" />
                  <path d="M5.5 7V5.5a2.5 2.5 0 0 1 5 0V7" />
                </svg>
                私有
              </span>
            </button>
            <button
              type="button"
              onClick={() => setVisibility("public")}
              className={`px-3 h-7 rounded-[6px] text-[12.5px] transition-colors ${
                visibility === "public"
                  ? "bg-canvas text-ink shadow-[var(--shadow-soft)] font-medium"
                  : "text-[#615d59] hover:text-[#31302e]"
              }`}
            >
              <span className="inline-flex items-center gap-1.5">
                <svg className="w-3 h-3" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M8 3C4.5 3 2 8 2 8s2.5 5 6 5 6-5 6-5-2.5-5-6-5z" />
                  <circle cx="8" cy="8" r="1.8" />
                </svg>
                公开
              </span>
            </button>
          </div>

          {/* 保存状态 */}
          <span className="flex items-center gap-1.5 text-[12px] text-[#a39e98]">
            <span className={`w-1.5 h-1.5 rounded-full ${saved ? "bg-sticker-green" : "bg-sticker-orange animate-pulse"}`} />
            {saved ? "已保存" : "保存中…"}
          </span>

          <button
            type="button"
            onClick={() => setSaved(true)}
            className="h-8 px-4 rounded-full bg-primary text-white text-[13px] font-medium hover:bg-primary-active transition-colors"
          >
            保存
          </button>
        </div>

        {/* 草稿提示条 */}
        {showDraft && (
          <div className="flex items-center gap-2 px-6 h-9 bg-sticker-orange/8 border-t border-sticker-orange/20 text-[12.5px] text-sticker-orange-deep">
            <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M8 2L14 13.5H2L8 2z" strokeLinejoin="round" />
              <path d="M8 6.5v3M8 11.5h.01" strokeLinecap="round" />
            </svg>
            检测到未保存的草稿
            <button className="underline underline-offset-2 font-medium">恢复草稿</button>
            <span className="text-sticker-orange/60">·</span>
            <button className="underline underline-offset-2">丢弃</button>
          </div>
        )}
      </div>

      {/* 编辑区 */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-[960px] mx-auto px-8 py-10">
          {/* 标题输入 */}
          <input
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              setSaved(false);
            }}
            placeholder="无标题"
            className="w-full font-hand-display text-[36px] font-bold tracking-[-1px] text-[#31302e] placeholder:text-[#a39e98] bg-transparent outline-none border-none"
          />

          {/* 元信息行：分类 + 标签 */}
          <div className="mt-4 flex items-center gap-2 flex-wrap">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="h-8 px-3 rounded-[8px] text-[12.5px] bg-[#f6f5f4] border border-[#e6e6e6] text-[#31302e] outline-none focus:border-[#0075de] transition-colors appearance-none pr-8 cursor-pointer"
            >
              {categories.map((cat) => (
                <optgroup key={cat.id} label={cat.name}>
                  {cat.children?.map((child) => (
                    <option key={child.id} value={child.id}>
                      {cat.name} / {child.name}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>

            <div className="flex items-center gap-1.5 flex-wrap">
              {tags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={`px-2.5 py-1 rounded-full text-[12px] border transition-colors ${
                    selectedTags.includes(tag)
                      ? "border-primary text-primary bg-primary/5 font-medium"
                      : "border-[#e6e6e6] text-[#615d59] hover:border-[#0075de]/40 hover:text-primary"
                  }`}
                >
                  #{tag}
                </button>
              ))}
            </div>
          </div>

          {/* 编辑器 */}
          <div className="mt-10">
            {/* 格式工具栏 */}
            <div className="sticky top-14 z-10 flex items-center gap-1 bg-canvas border border-[#e6e6e6] rounded-[10px] px-2 py-1.5 shadow-[var(--shadow-soft)] w-fit mb-4">
              {toolbarGroups.map((group, gi) => (
                <div key={gi} className={`flex items-center gap-0.5 ${gi > 0 ? "pl-2 ml-1 border-l border-[#e6e6e6]" : ""}`}>
                  {group.map((btn) => (
                    <ToolbarButton key={btn.label} {...btn} />
                  ))}
                </div>
              ))}
            </div>

            {/* 正文（TipTap 占位区域） */}
            <div className="min-h-[50vh]">
              <div className="prose-kb" suppressHydrationWarning>
                <h1>一、Server Components 是默认选择</h1>
                <p>
                  默认情况下，页面组件是 Server Component，可以直接 <code>async</code>{" "}
                  获取数据，无需任何客户端状态管理。好处是显著减少客户端 JavaScript 体积，首屏更快。
                </p>
                <pre><code>{`export default async function Page() {
  const articles = await getArticles();
  return <ArticleList articles={articles} />;
}`}</code></pre>
                <blockquote>
                  经验法则：把数据获取尽量放在服务端，只在交互边界引入客户端组件。
                </blockquote>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
