"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/trpc/client";
import {
  useArticleEditor,
  EditorToolbar,
  EditorArea,
} from "@/components/rich-text";
import TagSelect from "@/components/tag-select";
import CategorySelect from "@/components/category-select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
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
    onSuccess: () => { toast.success("已保存"); utils.article.list.invalidate(); router.push(`${ADMIN_HOME}/articles`); },
    onError: (e) => toast.error(`保存失败：${e.message}`),
  });
  const update = api.article.update.useMutation({
    onSuccess: () => { toast.success("已保存"); utils.article.list.invalidate(); router.push(`${ADMIN_HOME}/articles`); },
    onError: (e) => toast.error(`保存失败：${e.message}`),
  });
  const createTag = api.tag.create.useMutation({
    onError: (e) => toast.error(`创建标签失败：${e.message}`),
  });
  const createCategory = api.category.create.useMutation({
    onError: (e) => toast.error(`创建分类失败：${e.message}`),
  });
  // 图片上传统一走附件管理（会写入 Attachment 记录，可在附件管理中查看/管理）
  const uploadImage = api.attachment.create.useMutation();

  const handleUploadImage = async (file: File): Promise<string> => {
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(new Error("读取文件失败"));
      reader.readAsDataURL(file);
    });
    const res = await uploadImage.mutateAsync({ name: file.name, data: dataUrl });
    return res.url;
  };

  const onSave = () => {
    if (!title.trim()) return toast.error("请输入标题");
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
      <div className="sticky top-0 z-30 shrink-0 bg-canvas-soft/95 backdrop-blur-sm border-b border-hairline">
        <div className="px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              title="返回"
              aria-label="返回"
              className="hover:text-ink-secondary"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10 3L5 8l5 5" />
              </svg>
            </Button>
            <span className="text-[14px] text-ink-faint">{isEdit ? "编辑文章" : "写笔记"}</span>
          </div>

          <div className="flex items-center gap-3">
            {/* 权限切换 */}
            <div className="flex items-center gap-0 p-0.5 bg-canvas-soft rounded-full border border-hairline">
              {(["private", "public"] as const).map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setVisibility(v)}
                  className={`px-3 h-7 text-[13px] font-medium rounded-full transition-all ${
                    visibility === v
                      ? "bg-white text-primary shadow-xs border border-hairline"
                      : "text-ink-muted hover:text-ink-secondary"
                  }`}
                >
                  {v === "private" ? "私有" : "公开"}
                </button>
              ))}
            </div>

            {/* 保存按钮 */}
            {saving ? (
              <span className="text-[13px] text-ink-faint flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M2 8a6 6 0 1 1 11 3.5" strokeLinecap="round" />
                </svg>
                保存中…
              </span>
            ) : (
              <Button
                type="button"
                onClick={onSave}
                disabled={!title.trim()}
                className="px-4 disabled:bg-hairline disabled:text-ink-faint disabled:opacity-100"
              >
                保存
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* ═══ 工具栏（紧贴小操作栏下方，固定不随内容滚动） ═══ */}
      <div className="shrink-0 bg-white border-b border-hairline">
        <EditorToolbar editor={editor} onUploadImage={handleUploadImage} />
      </div>

      {/* ═══ 主体内容（剩余空间内部滚动，编辑器不会撑高页面） ═══ */}
      <div className="relative flex-1 min-h-0 overflow-y-auto pb-12">
        {/* 标题、标签、正文收窄居中，其余（工具栏/顶栏/大纲/状态栏）保持全宽 */}
        <div className="max-w-3xl mx-auto">
          {/* 标题输入 */}
          <div className="px-6 pt-3 pb-1">
            <Input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="无标题"
              className="h-auto bg-transparent px-0 py-0 text-[28px] sm:text-[32px] font-bold leading-tight font-sans focus-visible:ring-0"
              style={{ border: "none" }}
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
          <div className="h-px bg-hairline" />

          {/* 富文本编辑区 */}
          <div>
            <EditorArea editor={editor} onUploadImage={handleUploadImage} />
          </div>
        </div>
      </div>

      {/* ═══ 右侧大纲悬浮面板 ═══ */}
      {outline.length > 0 && (
        <div className="hidden xl:block fixed right-6 top-30 w-56 bg-white rounded-lg sketch-border sketch-shadow p-4 max-h-[calc(100vh-136px)] overflow-y-auto z-20">
          <div className="text-[12px] font-semibold text-ink-faint uppercase tracking-wider mb-3">大纲</div>
          <nav className="space-y-0.5">
            {outline.map((item) => (
              <button
                key={item.id}
                onClick={() =>
                  document
                    .querySelectorAll(".ProseMirror h1, .ProseMirror h2, .ProseMirror h3")
                    [outline.indexOf(item)]?.scrollIntoView({ behavior: "smooth", block: "center" })
                }
                className={`block w-full text-left text-[13px] py-1.5 px-2 rounded-md hover:bg-canvas-soft transition-colors truncate ${
                  item.level === 1
                    ? "text-ink-secondary font-semibold"
                    : item.level === 2
                    ? "text-ink-muted pl-3"
                    : "text-ink-faint pl-5"
                }`}
              >
                {item.text}
              </button>
            ))}
          </nav>
        </div>
      )}

      {/* ═══ 底部状态栏（固定在视口底部） ═══ */}
      <div className="fixed bottom-0 left-55 right-0 bg-canvas-soft/95 backdrop-blur-sm border-t border-hairline px-6 py-2 flex items-center gap-3 text-[12px] text-ink-faint z-30">
        <span>{wordCount > 0 ? `${wordCount} 字` : "空文档"}</span>
        <span className="w-px h-3 bg-hairline" />
        <span>{isEdit ? "编辑模式" : "新建模式"}</span>
        <span className="w-px h-3 bg-hairline" />
        <span className="hidden sm:inline">⌘S 保存</span>
      </div>
    </div>
  );
}
