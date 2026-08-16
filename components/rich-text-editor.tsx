"use client";

import { useEffect, useMemo } from "react";
import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";

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

/* ─── 工具栏分组数据（供外部使用） ─── */

export interface ToolbarAction {
  title: string;
  active?: boolean;
  onClick: () => void;
  icon: React.ReactNode;
}

export function buildToolbarGroups(editor: Editor): ToolbarAction[][] {
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
      { title: "行内代码", active: editor.isActive("code"), onClick: () => editor.chain().focus().toggleCode().run(), icon: <IconCode /> },
    ],
    [
      { title: "无序列表", active: editor.isActive("bulletList"), onClick: () => editor.chain().focus().toggleBulletList().run(), icon: <IconUl /> },
      { title: "有序列表", active: editor.isActive("orderedList"), onClick: () => editor.chain().focus().toggleOrderedList().run(), icon: <IconOl /> },
      { title: "引用", active: editor.isActive("blockquote"), onClick: () => editor.chain().focus().toggleBlockquote().run(), icon: <IconQuote /> },
    ],
    [
      { title: "分割线", onClick: () => editor.chain().focus().setHorizontalRule().run(), icon: <IconHr /> },
      { title: "图片", onClick: () => {
        const url = window.prompt("图片 URL（或 base64 数据）");
        if (url) editor.chain().focus().setImage({ src: url }).run();
      }, icon: <IconImage /> },
      { title: "链接", onClick: () => {
        const prev = editor.getAttributes("link").href as string | undefined;
        const url = window.prompt("链接 URL", prev ?? "https://");
        if (url === null) return;
        if (url === "") { editor.chain().focus().extendMarkRange("link").unsetLink().run(); return; }
        editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
      }, active: editor.isActive("link"), icon: <IconLink /> },
    ],
  ];
}

/* ─── 独立工具栏组件（可放在任意位置） ─── */

export function EditorToolbar({ editor }: { editor: Editor | null }) {
  const groups = useMemo(() => editor ? buildToolbarGroups(editor) : [], [editor]);

  if (!editor) return null;

  return (
    <div className="flex items-center gap-0.5 px-3 py-1.5 border-b border-[#e6e6e6] bg-white flex-wrap">
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
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      Image.configure({ allowBase64: true }),
      Link.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder: placeholder ?? "开始写作…" }),
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
    </div>
  );
}
