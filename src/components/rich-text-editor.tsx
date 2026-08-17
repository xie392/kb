"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useEditor, useEditorState, EditorContent, ReactNodeViewRenderer, NodeViewWrapper, type Editor } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import { NodeSelection, type EditorState } from "@tiptap/pm/state";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import Highlight from "@tiptap/extension-highlight";
import TextAlign from "@tiptap/extension-text-align";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import { Table } from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import { Markdown } from "@tiptap/markdown";
import { MarkdownPaste } from "@/components/markdown-paste";
import { CustomCodeBlock } from "@/components/code-block-node";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

/* ─── 工具栏按钮 ─── */

function ToolbarBtn({
  active,
  disabled,
  onClick,
  title,
  children,
}: {
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={`w-8 h-8 rounded-[6px] grid place-items-center transition-all duration-150 ${
        active
          ? "bg-[#0075de]/10 text-[#0075de]"
          : "text-[#615d59] hover:bg-[#f0efec] hover:text-[#31302e]"
      } ${disabled ? "opacity-30 cursor-not-allowed" : "cursor-pointer"}`}
    >
      {children}
    </button>
  );
}

export { ToolbarBtn };

function ToolbarDivider() {
  return <div className="w-px h-5 bg-[#e6e6e6] mx-1 shrink-0" />;
}

/* ─── SVG 图标 ─── */

function IconUndo() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9.5a5 5 0 0 1 7-4.6V3l3.5 3L10 9V7A3 3 0 1 0 7 10H3v-.5z" />
    </svg>
  );
}

function IconRedo() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 9.5a5 5 0 0 0-7-4.6V3l-3.5 3L6 9V7a3 3 0 1 1 3 3h4v-.5z" />
    </svg>
  );
}

function IconBold() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
      <path d="M4 2h5a3 3 0 0 1 2.1 5.1A3 3 0 0 1 9 14H4V2zm2.5 2v3h2a1 1 0 0 0 0-2h-2zm0 5v3h2.5a1.5 1.5 0 0 0 0-3H6.5z" />
    </svg>
  );
}

function IconItalic() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 2H6l-2 12h4" />
    </svg>
  );
}

function IconUnderline() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 2v6a4 4 0 0 0 8 0V2M3 14h10" />
    </svg>
  );
}

function IconStrike() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
      <path d="M2 8h12M5 5c0-1.5 1.5-2.5 3-2.5s3 1 3 2.5c0 1-1 1.8-2.5 2.5C7 8.2 5 9 5 11c0 1.5 1.5 2.5 3 2.5s3-1 3-2.5" />
    </svg>
  );
}

function IconCode() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="m5 4-3 4 3 4M11 4l3 4-3 4" />
    </svg>
  );
}

function IconH1() {
  return <span className="text-[12px] font-bold leading-none">H1</span>;
}
function IconH2() {
  return <span className="text-[12px] font-bold leading-none">H2</span>;
}
function IconH3() {
  return <span className="text-[12px] font-bold leading-none">H3</span>;
}
function IconParagraph() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
      <path d="M3 3h10v2H3zM3 7h7v2H3zM3 11h10v2H3z" opacity="0.7" />
    </svg>
  );
}

function IconUl() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
      <circle cx="3.5" cy="4" r="1" /><circle cx="3.5" cy="8" r="1" /><circle cx="3.5" cy="12" r="1" />
      <rect x="7" y="3" width="7" height="2" rx="0.5" /><rect x="7" y="7" width="7" height="2" rx="0.5" /><rect x="7" y="11" width="7" height="2" rx="0.5" />
    </svg>
  );
}

function IconOl() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" fontSize="7" fontFamily="sans-serif">
      <text x="2" y="5.5" fontWeight="bold">1</text><text x="2" y="9.5" fontWeight="bold">2</text><text x="2" y="13.5" fontWeight="bold">3</text>
      <rect x="7" y="3" width="7" height="2" rx="0.5" /><rect x="7" y="7" width="7" height="2" rx="0.5" /><rect x="7" y="11" width="7" height="2" rx="0.5" />
    </svg>
  );
}

