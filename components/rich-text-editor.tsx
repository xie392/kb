"use client";

import { useEffect } from "react";
import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";

interface Props {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

function ToolbarButton({
  active,
  onClick,
  title,
  children,
}: {
  active?: boolean;
  onClick: () => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={`min-w-[30px] h-[30px] px-1.5 rounded-[6px] grid place-items-center transition-colors ${
        active
          ? "bg-[#0075de] text-white"
          : "text-[#615d59] hover:bg-[#f6f5f4] hover:text-[#31302e]"
      }`}
    >
      {children}
    </button>
  );
}

export default function RichTextEditor({ value, onChange, placeholder }: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Image.configure({ allowBase64: true }),
      Link.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder: placeholder ?? "开始写作…" }),
    ],
    content: value || "",
    editorProps: {
      attributes: {
        class:
          "prose-kb min-h-[50vh] focus:outline-none [&_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)] [&_p.is-editor-empty:first-child::before]:text-[#a39e98]",
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  // 外部 value 变化时同步（编辑已有文章）
  useEffect(() => {
    if (editor && value && editor.getHTML() !== value) {
      editor.commands.setContent(value, { emitUpdate: false });
    }
  }, [editor, value]);

  if (!editor) return null;

  const addImage = () => {
    const url = window.prompt("图片 URL（或 base64 数据）");
    if (url) editor.chain().focus().setImage({ src: url }).run();
  };

  const setLink = () => {
    const prev = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("链接 URL", prev ?? "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  const btns: { title: string; active: () => boolean; onClick: () => void; render: () => React.ReactNode }[] = [
    {
      title: "撤销", active: () => false, onClick: () => editor.chain().focus().undo().run(),
      render: () => <span className="text-[13px]">↩</span>,
    },
    {
      title: "重做", active: () => false, onClick: () => editor.chain().focus().redo().run(),
      render: () => <span className="text-[13px]">↪</span>,
    },
    {
      title: "标题 1", active: () => editor.isActive("heading", { level: 1 }),
      onClick: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
      render: () => <span className="text-[12px] font-bold">H1</span>,
    },
    {
      title: "标题 2", active: () => editor.isActive("heading", { level: 2 }),
      onClick: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
      render: () => <span className="text-[12px] font-bold">H2</span>,
    },
    {
      title: "标题 3", active: () => editor.isActive("heading", { level: 3 }),
      onClick: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
      render: () => <span className="text-[12px] font-bold">H3</span>,
    },
    {
      title: "正文", active: () => editor.isActive("paragraph"),
      onClick: () => editor.chain().focus().setParagraph().run(),
      render: () => <span className="text-[12px] font-semibold">¶</span>,
    },
    {
      title: "加粗", active: () => editor.isActive("bold"),
      onClick: () => editor.chain().focus().toggleBold().run(),
      render: () => <span className="font-bold">B</span>,
    },
    {
      title: "斜体", active: () => editor.isActive("italic"),
      onClick: () => editor.chain().focus().toggleItalic().run(),
      render: () => <span className="italic">I</span>,
    },
    {
      title: "删除线", active: () => editor.isActive("strike"),
      onClick: () => editor.chain().focus().toggleStrike().run(),
      render: () => <span className="line-through">S</span>,
    },
    {
      title: "行内代码", active: () => editor.isActive("code"),
      onClick: () => editor.chain().focus().toggleCode().run(),
      render: () => <span className="font-mono text-[13px]">&lt;/&gt;</span>,
    },
    {
      title: "无序列表", active: () => editor.isActive("bulletList"),
      onClick: () => editor.chain().focus().toggleBulletList().run(),
      render: () => (
        <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M3 4.5h10M3 8h10M3 11.5h10" strokeLinecap="round" />
          <circle cx="6.5" cy="4.5" r="0.5" fill="currentColor" />
        </svg>
      ),
    },
    {
      title: "有序列表", active: () => editor.isActive("orderedList"),
      onClick: () => editor.chain().focus().toggleOrderedList().run(),
      render: () => (
        <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M6 4.5h7M6 8h7M6 11.5h7" strokeLinecap="round" />
          <path d="M2.5 3.5v3M2.5 6.5c.8.5 1.5.9 1.5 1.8 0 .9-.9 1.2-1.5.9M2.5 11.5c.7.3 1.5 0 1.5-.7s-.7-.9-1.5-1.2" />
        </svg>
      ),
    },
    {
      title: "引用", active: () => editor.isActive("blockquote"),
      onClick: () => editor.chain().focus().toggleBlockquote().run(),
      render: () => (
        <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
          <path d="M4 4c-1.7 1-2.5 2.8-2.5 5v3h4v-4H3.5c.2-1.3 1-2.3 2-2.9L4 4zm7 0c-1.7 1-2.5 2.8-2.5 5v3h4v-4h-2c.2-1.3 1-2.3 2-2.9L11 4z" />
        </svg>
      ),
    },
    {
      title: "代码块", active: () => editor.isActive("codeBlock"),
      onClick: () => editor.chain().focus().toggleCodeBlock().run(),
      render: () => (
        <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M6 4L2.5 8 6 12M10 4l3.5 4L10 12" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      title: "分割线", active: () => false,
      onClick: () => editor.chain().focus().setHorizontalRule().run(),
      render: () => <span className="text-[12px] font-bold">—</span>,
    },
    {
      title: "图片", active: () => false,
      onClick: addImage,
      render: () => (
        <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="2" y="3" width="12" height="10" rx="1.5" />
          <circle cx="6" cy="7" r="1.2" />
          <path d="M2 11l3.5-3 2.5 2 3-2.5L14 11" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      title: "链接", active: () => editor.isActive("link"),
      onClick: setLink,
      render: () => (
        <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M6.5 9.5l3-3M7 3.5l1.5-1.5a3 3 0 0 1 4.2 4.2L11 8M9 12.5l-1.5 1.5a3 3 0 0 1-4.2-4.2L5 8" strokeLinecap="round" />
        </svg>
      ),
    },
  ];

  return (
    <div className="bg-white sketch-border sketch-shadow">
      {/* 工具栏 */}
      <div className="flex items-center gap-0.5 flex-wrap px-2 py-1.5 border-b-2 border-dashed border-[#e6e6e6] sticky top-[60px] z-10 bg-white/95 backdrop-blur-sm">
        {btns.map((b) => (
          <ToolbarButton key={b.title} title={b.title} active={b.active()} onClick={b.onClick}>
            {b.render()}
          </ToolbarButton>
        ))}
      </div>

      {/* 编辑区 */}
      <div className="p-6">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
