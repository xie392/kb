<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# 项目规则（个人知识库）

## 文件大小限制

- **每个 `.tsx` / `.ts` 文件最多不超过 500 行**。
- 超过 500 行时**必须拆分组件**：把可复用的 UI 块、逻辑抽到独立文件（`components/` 或同目录子组件），保持单一职责。
- **例外**：`components/canvasui/*` 为第三方（Canvas UI / shadcn registry）生成的单文件组件，包含完整 WebGL/Shader 实现，**禁止拆分或修改其内部逻辑**；如需调整效果，通过 props 配置。

## 代码规范

- 技术栈：Next.js 16 (App Router) + TypeScript + Tailwind v4 + shadcn/ui + GSAP。
- 前端统一采用**手绘线框图风格**（方格纸 `graph-paper`、手写字体 `font-hand-display/body`、`sketch-border/shadow`、马克笔、便签）。新页面必须沿用该设计语言，不要引入新的视觉体系。
- 颜色一律使用设计系统变量/常量（docs/DESIGN.md），禁止硬编码随机色值。
- 后台路径由 `ADMIN_BASE_PATH` 环境变量控制（rewrites 映射到 `internal-admin`），**禁止在前端导航渲染后台入口**，不要直接硬编码 `/admin`。
- 写作/编辑入口仅存在于后台，前端页面不提供"写笔记/编辑"入口。
- 页面路由采用 route group：`(home)` 首页、`(main)` 前台内容页、`internal-admin` 后台。
- 组件优先 Server Component；需要交互的组件标 `"use client"`，GSAP 一律用 `useGSAP()` hook（`@gsap/react`）并在 cleanup 中取消 rAF/监听。
- 修改样式后运行 `npx tsc --noEmit` 与 `next build` 验证。
