"use client";

import { useEffect, useRef, useState } from "react";
import {
  NodeViewContent,
  NodeViewWrapper,
  ReactNodeViewRenderer,
} from "@tiptap/react";
import { CodeBlockLowlight } from "@tiptap/extension-code-block-lowlight";
import { createLowlight, common } from "lowlight";

/** 编辑器内低亮实例：注册 highlight.js 常用语言（与阅读页共用同一套语法） */
const lowlight = createLowlight(common);

export type CodeBlockTheme = "light" | "dark";

export interface CodeLanguage {
  /** null 表示纯文本（无语言） */
  value: string | null;
  label: string;
}

/** 可选编程语言（均来自 highlight.js 常用语言集合） */
export const CODE_LANGUAGES: CodeLanguage[] = [
  { value: null, label: "纯文本" },
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "python", label: "Python" },
  { value: "java", label: "Java" },
  { value: "c", label: "C" },
  { value: "cpp", label: "C++" },
  { value: "csharp", label: "C#" },
  { value: "go", label: "Go" },
  { value: "rust", label: "Rust" },
  { value: "swift", label: "Swift" },
  { value: "kotlin", label: "Kotlin" },
  { value: "php", label: "PHP" },
  { value: "ruby", label: "Ruby" },
  { value: "sql", label: "SQL" },
  { value: "html", label: "HTML" },
  { value: "xml", label: "XML" },
  { value: "css", label: "CSS" },
  { value: "scss", label: "SCSS" },
  { value: "json", label: "JSON" },
  { value: "yaml", label: "YAML" },
  { value: "markdown", label: "Markdown" },
  { value: "bash", label: "Bash / Shell" },
  { value: "shell", label: "Shell 会话" },
  { value: "graphql", label: "GraphQL" },
  { value: "ini", label: "INI / TOML" },
  { value: "makefile", label: "Makefile" },
  { value: "lua", label: "Lua" },
  { value: "perl", label: "Perl" },
  { value: "objectivec", label: "Objective-C" },
  { value: "r", label: "R" },
  { value: "diff", label: "Diff" },
];

/** markdown 输入 / 历史数据中常见的语言别名 → 规范名 */
const LANGUAGE_ALIASES: Record<string, string> = {
  js: "javascript",
  jsx: "javascript",
  mjs: "javascript",
  cjs: "javascript",
  ts: "typescript",
  tsx: "typescript",
  py: "python",
  rb: "ruby",
  sh: "bash",
  zsh: "bash",
  md: "markdown",
  h: "c",
  cc: "cpp",
  hpp: "cpp",
  cs: "csharp",
  yml: "yaml",
  toml: "ini",
};

function canonicalLang(value: string | null): string | null {
  return value ? LANGUAGE_ALIASES[value] ?? value : null;
}

function langLabel(value: string | null): string {
  const canonical = canonicalLang(value);
  return CODE_LANGUAGES.find((l) => l.value === canonical)?.label ?? value ?? "纯文本";
}

