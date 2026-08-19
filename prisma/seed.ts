import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient({
  adapter: new PrismaBetterSqlite3({
    url: process.env.DATABASE_URL ?? "file:./dev.db",
  }),
});

async function main() {
  // 仅在 users 表为空时创建初始账号，避免后续重启/迁移时因环境变量变化创建多余账号
  const userCount = await prisma.user.count();
  if (userCount === 0) {
    const initUsername = process.env.INIT_USERNAME?.trim() || "admin";
    const initPassword = process.env.INIT_PASSWORD?.trim() || "admin123";
    const initNickname = process.env.INIT_NICKNAME?.trim() || "知识库管理员";
    const hash = await bcrypt.hash(initPassword, 10);
    await prisma.user.create({
      data: { username: initUsername, passwordHash: hash, nickname: initNickname },
    });
    console.log(`👤 初始账号已创建：${initUsername}`);
  } else {
    console.log(`👤 已存在 ${userCount} 个用户，跳过初始账号创建`);
  }

  // 示例数据（分类/标签/文章）仅在非生产环境写入，生产环境只初始化管理员
  if (process.env.NODE_ENV === "production") {
    console.log("🏭 生产环境，跳过示例数据初始化");
    return;
  }

  // 分类树
  const work = await prisma.category.upsert({
    where: { id: "c-work" },
    update: {},
    create: { id: "c-work", name: "工作", sort: 1 },
  });
  const study = await prisma.category.upsert({
    where: { id: "c-study" },
    update: {},
    create: { id: "c-study", name: "学习", sort: 2 },
  });
  const life = await prisma.category.upsert({
    where: { id: "c-life" },
    update: {},
    create: { id: "c-life", name: "生活", sort: 3 },
  });

  const children = [
    ["c-work-review", "项目复盘", work.id, 1],
    ["c-work-summary", "工作总结", work.id, 2],
    ["c-work-meeting", "会议记录", work.id, 3],
    ["c-study-code", "编程笔记", study.id, 1],
    ["c-study-book", "读书笔记", study.id, 2],
    ["c-study-english", "英语学习", study.id, 3],
    ["c-life-health", "健康", life.id, 1],
    ["c-life-travel", "旅行", life.id, 2],
  ] as const;
  for (const [id, name, parentId, sort] of children) {
    await prisma.category.upsert({
      where: { id },
      update: {},
      create: { id, name, parentId, sort },
    });
  }

  // 标签
  const tagNames = ["React", "Next.js", "TypeScript", "读书", "效率工具", "职场"];
  const tags: Record<string, string> = {};
  for (const name of tagNames) {
    const tag = await prisma.tag.upsert({
      where: { name },
      update: {},
      create: { name },
    });
    tags[name] = tag.id;
  }

  // 示例文章
  const sampleArticles = [
    {
      id: "a1",
      title: "Next.js App Router 数据获取模式总结",
      summary:
        "Server Components 与 Client Components 的边界、缓存策略、以及流式渲染在实际项目中的应用心得。",
      categoryId: "c-study-code",
      tags: ["Next.js", "React", "TypeScript"],
      visibility: "public",
      isPinned: true,
      isFavorite: true,
    },
    {
      id: "a2",
      title: "2026 年中项目复盘：一个从 0 到 1 的交付记录",
      summary:
        "复盘上半年主导的数据看板项目：从需求澄清、技术选型到上线后的数据验证，沉淀了 5 条可复用的经验。",
      categoryId: "c-work-review",
      tags: ["职场", "效率工具"],
      visibility: "private",
      isPinned: true,
      isFavorite: false,
    },
    {
      id: "a3",
      title: "《卡片笔记写作法》读书笔记",
      summary:
        "关于 Zettelkasten 方法的要点整理：原子化笔记、链接优先于分类、以及如何让想法自然生长。",
      categoryId: "c-study-book",
      tags: ["读书"],
      visibility: "private",
      isPinned: false,
      isFavorite: true,
    },
    {
      id: "a4",
      title: "TypeScript 泛型进阶：从工具类型到条件类型",
      summary:
        "用实际例子梳理泛型的核心概念：类型参数、约束、映射类型、以及 infer 的常见用法。",
      categoryId: "c-study-code",
      tags: ["TypeScript"],
      visibility: "private",
      isPinned: false,
      isFavorite: false,
    },
    {
      id: "a5",
      title: "晨间散步的三个月：身心变化记录",
      summary:
        "坚持每天早晨散步 30 分钟三个月后的观察记录，包括精力水平、注意力和情绪的变化。",
      categoryId: "c-life-health",
      tags: ["效率工具"],
      visibility: "private",
      isPinned: false,
      isFavorite: false,
    },
    {
      id: "a6",
      title: "给团队讲 tRPC：为什么端到端类型安全很重要",
      summary:
        "一次内部分享的讲稿整理：对比 REST 与 tRPC 的调用体验差异，以及接入时的注意事项。",
      categoryId: "c-work-summary",
      tags: ["TypeScript", "效率工具"],
      visibility: "public",
      isPinned: false,
      isFavorite: false,
    },
  ];

  const content = `
<p>在 Next.js 15 的 App Router 中，数据获取的核心问题只有一个：<strong>这段数据应该在服务端拿，还是在客户端拿？</strong></p>
<h2>一、Server Components 是默认选择</h2>
<p>默认情况下，页面组件是 Server Component，可以直接 <code>async</code> 获取数据，无需任何客户端状态管理。</p>
<blockquote>经验法则：把数据获取尽量放在服务端，只在交互边界引入客户端组件。</blockquote>
<h2>二、缓存与失效</h2>
<p>写操作后调用 <code>revalidatePath</code> 失效相关页面，避免过早优化。</p>
`;

  for (const a of sampleArticles) {
    await prisma.article.upsert({
      where: { id: a.id },
      update: {
        title: a.title,
        summary: a.summary,
        content,
        categoryId: a.categoryId,
        visibility: a.visibility,
        isPinned: a.isPinned,
        isFavorite: a.isFavorite,
      },
      create: {
        id: a.id,
        title: a.title,
        summary: a.summary,
        content,
        categoryId: a.categoryId,
        visibility: a.visibility,
        isPinned: a.isPinned,
        isFavorite: a.isFavorite,
        tags: {
          create: a.tags.map((t) => ({ tagId: tags[t] })),
        },
      },
    });
  }

  console.log(`✅ Seed 完成：1 用户 / 11 分类 / 6 标签 / 6 文章`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
