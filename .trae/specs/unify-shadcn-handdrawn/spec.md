# 统一使用 shadcn/ui + 手绘风格重绘 + 手绘装饰封装 Spec

## Why
项目已安装 shadcn/ui（Base UI 版），但大量交互组件（搜索弹窗、移动端菜单、登录表单、后台表格/表单、文章编辑器操作栏/提示）仍手写实现，重复造轮子且与 shadcn 生态割裂。根因之一是 `src/components/ui/*` 仍是 shadcn 默认外观，与网站手绘线框图风格不搭，导致开发者不愿复用而手写。此外手绘 SVG 装饰（如登录页 `SketchDecorations`）逐页内联复制，无法复用。

## What Changes
- **重绘 shadcn/ui 基础组件**：`button` / `input` / `textarea` / `input-group` / `dialog` / `alert-dialog` / `popover` / `command` / `tooltip` 默认接入设计系统（design tokens + `sketch-border`/`sketch-shadow` + `font-hand-display`/`font-hand-body`），复用 shadcn 即得到手绘外观。
- **补充缺失的 shadcn 组件**：`select`、`checkbox`、`dropdown-menu`、`sonner`（toast），均为手绘风格。
- **替换手写实现**：
  - 搜索弹窗 → `Dialog` + `Command`
  - 移动端菜单 → `DropdownMenu`，汉堡按钮 → `Button`
  - 登录页表单 → `Input` / `Button`
  - 后台表格与表单（articles/categories/tags/attachments/settings）→ `Button` / `Select` / `Checkbox` / `Input` / `Dialog` / `AlertDialog`
  - 文章编辑器操作栏 → `Button` / `Input` / `Select`，保存提示 → `sonner` toast
- **封装手绘装饰**：新建 `src/components/sketch/`，提取 doodle 图元与 `SketchDecorations` 组合组件，登录页改为引用封装组件，后续页面直接复用。

## Impact
- Affected specs: 全局 UI 规范（`docs/DESIGN.md` 的设计系统与手绘风格约定继续生效，不引入新视觉体系）
- Affected code:
  - `src/components/ui/*.tsx`（重绘，样式层；不改动组件 API）
  - `src/components/sketch/*`（新增）
  - `src/components/search-dialog.tsx`、`site-nav.tsx`、`admin-nav.tsx`、`article-editor.tsx`、`trash-list.tsx`、`rich-text/toolbar.tsx`
  - `src/app/login/page.tsx`
  - `src/app/internal-admin/{articles,categories,tags,attachments,settings}/page.tsx`

## ADDED Requirements

### Requirement: shadcn/ui 基础组件手绘化
`src/components/ui/*` 基础组件 SHALL 默认呈现手绘设计系统外观（sketch 边框/阴影、手写字体、design token 颜色），调用方无需额外追加样式类。

#### Scenario: 使用 Button 默认样式
- **WHEN** 页面使用 `<Button>`（默认 variant）
- **THEN** 渲染为手绘主按钮（品牌蓝底白字、`sketch-border`/`sketch-shadow`、`font-hand-display`、轻微旋转），而非 shadcn 默认圆角外观

#### Scenario: 使用 Input / Textarea / Dialog / Popover / Command
- **WHEN** 页面使用这些基础组件
- **THEN** 默认呈现手绘边框、暖纸/白底、手写字体与品牌蓝 focus 指示，无需调用方手动叠加 sketch 工具类

### Requirement: 补充 shadcn 交互组件
系统 SHALL 提供手绘风格的 `select`、`checkbox`、`dropdown-menu`、`sonner`（toast）组件，供后台表单、表格与编辑器使用。

#### Scenario: 后台可见性下拉
- **WHEN** 后台文章表格切换可见性
- **THEN** 使用 shadcn `Select` 渲染手绘风格下拉，替代原生 `<select>`

### Requirement: 手绘装饰封装
手绘 SVG 装饰元素 SHALL 封装为可复用组件（`src/components/sketch/`），页面通过组合 props 复用，不再逐页内联复制 SVG。

#### Scenario: 登录页装饰
- **WHEN** 渲染登录页
- **THEN** 引用 `SketchDecorations` 封装组件，渲染结果与改造前视觉一致

## MODIFIED Requirements

### Requirement: 交互组件复用 shadcn（替换手写实现）
搜索弹窗、移动端菜单、登录表单、后台表格/表单、文章编辑器操作栏 SHALL 基于 shadcn/ui 组件实现，不再手写 `fixed inset-0` 弹层、click-outside、键盘事件等底层逻辑。

#### Scenario: 搜索弹窗
- **WHEN** 点击搜索按钮打开搜索
- **THEN** 使用 `Dialog` + `Command` 渲染，Esc 关闭与点击外部关闭由 Base UI 处理，视觉保持手绘风格（搜索词高亮、结果列表样式不变）

#### Scenario: 移动端菜单
- **WHEN** 视口小于 `md` 且点击汉堡按钮
- **THEN** 使用 `DropdownMenu` 渲染，移除手写 click-outside 监听

#### Scenario: 文章编辑器保存提示
- **WHEN** 保存文章成功或失败
- **THEN** 使用 `sonner` toast 展示手绘风格提示，替换手写 `msg` 浮层

## REMOVED Requirements

### Requirement: 手写 UI 底层逻辑
**Reason**: 与 shadcn/Base UI 重复（弹层定位、焦点管理、click-outside、键盘事件），统一交由 shadcn 组件处理。
**Migration**: 对应手写实现被 shadcn 组件替换后删除；`search-dialog.tsx` 的手写弹层、`site-nav.tsx` 的 click-outside、各页面原生 `<select>`/`<input>` 样式均迁移到 shadcn 组件。
