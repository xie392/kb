# 个人知识库系统 · 技术架构设计

> 版本：v1.0
> 关联文档：[PRD](./PRD.md)
> 技术栈：Next.js 15 (App Router) + TypeScript + Prisma + tRPC v11 + Auth.js v5 + Tailwind v4 + shadcn/ui

---

## 1. 技术选型总览

| 层次 | 选型 | 说明 |
|------|------|------|
| 框架 | Next.js 15 (App Router, TS) | 全栈单应用，Server Components + Route Handlers |
| ORM | Prisma | 类型安全，schema 即文档 |
| 数据库 | **SQLite**（默认） | 个人知识库零运维、单文件部署；可切换 PostgreSQL（见 §8） |
| 前端样式 | Tailwind CSS v4 + shadcn/ui | v4 采用 CSS-first 配置（`@theme`） |
| 数据通信 | tRPC v11 + TanStack Query | 端到端类型安全，免手写 API 层 |
| 认证 | Auth.js v5 (NextAuth) + Credentials | 单用户密码登录，JWT session |
| 校验 | zod | 输入校验 + 类型推导 |
| 富文本 | TipTap | React 原生、可扩展、输出 HTML，XSS 可配置白名单 |
| 全文检索 | SQLite FTS5（raw SQL） | Prisma 无原生全文索引，用虚拟表 + 触发器同步 |

**设计原则**：全栈单应用（不需要 monorepo）；tRPC 贯通前后端类型；单用户场景下认证与权限极简，不做多角色。

---

## 2. 整体架构图

```
┌────────────────────────────────────────────────────────────┐
│                     Next.js App (单应用)                      │
│                                                             │
│  ┌────────────┐   tRPC client   ┌──────────────────────┐   │
│  │ React 前端   │ ──────────────▶│  tRPC Server (App    │   │
│  │ (RSC+CSR)   │ ◀──────────────│  Router Handlers)     │   │
│  │ shadcn/ui   │  TanStack Query │  middleware: auth     │   │
│  │ TipTap      │                │  routers: article/    │   │
│  └────────────┘                │  category/tag/search   │   │
│       │                        └───────────┬──────────┘   │
│  Auth.js (Credentials)                     │              │
│  JWT cookie ◀──────────────┐               │ Prisma       │
│                            │               ▼              │
│                     Auth.js  │        ┌──────────┐         │
│                     server   │        │ SQLite   │         │
│                            │        │ + FTS5   │         │
│                            └────────▶│ 虚拟表     │         │
│                                     └──────────┘         │
└────────────────────────────────────────────────────────────┘
```

**数据流**：前端组件 → tRPC client → HTTP `POST /api/trpc/*` → Router Handler → middleware 鉴权 → 业务 router → Prisma → SQLite。

---

## 3. 项目目录结构

