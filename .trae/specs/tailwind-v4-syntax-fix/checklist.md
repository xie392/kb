# Checklist

## 工具类迁移（Task 1-3）
- [x] `src/components/ui/*` 中 `outline-none` 全部替换为 `outline-hidden`
- [x] `category-select.tsx`、`tag-select.tsx`、`rich-text/use-editor.ts` 的 `outline-none`（含 `focus:` 前缀）全部替换为 `outline-hidden`
- [x] `article-editor.tsx`、`code-block-node.tsx` 的 `shadow-sm` 全部替换为 `shadow-xs`
- [x] `category-sidebar.tsx`、`article-toc.tsx`、`ui/command.tsx`、`ui/tooltip.tsx` 的 `rounded-sm` 全部替换为 `rounded-xs`
- [x] 全库无残留 v3 已重命名/已移除工具类（`outline-none`、`shadow-sm`、`rounded-sm`、`*-opacity-*`、`flex-shrink-*`、`flex-grow-*`、`bg-gradient-to-*`、`overflow-ellipsis`）

## 500 行规则审计
- [x] 除 `components/canvasui/*`（规则豁免）外，所有 `.tsx` / `.ts` 文件行数 ≤ 500，无拆分需求
- [x] 本次改动未使任何文件突破 500 行

## 验证
- [x] `npx tsc --noEmit` 通过
- [x] `next build` 通过
- [x] 前台/后台关键页面视觉与改造前一致（纯重命名，无样式语义变化）
