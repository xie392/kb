import type { ReactNode } from "react";

const previewCard = "rounded-md bg-white p-3 shadow-sm";

export function getPreview(actionId: string): { title: string; node: ReactNode } {
  switch (actionId) {
    case "heading-1":
      return {
        title: "大型章节标题",
        node: (
          <div className={previewCard}>
            <div className="text-[18px] font-bold leading-tight text-ink">大型标题</div>
            <div className="mt-1.5 space-y-1">
              <div className="h-1.5 w-full rounded bg-gray-200" />
              <div className="h-1.5 w-4/5 rounded bg-gray-200" />
            </div>
          </div>
        ),
      };
    case "heading-2":
      return {
        title: "中型版块标题",
        node: (
          <div className={previewCard}>
            <div className="text-[15px] font-bold leading-tight text-ink">Our Values</div>
            <div className="mt-1.5 space-y-1">
              <div className="flex items-center gap-1.5">
                <div className="h-1 w-1 rounded-full bg-gray-400" />
                <div className="h-1.5 w-20 rounded bg-gray-300" />
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-1 w-1 rounded-full bg-gray-400" />
                <div className="h-1.5 w-16 rounded bg-gray-300" />
              </div>
            </div>
          </div>
        ),
      };
    case "heading-3":
      return {
        title: "小节标题",
        node: (
          <div className={previewCard}>
            <div className="text-[13px] font-semibold leading-tight text-ink">小节标题</div>
            <div className="mt-1.5 space-y-1">
              <div className="h-1.5 w-full rounded bg-gray-200" />
              <div className="h-1.5 w-3/4 rounded bg-gray-200" />
            </div>
          </div>
        ),
      };
    case "heading-4":
    case "heading-5":
    case "heading-6":
      return {
        title: "次级标题",
        node: (
          <div className={previewCard}>
            <div className="text-[12px] font-semibold leading-tight text-ink">子标题</div>
            <div className="mt-1.5 h-1.5 w-full rounded bg-gray-200" />
          </div>
        ),
      };
    case "paragraph":
      return {
        title: "普通段落",
        node: (
          <div className={previewCard}>
            <div className="space-y-1.5">
              <div className="h-1.5 w-full rounded bg-gray-300" />
              <div className="h-1.5 w-full rounded bg-gray-200" />
              <div className="h-1.5 w-3/5 rounded bg-gray-200" />
            </div>
          </div>
        ),
      };
    case "bullet-list":
      return {
        title: "无序列表",
        node: (
          <div className={previewCard + " space-y-1.5"}>
            {["列表项一", "列表项二", "列表项三"].map((t) => (
              <div key={t} className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-gray-500" />
                <div className="text-[11px] text-gray-600">{t}</div>
              </div>
            ))}
          </div>
        ),
      };
    case "ordered-list":
      return {
        title: "有序列表",
        node: (
          <div className={previewCard + " space-y-1.5"}>
            {["1.", "2.", "3."].map((n, i) => (
              <div key={n} className="flex items-center gap-2">
                <span className="w-3 shrink-0 text-[11px] font-medium text-gray-500">{n}</span>
                <div className="text-[11px] text-gray-600">第 {i + 1} 项内容</div>
              </div>
            ))}
          </div>
        ),
      };
    case "task-list":
      return {
        title: "待办任务",
        node: (
          <div className={previewCard + " space-y-2"}>
            {[true, false, false].map((done, i) => (
              <div key={i} className="flex items-center gap-2">
                <div
                  className={
                    "flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-[3px] border " +
                    (done ? "border-green-500 bg-green-500 text-white" : "border-gray-300")
                  }
                >
                  {done && (
                    <svg viewBox="0 0 12 12" className="h-2.5 w-2.5" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M2 6l3 3 5-6" />
                    </svg>
                  )}
                </div>
                <span className={"text-[11px] " + (done ? "text-gray-400 line-through" : "text-gray-600")}>
                  任务 {i + 1}
                </span>
              </div>
            ))}
          </div>
        ),
      };
    case "code-block":
      return {
        title: "代码块",
        node: (
          <div className="rounded-md bg-gray-900 p-3">
            <div className="space-y-1 font-mono text-[10px]">
              <div><span className="text-purple-400">const</span> <span className="text-blue-300">greet</span> = () {"=> {"}</div>
              <div className="pl-3"><span className="text-gray-400">// Hello World</span></div>
              <div className="pl-3"><span className="text-yellow-300">return</span> <span className="text-green-300">"Hi"</span>;</div>
              <div>{"};"}</div>
            </div>
          </div>
        ),
      };
    case "blockquote":
      return {
        title: "引用块",
        node: (
          <div className={previewCard}>
            <div className="border-l-[3px] border-gray-800 pl-2.5">
              <div className="text-[11px] italic leading-relaxed text-gray-600">
                真知无形，大音希声。这是一段引用的示例文本。
              </div>
            </div>
          </div>
        ),
      };
    case "horizontal-rule":
      return {
        title: "分割线",
        node: (
          <div className={previewCard + " flex items-center justify-center py-3"}>
            <div className="h-px w-full bg-gray-300" />
          </div>
        ),
      };
    case "table":
      return {
        title: "表格",
        node: (
          <div className="overflow-hidden rounded-md border border-gray-200 bg-white">
            <table className="w-full text-[9px]">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border-b border-r border-gray-200 px-1.5 py-1 text-left font-medium text-gray-600">列 A</th>
                  <th className="border-b border-r border-gray-200 px-1.5 py-1 text-left font-medium text-gray-600">列 B</th>
                  <th className="border-b border-gray-200 px-1.5 py-1 text-left font-medium text-gray-600">列 C</th>
                </tr>
              </thead>
              <tbody>
                {[1, 2].map((r) => (
                  <tr key={r}>
                    <td className="border-b border-r border-gray-100 px-1.5 py-1 text-gray-500">数据{r}-1</td>
                    <td className="border-b border-r border-gray-100 px-1.5 py-1 text-gray-500">数据{r}-2</td>
                    <td className="border-b border-gray-100 px-1.5 py-1 text-gray-500">数据{r}-3</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ),
      };
    case "image":
      return {
        title: "图片",
        node: (
          <div className="overflow-hidden rounded-md bg-white">
            <div className="flex h-24 items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
              <svg viewBox="0 0 24 24" className="h-7 w-7 text-gray-400" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <path d="m21 15-5-5L5 21" />
              </svg>
            </div>
          </div>
        ),
      };
    case "callout":
      return {
        title: "提示框",
        node: (
          <div className="flex gap-2 rounded-md bg-amber-50 p-2.5">
            <span className="text-sm">💡</span>
            <div className="space-y-1">
              <div className="text-[11px] font-medium text-amber-900">提示</div>
              <div className="h-1.5 w-full rounded bg-amber-200/70" />
              <div className="h-1.5 w-3/4 rounded bg-amber-200/70" />
            </div>
          </div>
        ),
      };
    case "columns":
      return {
        title: "多栏布局",
        node: (
          <div className="flex gap-2 rounded-md bg-white p-2.5">
            <div className="flex-1 space-y-1">
              <div className="h-1.5 w-full rounded bg-gray-300" />
              <div className="h-1.5 w-3/4 rounded bg-gray-200" />
            </div>
            <div className="w-px bg-gray-200" />
            <div className="flex-1 space-y-1">
              <div className="h-1.5 w-full rounded bg-gray-300" />
              <div className="h-1.5 w-2/3 rounded bg-gray-200" />
            </div>
          </div>
        ),
      };
    case "details":
      return {
        title: "折叠块",
        node: (
          <div className="rounded-md bg-white p-2.5">
            <div className="flex items-center gap-1.5">
              <svg viewBox="0 0 12 12" className="h-3 w-3 text-gray-500" fill="currentColor">
                <path d="M4 2l4 4-4 4z" />
              </svg>
              <span className="text-[11px] font-medium text-gray-700">点击展开</span>
            </div>
          </div>
        ),
      };
    case "toc":
      return {
        title: "页面目录",
        node: (
          <div className={previewCard + " space-y-1.5"}>
            <div className="flex items-center gap-2">
              <div className="h-1 w-1 rounded-full bg-gray-400" />
              <div className="h-1.5 w-16 rounded bg-gray-300" />
            </div>
            <div className="flex items-center gap-2 pl-3">
              <div className="h-1 w-1 rounded-full bg-gray-300" />
              <div className="h-1.5 w-12 rounded bg-gray-200" />
            </div>
            <div className="flex items-center gap-2">
              <div className="h-1 w-1 rounded-full bg-gray-400" />
              <div className="h-1.5 w-20 rounded bg-gray-300" />
            </div>
          </div>
        ),
      };
    case "iframe":
      return {
        title: "嵌入网页",
        node: (
          <div className="overflow-hidden rounded-md bg-white">
            <div className="flex h-20 items-center justify-center bg-gray-100">
              <div className="text-center">
                <div className="text-[10px] text-gray-400">🔗 外部网页</div>
                <div className="mt-1 h-1 w-16 mx-auto rounded bg-gray-300" />
              </div>
            </div>
          </div>
        ),
      };
    case "katex":
      return {
        title: "数学公式",
        node: (
          <div className="flex items-center justify-center rounded-md bg-white py-4">
            <span className="text-[16px] italic text-gray-800" style={{ fontFamily: "serif" }}>
              E = mc²
            </span>
          </div>
        ),
      };
    case "attachment":
      return {
        title: "附件",
        node: (
          <div className={previewCard}>
            <div className="flex items-center gap-2 rounded border border-gray-200 p-2">
              <div className="flex h-7 w-7 items-center justify-center rounded bg-red-50 text-[10px] font-bold text-red-500">
                PDF
              </div>
              <div className="flex-1 space-y-1">
                <div className="h-1.5 w-20 rounded bg-gray-300" />
                <div className="h-1 w-10 rounded bg-gray-200" />
              </div>
            </div>
          </div>
        ),
      };
    case "link":
      return {
        title: "链接",
        node: (
          <div className={previewCard}>
            <div className="inline-flex items-center gap-1 rounded bg-blue-50 px-2 py-1">
              <span className="text-[11px] text-blue-600 underline">链接文字</span>
              <svg viewBox="0 0 12 12" className="h-2.5 w-2.5 text-blue-500" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M3 9l6-6M5 3h4v4" />
              </svg>
            </div>
          </div>
        ),
      };
    case "emoji":
      return {
        title: "Emoji 表情",
        node: (
          <div className={previewCard + " flex items-center justify-center gap-2 py-4"}>
            {["😀", "🎉", "❤️", "🔥", "✨"].map((e) => (
              <span key={e} className="text-lg">{e}</span>
            ))}
          </div>
        ),
      };
    default:
      return {
        title: "插入块",
        node: (
          <div className={previewCard}>
            <div className="space-y-1.5">
              <div className="h-1.5 w-full rounded bg-gray-200" />
              <div className="h-1.5 w-2/3 rounded bg-gray-200" />
            </div>
          </div>
        ),
      };
  }
}

export const PREVIEW_WIDTH = 200;
export const PREVIEW_GAP = 6;
