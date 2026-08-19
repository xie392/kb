<div align="center">

# 📒 XIE392 的个人知识库

**一款轻量化、私有化的个人知识管理工具**

记录碎片化的想法，沉淀系统化的知识

<p>
  <img alt="Next.js" src="https://img.shields.io/badge/Next.js-16-000000?style=flat-square&logo=next.js&logoColor=white" />
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat-square&logo=typescript&logoColor=white" />
  <img alt="Tailwind CSS" src="https://img.shields.io/badge/Tailwind_CSS-v4-38BDF8?style=flat-square&logo=tailwindcss&logoColor=white" />
  <img alt="Prisma" src="https://img.shields.io/badge/Prisma-7-2D3748?style=flat-square&logo=prisma&logoColor=white" />
  <img alt="SQLite" src="https://img.shields.io/badge/SQLite-3-003B57?style=flat-square&logo=sqlite&logoColor=white" />
  <img alt="License" src="https://img.shields.io/badge/License-MIT-green?style=flat-square" />
</p>

</div>

![首页预览](./public/homepage-screenshot.png)

<p align="center">
  <sub>手绘线框图风格 · 方格纸背景 · 马克笔高亮 · 便签装饰</sub>
</p>

---

## ✨ 功能特性

<table>
  <tr>
    <td width="33%" align="center">
      <h3>📝</h3>
      <h4>富文本编辑</h4>
      <sub>基于 TipTap 的所见即所得编辑器，支持代码高亮、表格、任务列表、图片上传、Markdown 粘贴、自动保存</sub>
    </td>
    <td width="33%" align="center">
      <h3>🗂️</h3>
      <h4>分类与标签</h4>
      <sub>两级树形分类 + 扁平标签多维组织，支持筛选、排序、空标签一键清理</sub>
    </td>
    <td width="33%" align="center">
      <h3>🔍</h3>
      <h4>全文检索</h4>
      <sub>SQLite FTS5 全文索引，BM25 相关性排序 + 关键词高亮，毫秒级响应</sub>
    </td>
  </tr>
  <tr>
    <td width="33%" align="center">
      <h3>🔒</h3>
      <h4>权限与隐私</h4>
      <sub>公开 / 私有双档可见性，后台路径可自定义防扫描，Auth.js + bcrypt 鉴权</sub>
    </td>
    <td width="33%" align="center">
      <h3>📊</h3>
      <h4>数据看板</h4>
      <sub>笔记统计、30 天增长趋势图、分类分布、浏览量追踪</sub>
    </td>
    <td width="33%" align="center">
      <h3>💾</h3>
      <h4>备份与导出</h4>
      <sub>JSON + Markdown 双格式导出，SQLite 单文件备份，回收站软删除</sub>
    </td>
  </tr>
</table>

---

## 🛠️ 技术栈

