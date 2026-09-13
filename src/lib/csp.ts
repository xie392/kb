/**
 * 内容安全策略（CSP）构造器 —— 纯函数，便于对 dev / prod 两个分支分别验证。
 *
 * 历史教训：曾用 `script-src 'self' 'unsafe-inline'`（缺 'unsafe-eval'）导致"本地文章访问不了"。
 * 原因：`next dev --webpack` 的 devtool 是 eval-source-map，每个模块都被 eval() 包裹，
 * React Refresh 同样依赖 eval；缺 'unsafe-eval' 时整个客户端 bundle 不执行，
 * 而文章页恰恰依赖客户端渲染（TipTap 只读编辑器 / TOC / 视图计数 / <Link> 导航），
 * 于是表现为内容空白或永久骨架（首页因 SSR 直出反而"看起来正常"）。
 *
 * 另外富文本用到了这些通道，必须放行：
 *   - blob:      → URL.createObjectURL 插入的图片预览（rich-text/toolbar.tsx）
 *   - media-src  → Video 扩展
 *   - frame-src  → Iframe 扩展（嵌入视频/网页）
 *   - font-src data: → KaTeX 字体
 */

/**
 * 需要额外放行到 `script-src` 的外部脚本源。
 * 目前来源：Umami 统计脚本（托管在独立域名，如 https://stats.xie392.cn/script.js）。
 * 若不放行，统计脚本会被 CSP 拦截（页面本身不受影响，但统计失效）。
 *
 * 注：next.config 在 `next start` 启动时也会被加载，因此容器运行时环境变量同样生效。
 */
function extraScriptOrigins(): string[] {
  const origins: string[] = [];

  const umami = process.env.NEXT_PUBLIC_UMAMI_URL;
  if (umami) {
    try {
      origins.push(new URL(umami).origin);
    } catch {
      // 非法 URL 忽略：此时 layout.tsx 也不会渲染统计脚本，二者保持一致
    }
  }

  // 预留开关：CSP_EXTRA_SCRIPT_SRC="https://a.example https://b.example"
  const extra = process.env.CSP_EXTRA_SCRIPT_SRC;
  if (extra) {
    origins.push(...extra.split(/[\s,]+/).filter(Boolean));
  }

  return origins;
}

export function buildCsp(isDev: boolean): string {
  const scriptSrc = [
    "'self'",
    "'unsafe-inline'", // App Router RSC/流式内联脚本必需，无法去掉
    ...(isDev ? ["'unsafe-eval'"] : []), // dev 的 eval-source-map / React Refresh
    ...extraScriptOrigins(),
  ].join(" ");

  return [
    "default-src 'self'",
    `script-src ${scriptSrc}`,
    "style-src 'self' 'unsafe-inline'", // TipTap/ProseMirror 运行时注入内联样式
    "img-src 'self' data: blob: https:",
    "media-src 'self' data: blob: https:",
    "frame-src 'self' https:",
    "font-src 'self' data:",
    // dev 额外放行 ws:/wss:：'self' 对 ws:// 的匹配各浏览器实现不一致，HMR 会断
    `connect-src 'self'${isDev ? " ws: wss:" : ""} https:`,
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    // dev 不设 frame-ancestors：IDE/浏览器预览面板多以 iframe 嵌套本地页面，设了会整页拒绝渲染
    ...(isDev ? [] : ["frame-ancestors 'none'"]),
  ].join("; ");
}
