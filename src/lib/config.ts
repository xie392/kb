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