function IconQuote() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" opacity="0.7">
      <path d="M3 8c0-2 1-3.5 3-3.5V6c-1 0-1.5.8-1.5 2H6v4H3V8zm6 0c0-2 1-3.5 3-3.5V6c-1 0-1.5.8-1.5 2H12v4H9V8z" />
    </svg>
  );
}

function IconHr() {
  return (
    <svg width="16" height="14" viewBox="0 0 16 14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
      <line x1="2" y1="7" x2="14" y2="7" />
    </svg>
  );
}

function IconImage() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2.5" y="3.5" width="11" height="9" rx="1.5" />
      <circle cx="5.5" cy="6.5" r="1.2" />
      <path d="M2.5 11l3.5-3 2.5 2 3-2.5L13.5 11" />
    </svg>
  );
}

function IconLink() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 10 9 7M7 3.5 8.5 2a3 3 0 0 1 4.2 4.2L11 8M9 12.5 7.5 14a3 3 0 0 1-4.2-4.2L5 8" />
    </svg>
  );
}

function IconHighlight() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
      <rect x="2" y="8.5" width="12" height="4.5" rx="1.2" fill="currentColor" opacity="0.35" />
      <path d="M4 4.5h8M6 7h4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function IconCodeBlock() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2.5" width="12" height="11" rx="1.5" />
      <path d="m6 6-2 2 2 2M10 6l2 2-2 2" />
    </svg>
  );
}

function IconTaskList() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2.8" width="3.4" height="3.4" rx="0.9" />
      <path d="M3.2 4.5l.9.9 1.4-1.6" />
      <rect x="7.5" y="3.2" width="6.5" height="1.7" rx="0.8" />
      <rect x="2" y="9.8" width="3.4" height="3.4" rx="0.9" />
      <rect x="7.5" y="10.4" width="6.5" height="1.7" rx="0.8" />
    </svg>
  );
}

function IconAlignLeft() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round">
      <path d="M2 3.5h12M2 7h8M2 10.5h11M2 14h5" />
    </svg>
  );
}

function IconAlignCenter() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round">
      <path d="M2 3.5h12M4 7h8M3 10.5h10M5 14h6" />
    </svg>
  );
}

function IconAlignRight() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round">
      <path d="M2 3.5h12M6 7h8M3 10.5h11M9 14h5" />
    </svg>
  );
}

function IconClearFormat() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6.5 3h5M8 3v7.5M5.5 12h5.5" />
      <path d="M2.5 14l10.5-11" />
    </svg>
  );
}

function IconTable() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round">
      <rect x="2.5" y="3.5" width="11" height="9" rx="1.2" />
      <path d="M2.5 6.5h11M6 3.5v9" />
    </svg>
  );
}

function IconTableDelete() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round">
      <rect x="2.5" y="3.5" width="11" height="9" rx="1.2" />
      <path d="M2.5 6.5h11M6 3.5v9" />
      <path d="M4.5 13l7-9" strokeLinejoin="round" />
    </svg>
  );
}

function IconSpinner() {
  return (
    <svg className="animate-spin" width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M2 8a6 6 0 1 1 11 3.5" strokeLinecap="round" />
    </svg>
  );
}

function IconDelete() {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2.5 4.5h11M6 4.5V3h4v1.5M4 4.5l.7 9h6.6l.7-9M6.5 7.5v4M9.5 7.5v4" />
    </svg>
  );
}

function IconRotate() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13.5 8a5.5 5.5 0 1 1-1.6-3.9" />
      <path d="M13.5 2v3h-3" />
    </svg>
  );
}

function IconImageStyle() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2.5" y="3.5" width="9" height="9" rx="1.5" />
      <circle cx="5.2" cy="6.2" r="0.9" />
      <path d="M2.5 10l2.5-2.2 2 1.6L10 6.5l1.5 1.5" />
    </svg>
  );
}

function IconReset() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3.5 4v3.5H7" />
      <path d="M3.9 10.5a5 5 0 1 0 .9-4.1L3.5 7.5" />
    </svg>
  );
}

