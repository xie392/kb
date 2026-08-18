# Tailwind v4 语法合规 + 500 行规则审计 Spec

## Why
项目已使用 Tailwind v4（`tailwindcss@^4.3.3` + `@tailwindcss/postcss`，CSS-first 配置），但部分组件仍残留 v3 时代已重命名的工具类（`outline-none`、`shadow-sm`、`rounded-sm`）。这些类在 v4 中仍可用但语义/取值已变（官方升级指南明确要求迁移），会导致：
- `outline-none`：v4 中变为 `outline-style: none`（彻底移除），替代 `outline-hidden`（透明保留，利于 forced-colors 无障碍）
- `shadow-sm` / `rounded-sm`：v4 中取值变为 v3 的 `shadow` / `rounded`（阴影更大、圆角更大），与原视觉意图不符

同时用户要求核查「每个 `.tsx`/`.ts` 文件不超过 500 行」的项目规则。

## What Changes
- **工具类 v3→v4 重命名迁移**（视觉结果与 v3 意图一致，属官方升级指南要求的机械替换）：
  - `outline-none` → `outline-hidden`：13 个文件 17 处（`ui/*`、`category-select.tsx`、`tag-select.tsx`、`rich-text/use-editor.ts` 等）
  - `shadow-sm` → `shadow-xs`：2 处（`article-editor.tsx`、`rich-text/code-block-node.tsx`）
  - `rounded-sm` → `rounded-xs`：5 处（`category-sidebar.tsx`、`article-toc.tsx`、`ui/command.tsx`）
- **500 行规则审计**：核对结果，确认无违规（不产生代码改动）
- **验证**：`npx tsc --noEmit` 与 `next build` 通过

## Impact
- Affected specs: 无新增视觉体系；设计系统（docs/DESIGN.md）不受影响
- Affected code:
  - `src/components/ui/{button,input,textarea,input-group,dialog,alert-dialog,select,checkbox,command,dropdown-menu}.tsx`
  - `src/components/{category-select,tag-select,article-editor,article-toc,category-sidebar}.tsx`
  - `src/components/rich-text/{use-editor.ts,code-block-node.tsx}`

## ADDED Requirements

### Requirement: Tailwind v4 工具类合规
系统 SHALL 仅使用 Tailwind v4 命名的工具类；所有 v3 已重命名的工具类 SHALL 迁移到 v4 对应类，保持原有视觉意图。

#### Scenario: outline 隐藏语义
- **WHEN** 组件需要隐藏焦点 outline 且由自定义样式接管焦点态
- **THEN** 使用 `outline-hidden`（v4 推荐，透明保留 outline 供 forced-colors 无障碍），而非 `outline-none`

#### Scenario: 小型阴影与圆角
- **WHEN** 组件需要 v3 时代的 `shadow-sm` / `rounded-sm` 外观
- **THEN** 分别使用 v4 的 `shadow-xs` / `rounded-xs`，视觉与 v3 一致

### Requirement: 文件行数规则审计
系统 SHALL 满足「每个 `.tsx` / `.ts` 文件不超过 500 行」的项目规则（`components/canvasui/*` 第三方组件按规则豁免）。

#### Scenario: 全量行数核查
- **WHEN** 审计 `src/` 下所有 `.tsx` / `.ts` 文件行数
- **THEN** 除 `components/canvasui/*`（豁免）外，全部文件 ≤ 500 行，无拆分需求
