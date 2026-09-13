"use client";

import { ARTICLE_TEMPLATES } from "@/lib/templates";

/** 新建笔记时的模板选择条：点击套用结构骨架 */
export default function TemplatePicker({
  onApply,
}: {
  onApply: (data: { title: string; content: string }) => void;
}) {
  return (
    <div className="px-6 pt-4 pb-2">
      <div className="flex items-center gap-2 mb-2">
        <span className="font-hand-display text-[15px] font-bold text-ink-muted rotate-[-0.5deg]">
          从模板开始
        </span>
        <span className="flex-1 pencil-line h-[2px]" />
      </div>
      <div className="flex flex-wrap gap-2">
        {ARTICLE_TEMPLATES.map((tpl, i) => (
          <button
            key={tpl.id}
            type="button"
            title={tpl.hint}
            onClick={() => onApply({ title: tpl.title, content: tpl.content })}
            className={`px-3 py-1.5 bg-white sketch-border font-hand-body text-[14px] text-ink-muted hover:text-primary transition-transform hover:-translate-y-0.5 ${
              i % 2 ? "rotate-[0.5deg]" : "rotate-[-0.5deg]"
            }`}
          >
            {tpl.name}
          </button>
        ))}
      </div>
    </div>
  );
}
