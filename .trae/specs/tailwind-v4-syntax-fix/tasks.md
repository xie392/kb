# Tasks

> 三个替换任务互不依赖，可并行；Task 4 为最终验证（依赖全部替换完成）。

- [x] Task 1: `outline-none` → `outline-hidden`（13 文件 17 处）
  - [x] SubTask 1.1: `src/components/ui/*`（button / input / textarea / input-group / dialog / alert-dialog / select / checkbox / command / dropdown-menu 共 12 处）
  - [x] SubTask 1.2: `src/components/{category-select,tag-select}.tsx`（5 处，含 `focus:outline-none` 一并替换为 `focus:outline-hidden`）
  - [x] SubTask 1.3: `src/components/rich-text/use-editor.ts` 的 `focus:outline-none` → `focus:outline-hidden`
  - [x] 验证：`npx tsc --noEmit` 通过

- [x] Task 2: `shadow-sm` → `shadow-xs`（2 处）
  - [x] SubTask 2.1: `src/components/article-editor.tsx`（1 处）
  - [x] SubTask 2.2: `src/components/rich-text/code-block-node.tsx`（1 处）
  - [x] 验证：`npx tsc --noEmit` 通过

- [x] Task 3: `rounded-sm` → `rounded-xs`（3 文件 5 处）
  - [x] SubTask 3.1: `src/components/category-sidebar.tsx`（3 处）
  - [x] SubTask 3.2: `src/components/article-toc.tsx`（1 处）
  - [x] SubTask 3.3: `src/components/ui/command.tsx`（1 处，另发现 `ui/tooltip.tsx` 1 处一并修正）
  - [x] 验证：`npx tsc --noEmit` 通过

- [x] Task 4: 全量验证
  - [x] SubTask 4.1: `npx tsc --noEmit` 通过
  - [x] SubTask 4.2: `next build` 通过
  - [x] SubTask 4.3: 复核无残留 v3 工具类（`outline-none`、`shadow-sm`、`rounded-sm`、`*-opacity-*`、`flex-shrink-*`、`bg-gradient-to-*`）

# Task Dependencies
- Task 1 / 2 / 3 相互独立，可并行
- Task 4 依赖 Task 1 / 2 / 3 全部完成
