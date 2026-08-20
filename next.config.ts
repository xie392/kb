import type { NextConfig } from "next";
import { ADMIN_BASE_PATH } from "./src/lib/config";

const nextConfig: NextConfig = {
  // better-sqlite3 为原生模块，webpack 打包后 __dirname 错位无法加载 .node 绑定，
  // 必须外部化让运行时直接从 node_modules 加载
  serverExternalPackages: [
    "better-sqlite3",
    "@prisma/client",
    "@prisma/adapter-better-sqlite3",
  ],
  // 附件目录由运行时环境变量配置，路径动态；忽略 Turbopack 的整树追踪警告
  // （本项目 Docker 全量部署，不依赖 standalone 产物）
  turbopack: {
    ignoreIssue: [{ path: "**/src/server/storage.ts", title: /Dynamic filesystem access/ }],
  },
  async rewrites() {
    return {
      // 物理路径直接访问 → 404（beforeFiles 优先于 filesystem）
      beforeFiles: [
        // 后台物理目录与固定登录页不可直接访问，防止被扫描
        { source: "/internal-admin/:path*", destination: "/_kb-missing" },
        { source: "/internal-admin", destination: "/_kb-missing" },
        { source: "/login", destination: "/_kb-missing" },
      ],
      // 动态后台路径 → 真实后台（filesystem 无此路径时才命中 afterFiles）
      afterFiles: [
        // 隐藏登录页：/{ADMIN_BASE_PATH}/login → 物理登录页（需在通用规则之前）
        { source: `/${ADMIN_BASE_PATH}/login`, destination: "/login" },
        { source: `/${ADMIN_BASE_PATH}/:path*`, destination: "/internal-admin/:path*" },
        { source: `/${ADMIN_BASE_PATH}`, destination: "/internal-admin" },
      ],
    };
  },
  async headers() {
    return [
      {
        // 首页也是 auth 相关的动态渲染，默认 no-store 会禁用 bfcache
        source: "/",
        headers: [
          { key: "Cache-Control", value: "private, max-age=0, must-revalidate" },
        ],
      },
      {
        source: "/article/:id",
        headers: [
          { key: "Cache-Control", value: "private, max-age=0, must-revalidate" },
        ],
      },
    ];
  },
};

export default nextConfig;
