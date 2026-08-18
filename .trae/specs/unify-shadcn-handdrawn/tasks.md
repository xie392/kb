# Tasks

> 实施顺序：Task 1（基础重绘）为其余页面任务的依赖；Task 2（新增组件）、Task 3（装饰封装）可并行。

- [x] Task 1: 重绘 shadcn/ui 基础组件为手绘风格（基础，其余任务依赖）
  - [x] SubTask 1.1: `ui/button.tsx` — 各 variant 接入 sketch 外观：default（品牌蓝底白字 + `sketch-border`/`sketch-shadow` + `font-hand-display` + 轻微旋转）、outline（白底 + `sketch-border`）、ghost（手写字体、悬停浅底）、destructive（红）、link；字体与颜色改用 design tokens
  - [x] SubTask 1.2: `ui/input.tsx` / `ui/textarea.tsx` / `ui/input-group.tsx` — `sketch-border`、`font-hand-body`、focus 品牌蓝 ring、暖纸/白底
  - [x] SubTask 1.3: `ui/dialog.tsx` / `ui/alert-dialog.tsx` — 内容区 `sketch-border`/`sketch-shadow` + 白底（替换 `ring-1 ring-foreground/10 rounded-xl`）、标题 `font-hand-display`
  - [x] SubTask 1.4: `ui/popover.tsx` / `ui/tooltip.tsx` / `ui/command.tsx` — 手绘化（popover/command 面板白底 + sketch 边框阴影；tooltip 手写字体）
  - [x] 验证：`npx tsc --noEmit` 与 `next build` 通过

- [x] Task 2: 补充缺失的 shadcn 组件（select / checkbox / dropdown-menu / sonner）
  - [x] SubTask 2.1: 优先用 `shadcn add` 按现有 Base UI 风格添加；若 CLI 不可用，则参照 `ui/*` 现有 Base UI 模式手写同 API 组件
  - [x] SubTask 2.2: 新组件同步 Task 1 的手绘样式（select 触发器/内容、checkbox、dropdown 菜单、sonner 主题色）
  - [x] 验证：`npx tsc --noEmit` 通过

- [x] Task 3: 封装手绘装饰组件 `src/components/sketch/`（与 Task 1 并行，无依赖）
  - [x] SubTask 3.1: 提取 doodle 图元组件（星/圆/心/加/对勾/螺旋/纸飞机/气泡/箭头/波浪/散点），props 控制颜色、尺寸、旋转、延迟动画
  - [x] SubTask 3.2: 组合 `SketchDecorations` 组件（可配置内容与定位），从登录页抽取
  - [x] SubTask 3.3: 登录页改为引用封装组件，删除页内内联 SVG
  - [x] 验证：`npx tsc --noEmit`、`next build`、视觉对比与改造前一致

- [x] Task 4: 搜索弹窗改用 `Dialog` + `Command`（依赖 Task 1）
  - [x] SubTask 4.1: 重写 `search-dialog.tsx`，移除手写 `fixed inset-0` 弹层、click-outside、Esc 监听；保留搜索输入、⌘K、结果高亮与列表样式
  - [x] 验证：`npx tsc --noEmit`，功能与视觉一致

- [x] Task 5: 移动端菜单改用 `DropdownMenu`（依赖 Task 1/2）
  - [x] SubTask 5.1: `site-nav.tsx` 汉堡按钮用 `Button`，下拉菜单用 `DropdownMenu`，移除手写 click-outside
  - [x] 验证：`npx tsc --noEmit`

- [x] Task 6: 登录页表单改用 `Input` / `Button`（依赖 Task 1）
  - [x] SubTask 6.1: 用户名/密码输入改用 `ui/Input`，提交按钮改用 `ui/Button`，保持手绘外观
  - [x] 验证：`npx tsc --noEmit`

- [x] Task 7: 后台各页改用 shadcn 组件（依赖 Task 1/2）
  - [x] SubTask 7.1: `internal-admin/articles/page.tsx` — 新增文章/操作按钮用 `Button`，可见性原生 `<select>` 改用 `Select`，表头/行复选框改用 `Checkbox`
  - [x] SubTask 7.2: `internal-admin/{categories,tags,settings}.page` 与 `attachments/page.tsx`、`components/trash-list.tsx`、`components/admin-nav.tsx` — 手写按钮/输入改用 `Button`/`Input`，弹窗统一 `Dialog`/`AlertDialog`
  - [x] 验证：`npx tsc --noEmit`，`next build` 通过

- [x] Task 8: 文章编辑器操作栏与提示改用 shadcn 组件（依赖 Task 1/2）
  - [x] SubTask 8.1: `article-editor.tsx` — 保存按钮/返回按钮用 `Button`，标题输入用 `Input`，可见性切换保留（或 ToggleGroup）；手写 `msg` 浮层改用 `sonner` toast
  - [x] SubTask 8.2: `rich-text/toolbar.tsx` 工具按钮统一 `Button variant="ghost" size="icon"`（不改变功能）
  - [x] 验证：`npx tsc --noEmit`，`next build` 通过

# Task Dependencies
- Task 2 与 Task 1 并行（新增组件不依赖重绘，但 2.2 需并入 Task 1 样式约定）
- Task 3 与 Task 1 并行，无依赖
- Task 4 依赖 Task 1
- Task 5、6 依赖 Task 1（5 额外依赖 Task 2 的 dropdown-menu）
- Task 7 依赖 Task 1、Task 2
- Task 8 依赖 Task 1、Task 2
- 最终由 checklist 统一验证