```
blog/
├── prisma/
│   ├── schema.prisma          # 数据模型
│   ├── migrations/            # 迁移文件
│   └── seed.ts                # 初始账号、示例分类
├── public/
│   └── uploads/               # 图片上传（本地存储）
├── src/
│   ├── app/
│   │   ├── (auth)/login/page.tsx         # 登录页
│   │   ├── (main)/                       # 登录后主界面
│   │   │   ├── page.tsx                  # 首页：笔记列表
│   │   │   ├── edit/[id]/page.tsx        # 笔记编辑页
│   │   │   ├── article/[id]/page.tsx     # 笔记详情页
│   │   │   ├── category/[id]/page.tsx    # 分类浏览页
│   │   │   ├── tag/[id]/page.tsx         # 标签浏览页
│   │   │   ├── favorites/page.tsx        # 收藏列表
│   │   │   └── trash/page.tsx            # 回收站
│   │   ├── internal-admin/               # 管理后台（物理路径；对外经 rewrites 映射到 ADMIN_BASE_PATH，见 §5.5）
│   │   │   ├── page.tsx                  # 数据看板
│   │   │   ├── articles/page.tsx         # 文章管理
│   │   │   ├── categories/page.tsx       # 分类管理
│   │   │   ├── tags/page.tsx             # 标签管理
│   │   │   └── settings/page.tsx         # 系统设置
│   │   ├── p/[id]/page.tsx               # 公开文章详情（访客）
│   │   ├── api/
│   │   │   ├── trpc/[trpc]/route.ts      # tRPC HTTP 入口
│   │   │   └── upload/route.ts           # 图片上传
│   │   ├── layout.tsx                    # 根布局（含 TRPCProvider/AuthProvider）
│   │   └── globals.css                   # Tailwind v4 入口
│   ├── server/
│   │   ├── db.ts                         # Prisma client 单例
│   │   ├── auth.ts                       # Auth.js 配置（Credentials）
│   │   └── api/
│   │       ├── trpc.ts                   # tRPC 上下文 + 鉴权中间件
│   │       ├── root.ts                   # 根 router
│   │       ├── auth.router.ts
│   │       ├── article.router.ts
│   │       ├── category.router.ts
│   │       ├── tag.router.ts
│   │       ├── search.router.ts
│   │       ├── stats.router.ts
│   │       └── settings.router.ts
│   ├── trpc/
│   │   ├── client.ts                     # 客户端 tRPC 封装
│   │   ├── server.ts                     # 服务端 caller（RSC 用）
│   │   └── react.tsx                     # TRPCProvider
│   ├── components/
│   │   ├── ui/                           # shadcn/ui 组件
│   │   ├── editor/                       # TipTap 编辑器封装
│   │   └── article/                      # 文章卡片、筛选栏等
│   ├── lib/
│   │   ├── sanitize.ts                   # 富文本 XSS 消毒
│   │   ├── utils.ts                      # cn() 等工具
│   │   └── search.ts                     # FTS5 raw SQL 封装
│   └── middleware.ts                     # 路由保护（Auth.js）
├── next.config.ts
├── components.json                        # shadcn/ui 配置
├── package.json
└── tsconfig.json
```

---

## 4. 数据模型（Prisma Schema）

与 PRD §6 保持一致：

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

model User {
  id           String   @id @default(cuid())
  username     String   @unique
  passwordHash String
  nickname     String?
  createdAt    DateTime @default(now())
}

model Category {
  id        String     @id @default(cuid())
  name      String
  parentId  String?
  parent    Category?  @relation("CategoryTree", fields: [parentId], references: [id])
  children  Category[] @relation("CategoryTree")
  sort      Int        @default(0)
  createdAt DateTime   @default(now())
  articles  Article[]
}

model Tag {
  id        String       @id @default(cuid())
  name      String       @unique
  createdAt DateTime     @default(now())
  articles  ArticleTag[]
}

model Article {
  id         String       @id @default(cuid())
  title      String
  content    String       // 富文本 HTML
  summary    String?
  categoryId String?
  category   Category?    @relation(fields: [categoryId], references: [id])
  status     String       @default("normal") // normal | trash
  visibility String       @default("private") // private | public
  isPinned   Boolean      @default(false)
  isFavorite Boolean      @default(false)
  tags       ArticleTag[]
  createdAt  DateTime     @default(now())
  updatedAt  DateTime     @updatedAt
  deletedAt  DateTime?
}

model ArticleTag {
  articleId String
  tagId     String
  article   Article @relation(fields: [articleId], references: [id], onDelete: Cascade)
  tag       Tag     @relation(fields: [tagId], references: [id], onDelete: Cascade)

  @@id([articleId, tagId])
}
```

**说明**：
- `status` / `visibility` 用字符串枚举，避免 Prisma enum 迁移时的类型摩擦；业务层用 TS 联合类型约束；
- 删除分类不删笔记：删除时前端先强制迁移或提示，后端 `categoryId` 置空；
- 软删除（status=trash + deletedAt），永久删除为硬删除并级联清 `ArticleTag`。

---

## 5. 认证设计（Auth.js v5）

### 5.1 选型
- `next-auth@beta`（Auth.js v5，App Router 原生）；
- **Credentials Provider**：单用户密码登录；
- **JWT session**（无数据库 session，避免额外表）。

### 5.2 流程

```
POST /api/auth/callback/credentials
  → 校验 username + bcrypt(password)
  → 签发 JWT（含 userId）
  → 写入 HttpOnly cookie