/* ─── 图片节点（支持对齐、旋转、描边、阴影） ───
 * 属性通过 data-* 输出到 DOM，视觉由 CSS 按属性选择器控制。
 * 这样 updateAttributes 后 ProseMirror 能把变更同步到 DOM（节点级
 * renderHTML 仅在首次插入时执行，属性级 renderHTML 返回 {} 会导致更新不落 DOM）。
 */

type ImageAlign = "left" | "center" | "right";
type ImageStyle = "none" | "border" | "shadow";

function parseLegacyStyle(el: HTMLElement) {
  const s = el.getAttribute("style") ?? "";
  const align: ImageAlign = s.includes("float:left")
    ? "left"
    : s.includes("float:right")
      ? "right"
      : "center";
  const rotMatch = s.match(/rotate\((-?\d+(?:\.\d+)?)deg\)/);
  const rotation = rotMatch ? Number(rotMatch[1]) : 0;
  const imgStyle: ImageStyle = s.includes("box-shadow:")
    ? "shadow"
    : s.includes("border:")
      ? "border"
      : "none";
  return { align, rotation, imgStyle };
}

function numAttr(el: HTMLElement, name: string): number | null {
  const v = el.getAttribute(name);
  if (v === null) return null;
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : null;
}

function readImageEl(el: HTMLElement): HTMLImageElement | null {
  if (el.tagName === "IMG") return el as HTMLImageElement;
  const img = el.querySelector("img");
  return img as HTMLImageElement | null;
}

const CustomImage = Image.configure({ allowBase64: true }).extend({
  parseHTML() {
    return [{ tag: "span.kb-img-wrap" }, { tag: "img[src]" }];
  },
  addAttributes() {
    return {
      ...this.parent?.(),
      src: {
        default: null,
        parseHTML: (el) => readImageEl(el as HTMLElement)?.getAttribute("src") ?? null,
      },
      alt: {
        default: null,
        parseHTML: (el) => readImageEl(el as HTMLElement)?.getAttribute("alt") ?? null,
      },
      title: {
        default: null,
        parseHTML: (el) => readImageEl(el as HTMLElement)?.getAttribute("title") ?? null,
      },
      width: {
        default: null,
        parseHTML: (el) => {
          const img = readImageEl(el as HTMLElement);
          return img ? numAttr(img, "width") : null;
        },
        renderHTML: (a) => (a.width ? { width: a.width } : {}),
      },
      height: {
        default: null,
        parseHTML: (el) => {
          const img = readImageEl(el as HTMLElement);
          return img ? numAttr(img, "height") : null;
        },
        renderHTML: (a) => (a.height ? { height: a.height } : {}),
      },
      align: {
        default: "center",
        parseHTML: (el) => {
          const root = el as HTMLElement;
          const img = readImageEl(root);
          return (
            root.getAttribute("data-align") ??
            img?.getAttribute("data-align") ??
            parseLegacyStyle(img ?? root).align
          ) as ImageAlign;
        },
        renderHTML: (a) => ({ "data-align": a.align }),
      },
      rotation: {
        default: 0,
        parseHTML: (el) => {
          const img = readImageEl(el as HTMLElement);
          if (!img) return 0;
          const d = img.getAttribute("data-rotation");
          if (d !== null) return Number(d) || 0;
          return parseLegacyStyle(img).rotation;
        },
        renderHTML: (a) =>
          a.rotation ? { "data-rotation": String(a.rotation) } : {},
      },
      imgStyle: {
        default: "none",
        parseHTML: (el) => {
          const img = readImageEl(el as HTMLElement);
          if (!img) return "none";
          return (
            (img.getAttribute("data-style") as ImageStyle | null) ??
            parseLegacyStyle(img).imgStyle
          );
        },
        renderHTML: (a) =>
          a.imgStyle && a.imgStyle !== "none"
            ? { "data-style": a.imgStyle }
            : {},
      },
    };
  },
  addNodeView() {
    return ReactNodeViewRenderer(ImageView);
  },
  renderHTML({ HTMLAttributes }) {
    const attrs = HTMLAttributes as Record<string, unknown>;
    const align = (attrs["data-align"] as ImageAlign) ?? "center";
    const rot = Number(attrs["data-rotation"]) || 0;
    const w = Number(attrs.width) || 0;
    const h = Number(attrs.height) || 0;
    const rad = (rot * Math.PI) / 180;
    const sin = Math.abs(Math.sin(rad));
    const cos = Math.abs(Math.cos(rad));
    const boxW = Math.round(w * cos + h * sin);
    const boxH = Math.round(w * sin + h * cos);
    const textAlign =
      align === "left" ? "left" : align === "right" ? "right" : "center";
    let wrapStyle = `text-align:${textAlign};`;
    let imgStyle: string | undefined;
    if (w && h && boxW && boxH) {
      wrapStyle += `width:${boxW}px;max-width:100%;aspect-ratio:${boxW} / ${boxH};`;
      imgStyle = [
        `width:${((w / boxW) * 100).toFixed(4)}%`,
        "height:auto",
        "position:absolute",
        "top:50%",
        "left:50%",
        "max-width:none",
        "margin:0",
        `transform:translate(-50%,-50%) rotate(${rot}deg)`,
      ].join(";");
    }
    return [
      "div",
      { class: "kb-img-wrap", "data-align": align, style: wrapStyle },
      ["img", { ...attrs, style: imgStyle }],
    ];
  },
});