/** 工具栏图标（均为内联 SVG，避免额外依赖） */
function IconChevron() {
  return (
    <svg viewBox="0 0 16 16" className="h-3 w-3" fill="currentColor">
      <path d="M4.5 6l3.5 3.5L11.5 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

function IconSun() {
  return (
    <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
      <circle cx="8" cy="8" r="3" />
      <path d="M8 1.5v1.5M8 13v1.5M1.5 8H3M13 8h1.5M3.4 3.4l1 1M11.6 11.6l1 1M12.6 3.4l-1 1M4.4 11.6l-1 1" />
    </svg>
  );
}

function IconMoon() {
  return (
    <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 9.5A5.5 5.5 0 0 1 6.5 3a5.5 5.5 0 1 0 6.5 6.5Z" />
    </svg>
  );
}

function IconCopy() {
  return (
    <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5.5" y="5.5" width="8" height="8" rx="1.5" />
      <path d="M10.5 5.5v-1a1.5 1.5 0 0 0-1.5-1.5H4a1.5 1.5 0 0 0-1.5 1.5v5A1.5 1.5 0 0 0 4 11h1.5" />
    </svg>
  );
}

function IconCheck() {
  return (
    <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 8.5l3.5 3.5L13 5" />
    </svg>
  );
}

function IconTrash() {
  return (
    <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2.5 4h11M6.5 4V2.5h3V4M4 4l.6 9h6.8l.6-9M6.5 7v3.5M9.5 7v3.5" />
    </svg>
  );
}

interface CodeBlockViewProps {
  node: {
    attrs: Record<string, unknown>;
    textContent: string;
  };
  updateAttributes: (patch: Record<string, unknown>) => void;
  deleteNode: () => void;
  selected?: boolean;
}

/** 代码块 NodeView：顶部悬浮工具条（语言选择 / 明暗主题 / 复制 / 删除） */
function CodeBlockView({ node, updateAttributes, deleteNode, selected }: CodeBlockViewProps) {
  const attrs = node.attrs as { language?: string | null; theme?: CodeBlockTheme };
  const language = attrs.language ?? null;
  const theme: CodeBlockTheme = attrs.theme === "light" ? "light" : "dark";
  const dark = theme === "dark";

  const [langOpen, setLangOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);

  // 点击面板外部 / Esc 关闭语言下拉
  useEffect(() => {
    if (!langOpen) return;
    const onDown = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setLangOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLangOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [langOpen]);

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(node.textContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* 剪贴板不可用时静默忽略 */
    }
  };

  const btnBase = dark
    ? "text-[#9d9d9d] hover:text-white hover:bg-white/10"
    : "text-[#8a8580] hover:text-ink-secondary hover:bg-black/5";

  return (
    <NodeViewWrapper
      as="div"
      className="kb-code-block group relative my-4"
      data-theme={theme}
      data-language={language ?? undefined}
      data-selected={selected ? "true" : undefined}
    >
      {/* 悬浮工具条 */}
      <div
        className={`absolute right-2 top-2 z-10 flex items-center gap-0.5 rounded-lg border px-1 py-0.5 opacity-0 shadow-xs transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100 ${
          dark
            ? "border-white/10 bg-[#0d1117]/90 backdrop-blur"
            : "border-[#e0ddd8] bg-white/90 backdrop-blur"
        }`}
        onMouseDown={(e) => e.preventDefault()}
      >
        {/* 语言选择 */}
        <div ref={langRef} className="relative">
          <button
            type="button"
            className={`flex h-6 items-center gap-1 rounded-md px-1.5 text-xs font-medium ${btnBase}`}
            onClick={() => setLangOpen((v) => !v)}
            title="设置编程语言"
          >
            {langLabel(language)}
            <IconChevron />
          </button>
          {langOpen && (
            <div
              className={`absolute right-0 top-full z-20 mt-1 max-h-64 w-44 overflow-y-auto rounded-lg border py-1 shadow-md ${
                dark ? "border-white/10 bg-[#161b22]" : "border-[#e0ddd8] bg-white"
              }`}
            >
              {CODE_LANGUAGES.map((l) => {
                const active = canonicalLang(l.value) === canonicalLang(language);
                return (
                  <button
                    key={l.value ?? "__plain__"}
                    type="button"
                    className={`flex w-full items-center justify-between px-3 py-1.5 text-left text-xs ${
                      dark
                        ? "text-[#e6edf3] hover:bg-white/10"
                        : "text-ink-secondary hover:bg-[#f4f2ef]"
                    } ${active ? "font-semibold" : ""}`}
                    onClick={() => {
                      updateAttributes({ language: l.value });
                      setLangOpen(false);
                    }}
                  >
                    <span>{l.label}</span>
                    {active && <span className="text-[#e6a700]">✓</span>}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <span className={`mx-0.5 h-4 w-px ${dark ? "bg-white/10" : "bg-[#e0ddd8]"}`} />

        {/* 明暗主题切换 */}
        <button
          type="button"
          className={`flex h-6 w-6 items-center justify-center rounded-md ${btnBase}`}
          onClick={() => updateAttributes({ theme: dark ? "light" : "dark" })}
          title={dark ? "切换到亮色主题" : "切换到暗色主题"}
        >
          {dark ? <IconSun /> : <IconMoon />}
        </button>

        {/* 复制 */}
        <button
          type="button"
          className={`flex h-6 w-6 items-center justify-center rounded-md ${btnBase}`}
          onClick={copyCode}
          title="复制代码"
        >
          {copied ? <IconCheck /> : <IconCopy />}
        </button>

        {/* 删除 */}
        <button
          type="button"
          className={`flex h-6 w-6 items-center justify-center rounded-md ${btnBase}`}
          onClick={() => deleteNode()}
          title="删除代码块"
        >
          <IconTrash />
        </button>
      </div>

      {/* 代码内容（低亮插件通过 decoration 给文本加 hljs-* class） */}
      <pre>
        <NodeViewContent
          as={"code" as never}
          style={{ whiteSpace: "pre" }}
          className={language ? `language-${language}` : undefined}
        />
      </pre>
    </NodeViewWrapper>
  );
}

/**
 * 代码块扩展：在 CodeBlockLowlight（实时语法高亮）基础上增加
 * - theme 属性（light/dark），默认 dark，序列化为 `<pre data-theme="...">`
 * - 自定义 NodeView，提供语言选择 / 主题切换 / 复制 / 删除工具条
 */
export const CustomCodeBlock = CodeBlockLowlight.configure({
  lowlight,
  defaultLanguage: null,
}).extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      theme: {
        default: "dark",
        parseHTML: (element: HTMLElement) =>
          element.getAttribute("data-theme") === "light" ? "light" : "dark",
        renderHTML: (attributes: Record<string, unknown>) =>
          attributes.theme === "light" ? { "data-theme": "light" } : {},
      },
    };
  },
  addNodeView() {
    return ReactNodeViewRenderer(CodeBlockView);
  },
});