中间件 auth() → 保护 /admin 与私有页面，未登录重定向 /login
tRPC 鉴权中间件 → 校验 session.user，写操作强制登录
```

### 5.3 关键点
- 密码用 `bcrypt` 哈希，**不存明文**；
- JWT 策略 `session: { strategy: "jwt" }`；
- 首次启动：`prisma seed` 创建初始账号，或首次访问 `/login` 引导初始化；
- 单用户：全站仅一个 User 记录，tRPC 内直接 `ctx.user` 即为本人，无需查询。

### 5.4 路由保护

```ts
// src/middleware.ts —— 动态读取后台路径
import { auth } from "@/server/auth"
import { ADMIN_BASE_PATH } from "@/lib/config"

export default auth((req) => {
  const { pathname } = req.nextUrl
  const isAdmin = pathname.startsWith(`/${ADMIN_BASE_PATH}`)
  if (isAdmin && !req.auth) {
    return Response.redirect(new URL("/login", req.url))
  }
})

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|p/|favicon.ico|login).*)"],
}
```

访客可访问：`/p/*`（公开文章）、`/login`；其余需登录。

### 5.5 后台路径隐藏（防路径扫描）

不直接使用 `/admin` 这种可被扫描的路径，采用**环境变量 + rewrites 双重方案**：

1. **物理目录名**：代码内为 `src/app/internal-admin/`（不含敏感词，不易被猜到）；
2. **对外 URL**：由环境变量 `ADMIN_BASE_PATH` 决定，默认随机生成（如 `kb-9f3x`），可自定义；
3. **rewrites 映射**：外部访问 `/{ADMIN_BASE_PATH}/*` 时映射到内部 `internal-admin/*`，外部完全看不到 `admin` 字样。

```ts
// next.config.ts
const adminPath = process.env.ADMIN_BASE_PATH ?? "kb-9f3x"

const nextConfig = {
  async rewrites() {
    return [
      { source: `/${adminPath}/:path*`, destination: "/internal-admin/:path*" },
      { source: `/${adminPath}`, destination: "/internal-admin" },
    ]
  },
}
```

```ts
// src/lib/config.ts —— 前后端共享后台路径
export const ADMIN_BASE_PATH =
  process.env.ADMIN_BASE_PATH ?? "kb-9f3x"
export const adminHref = `/${ADMIN_BASE_PATH}`
```

**配套规则**：
- 前端导航、首页**不渲染**后台入口链接，避免在 HTML/JS 中暴露路径；入口仅通过登录后手动输入 URL 或书签访问；
- 后台路径仍受 §5.4 中间件保护，**路径隐蔽是纵深防御的一层，不替代鉴权**（tRPC `protectedProcedure` 依然强制校验登录态）。

---

## 6. tRPC 路由设计

### 6.1 上下文与鉴权中间件

```ts
// src/server/api/trpc.ts
import { initTRPC, TRPCError } from "@trpc/server"
import { auth } from "@/server/auth"

const t = initTRPC.context<{ user: User | null }>().create()

export const publicProcedure = t.procedure
export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" })
  return next({ ctx: { ...ctx, user: ctx.user } })
})
```

### 6.2 Router 清单

```
rootRouter
├── auth
│   ├── login        (public)  username+password → session
│   ├── logout       (protected)
│   └── getSession   (public)  返回当前登录态
├── article
│   ├── list         (protected) 分页/筛选/排序（含置顶）
│   ├── get          (protected)
│   ├── getPublic    (public)   仅 visibility=public
│   ├── create       (protected)
│   ├── update       (protected)
│   ├── softDelete   (protected) → trash
│   ├── restore      (protected) ← trash
│   ├── hardDelete   (protected) 永久删除
│   ├── togglePin    (protected)
│   ├── toggleFavorite (protected)
│   └── batch        (protected) 批量迁移/删改/权限
├── category
│   ├── tree         (protected) 一级+二级
│   ├── create/update/delete/reorder
├── tag
│   ├── list         (protected) 含笔记数
│   ├── create/update/delete
│   └── cleanEmpty   (protected) 批量清空标签
├── search
│   └── fulltext     (protected) FTS5 检索 + 高亮片段
├── stats
│   └── overview     (protected) 看板数据
└── settings
    ├── updateProfile  (protected)
    ├── changePassword (protected)
    ├── backup         (protected) 导出 JSON+MD
    └── restore        (protected) 导入恢复
```

### 6.3 输入校验
所有 mutation 用 zod 定义输入 schema，复用为前端类型：

```ts
const createArticleInput = z.object({
  title: z.string().min(1).max(200),
  content: z.string(),
  categoryId: z.string().cuid().nullish(),
  tagIds: z.array(z.string()).max(10).default([]),
  visibility: z.enum(["private", "public"]).default("private"),
})
```

---

## 7. 全文检索（SQLite FTS5）

Prisma 不原生支持全文索引，采用 **FTS5 虚拟表 + 触发器** 方案：

### 7.1 建表（迁移时执行 raw SQL）

```sql
-- 虚拟表：索引标题 + 正文 + 摘要
CREATE VIRTUAL TABLE articles_fts USING fts5(
  articleId UNINDEXED,
  title,
  content,
  summary,
  tokenize = 'unicode61'
);

-- 触发器：新增/更新/删除同步
CREATE TRIGGER articles_ai AFTER INSERT ON Article BEGIN
  INSERT INTO articles_fts(articleId, title, content, summary)
  VALUES (new.id, new.title, new.content, new.summary);
END;

CREATE TRIGGER articles_ad AFTER DELETE ON Article BEGIN
  DELETE FROM articles_fts WHERE articleId = old.id;
END;

CREATE TRIGGER articles_au AFTER UPDATE ON Article BEGIN
  DELETE FROM articles_fts WHERE articleId = old.id;
  INSERT INTO articles_fts(articleId, title, content, summary)
  VALUES (new.id, new.title, new.content, new.summary);
END;
```

### 7.2 检索查询（lib/search.ts）

```ts
// 用 prisma.$queryRaw 执行，返回命中片段用于高亮
SELECT articleId,
       snippet(articles_fts, 1, '<mark>', '</mark>', '…', 16) AS titleSnippet,
       snippet(articles_fts, 2, '<mark>', '</mark>', '…', 32) AS contentSnippet
FROM articles_fts
WHERE articles_fts MATCH ${query}
ORDER BY bm25(articles_fts)
LIMIT 50;
```

### 7.3 说明
- FTS5 的 `MATCH` 语法有保留字，需对用户输入做转义处理（`lib/search.ts` 封装）；
- 检索结果关联 `Article` 表取分类、标签、时间等展示字段；
- 千篇量级性能远优于 `LIKE`，满足 PRD 检索 ≤ 1s；
- **若切换 PostgreSQL**：改用 `tsvector` + `to_tsquery('simple', ...)` + GIN 索引，`search.router` 的 SQL 替换即可，router 签名不变（见 §8）。

---

## 8. 数据库可切换性

| 项 | SQLite（默认） | PostgreSQL（可选） |
|----|---------------|-------------------|
| datasource | `provider = "sqlite"` | `provider = "postgresql"` |
| 全文检索 | FTS5 虚拟表 + trigger | `tsvector` + GIN |
| 部署 | 单文件 + 挂载卷 | 云托管（Neon/Supabase） |
| 适用 | 本地 NAS / 自托管 / 低流量 | Vercel 部署 / 多端同步 |

切换时仅需改：`schema.prisma` 的 provider、`lib/search.ts` 的 SQL、`DATABASE_URL`。业务 router 与前端**零改动**。

---

## 9. 富文本编辑器（TipTap）

- 基于 `@tiptap/react` + `StarterKit`（标题/列表/引用/代码块/加粗等）+ `@tiptap/extension-image` + `@tiptap/extension-link`；
- 输出 **HTML 字符串**存入 `Article.content`；
- **XSS 防护**：编辑器只保留白名单节点；服务端 `lib/sanitize.ts` 用 `isomorphic-dompurify` 再消毒一次（配置白名单标签与属性），双保险；
- 图片上传：`POST /api/upload` → 校验类型/大小（≤5MB）→ 存 `public/uploads/` → 返回 URL；生产建议对象存储（可选）。
- **自动保存**：编辑器 `onUpdate` 防抖 2s 调用 `article.update` mutation；`Ctrl/Cmd+S` 手动保存；离开页面前 `beforeunload` 检测未保存。

---

## 10. 关键工程配置

### 10.1 Tailwind v4 + shadcn/ui

```css
/* src/app/globals.css —— Tailwind v4 CSS-first 配置 */
@import "tailwindcss";

