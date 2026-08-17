"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/trpc/client";
import {
  useArticleEditor,
  EditorToolbar,
  EditorArea,
} from "@/components/rich-text-editor";
import TagSelect from "@/components/tag-select";
import CategorySelect from "@/components/category-select";
import { ADMIN_HOME } from "@/lib/config";

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
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const { data: cats } = api.category.tree.useQuery();
  const { data: tags } = api.tag.list.useQuery();

  // 编辑器实例（提升到父级，工具栏和编辑区共享）
  const editor = useArticleEditor({
    value: content,
    onChange: (html) => setContent(html),
    onOutline: setOutline,
    placeholder: "开始写作…",
  });

  const create = api.article.create.useMutation({
    onSuccess: () => { show("已保存", "ok"); utils.article.list.invalidate(); router.push(`${ADMIN_HOME}/articles`); },
    onError: (e) => show(`保存失败：${e.message}`, "err"),
  });
  const update = api.article.update.useMutation({
    onSuccess: () => { show("已保存", "ok"); utils.article.list.invalidate(); router.push(`${ADMIN_HOME}/articles`); },
    onError: (e) => show(`保存失败：${e.message}`, "err"),
  });
  const createTag = api.tag.create.useMutation({
    onError: (e) => show(`创建标签失败：${e.message}`, "err"),
  });
  const createCategory = api.category.create.useMutation({
    onError: (e) => show(`创建分类失败：${e.message}`, "err"),
  });
  const uploadImage = api.upload.image.useMutation();

  const handleUploadImage = async (file: File): Promise<string> => {
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(new Error("读取文件失败"));
      reader.readAsDataURL(file);
    });
    const res = await uploadImage.mutateAsync({ data: dataUrl });
    return res.url;
  };

  const show = (text: string, type: "ok" | "err") => {
    setMsg({ type, text });
    setTimeout(() => setMsg(null), 2500);
  };

  const onSave = () => {
    if (!title.trim()) return show("请输入标题", "err");
    setSaving(true);
    const payload = { title: title.trim(), content, categoryId: categoryId || null, visibility, tagIds };
    const cb = { onSuccess: () => setSaving(false), onError: () => setSaving(false) };
    if (isEdit) update.mutate({ id: article.id, ...payload }, cb);
    else create.mutate(payload, cb);
  };

  // 字数统计
  const plainText = content.replace(/<[^>]+>/g, "").replace(/\s+/g, "");
  const wordCount = plainText.length;

  // Ctrl/Cmd+S 保存
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") { e.preventDefault(); onSave(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, content, categoryId, visibility, tagIds]);

  return (
    <div className="h-full flex flex-col bg-white">
      {/* ═══ 固定顶部操作栏 ═══ */}
      <div className="sticky top-0 z-30 shrink-0 bg-white/95 backdrop-blur-sm border-b border-[#e6e6e6]">
        <div className="px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="w-8 h-8 rounded-[6px] grid place-items-center text-[#615d59] hover:bg-[#f0efec] hover:text-[#31302e] transition-colors"
              title="返回"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10 3L5 8l5 5" />
              </svg>
            </button>
            <span className="text-[14px] text-[#a39e98]">{isEdit ? "编辑文章" : "写笔记"}</span>
          </div>

          <div className="flex items-center gap-3">
            {/* 权限切换 */}
            <div className="flex items-center gap-0 p-0.5 bg-[#f6f5f4] rounded-full border border-[#e6e6e6]">
              {(["private", "public"] as const).map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setVisibility(v)}
                  className={`px-3 h-7 text-[13px] font-medium rounded-full transition-all ${
                    visibility === v
                      ? "bg-white text-[#0075de] shadow-sm border border-[#e6e6e6]"
                      : "text-[#615d59] hover:text-[#31302e]"
                  }`}
                >
                  {v === "private" ? "私有" : "公开"}
                </button>
              ))}
            </div>

            {/* 保存按钮 */}
            {saving ? (
              <span className="text-[13px] text-[#a39e98] flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M2 8a6 6 0 1 1 11 3.5" strokeLinecap="round" />
                </svg>
                保存中…
              </span>
            ) : (
              <button
                type="button"
                onClick={onSave}
                disabled={!title.trim()}
                className={`h-8 px-4 rounded-full text-[13px] font-medium transition-all ${
                  title.trim()
                    ? "bg-[#0075de] text-white hover:bg-[#005bab] active:scale-[0.97]"
                    : "bg-[#e6e6e6] text-[#a39e98] cursor-not-allowed"
                }`}
              >
                保存
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 消息提示 */}
      {msg && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-lg bg-white sketch-border sketch-shadow text-[13px] font-medium animate-fade-in">
          <span className={msg.type === "ok" ? "text-[#2a9d99]" : "text-red-500"}>
            {msg.type === "ok" ? "✓" : "✗"} {msg.text}
          </span>
        </div>
      )}

      {/* ═══ 工具栏（紧贴小操作栏下方，固定不随内容滚动） ═══ */}
      <div className="shrink-0 bg-white border-b border-[#e6e6e6]">
        <EditorToolbar editor={editor} onUploadImage={handleUploadImage} />
      </div>

      {/* ═══ 主体内容（剩余空间内部滚动，编辑器不会撑高页面） ═══ */}
      <div className="flex-1 min-h-0 overflow-y-auto pb-12">
        {/* 标题、标签、正文收窄居中，其余（工具栏/顶栏/大纲/状态栏）保持全宽 */}
        <div className="max-w-3xl mx-auto">
          {/* 标题输入 */}
          <div className="px-6 pt-3 pb-1">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="无标题"
              className="w-full text-[28px] sm:text-[32px] font-bold leading-tight text-[#31302e] placeholder:text-[#c5c0b9] bg-transparent border-none outline-none focus:ring-0 font-sans"
            />
          </div>

          {/* 元信息栏（分类 + 标签） */}
          <div className="px-6 pb-2 flex items-center gap-3 flex-wrap">
            <CategorySelect
              options={cats ?? []}
              value={categoryId}
              onChange={setCategoryId}
              onCreate={async (name, parentId) => {
                try {
                  const data = await createCategory.mutateAsync({ name, parentId });
                  utils.category.tree.invalidate();
                  return data.id;
                } catch {
                  return null;
                }
              }}
            />

            <TagSelect
              options={tags ?? []}
              value={tagIds}
              onChange={setTagIds}
              onCreate={async (name) => {
                try {
                  const data = await createTag.mutateAsync({ name });
                  utils.tag.list.invalidate();
                  return data.id;
                } catch {
                  return null;
                }
              }}
            />
          </div>

          {/* 分隔线 */}
          <div className="h-px bg-[#e6e6e6]" />

          {/* 富文本编辑区 */}
          <div>
            <EditorArea editor={editor} />
          </div>
        </div>
      </div>

      {/* ═══ 右侧大纲悬浮面板 ═══ */}
      {outline.length > 0 && (
        <div className="hidden xl:block fixed right-6 top-[120px] w-56 bg-white rounded-lg sketch-border sketch-shadow p-4 max-h-[calc(100vh-136px)] overflow-y-auto z-20">
          <div className="text-[12px] font-semibold text-[#a39e98] uppercase tracking-wider mb-3">大纲</div>
          <nav className="space-y-0.5">
            {outline.map((item) => (
              <button
                key={item.id}
                onClick={() =>
                  document
                    .querySelectorAll(".ProseMirror h1, .ProseMirror h2, .ProseMirror h3")
                    [outline.indexOf(item)]?.scrollIntoView({ behavior: "smooth", block: "center" })
                }
                className={`block w-full text-left text-[13px] py-1.5 px-2 rounded-md hover:bg-[#f6f5f4] transition-colors truncate ${
                  item.level === 1
                    ? "text-[#31302e] font-semibold"
                    : item.level === 2
                    ? "text-[#615d59] pl-3"
                    : "text-[#a39e98] pl-5"
                }`}
              >
                {item.text}
              </button>
            ))}
          </nav>
        </div>
      )}

      {/* ═══ 底部状态栏（固定在视口底部） ═══ */}
      <div className="fixed bottom-0 left-[220px] right-0 bg-white/95 backdrop-blur-sm border-t border-[#e6e6e6] px-6 py-2 flex items-center gap-3 text-[12px] text-[#a39e98] z-30">
        <span>{wordCount > 0 ? `${wordCount} 字` : "空文档"}</span>
        <span className="w-px h-3 bg-[#e6e6e6]" />
        <span>{isEdit ? "编辑模式" : "新建模式"}</span>
        <span className="w-px h-3 bg-[#e6e6e6]" />
        <span className="hidden sm:inline">⌘S 保存</span>
      </div>
    </div>
  );
}
