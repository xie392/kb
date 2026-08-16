# 个人知识库系统（Personal Knowledge Base）

一款**轻量化、私有化**的个人知识管理工具，聚焦笔记记录、知识分类归档、内容检索与后台管理四大核心能力，帮助沉淀碎片化知识、系统化管理学习/工作笔记。

- 单人使用、数据自持：所有数据存储在本地 SQLite 数据库，不依赖任何第三方服务
- 手绘线框图风格界面：方格纸背景、手写字体、马克笔与便签元素
- 前端展示 + 管理后台双端，后台入口路径可配置，防止被扫描

## 功能特性

- **富文本编辑**：基于 TipTap，支持标题、列表、引用、代码块、表格、任务列表、图片上传、Markdown 粘贴等
- **笔记管理**：增删改查、软删除（回收站可恢复/永久删除）、收藏、置顶、自动保存与草稿恢复
- **分类与标签**：两级树形分类、扁平标签，支持多维筛选与搜索联想
- **全文检索**：SQLite FTS5 全文索引，匹配标题/正文/分类/标签
- **权限控制**：笔记分「公开 / 私有」，公开文章可匿名浏览（仅查看）
- **管理后台**：文章批量运维、分类/标签统一管理、数据统计看板、Markdown/TXT 导出

## 技术栈

| 层次 | 选型 |
|------|------|
| 框架 | Next.js 16（App Router）+ TypeScript |
| 数据库 | SQLite + Prisma 7（可切换 PostgreSQL） |
| 数据通信 | tRPC v11 + TanStack Query（端到端类型安全） |
| 认证 | Auth.js v5（Credentials + JWT） |
| 样式 | Tailwind CSS v4 + shadcn/ui + GSAP |
| 编辑器 | TipTap |
| 校验 | zod |

## 快速开始

### 环境要求

- Node.js ≥ 20.9.0（建议使用 Node 22+）
- npm（或 pnpm / yarn）

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

复制示例文件并填写密钥：

```bash
cp .env.example .env
```

各变量说明：

| 变量 | 说明 |
|------|------|
| `DATABASE_URL` | SQLite 数据库文件路径（默认 `file:./dev.db`） |
| `AUTH_SECRET` | Auth.js 会话密钥，生成方式：`openssl rand -base64 32` |
| `AUTH_TRUST_HOST` | 生产环境设为 `true`，允许信任反向代理转发 |
| `ADMIN_BASE_PATH` | 后台入口路径，建议改成不易猜测的值（默认 `kb-9f3x`） |

> 注意：`.env` 已被 gitignore 忽略，不会提交到仓库。

### 3. 初始化数据库

应用已有迁移文件，执行迁移创建数据库表结构，并生成 Prisma Client：

```bash
npx prisma migrate deploy
```

### 4. 初始化种子数据（可选）

创建初始账号、示例分类/标签/文章：

```bash
npm run db:seed
```

> 跳过此步则数据库为空，需先在登录页注册初始账号。

### 5. 启动开发服务器

```bash
npm run dev
```

访问 <http://localhost:3000>。

### 默认账号

| 项 | 值 |
|----|----|
| 用户名 | `admin` |
| 密码 | `admin123` |

> 安全提醒：首次登录后请立即在后台「系统设置」中修改密码。

### 后台入口

后台路径由 `ADMIN_BASE_PATH` 环境变量控制（默认 `kb-9f3x`），并通过 Next.js rewrites 映射到物理路径 `internal-admin`（物理路径直接访问会 404）。

- 登录后默认跳转到后台：`http://localhost:3000/kb-9f3x`
- 若修改了 `ADMIN_BASE_PATH`，请同步修改登录页 `app/login/page.tsx` 中的跳转地址

## 常用脚本

| 命令 | 说明 |
|------|------|
| `npm run dev` | 启动开发服务器 |
| `npm run build` | 生产构建 |
| `npm start` | 启动生产服务器（需先 build） |
| `npm run lint` | 代码检查 |
| `npm run db:migrate` | 创建/应用数据库迁移（开发用） |
| `npm run db:seed` | 写入种子数据 |
| `npm run db:studio` | 打开 Prisma Studio 可视化数据库 |

## 目录结构

```
blog/
├── app/
│   ├── (home)/            # 首页（公开文章列表）
│   ├── (main)/            # 登录后主界面（列表/详情/分类/标签/收藏/回收站）
│   ├── internal-admin/    # 管理后台（经 rewrites 映射到 ADMIN_BASE_PATH）
│   ├── login/             # 登录页
│   ├── api/               # tRPC / Auth.js / 上传路由
│   └── layout.tsx         # 根布局
├── components/            # UI 组件（shadcn/ui、TipTap 编辑器封装等）
├── lib/                   # 工具函数（XSS 消毒、FTS 封装等）
├── server/                # Prisma client、Auth.js 配置、tRPC routers
├── trpc/                  # tRPC 客户端/服务端封装
├── prisma/
│   ├── schema.prisma      # 数据模型
│   ├── migrations/        # 迁移文件
│   └── seed.ts            # 种子数据
└── docs/                  # PRD / 架构 / 设计文档
```

## 部署与备份

- **数据文件**：SQLite 数据库为 `dev.db`（默认位于项目根目录），备份时连同 `public/uploads/`（上传图片）一起拷贝即可
- **生产构建**：`npm run build && npm start`，建议配合 PM2 / Docker / Nginx 反向代理使用
- **环境变量**：生产环境务必设置 `AUTH_SECRET` 与自定义 `ADMIN_BASE_PATH`

更多细节见 [docs/PRD.md](docs/PRD.md)、[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)、[docs/DESIGN.md](docs/DESIGN.md)。
