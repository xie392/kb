"use client";

import { useEffect, useState } from "react";
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

interface OutlineItem {
  id: string;
  text: string;
  level: number;
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
  const [outline, setOutline] = useState<OutlineItem[]>([]);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const { data: cats } = api.category.tree.useQuery();
  const { data: tags } = api.tag.list.useQuery();

  const create = api.article.create.useMutation({
    onSuccess: () => {
      show("已保存", "ok");
      utils.article.list.invalidate();
      router.push("/kb-9f3x/articles");
    },
    onError: (e) => show(`保存失败：${e.message}`, "err"),
  });
  const update = api.article.update.useMutation({
    onSuccess: () => {
      show("已保存", "ok");
      utils.article.list.invalidate();
      router.push("/kb-9f3x/articles");
    },
    onError: (e) => show(`保存失败：${e.message}`, "err"),
  });

  const show = (text: string, type: "ok" | "err") => {
    setMsg({ type, text });
    setTimeout(() => setMsg(null), 2500);
  };

  const toggleTag = (id: string) => {
    setTagIds((prev) => (prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]));
  };

  const onSave = () => {
    if (!title.trim()) return show("请输入标题", "err");
    setSaving(true);
    const payload = {
      title: title.trim(),
      content,
      categoryId: categoryId || null,
      visibility,
      tagIds,
    };
    const cb = {
      onSuccess: () => setSaving(false),
      onError: () => setSaving(false),
    };
    if (isEdit) update.mutate({ id: article.id, ...payload }, cb);
    else create.mutate(payload, cb);
  };

  // 字数统计（去 HTML 标签）
  const plainText = content.replace(/<[^>]+>/g, "").replace(/\s+/g, "");
  const wordCount = plainText.length;

  // Ctrl/Cmd+S 保存
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        onSave();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, content, categoryId, visibility, tagIds]);

  const dirty = !saving && (title !== (article?.title ?? "") || content !== (article?.content ?? ""));

  return (
    <div className="h-full flex flex-col">
      {/* ─── 顶部：标题 + 状态 + 保存 ─── */}
      <div className="sticky top-0 z-20 bg-[#fbfaf6]/95 backdrop-blur-sm border-b-2 border-dashed border-[#e6e6e6] px-8 py-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="font-hand-display text-[16px] text-[#615d59] hover:text-[#31302e] shrink-0"
          >
            ← 返回
          </button>
          <span className="font-hand-body text-[14px] text-[#a39e98] shrink-0">
            {isEdit ? "编辑文章" : "写笔记"}
          </span>
          <div className="flex-1" />

          {/* 权限切换 */}
          <div className="flex items-center gap-1 p-0.5 bg-white sketch-border">
            <button
              type="button"
              onClick={() => setVisibility("private")}
              className={`px-3 h-7 font-hand-display text-[14px] transition-colors ${
                visibility === "private" ? "bg-[#f6f5f4] sketch-border text-[#0075de] font-bold" : "text-[#615d59]"
              }`}
            >
              私有
            </button>
            <button
              type="button"
              onClick={() => setVisibility("public")}
              className={`px-3 h-7 font-hand-display text-[14px] transition-colors ${
                visibility === "public" ? "bg-[#f6f5f4] sketch-border text-[#0075de] font-bold" : "text-[#615d59]"
              }`}
            >
              公开
            </button>
          </div>

          <span className="flex items-center gap-1.5 font-hand-body text-[13px] text-[#a39e98]">
            <span className={`w-2 h-2 rounded-full ${dirty ? "bg-[#dd5b00] animate-pulse" : "bg-[#2a9d99]"}`} />
            {saving ? "保存中…" : dirty ? "未保存" : savedAt ? `已保存 ${savedAt}` : "已保存"}
          </span>

          <button
            onClick={onSave}
            disabled={saving}
            className="px-4 py-1.5 bg-[#0075de] text-white font-hand-display text-[17px] font-bold sketch-border sketch-shadow rotate-[-1deg] hover:rotate-0 transition-transform disabled:opacity-50"
          >
            保存
          </button>
        </div>

        {/* 大标题输入（语雀风格） */}
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="无标题"
          className="mt-3 w-full font-hand-display text-[32px] font-bold tracking-[-0.5px] text-[#213183] placeholder:text-[#a39e98] bg-transparent outline-none border-none"
        />

        {/* 元信息行：分类 + 标签 */}
        <div className="mt-3 flex items-center gap-3 flex-wrap">
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="h-8 px-2.5 bg-white sketch-border font-hand-body text-[13px] text-[#31302e] outline-none"
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
                className={`px-2 py-0.5 font-hand-body text-[13px] sketch-border transition-colors ${
                  tagIds.includes(tag.id) ? "bg-[#0075de] text-white" : "bg-white text-[#615d59] hover:text-[#0075de]"
                }`}
              >
                #{tag.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {msg && (
        <div className="mx-8 mt-3 sticky-note sketch-border px-4 py-2 rotate-[-1deg] w-fit fade-up">
          <span className={`font-hand-display text-[15px] font-bold ${msg.type === "ok" ? "text-[#2a9d99]" : "text-red-500"}`}>
            {msg.type === "ok" ? "✓" : "✗"} {msg.text}
          </span>
        </div>
      )}

      {/* ─── 主体：编辑器 + 大纲 ─── */}
      <div className="flex-1 flex min-h-0">
        {/* 编辑区 */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-[860px] mx-auto">
            <RichTextEditor value={content} onChange={(html) => setContent(html)} onOutline={setOutline} placeholder="开始写作…" />
          </div>
        </div>

        {/* 右侧大纲（语雀风格） */}
        {outline.length > 0 && (
          <div className="hidden xl:block w-56 shrink-0 border-l-2 border-dashed border-[#e6e6e6] p-4 overflow-y-auto">
            <div className="font-hand-display text-[16px] font-bold text-[#31302e] marker-underline inline-block mb-3">
              目录
            </div>
            <nav className="space-y-1">
              {outline.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    // 滚动到对应标题（用编辑器命令定位较复杂，此处简单标记）
                    document
                      .querySelectorAll(".ProseMirror h1, .ProseMirror h2, .ProseMirror h3")
                      [outline.indexOf(item)]?.scrollIntoView({ behavior: "smooth", block: "center" });
                  }}
                  className={`block w-full text-left font-hand-body text-[13px] py-1 px-2 rounded hover:bg-[#f6f5f4] hover:text-[#0075de] transition-colors ${
                    item.level === 1 ? "text-[#31302e] font-bold pl-2" : item.level === 2 ? "text-[#615d59] pl-5" : "text-[#a39e98] pl-8"
                  }`}
                >
                  {item.text}
                </button>
              ))}
            </nav>
          </div>
        )}
      </div>

      {/* ─── 底部状态栏 ─── */}
      <div className="sticky bottom-0 bg-[#fbfaf6]/95 backdrop-blur-sm border-t-2 border-dashed border-[#e6e6e6] px-8 py-2 flex items-center gap-4 font-hand-body text-[13px] text-[#a39e98]">
        <span>{wordCount > 0 ? `${wordCount} 字` : "空文档"}</span>
        <span>·</span>
        <span>{isEdit ? "编辑模式" : "新建模式"}</span>
        <span>·</span>
        <span>快捷键：Ctrl/Cmd+B 加粗 · Ctrl/Cmd+S 保存</span>
      </div>
    </div>
  );
}