@theme {
  --color-background: hsl(0 0% 100%);
  /* 其余主题变量随 shadcn/ui init 生成 */
}
```

```bash
# 初始化 shadcn/ui（自动识别 Tailwind v4）
npx shadcn@latest init
```

- Tailwind v4 不再用 `tailwind.config.js`，主题在 CSS 的 `@theme` 中定义；
- shadcn 组件按需 `npx shadcn@latest add button card dialog ...`。

### 10.2 环境变量

```
DATABASE_URL="file:./dev.db"
AUTH_SECRET="<openssl rand -base64 32>"
ADMIN_BASE_PATH="kb-9f3x"        # 后台路径，部署时自定义为不易猜的值（可留空用默认）
UPLOAD_DIR="./public/uploads"
```

### 10.3 依赖清单（核心）

```
next react react-dom
typescript @types/node
@prisma/client prisma
@trpc/server @trpc/client @trpc/react-query @trpc/next
@tanstack/react-query
next-auth@beta zod
@hookform/resolvers react-hook-form  # 表单（可选）
bcryptjs @types/bcryptjs
tailwindcss@^4 @tailwindcss/postcss
@tiptap/react @tiptap/starter-kit @tiptap/extension-image @tiptap/extension-link
isomorphic-dompurify
```

---

## 11. 部署方案

### 11.1 自托管（Docker，推荐）

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY . .
RUN npm ci && npx prisma migrate deploy && npm run build
CMD ["npm", "start"]
```

