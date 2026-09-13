"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/trpc/client";
import {
  draftKey,
  loadDraft,
  saveDraft,
  clearDraft,
  serializeDraftState,
} from "@/lib/draft";
import {
  useArticleEditor,
  EditorToolbar,
  EditorArea,
} from "@/components/rich-text";
import { TocPanel } from "@/components/rich-text/toc-panel";
import TagSelect from "@/components/tag-select";
import CategorySelect from "@/components/category-select";
import EditorTopBar from "@/components/editor-top-bar";
import TemplatePicker from "@/components/template-picker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner";
import { ADMIN_HOME } from "@/lib/config";
import { deepSeekProvider } from "@/lib/ai-provider";
import { EditorProvider } from "@tipkit/core";
import type { Editor } from "@tiptap/react";
import { Sparkles, X } from "lucide-react";

interface Props {
  article?: {
    id: string;
    title: string;
    content: string;
    summary: string | null;
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
  const [summary, setSummary] = useState(article?.summary ?? "");
  const [categoryId, setCategoryId] = useState(article?.categoryId ?? "");
  const [visibility, setVisibility] = useState<"private" | "public">(
    (article?.visibility as "private" | "public") ?? "private"
  );
  const [tagIds, setTagIds] = useState<string[]>(article?.tagIds ?? []);
  const [outline, setOutline] = useState<OutlineItem[]>([]);
  const [saving, setSaving] = useState(false);
  const [showToc, setShowToc] = useState(true);
  const [draftSavedAt, setDraftSavedAt] = useState<number | null>(null);

  // 草稿键：新建与编辑各自独立；初始内容快照用于判断"是否有未保存改动"
  const draftStorageKey = draftKey(article?.id);
  const initialSnapshotRef = useRef<string>("");
  const draftCheckedRef = useRef(false);

  const { data: cats } = api.category.tree.useQuery();
  const { data: tags } = api.tag.list.useQuery();

  // `[[` 双向链接补全：按关键词查询候选笔记标题
  const wikiSearch = useCallback(
    async (q: string) => {
      const res = await utils.article.titleSearch.fetch({ q, excludeId: article?.id });
      return res.items;
    },
    [utils, article?.id],
  );

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

  const handleUploadAttachment = async (file: File, _editor: Editor) => {
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(new Error("读取文件失败"));
      reader.readAsDataURL(file);
    });
    const res = await uploadImage.mutateAsync({ name: file.name, data: dataUrl });
    return {
      url: res.url,
      name: res.name,
      size: res.size,
      mimeType: res.mimeType,
    };
  };

  // 编辑器实例（提升到父级，工具栏和编辑区共享）
  const editor = useArticleEditor({
    value: content,
    onChange: (html) => setContent(html),
    onOutline: setOutline,
    onUploadImage: handleUploadImage,
  });

  const create = api.article.create.useMutation({
    onSuccess: () => { toast.success("已保存"); clearDraft(draftStorageKey); utils.article.list.invalidate(); router.push(`${ADMIN_HOME}/articles`); },
    onError: (e) => toast.error(`保存失败：${e.message}`),
  });
  const update = api.article.update.useMutation({
    onSuccess: () => { toast.success("已保存"); clearDraft(draftStorageKey); utils.article.list.invalidate(); router.push(`${ADMIN_HOME}/articles`); },
    onError: (e) => toast.error(`保存失败：${e.message}`),
  });
  const createTag = api.tag.create.useMutation({
    onError: (e) => toast.error(`创建标签失败：${e.message}`),
  });
  const createCategory = api.category.create.useMutation({
    onError: (e) => toast.error(`创建分类失败：${e.message}`),
  });

  // AI 摘要 / 自动标签
  const aiSummary = api.article.aiSummary.useMutation({
    onError: (e) => toast.error(`生成摘要失败：${e.message}`),
  });
  const aiTags = api.article.aiTags.useMutation({
    onError: (e) => toast.error(`推荐标签失败：${e.message}`),
  });

  const runAiSummary = async () => {
    if (!content.trim()) return toast.error("正文为空，无法生成摘要");
    const res = await aiSummary.mutateAsync({ content });
    if (res.summary) {
      setSummary(res.summary);
      toast.success("已生成摘要");
    } else {
      toast("AI 没有返回摘要");
    }
  };

  const runAiTags = async () => {
    if (!content.trim()) return toast.error("正文为空，无法推荐标签");
    const res = await aiTags.mutateAsync({ content });
    const names = res.tags;
    if (names.length === 0) return toast("AI 没有返回标签");
    const next = [...tagIds];
    try {
      for (const name of names) {
        let id = (tags ?? []).find((t) => t.name === name)?.id;
        if (!id) {
          const created = await createTag.mutateAsync({ name });
          id = created.id;
        }
        if (id && !next.includes(id)) next.push(id);
      }
    } catch {
      // createTag 的 onError 已提示
    }
    setTagIds(next);
    utils.tag.list.invalidate();
    toast.success(`已添加标签：${names.join("、")}`);
  };

  const onSave = () => {
    if (!title.trim()) return toast.error("请输入标题");
    setSaving(true);
    const payload = {
      title: title.trim(),
      content,
      summary: summary.trim() || null,
      categoryId: categoryId || null,
      visibility,
      tagIds,
    };
    const cb = { onSuccess: () => setSaving(false), onError: () => setSaving(false) };
    if (isEdit) update.mutate({ id: article.id, ...payload }, cb);
    else create.mutate(payload, cb);
  };

  // 草稿：挂载时记录初始快照，并检测 7 天内的未保存内容提示恢复
  useEffect(() => {
    initialSnapshotRef.current = serializeDraftState({
      title,
      content,
      categoryId,
      visibility,
      tagIds,
    });
    if (draftCheckedRef.current) return;
    draftCheckedRef.current = true;

    const draft = loadDraft(draftStorageKey);
    if (!draft) return;
    // 与服务端内容一致：视为无改动，直接清理
    if (serializeDraftState(draft) === initialSnapshotRef.current) {
      clearDraft(draftStorageKey);
      return;
    }
    toast("检测到未保存的草稿", {
      description: `上次保存于 ${new Date(draft.savedAt).toLocaleString("zh-CN")}`,
      duration: 12000,
      action: {
        label: "恢复",
        onClick: () => {
          setTitle(draft.title);
          setContent(draft.content);
          setCategoryId(draft.categoryId ?? "");
          setVisibility(draft.visibility === "public" ? "public" : "private");
          setTagIds(draft.tagIds ?? []);
          toast.success("已恢复草稿");
        },
      },
      cancel: {
        label: "丢弃",
        onClick: () => {
          clearDraft(draftStorageKey);
          setDraftSavedAt(null);
          toast("已丢弃草稿");
        },
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draftStorageKey]);

  // 草稿：停止输入 2s 后自动暂存到本地（内容与服务端一致时不写）
  useEffect(() => {
    const current = serializeDraftState({ title, content, categoryId, visibility, tagIds });
    if (current === initialSnapshotRef.current) return;
    const timer = setTimeout(() => {
      saveDraft(draftStorageKey, { title, content, categoryId, visibility, tagIds });
      setDraftSavedAt(Date.now());
    }, 2000);
    return () => clearTimeout(timer);
  }, [draftStorageKey, title, content, categoryId, visibility, tagIds]);

  // 字数统计
  const plainText = content.replace(/<[^>]+>/g, "").replace(/\s+/g, "");
  const wordCount = plainText.length;

  useEffect(() => {
    const container = document.querySelector("[data-editor-scroll]");
    if (container) container.scrollTop = 0;
  }, []);

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
    <EditorProvider deps={{ uploadAttachment: handleUploadAttachment, ai: deepSeekProvider }}>
      <TooltipProvider delay={150}>
      <div className="tk-theme-sketch h-full flex flex-col bg-canvas">
      <EditorTopBar
        isEdit={isEdit}
        title={title}
        saving={saving}
        showToc={showToc}
        onToggleToc={() => setShowToc((v) => !v)}
        onBack={() => router.back()}
        onSave={onSave}
        visibility={visibility}
        onVisibilityChange={setVisibility}
        articleId={article?.id}
        onRestored={({ title: t, content: c, summary: s }) => {
          setTitle(t);
          setContent(c);
          setSummary(s);
        }}
      />

      {/* ═══ 工具栏（紧贴小操作栏下方，固定不随内容滚动） ═══ */}
      <div className="shrink-0 relative z-30 bg-card px-4 py-2 border-b border-hairline/50">
        <EditorToolbar editor={editor} onUploadImage={handleUploadImage} />
      </div>

      {/* ═══ 主体内容（剩余空间内部滚动，编辑器不会撑高页面） ═══ */}
      <div data-editor-scroll className="relative flex-1 min-h-0 overflow-y-auto overflow-x-hidden pb-12">
        {/* 标题、标签、正文收窄居中，其余（工具栏/顶栏/大纲/状态栏）保持全宽 */}
        <div className="max-w-205 mx-auto">
          {/* 新建且正文为空时，展示写作模板 */}
          {!isEdit && !content.trim() && (
            <TemplatePicker
              onApply={({ title: t, content: c }) => {
                if (t) setTitle(t);
                setContent(c);
              }}
            />
          )}

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

          {/* 元信息栏（分类 + 标签 + AI） */}
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

            {/* AI 辅助 */}
            <div className="ml-auto flex items-center gap-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={aiSummary.isPending}
                onClick={runAiSummary}
                className="gap-1 text-[13px] text-ink-muted hover:text-primary"
              >
                <Sparkles className="w-3.5 h-3.5" />
                {aiSummary.isPending ? "生成中…" : "AI 摘要"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={aiTags.isPending}
                onClick={runAiTags}
                className="gap-1 text-[13px] text-ink-muted hover:text-primary"
              >
                <Sparkles className="w-3.5 h-3.5" />
                {aiTags.isPending ? "推荐中…" : "AI 标签"}
              </Button>
            </div>
          </div>

          {/* 摘要（可选） */}
          <div className="px-6 pb-3">
            <Input
              type="text"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="摘要（可选，用于列表与 SEO；留空自动截取正文）"
              className="h-9 bg-transparent px-0 text-[14px] focus-visible:ring-0"
              style={{ border: "none" }}
            />
          </div>

          {/* 分隔线 */}
          <div className="h-px bg-hairline" />

          {/* 富文本编辑区 */}
          <div>
            <EditorArea editor={editor} onUploadImage={handleUploadImage} onWikiSearch={wikiSearch} />
          </div>
        </div>
      </div>

      {/* ═══ 右侧大纲悬浮面板（TocPanel 自取 headings + IntersectionObserver 高亮） ═══ */}
      {showToc && (
        <div className="hidden xl:block fixed right-6 top-30 w-56 bg-white rounded-lg sketch-border sketch-shadow p-4 max-h-[calc(100vh-136px)] overflow-y-auto z-[70]">
          <TocPanel
            editor={editor}
            emptyText="添加标题后会自动生成目录"
            headerExtra={
              <Tooltip>
                <TooltipTrigger
                  render={
                    <button
                      type="button"
                      onClick={() => setShowToc(false)}
                      className="text-ink-faint hover:text-ink-secondary transition-colors p-1 -m-1 rounded"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  }
                />
                <TooltipContent side="left">隐藏大纲</TooltipContent>
              </Tooltip>
            }
          />
        </div>
      )}

      {/* ═══ 底部状态栏（固定在视口底部） ═══ */}
      <div className="fixed bottom-0 left-55 right-0 bg-canvas/95 backdrop-blur-sm border-t border-hairline px-6 py-2 flex items-center gap-3 text-[12px] text-ink-faint z-30">
        <span>{wordCount > 0 ? `${wordCount} 字` : "空文档"}</span>
        <span className="w-px h-3 bg-hairline" />
        <span>{isEdit ? "编辑模式" : "新建模式"}</span>
        {draftSavedAt && (
          <>
            <span className="w-px h-3 bg-hairline" />
            <span className="text-primary/70">草稿已暂存</span>
          </>
        )}
        <span className="w-px h-3 bg-hairline" />
        <span className="hidden sm:inline">⌘S 保存</span>
      </div>
    </div>
    </TooltipProvider>
    </EditorProvider>
  );
}
