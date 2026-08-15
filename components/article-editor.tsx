"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/trpc/client";

interface Props {
  article?: {
    id: string;
    title: string;
    content: string;
    categoryId: string | null;
    visibility: string;
    tagIds: string[];
  };
}

const toolbarGroups = [
  [
    { label: "H1", icon: "h1" },
    { label: "H2", icon: "h2" },
    { label: "H3", icon: "h3" },
  ],
  [
    { label: "B", icon: "bold" },
    { label: "I", icon: "italic" },
    { label: "U", icon: "underline" },
  ],
  [
    { label: "列表", icon: "list" },
    { label: "引用", icon: "quote" },
    { label: "代码", icon: "code" },
  ],
];

function ToolbarButton({ label, icon }: { label: string; icon: string }) {
  const render = () => {
    switch (icon) {
      case "bold": return <span className="font-bold">B</span>;
      case "italic": return <span className="italic">I</span>;
      case "underline": return <span className="underline underline-offset-2">U</span>;
      case "h1": case "h2": case "h3": return <span className="text-[12px] font-bold">{label}</span>;
      case "list": return (
        <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M3 4.5h10M3 8h10M3 11.5h10" strokeLinecap="round" />
        </svg>
      );
      case "quote": return (
        <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
          <path d="M4 4c-1.7 1-2.5 2.8-2.5 5v3h4v-4H3.5c.2-1.3 1-2.3 2-2.9L4 4zm7 0c-1.7 1-2.5 2.8-2.5 5v3h4v-4h-2c.2-1.3 1-2.3 2-2.9L11 4z" />
        </svg>
      );
      case "code": return (
        <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M6 4L2.5 8 6 12M10 4l3.5 4L10 12" strokeLinecap="round" />
        </svg>
      );
      default: return <span className="text-[12px] font-semibold">{label}</span>;
    }
  };
  return (
    <button
      type="button"
      title={label}
      className="min-w-[30px] h-[30px] px-1.5 rounded-[6px] text-[13px] text-[#615d59] hover:bg-[#f6f5f4] hover:text-[#31302e] transition-colors grid place-items-center"
    >
      {render()}
    </button>
  );
}

