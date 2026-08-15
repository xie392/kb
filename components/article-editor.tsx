"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/trpc/client";
import RichTextEditor from "@/components/rich-text-editor";

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

        {/* 编辑器（TipTap 富文本） */}
        <div className="mt-8">
          <RichTextEditor
            value={content}
            onChange={(html) => { setContent(html); setSaved(false); }}
            placeholder="开始写作… 支持标题 / 列表 / 引用 / 代码块 / 图片 / 链接"
          />
        </div>
      </div>
    </div>
  );
}
