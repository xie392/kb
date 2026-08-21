"use client";

import { useEffect, useState } from "react";
import type { Editor } from "@tiptap/react";
import { getMarkRange } from "@tiptap/core";
import { NodeSelection } from "@tiptap/pm/state";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { LinkCardAttrs } from "./link-card";
import { fetchLinkPreview } from "./link-preview";

interface LinkDialogProps {
  editor: Editor | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** 由外部传入的初始卡片（编辑已有卡片时） */
  initialCard?: LinkCardAttrs | null;
}

type LinkMode = "text" | "card";

export function LinkDialog({ editor, open, onOpenChange, initialCard }: LinkDialogProps) {
  const [mode, setMode] = useState<LinkMode>("text");
  const [text, setText] = useState("");
  const [url, setUrl] = useState("");
  const [cardTitle, setCardTitle] = useState("");
  const [cardDesc, setCardDesc] = useState("");
  const [cardImage, setCardImage] = useState("");
  const [cardFavicon, setCardFavicon] = useState<string | null>(null);
  const [fetching, setFetching] = useState(false);

  const isEditingCard = () =>
    !!editor &&
    editor.state.selection instanceof NodeSelection &&
    editor.state.selection.node.type.name === "linkCard";

  useEffect(() => {
    if (!open || !editor) return;

    // 编辑已有卡片
    if (initialCard) {
      setMode("card");
      setUrl(initialCard.href ?? "");
      setCardTitle(initialCard.title ?? "");
      setCardDesc(initialCard.description ?? "");
      setCardImage(initialCard.image ?? "");
      setCardFavicon(initialCard.favicon ?? null);
      return;
    }
    // 选中卡片节点（编辑器内点卡片编辑按钮时）
    if (isEditingCard()) {
      const attrs = (editor.state.selection as NodeSelection).node.attrs as LinkCardAttrs;
      setMode("card");
      setUrl(attrs.href ?? "");
      setCardTitle(attrs.title ?? "");
      setCardDesc(attrs.description ?? "");
      setCardImage(attrs.image ?? "");
      setCardFavicon(attrs.favicon ?? null);
      return;
    }
    // 普通文字链接
    setMode("text");
    const { from, to, empty } = editor.state.selection;
    let selectedText = empty ? "" : editor.state.doc.textBetween(from, to, "\n", " ");
    if (!selectedText && editor.isActive("link")) {
      const range = getMarkRange(
        editor.state.doc.resolve(editor.state.selection.from),
        editor.schema.marks.link
      );
      if (range) {
        selectedText = editor.state.doc.textBetween(range.from, range.to, "\n", " ");
      }
    }
    setText(selectedText);
    setUrl((editor.getAttributes("link").href as string) ?? "");
  }, [editor, open, initialCard]);

  const applyLink = () => {
    if (!editor) return;
    const href = url.trim();
    const label = text.trim() || "链接";
    const { from, to, empty } = editor.state.selection;

    if (!href) {
      if (isEditingCard()) {
        editor.chain().focus().deleteSelection().run();
      } else {
        editor.chain().focus().extendMarkRange("link").unsetLink().run();
      }
      onOpenChange(false);
      return;
    }

    const chain = editor.chain().focus();

    if (mode === "card") {
      if (isEditingCard()) {
        chain.updateAttributes("linkCard", {
          href,
          title: cardTitle.trim() || href,
          description: cardDesc.trim(),
          image: cardImage.trim() || null,
          favicon: cardFavicon,
        } satisfies LinkCardAttrs);
      } else {
        if (!empty) chain.deleteSelection();
        chain.insertContent({
          type: "linkCard",
          attrs: {
            href,
            title: cardTitle.trim() || href,
            description: cardDesc.trim(),
            image: cardImage.trim() || null,
            favicon: cardFavicon,
          } satisfies LinkCardAttrs,
        });
      }
      chain.run();
      onOpenChange(false);
      return;
    }

    if (empty) {
      chain.insertContent({
        type: "text",
        text: label,
        marks: [{ type: "link", attrs: { href } }],
      });
    } else {
      const selectedText = editor.state.doc.textBetween(from, to, "\n", " ");
      if (text.trim() && text.trim() !== selectedText) {
        chain
          .deleteRange({ from, to })
          .insertContent({
            type: "text",
            text: label,
            marks: [{ type: "link", attrs: { href } }],
          });
      } else {
        chain.extendMarkRange("link").setLink({ href });
      }
    }
    chain.run();
    onOpenChange(false);
  };

  const modeBtn = (m: LinkMode, label: string) => (
    <button
      type="button"
      onClick={() => setMode(m)}
      className={cn(
        "flex-1 rounded-md px-3 py-1 text-xs transition-colors",
        mode === m
          ? "bg-primary text-white shadow-sm"
          : "text-ink-muted hover:bg-white hover:text-ink-secondary"
      )}
    >
      {label}
    </button>
  );

  const fetchCardInfo = async () => {
    const href = url.trim();
    if (!href || fetching) return;
    setFetching(true);
    try {
      const data = await fetchLinkPreview(href);
      if (data) {
        if (data.title && !cardTitle) setCardTitle(data.title);
        if (data.description && !cardDesc) setCardDesc(data.description);
        if (data.image && !cardImage) setCardImage(data.image);
        if (data.favicon) setCardFavicon(data.favicon);
      }
    } finally {
      setFetching(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-hand-display text-[17px] font-bold">链接</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 px-1">
          <div className="flex gap-1 rounded-lg bg-canvas-soft p-1">
            {modeBtn("text", "文字链接")}
            {modeBtn("card", "卡片链接")}
          </div>

          {mode === "text" ? (
            <>
              <div className="space-y-1">
                <label htmlFor="kb-link-text" className="text-xs text-ink-muted">
                  显示内容
                </label>
                <Input
                  id="kb-link-text"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="链接上显示的文字"
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="kb-link-url" className="text-xs text-ink-muted">
                  链接地址
                </label>
                <Input
                  id="kb-link-url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com"
                />
              </div>
            </>
          ) : (
            <>
              <div className="space-y-1">
                <label htmlFor="kb-card-url" className="text-xs text-ink-muted">
                  链接地址
                </label>
                <div className="flex gap-2">
                  <Input
                    id="kb-card-url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://example.com"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="shrink-0"
                    disabled={!url.trim() || fetching}
                    onClick={() => void fetchCardInfo()}
                  >
                    {fetching ? "获取中…" : "获取信息"}
                  </Button>
                </div>
              </div>
              <div className="space-y-1">
                <label htmlFor="kb-card-title" className="text-xs text-ink-muted">
                  标题
                </label>
                <Input
                  id="kb-card-title"
                  value={cardTitle}
                  onChange={(e) => setCardTitle(e.target.value)}
                  placeholder="卡片标题（留空用链接地址）"
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="kb-card-desc" className="text-xs text-ink-muted">
                  描述
                </label>
                <Input
                  id="kb-card-desc"
                  value={cardDesc}
                  onChange={(e) => setCardDesc(e.target.value)}
                  placeholder="简短描述（可选）"
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="kb-card-image" className="text-xs text-ink-muted">
                  缩略图 URL
                </label>
                <Input
                  id="kb-card-image"
                  value={cardImage}
                  onChange={(e) => setCardImage(e.target.value)}
                  placeholder="https://…/cover.png（可选）"
                />
              </div>
            </>
          )}
        </div>
        <DialogFooter className="-mx-5 -mb-5 gap-2 border-t border-hairline bg-white p-4 sm:flex-row sm:justify-end">
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              if (!editor) return;
              if (isEditingCard()) {
                editor.chain().focus().deleteSelection().run();
              } else {
                editor.chain().focus().extendMarkRange("link").unsetLink().run();
              }
              onOpenChange(false);
            }}
          >
            {mode === "card" ? "移除卡片" : "移除链接"}
          </Button>
          <Button type="button" onClick={applyLink}>
            应用
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ─── 全局打开入口：工具栏/插入菜单/slash 菜单/卡片共用同一个弹窗 ─── */

export interface LinkDialogOpenOptions {
  card?: LinkCardAttrs | null;
}

let requestOpen: ((opts?: LinkDialogOpenOptions) => void) | null = null;

export function openLinkDialog(opts?: LinkDialogOpenOptions) {
  requestOpen?.(opts);
}

/** 挂载在编辑区，持有 editor 引用并接收全局打开请求 */
export function LinkDialogHost({ editor }: { editor: Editor | null }) {
  const [open, setOpen] = useState(false);
  const [initialCard, setInitialCard] = useState<LinkCardAttrs | null>(null);

  useEffect(() => {
    requestOpen = (opts) => {
      setInitialCard(opts?.card ?? null);
      setOpen(true);
    };
    return () => {
      requestOpen = null;
    };
  }, []);

  return (
    <LinkDialog
      editor={editor}
      open={open}
      onOpenChange={setOpen}
      initialCard={initialCard}
    />
  );
}