/* 图片 NodeView：wrapper 内的定位容器按旋转后的包围盒预留布局空间，
 * 图片绝对居中并旋转，避免 transform 悬浮覆盖相邻内容。 */
function ImageView(props: {
  node: { attrs: Record<string, unknown> };
  updateAttributes: (patch: Record<string, unknown>) => void;
  selected?: boolean;
}) {
  const { node, selected, updateAttributes } = props;
  const attrs = node.attrs as {
    src?: string;
    alt?: string;
    title?: string;
    width?: number | null;
    height?: number | null;
    align?: ImageAlign;
    rotation?: number;
    imgStyle?: ImageStyle;
  };
  const align = attrs.align ?? "center";
  const rotation = ((attrs.rotation ?? 0) % 360 + 360) % 360;
  const imgStyle = attrs.imgStyle ?? "none";
  const storedW = Number(attrs.width) || 0;
  const storedH = Number(attrs.height) || 0;

  const [size, setSize] = useState<{ w: number; h: number } | null>(
    storedW && storedH ? { w: storedW, h: storedH } : null,
  );

  const rad = (rotation * Math.PI) / 180;
  const sin = Math.abs(Math.sin(rad));
  const cos = Math.abs(Math.cos(rad));
  const boxW = size ? size.w * cos + size.h * sin : 0;
  const boxH = size ? size.w * sin + size.h * cos : 0;
  const textAlign =
    align === "left" ? "left" : align === "right" ? "right" : "center";

  const wrapStyle: React.CSSProperties = {
    textAlign,
    width: boxW ? `${Math.round(boxW)}px` : undefined,
    maxWidth: "100%",
    aspectRatio: boxW && boxH ? `${boxW} / ${boxH}` : undefined,
  };
  const imgCss: React.CSSProperties = size
    ? {
        width: `${((size.w / boxW) * 100).toFixed(4)}%`,
        height: "auto",
        position: "absolute",
        top: "50%",
        left: "50%",
        maxWidth: "none",
        margin: 0,
        transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
      }
    : { maxWidth: "100%", height: "auto" };

  return (
    <NodeViewWrapper
      as="div"
      className="kb-img-wrap"
      style={wrapStyle}
      data-align={align}
      data-selected={selected ? "true" : undefined}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={attrs.src ?? undefined}
        alt={attrs.alt ?? undefined}
        title={attrs.title ?? undefined}
        data-align={align}
        data-rotation={String(rotation)}
        data-style={imgStyle}
        style={imgCss}
        onLoad={(e) => {
          const el = e.currentTarget;
          const nw = el.naturalWidth || el.width;
          const nh = el.naturalHeight || el.height;
          if (nw && nh) {
            setSize({ w: nw, h: nh });
            if (!storedW || !storedH) {
              updateAttributes({ width: Math.round(nw), height: Math.round(nh) });
            }
          }
        }}
      />
    </NodeViewWrapper>
  );
}