| 层次 | 选型 | 说明 |
|------|------|------|
| **框架** | [Next.js 16](https://nextjs.org/) (App Router) | React 19，Server Components 优先 |
| **语言** | [TypeScript](https://www.typescriptlang.org/) | 端到端类型安全 |
| **样式** | [Tailwind CSS v4](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/) | CSS-first 配置，手绘风格设计系统 |
| **动画** | [GSAP](https://gsap.com/) + `@gsap/react` | 页面过渡与交互动效 |
| **数据库** | SQLite + [Prisma 7](https://www.prisma.io/) | 零运维单文件，可切换 PostgreSQL |
| **API 层** | [tRPC v11](https://trpc.io/) + TanStack Query | 端到端类型安全，免手写 API 类型 |
| **认证** | [Auth.js v5](https://authjs.dev/) (NextAuth) | Credentials + JWT，无状态会话 |
| **编辑器** | [TipTap 3](https://tiptap.dev/) | 基于 ProseMirror 的可扩展富文本 |
| **校验** | [Zod](https://zod.dev/) | 运行时类型校验 + Schema 推导 |
| **部署** | Docker + Caddy | 容器化部署，自动 HTTPS |

---

## 🚀 快速开始

### 环境要求

- **Node.js** ≥ 20.9.0（推荐 22+）
- **pnpm** ≥ 10（推荐包管理器）

### 1. 克隆仓库

```bash
git clone <your-repo-url>
cd kb
```

### 2. 安装依赖

```bash
pnpm install
```

> 若使用 pnpm v10+，根目录 `pnpm-workspace.yaml` 已配置 `allowBuilds` 白名单（`better-sqlite3`、`esbuild`、`@prisma/engines`、`prisma`），确保原生依赖正常编译。

### 3. 配置环境变量

```bash
cp .env.example .env
```

关键变量说明：

| 变量 | 说明 |
|------|------|
| `DATABASE_URL` | SQLite 路径，默认 `file:./dev.db` |
| `AUTH_SECRET` | 会话密钥，生成：`openssl rand -base64 32` |
| `NEXT_PUBLIC_ADMIN_BASE_PATH` | 后台入口前缀（默认 `kb-9f3x`，建议自定义） |
| `NEXT_PUBLIC_SITE_URL` | 站点公网 URL（SEO / sitemap 使用） |
| `NEXT_PUBLIC_SITE_NAME` | 站点名称（如 `XIE392`，展示为「XIE392的知识库」） |

### 4. 初始化数据库

```bash
npx prisma migrate deploy
npx prisma generate
pnpm db:seed
```

### 5. 启动

```bash
pnpm dev
```

访问 <http://localhost:3001>。

**默认账号**：`admin` / `admin123`（首次登录后请立即修改密码）

> 后台入口：`http://localhost:3001/<NEXT_PUBLIC_ADMIN_BASE_PATH>`
> 登录页：`http://localhost:3001/<NEXT_PUBLIC_ADMIN_BASE_PATH>/login`

---

## 📜 常用脚本

| 命令 | 说明 |
|------|------|
| `pnpm dev` | 启动开发服务器（端口 3001） |
| `pnpm build` | 生产构建 |
| `pnpm start` | 启动生产服务器 |
| `pnpm lint` | 代码检查 |
| `pnpm db:migrate` | 创建 / 应用数据库迁移 |
| `pnpm db:seed` | 写入种子数据 |
| `pnpm db:studio` | 打开 Prisma Studio |

---

## 📁 目录结构

```
kb/
├── prisma/
│   ├── schema.prisma          # 数据模型
│   ├── migrations/            # 迁移文件
│   └── seed.ts                # 种子数据
├── public/                    # 静态资源 & 截图
├── src/
│   ├── app/
│   │   ├── (home)/            # 首页（公开文章列表）
│   │   ├── (main)/            # 前台内容页（分类/标签/收藏/回收站）
│   │   ├── internal-admin/    # 管理后台（经 rewrites 映射）
│   │   ├── login/             # 登录页
│   │   ├── api/               # tRPC / Auth.js / 附件路由
│   │   └── globals.css        # Tailwind v4 入口 & 设计系统变量
│   ├── components/
│   │   ├── ui/                # shadcn/ui 组件
│   │   ├── rich-text/         # TipTap 编辑器封装
│   │   ├── canvasui/          # Canvas / WebGL 动效组件
│   │   └── sketch/            # 手绘装饰组件
│   ├── server/                # Prisma、Auth.js、tRPC routers
│   ├── trpc/                  # tRPC 客户端/服务端封装
│   └── lib/                   # 工具函数（FTS、代码高亮、配置等）
├── docs/                      # PRD / 架构 / 设计文档
├── Dockerfile
├── docker-compose.yml
└── Caddyfile
```

---

## 🐳 Docker 部署

项目提供 `Dockerfile` + `docker-compose.yml` + `Caddyfile`，一键部署：

```bash
# 1. 配置环境变量
cp .env.example .env
# 编辑 .env，设置 AUTH_SECRET、NEXT_PUBLIC_SITE_URL 等

# 2. 构建并启动
docker compose up -d --build
```

- 应用监听 `127.0.0.1:3000`，由 Caddy 反向代理到 80/443
- 数据持久化到宿主机 `./data` 目录（SQLite + 附件 + 备份）
- 修改 `Caddyfile` 中的域名为你的实际域名即可自动申请 HTTPS 证书

---

## 🎨 设计语言

全站统一采用**手绘线框图风格**：

- 📐 **方格纸背景**：淡灰色网格，营造笔记本质感
- ✍️ **手写字体**：标题使用手写风格字体，正文保持可读性
- 🖊️ **马克笔高亮**：关键词使用荧光笔效果
- 📌 **便签元素**：统计数字、提示信息以便利贴形式呈现
- 🌓 **深色模式**：支持亮色 / 暗色 / 跟随系统切换
- 📱 **响应式**：适配桌面、平板、手机

---

## 🔧 配置可切换数据库

默认使用 **SQLite**（个人使用零运维）。如需切换到 PostgreSQL：

1. 修改 `prisma/schema.prisma` 中 `provider = "postgresql"`
2. 将 `DATABASE_URL` 改为 PostgreSQL 连接串
3. 修改 `src/lib/` 中全文检索 SQL（FTS5 → `tsvector` + GIN）
4. 执行业务迁移

业务 router 与前端代码**无需改动**。

---

## 📄 License

[MIT](./LICENSE) © 2026 0x8C220

---

<div align="center">
  <sub>Built with Next.js · TypeScript · Tailwind CSS · Prisma · tRPC · TipTap</sub>
</div>
