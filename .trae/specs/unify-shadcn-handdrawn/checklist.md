# Checklist

## 基础组件手绘化（Task 1）
- [x] `ui/button.tsx` 各 variant 默认呈现手绘外观（sketch 边框/阴影、手写字体、design tokens），调用方无需额外样式类
- [x] `ui/input.tsx` / `ui/textarea.tsx` / `ui/input-group.tsx` 手绘边框 + `font-hand-body` + 品牌蓝 focus
- [x] `ui/dialog.tsx` / `ui/alert-dialog.tsx` 内容区 `sketch-border`/`sketch-shadow` + 白底 + 手写标题
- [x] `ui/popover.tsx` / `ui/tooltip.tsx` / `ui/command.tsx` 已手绘化

## 新增组件（Task 2）
- [x] `select`、`checkbox`、`dropdown-menu`、`sonner` 已安装且为手绘风格

## 手绘装饰封装（Task 3）
- [x] `src/components/sketch/` 存在 doodle 图元与 `SketchDecorations` 组合组件
- [x] 登录页改为引用封装组件，页内不再内联重复 SVG，视觉一致

## 手写实现替换（Task 4-8）
- [x] 搜索弹窗基于 `Dialog` + `Command`，移除手写 `fixed inset-0` 弹层与 click-outside/Esc 监听
- [x] 移动端菜单基于 `DropdownMenu`，汉堡按钮用 `Button`，无手写 click-outside
- [x] 登录页表单使用 `Input` / `Button`
- [x] 后台各页按钮/可见性下拉/复选框/输入使用 shadcn 组件，无原生 `<select>`/`<input>` 样式手写残留
- [x] 文章编辑器保存/返回按钮、标题输入使用 shadcn 组件，保存提示用 `sonner` toast（或等价 shadcn toast）
- [x] `rich-text/toolbar.tsx` 工具按钮统一 `Button variant="ghost" size="icon"`

## 验证
- [x] `npx tsc --noEmit` 通过
- [x] `next build` 通过
- [x] 前台（首页/文章/搜索）与后台（登录/文章管理/编辑器）视觉无回退，手绘风格保持一致（Playwright 截图验证，无 console 报错）