/* ─── 工具栏分组数据（供外部使用） ─── */

export interface ToolbarAction {
  title: string;
  active?: boolean;
  onClick: () => void;
  icon: React.ReactNode;
}

interface ToolbarImageOpts {
  /** 有值时图片按钮改为触发本地文件选择（上传后返回图片 URL） */
  openImagePicker?: () => void;
  /** 上传中状态 */
  uploading?: boolean;
}

export function buildToolbarGroups(editor: Editor, opts?: ToolbarImageOpts): ToolbarAction[][] {
  return [
    [
      { title: "撤销", onClick: () => editor.chain().focus().undo().run(), icon: <IconUndo /> },
      { title: "重做", onClick: () => editor.chain().focus().redo().run(), icon: <IconRedo /> },
    ],
    [
      { title: "标题 1", active: editor.isActive("heading", { level: 1 }), onClick: () => editor.chain().focus().toggleHeading({ level: 1 }).run(), icon: <IconH1 /> },
      { title: "标题 2", active: editor.isActive("heading", { level: 2 }), onClick: () => editor.chain().focus().toggleHeading({ level: 2 }).run(), icon: <IconH2 /> },
      { title: "标题 3", active: editor.isActive("heading", { level: 3 }), onClick: () => editor.chain().focus().toggleHeading({ level: 3 }).run(), icon: <IconH3 /> },
      { title: "正文", active: editor.isActive("paragraph"), onClick: () => editor.chain().focus().setParagraph().run(), icon: <IconParagraph /> },
    ],
    [
      { title: "加粗", active: editor.isActive("bold"), onClick: () => editor.chain().focus().toggleBold().run(), icon: <IconBold /> },
      { title: "斜体", active: editor.isActive("italic"), onClick: () => editor.chain().focus().toggleItalic().run(), icon: <IconItalic /> },
      { title: "下划线", active: editor.isActive("underline"), onClick: () => editor.chain().focus().toggleUnderline().run(), icon: <IconUnderline /> },
      { title: "删除线", active: editor.isActive("strike"), onClick: () => editor.chain().focus().toggleStrike().run(), icon: <IconStrike /> },
      { title: "高亮", active: editor.isActive("highlight"), onClick: () => editor.chain().focus().toggleHighlight().run(), icon: <IconHighlight /> },
      { title: "行内代码", active: editor.isActive("code"), onClick: () => editor.chain().focus().toggleCode().run(), icon: <IconCode /> },
      { title: "清除格式", onClick: () => editor.chain().focus().clearNodes().unsetAllMarks().run(), icon: <IconClearFormat /> },
    ],
    [
      { title: "无序列表", active: editor.isActive("bulletList"), onClick: () => editor.chain().focus().toggleBulletList().run(), icon: <IconUl /> },
      { title: "有序列表", active: editor.isActive("orderedList"), onClick: () => editor.chain().focus().toggleOrderedList().run(), icon: <IconOl /> },
      { title: "任务列表", active: editor.isActive("taskList"), onClick: () => editor.chain().focus().toggleTaskList().run(), icon: <IconTaskList /> },
      { title: "引用", active: editor.isActive("blockquote"), onClick: () => editor.chain().focus().toggleBlockquote().run(), icon: <IconQuote /> },
      { title: "代码块", active: editor.isActive("codeBlock"), onClick: () => editor.chain().focus().toggleCodeBlock().run(), icon: <IconCodeBlock /> },
    ],
    [
      { title: "左对齐", active: editor.isActive({ textAlign: "left" }), onClick: () => editor.chain().focus().setTextAlign("left").run(), icon: <IconAlignLeft /> },
      { title: "居中", active: editor.isActive({ textAlign: "center" }), onClick: () => editor.chain().focus().setTextAlign("center").run(), icon: <IconAlignCenter /> },
      { title: "右对齐", active: editor.isActive({ textAlign: "right" }), onClick: () => editor.chain().focus().setTextAlign("right").run(), icon: <IconAlignRight /> },
    ],
    [
      { title: "分割线", onClick: () => editor.chain().focus().setHorizontalRule().run(), icon: <IconHr /> },
      { title: opts?.uploading ? "上传中…" : "图片", onClick: () => {
        if (opts?.openImagePicker) {
          opts.openImagePicker();
          return;
        }
        const url = window.prompt("图片 URL（或 base64 数据）");
        if (url) editor.chain().focus().setImage({ src: url }).run();
      }, icon: opts?.uploading ? <IconSpinner /> : <IconImage /> },
      { title: "链接", onClick: () => {
        const prev = editor.getAttributes("link").href as string | undefined;
        const url = window.prompt("链接 URL", prev ?? "https://");
        if (url === null) return;
        if (url === "") { editor.chain().focus().extendMarkRange("link").unsetLink().run(); return; }
        editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
      }, active: editor.isActive("link"), icon: <IconLink /> },
      { title: "表格", onClick: () => {
        const input = window.prompt("表格尺寸（列数×行数），如 3×3", "3×3");
        if (!input) return;
        const m = input.trim().match(/^(\d+)\s*[x×]\s*(\d+)$/);
        if (!m) return;
        const cols = Math.min(Math.max(parseInt(m[1]), 1), 8);
        const rows = Math.min(Math.max(parseInt(m[2]), 1), 20);
        editor.chain().focus().insertTable({ rows, cols, withHeaderRow: true }).run();
      }, icon: <IconTable /> },
      { title: "删除表格", active: editor.isActive("table"), onClick: () => {
        if (editor.isActive("table")) editor.chain().focus().deleteTable().run();
      }, icon: <IconTableDelete /> },
    ],
  ];
}

