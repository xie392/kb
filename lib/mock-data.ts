// Mock 数据 —— 用于 UI 设计阶段，后续接入 tRPC 后替换

export type Visibility = "private" | "public";

export interface Article {
  id: string;
  title: string;
  summary: string;
  category: string;
  categoryColor: string; // sticker 色
  tags: string[];
  visibility: Visibility;
  isPinned: boolean;
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryNode {
  id: string;
  name: string;
  color: string; // sticker 色
  count: number;
  children?: { id: string; name: string; count: number }[];
}

export const categories: CategoryNode[] = [
  {
    id: "work",
    name: "工作",
    color: "#0075de",
    count: 12,
    children: [
      { id: "work-review", name: "项目复盘", count: 5 },
      { id: "work-summary", name: "工作总结", count: 4 },
      { id: "work-meeting", name: "会议记录", count: 3 },
    ],
  },
  {
    id: "study",
    name: "学习",
    color: "#ff64c8",
    count: 18,
    children: [
      { id: "study-code", name: "编程笔记", count: 9 },
      { id: "study-book", name: "读书笔记", count: 6 },
      { id: "study-english", name: "英语学习", count: 3 },
    ],
  },
  {
    id: "life",
    name: "生活",
    color: "#2a9d99",
    count: 7,
    children: [
      { id: "life-health", name: "健康", count: 3 },
      { id: "life-travel", name: "旅行", count: 4 },
    ],
  },
];

export const tags = ["React", "Next.js", "TypeScript", "读书", "效率工具", "职场"];

export const articles: Article[] = [
  {
    id: "a1",
    title: "Next.js App Router 数据获取模式总结",
    summary:
      "Server Components 与 Client Components 的边界、缓存策略、以及流式渲染在实际项目中的应用心得。",
    category: "编程笔记",
    categoryColor: "#ff64c8",
    tags: ["Next.js", "React", "TypeScript"],
    visibility: "public",
    isPinned: true,
    isFavorite: true,
    createdAt: "2026-07-28",
    updatedAt: "2026-08-14",
  },
  {
    id: "a2",
    title: "2026 年中项目复盘：一个从 0 到 1 的交付记录",
    summary:
      "复盘上半年主导的数据看板项目：从需求澄清、技术选型到上线后的数据验证，沉淀了 5 条可复用的经验。",
    category: "项目复盘",
    categoryColor: "#0075de",
    tags: ["职场", "效率工具"],
    visibility: "private",
    isPinned: true,
    isFavorite: false,
    createdAt: "2026-07-30",
    updatedAt: "2026-08-12",
  },
  {
    id: "a3",
    title: "《卡片笔记写作法》读书笔记",
    summary:
      "关于 Zettelkasten 方法的要点整理：原子化笔记、链接优先于分类、以及如何让想法自然生长。",
    category: "读书笔记",
    categoryColor: "#ff64c8",
    tags: ["读书"],
    visibility: "private",
    isPinned: false,
    isFavorite: true,
    createdAt: "2026-08-01",
    updatedAt: "2026-08-10",
  },
  {
    id: "a4",
    title: "TypeScript 泛型进阶：从工具类型到条件类型",
    summary:
      "用实际例子梳理泛型的核心概念：类型参数、约束、映射类型、以及 infer 的常见用法。",
    category: "编程笔记",
    categoryColor: "#ff64c8",
    tags: ["TypeScript"],
    visibility: "private",
    isPinned: false,
    isFavorite: false,
    createdAt: "2026-07-25",
    updatedAt: "2026-08-08",
  },
  {
    id: "a5",
    title: "晨间散步的三个月：身心变化记录",
    summary:
      "坚持每天早晨散步 30 分钟三个月后的观察记录，包括精力水平、注意力和情绪的变化。",
    category: "健康",
    categoryColor: "#2a9d99",
    tags: ["效率工具"],
    visibility: "private",
    isPinned: false,
    isFavorite: false,
    createdAt: "2026-08-03",
    updatedAt: "2026-08-06",
  },
  {
    id: "a6",
    title: "给团队讲 tRPC：为什么端到端类型安全很重要",
    summary:
      "一次内部分享的讲稿整理：对比 REST 与 tRPC 的调用体验差异，以及接入时的注意事项。",
    category: "工作总结",
    categoryColor: "#0075de",
    tags: ["TypeScript", "效率工具"],
    visibility: "public",
    isPinned: false,
    isFavorite: false,
    createdAt: "2026-07-20",
    updatedAt: "2026-08-02",
  },
];

export const articleContent = {
  html: `
<p>在 Next.js 15 的 App Router 中，数据获取的核心问题只有一个：<strong>这段数据应该在服务端拿，还是在客户端拿？</strong></p>
<h2>一、Server Components 是默认选择</h2>
<p>默认情况下，页面组件是 Server Component，可以直接 <code>async</code> 获取数据，无需任何客户端状态管理。好处是显著减少客户端 JavaScript 体积，首屏更快。</p>
<pre><code>export default async function Page() {
  const articles = await getArticles();
  return &lt;ArticleList articles={articles} /&gt;;
}</code></pre>
<h2>二、什么时候必须用 Client Components</h2>
<ul>
  <li>需要交互的组件（表单、编辑器、弹窗）</li>
  <li>需要浏览器 API 的逻辑</li>
  <li>需要实时更新 / 轮询的数据</li>
</ul>
<blockquote>经验法则：把数据获取尽量放在服务端，只在交互边界引入客户端组件，并用 <code>children</code> 传服务端渲染结果。</blockquote>
<h2>三、缓存与失效</h2>
<p>App Router 的缓存层级比 Pages Router 复杂得多。个人知识库这种「写后即读」的场景，<strong>最简单的策略</strong>：写操作后调用 <code>revalidatePath</code> 失效相关页面。</p>
<p>避免过早优化。默认缓存 + 按需失效，比一开始就设计复杂的缓存标签体系要省心得多。</p>
<hr>
<p>最后留一个问题给自己：如果数据获取失败，Server Component 的错误边界应该怎么设计？</p>
`,
};