```yaml
# docker-compose.yml
services:
  blog:
    build: .
    ports: ["3000:3000"]
    volumes:
      - ./data:/app/prisma/dev.db      # SQLite 持久化
      - ./uploads:/app/public/uploads  # 图片持久化
    environment:
      - DATABASE_URL=file:/app/prisma/dev.db
      - AUTH_SECRET=${AUTH_SECRET}
      - ADMIN_BASE_PATH=${ADMIN_BASE_PATH}
```

### 11.2 云部署（可选）
- Vercel + PostgreSQL（Neon）：数据库切 PG，`search.ts` 换 tsvector；
- 图片改用对象存储（如 S3/R2）。

### 11.3 备份
- 后台「一键备份」：导出 JSON + Markdown 双格式，Prisma 全量读取序列化；
- 可叠加 `cron` 定期将 `dev.db` 复制到备份目录（可选）。

---

## 12. 与 PRD 的对应关系

| PRD 章节 | 架构落地 |
|----------|----------|
| §3.2 笔记编辑 | TipTap + 防抖自动保存（§9） |
| §3.3 分类 | `Category` 自关联树 + `tree` router |
| §3.5.2 全文检索 | SQLite FTS5（§7） |
| §3.6 权限 | `visibility` 字段 + `getPublic` procedure |
| §5 权限需求 | Auth.js middleware + tRPC 鉴权（§5） |
| §6 数据模型 | Prisma schema（§4） |
| §4.4 数据看板 | `stats.overview` router |

---

## 13. 开发里程碑（与 PRD §11 对齐）

| 阶段 | 内容 | 验证 |
|------|------|------|
| 脚手架 | Next.js + Tailwind v4 + shadcn + tRPC + Prisma + Auth.js 跑通 | 登录页可用，能调通一个 tRPC 查询 |
| M1 | 文章 CRUD + 富文本 + 自动保存 + 一级分类 + 标签 | PRD §12.1 功能验收 1~3 |
| M2 | FTS5 检索 + 收藏/置顶/回收站 + 二级分类 + 批量操作 + 看板 | PRD §12.1 验收 4~8 |
| M3 | 导出/备份恢复 + 系统设置 + 移动端适配 + 公开页 | PRD §12.2/12.3 验收 |