/* ─── 独立工具栏组件（可放在任意位置） ─── */

export function EditorToolbar({
  editor,
  onUploadImage,
}: {
  editor: Editor | null;
  /** 传入后图片按钮变为"本地上传"，返回图片 URL */
  onUploadImage?: (file: File) => Promise<string>;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [errMsg, setErrMsg] = useState<string | null>(null);

  const groups = useMemo(
    () =>
      editor
        ? buildToolbarGroups(editor, {
            openImagePicker: onUploadImage ? () => fileRef.current?.click() : undefined,
            uploading,
          })
        : [],
    [editor, onUploadImage, uploading]
  );

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // 允许重复选择同一文件
    if (!file || !onUploadImage || !editor) return;
    if (!file.type.startsWith("image/")) {
      setErrMsg("请选择图片文件（JPG/PNG/GIF/WebP）");
      return;
    }
    setUploading(true);
    try {
      const url = await onUploadImage(file);
      if (url) editor.chain().focus().setImage({ src: url }).run();
    } catch (err) {
      setErrMsg(`上传失败：${err instanceof Error ? err.message : "未知错误"}`);
    } finally {
      setUploading(false);
    }
  };

  if (!editor) return null;

  return (
    <div className="flex items-center gap-0.5 px-3 py-1.5 border-b border-[#e6e6e6] bg-white flex-wrap">
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
      {groups.map((group, gi) => (
        <div key={gi} className="flex items-center gap-0.5">
          {gi > 0 && <ToolbarDivider />}
          {group.map((btn) => (
            <ToolbarBtn
              key={btn.title}
              title={btn.title}
              active={"active" in btn ? !!btn.active : false}
              onClick={btn.onClick}
            >
              {btn.icon}
            </ToolbarBtn>
          ))}
        </div>
      ))}

      {/* 错误提示弹窗 */}
      <AlertDialog
        open={!!errMsg}
        onOpenChange={(open) => {
          if (!open) setErrMsg(null);
        }}
      >
        <AlertDialogContent className="rounded-xl border border-[#e6e6e6] bg-white shadow-lg">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-hand-display text-[18px] font-bold text-[#31302e]">
              提示
            </AlertDialogTitle>
            <AlertDialogDescription className="text-[13px] text-[#615d59]">{errMsg}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction
              className="bg-[#0075de] text-white hover:bg-[#005bab]"
              onClick={() => setErrMsg(null)}
            >
              知道了
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

/* ─── 编辑器 Hook（供外部创建 editor 实例） ─── */

export function useArticleEditor(options: {
  value: string;
  onChange: (html: string) => void;
  onOutline?: (items: { id: string; text: string; level: number }[]) => void;
  placeholder?: string;
}) {
  const { value, onChange, onOutline, placeholder } = options;

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] }, codeBlock: false }),
      CustomCodeBlock,
      Underline,
      Highlight.configure({ multicolor: false }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Table.configure({ resizable: false }),
      TableRow,
      TableHeader,
      TableCell,
      CustomImage,
      Link.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder: placeholder ?? "开始写作…" }),
      Markdown,
      MarkdownPaste,
    ],
    content: value || "",
    editorProps: {
      attributes: {
        class: "prose-kb focus:outline-none",
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
      emitOutline(editor);
    },
    onCreate: ({ editor }) => {
      emitOutline(editor);
    },
  });

  function emitOutline(ed: Editor) {
    if (!onOutline) return;
    const items: { id: string; text: string; level: number }[] = [];
    ed.state.doc.descendants((node) => {
      if (node.type.name === "heading") {
        items.push({
          id: `h-${items.length}`,
          text: node.textContent.slice(0, 40) || "（空标题）",
          level: node.attrs.level as number,
        });
      }
      return true;
    });
    onOutline(items);
  }

  // 外部 value 变化时同步
  useEffect(() => {
    if (editor && value && editor.getHTML() !== value) {
      editor.commands.setContent(value, { emitUpdate: false });
      emitOutline(editor);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor, value]);

  return editor;
}