export default function ArticleEditor({ article }: Props) {
  const router = useRouter();
  const utils = api.useUtils();
  const isEdit = !!article;

  const [title, setTitle] = useState(article?.title ?? "");
  const [content, setContent] = useState(article?.content ?? "");
  const [categoryId, setCategoryId] = useState(article?.categoryId ?? "");
  const [visibility, setVisibility] = useState<"private" | "public">(
    (article?.visibility as "private" | "public") ?? "private"
  );
  const [tagIds, setTagIds] = useState<string[]>(article?.tagIds ?? []);
  const [saved, setSaved] = useState(true);
  const [msg, setMsg] = useState<string | null>(null);

  const { data: cats } = api.category.tree.useQuery();
  const { data: tags } = api.tag.list.useQuery();

  const create = api.article.create.useMutation({
    onSuccess: () => {
      show("已保存");
      utils.article.list.invalidate();
      router.push("/kb-9f3x/articles");
    },
    onError: (e) => show(`保存失败：${e.message}`, "err"),
  });
  const update = api.article.update.useMutation({
    onSuccess: () => {
      show("已保存");
      utils.article.list.invalidate();
      router.push("/kb-9f3x/articles");
    },
    onError: (e) => show(`保存失败：${e.message}`, "err"),
  });

  const show = (text: string, type: "ok" | "err" = "ok") => {
    setMsg(text);
    setTimeout(() => setMsg(null), 2500);
  };

  const toggleTag = (id: string) => {
    setTagIds((prev) => (prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]));
  };

  const onSave = () => {
    if (!title.trim()) return show("请输入标题", "err");
    const payload = {
      title: title.trim(),
      content,
      categoryId: categoryId || null,
      visibility,
      tagIds,
    };
    if (isEdit) update.mutate({ id: article.id, ...payload });
    else create.mutate(payload);
  };

  return (
    <div className="p-8 w-full">
      {/* 工具栏 */}
      <div className="sticky top-0 z-20 bg-[#fbfaf6]/95 backdrop-blur-sm border-b-2 border-dashed border-[#e6e6e6] -mx-8 px-8 py-3 flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="font-hand-display text-[16px] text-[#615d59] hover:text-[#31302e]"
        >
          ← 返回
        </button>
        <span className="font-hand-display text-[18px] font-bold text-[#31302e]">
          {isEdit ? "编辑文章" : "写笔记"}
        </span>
        <div className="flex-1" />

        {/* 权限切换 */}
        <div className="flex items-center gap-1 p-1 bg-white sketch-border">
          <button
            type="button"
            onClick={() => setVisibility("private")}
            className={`px-3 h-7 font-hand-display text-[15px] transition-colors ${
              visibility === "private" ? "bg-[#f6f5f4] sketch-border text-[#0075de] font-bold" : "text-[#615d59]"
            }`}
          >
            私有
          </button>
          <button
            type="button"
            onClick={() => setVisibility("public")}
            className={`px-3 h-7 font-hand-display text-[15px] transition-colors ${
              visibility === "public" ? "bg-[#f6f5f4] sketch-border text-[#0075de] font-bold" : "text-[#615d59]"
            }`}
          >
            公开
          </button>
        </div>

        <span className="flex items-center gap-1.5 font-hand-body text-[13px] text-[#a39e98]">
          <span className={`w-2 h-2 rounded-full ${saved ? "bg-[#2a9d99]" : "bg-[#dd5b00] animate-pulse"}`} />
          {saved ? "已保存" : "未保存"}
        </span>

        <button
          onClick={onSave}
          className="px-4 py-1.5 bg-[#0075de] text-white font-hand-display text-[17px] font-bold sketch-border sketch-shadow rotate-[-1deg] hover:rotate-0 transition-transform"
        >
          保存
        </button>
      </div>

      {msg && (
        <div className={`mt-4 sticky-note sketch-border px-4 py-2 rotate-[-1deg] w-fit fade-up`}>
          <span className={`font-hand-display text-[16px] font-bold ${msg.startsWith("保存失败") ? "text-red-500" : "text-[#2a9d99]"}`}>
            {msg.startsWith("保存失败") ? "✗" : "✓"} {msg}
          </span>
        </div>
      )}

      {/* 编辑区 */}
      <div className="mt-6">
        <input
          value={title}
          onChange={(e) => { setTitle(e.target.value); setSaved(false); }}
          placeholder="无标题"
          className="w-full font-hand-display text-[36px] font-bold tracking-[-1px] text-[#31302e] placeholder:text-[#a39e98] bg-transparent outline-none border-none"
        />

        {/* 元信息行：分类 + 标签 */}
        <div className="mt-4 flex items-center gap-3 flex-wrap">
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="h-9 px-3 bg-white sketch-border font-hand-body text-[14px] text-[#31302e] outline-none"
          >
            <option value="">未分类</option>
            {cats?.map((cat) => (
              <optgroup key={cat.id} label={cat.name}>
                <option value={cat.id}>{cat.name}（一级）</option>
                {cat.children?.map((child) => (
                  <option key={child.id} value={child.id}>
                    {cat.name} / {child.name}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>

          <div className="flex items-center gap-1.5 flex-wrap">
            {tags?.map((tag) => (
              <button
                key={tag.id}
                type="button"
                onClick={() => toggleTag(tag.id)}
                className={`px-2.5 py-1 font-hand-body text-[14px] sketch-border transition-colors ${
                  tagIds.includes(tag.id)
                    ? "bg-[#0075de] text-white"
                    : "bg-white text-[#615d59] hover:text-[#0075de]"
                }`}
              >
                #{tag.name}
              </button>
            ))}
          </div>
        </div>

        {/* 编辑器 */}
        <div className="mt-8">
          <div className="flex items-center gap-1 bg-white sketch-border sketch-shadow px-2 py-1.5 w-fit mb-4">
            {toolbarGroups.map((group, gi) => (
              <div key={gi} className={`flex items-center gap-0.5 ${gi > 0 ? "pl-2 ml-1 border-l border-[#e6e6e6]" : ""}`}>
                {group.map((btn) => (
                  <ToolbarButton key={btn.label} {...btn} />
                ))}
              </div>
            ))}
          </div>

          <textarea
            value={content}
            onChange={(e) => { setContent(e.target.value); setSaved(false); }}
            placeholder="开始写作… 支持 Markdown / HTML"
            className="w-full min-h-[50vh] bg-white sketch-border sketch-shadow p-6 font-hand-body text-[16px] leading-relaxed text-[#31302e] placeholder:text-[#a39e98] outline-none resize-y"
          />
          <div className="mt-2 font-hand-body text-[13px] text-[#a39e98]">
            当前以纯文本编辑，保存为 HTML 内容；后续可接入富文本编辑器
          </div>
        </div>
      </div>
    </div>
  );
}
