// 后台入口路径（前后端共享的唯一来源）。
// 只通过 NEXT_PUBLIC_ADMIN_BASE_PATH 注入：服务端与客户端都会在构建期读取该变量，
// 修改路径只需改这一个环境变量并重新构建，不存在两处漂移。
const basePath = process.env.NEXT_PUBLIC_ADMIN_BASE_PATH;

if (!basePath) {
  throw new Error(
    "[config] 缺少环境变量 NEXT_PUBLIC_ADMIN_BASE_PATH，请在 .env 中配置后台路径后重新启动/构建。"
  );
}

export const ADMIN_BASE_PATH = basePath;

// 后台首页完整路径
export const ADMIN_HOME = `/${ADMIN_BASE_PATH}`;

// 隐藏登录页完整路径
export const ADMIN_LOGIN = `${ADMIN_HOME}/login`;

// 站点对外 URL（SEO：canonical / OG / sitemap / robots 使用）。
// 生产环境通过 NEXT_PUBLIC_SITE_URL 配置公网域名，默认本地开发地址。
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
).replace(/\/+$/, "");

// 站点显示名称（导航 / 首页 / 登录页等前台展示）。
// NEXT_PUBLIC_SITE_NAME 只配置名字部分（如 XIE392），"的知识库"为固定后缀。
// 构建期注入，修改后需重新构建。
export const SITE_NAME = `${process.env.NEXT_PUBLIC_SITE_NAME ?? "XIE392"}的知识库`;