/* ─── 块级浮动工具条（选中图片/表格等节点时显示） ─── */

function MenuBtn({
  active,
  disabled,
  title,
  onClick,
  children,
}: {
  active?: boolean;
  disabled?: boolean;
  title: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={`w-7 h-7 grid place-items-center rounded-md text-[12px] transition-colors ${
        active
          ? "bg-[#0075de]/10 text-[#0075de]"
          : "text-[#615d59] hover:bg-[#f0efec] hover:text-[#31302e]"
      } ${disabled ? "opacity-30 cursor-not-allowed pointer-events-none" : ""}`}
    >
      {children}
    </button>
  );
}

function BlockMenu({ editor }: { editor: Editor }) {
  const [scrollTarget, setScrollTarget] = useState<HTMLElement | Window>(window);
  const [styleOpen, setStyleOpen] = useState(false);
  const styleWrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let el: HTMLElement | null = editor.view.dom.parentElement;
    while (el) {
      const oy = getComputedStyle(el).overflowY;
      if (oy === "auto" || oy === "scroll") {
        setScrollTarget(el);
        return;
      }
      el = el.parentElement;
    }
    setScrollTarget(window);
  }, [editor]);

  useEffect(() => {
    if (!styleOpen) return;
    const onDown = (e: MouseEvent) => {
      if (styleWrapRef.current && !styleWrapRef.current.contains(e.target as Node)) {
        setStyleOpen(false);
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [styleOpen]);

  // 直接从编辑器状态派生选中节点的类型/属性，避免在 effect 中 setState 造成死循环
  const { nodeType, imgAttrs } = useEditorState({
    editor,
    selector: ({ editor }) => {
      const sel = editor.state.selection;
      if (!(sel instanceof NodeSelection)) {
        return { nodeType: null, imgAttrs: null };
      }
      const node = sel.node;
      return {
        nodeType: node.type.name,
        imgAttrs:
          node.type.name === "image"
            ? {
                align: (node.attrs.align as ImageAlign) ?? "center",
                rotation: (node.attrs.rotation as number) ?? 0,
                imgStyle: (node.attrs.imgStyle as ImageStyle) ?? "none",
              }
            : null,
      };
    },
  });

  const bubbleOptions = useMemo(
    () => ({ placement: "top" as const, offset: 8, scrollTarget }),
    [scrollTarget]
  );

  const shouldShow = useCallback(
    ({ state }: { state: EditorState }) => state.selection instanceof NodeSelection,
    []
  );

  const setImageAttr = (patch: Partial<{ align: ImageAlign; rotation: number; imgStyle: ImageStyle }>) =>
    editor.chain().focus().updateAttributes("image", patch).run();

  const isDefault =
    imgAttrs?.align === "center" && imgAttrs?.rotation === 0 && imgAttrs?.imgStyle === "none";

  const styleLabels: Record<ImageStyle, string> = { none: "无样式", border: "描边", shadow: "阴影" };

  return (
    <BubbleMenu
      editor={editor}
      shouldShow={shouldShow}
      options={bubbleOptions}
    >
      <div className="flex items-center gap-0.5 px-1 py-1 bg-white rounded-lg border border-[#e6e6e6] shadow-lg">
        {nodeType === "image" && imgAttrs && (
          <>
            <MenuBtn title="向左旋转 90°" onClick={() => setImageAttr({ rotation: (imgAttrs.rotation - 90) % 360 })}>
              <IconRotate />
            </MenuBtn>
            <ToolbarDivider />
            <MenuBtn title="左对齐" active={imgAttrs.align === "left"} onClick={() => setImageAttr({ align: "left" })}>
              <IconAlignLeft />
            </MenuBtn>
            <MenuBtn title="居中" active={imgAttrs.align === "center"} onClick={() => setImageAttr({ align: "center" })}>
              <IconAlignCenter />
            </MenuBtn>
            <MenuBtn title="右对齐" active={imgAttrs.align === "right"} onClick={() => setImageAttr({ align: "right" })}>
              <IconAlignRight />
            </MenuBtn>
            <ToolbarDivider />
            <div ref={styleWrapRef} className="relative">
              <MenuBtn
                title="样式"
                active={imgAttrs.imgStyle !== "none"}
                onClick={() => setStyleOpen((v) => !v)}
              >
                <IconImageStyle />
              </MenuBtn>
              {styleOpen && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1.5 min-w-[110px] bg-white rounded-lg border border-[#e6e6e6] shadow-lg py-1 z-50">
                  {(["none", "border", "shadow"] as ImageStyle[]).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => { setImageAttr({ imgStyle: s }); setStyleOpen(false); }}
                      className={`w-full text-left px-3 py-1.5 text-[13px] transition-colors ${
                        imgAttrs.imgStyle === s
                          ? "text-[#0075de] bg-[#0075de]/5 font-medium"
                          : "text-[#615d59] hover:bg-[#f6f5f4]"
                      }`}
                    >
                      {styleLabels[s]}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <MenuBtn
              title="复原"
              disabled={isDefault}
              onClick={() => setImageAttr({ align: "center", rotation: 0, imgStyle: "none" })}
            >
              <IconReset />
            </MenuBtn>
            <ToolbarDivider />
          </>
        )}
        {nodeType === "table" && (
          <>
            <MenuBtn title="删除表格" onClick={() => editor.chain().focus().deleteTable().run()}>
              <IconDelete />
            </MenuBtn>
            <ToolbarDivider />
          </>
        )}
        <MenuBtn title="删除" onClick={() => editor.chain().focus().deleteSelection().run()}>
          <IconDelete />
        </MenuBtn>
      </div>
    </BubbleMenu>
  );
}

/* ─── 纯编辑区组件（不含工具栏） ─── */

export function EditorArea({ editor }: { editor: Editor | null }) {
  if (!editor) {
    return (
      <div className="animate-pulse space-y-3 p-8">
        <div className="h-4 bg-[#f0efec] rounded w-3/4" />
        <div className="h-4 bg-[#f0efec] rounded w-1/2" />
        <div className="h-4 bg-[#f0efec] rounded w-2/3" />
      </div>
    );
  }

  return (
    <div className="px-6 py-4">
      <EditorContent editor={editor} />
      <BlockMenu editor={editor} />
    </div>
  );
}
