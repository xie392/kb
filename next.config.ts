import type { NextConfig } from "next";
import { ADMIN_BASE_PATH } from "./src/lib/config";
import { buildCsp } from "./src/lib/csp";

const isDev = process.env.NODE_ENV === "development";

// CSP 构造见 src/lib/csp.ts（纯函数，含"本地文章访问不了"的完整坑位说明）
const csp = buildCsp(isDev);

// 先观察后收紧：CSP_REPORT_ONLY=true 时只上报不拦截，用于灰度验证
const cspHeaderKey =
  process.env.CSP_REPORT_ONLY === "true"
    ? "Content-Security-Policy-Report-Only"
    : "Content-Security-Policy";

const nextConfig: NextConfig = {
  // Cache Components + Partial Prefetching：前台公开查询用 "use cache" 进静态壳/预取，
  // 点击切换时立即渲染缓存内容，实现丝滑跳转（而非骨架等待）。
  cacheComponents: true,
  partialPrefetching: true,
  // 前台内容缓存档案。关键：expire < 5min 使内容成为 "dynamic hole"（构建期不执行数据库查询，
  // 从而 CI/构建环境无需 SQLite 也能构建），运行时首次访问流式生成、之后缓存秒开。
  // revalidate 后台静默刷新；后台写操作后再 revalidateTag('kb') 即时失效。
  cacheLife: {
    kb: { stale: 300, revalidate: 60, expire: 240 },
  },
  // 生产构建禁用 source map，加快构建速度并减少内存使用
  productionBrowserSourceMaps: false,
  // 关闭 x-powered-by: Next.js 响应头，减少技术栈指纹暴露
  poweredByHeader: false,
  // 跳过 next build 内置的类型检查（小内存服务器上 tsc 会额外吃内存）。
  // 类型/代码规范把关由本地 `npx tsc --noEmit && next lint` / CI 单独执行，构建产物不受影响。
  typescript: {
    ignoreBuildErrors: true,
  },
  // @tipkit/* 以 TS 源码形式发布，需要显式编译
  transpilePackages: [
    "@tipkit/core",
    "@tipkit/extensions",
    "@tipkit/themes",
    "@tipkit/ui",
    "@tipkit/components",
  ],
  // better-sqlite3 为原生模块，webpack 打包后 __dirname 错位无法加载 .node 绑定，
  // 必须外部化让运行时直接从 node_modules 加载
  serverExternalPackages: [
    "better-sqlite3",
    "@prisma/client",
    "@prisma/adapter-better-sqlite3",
  ],
  // better-sqlite3 为原生模块，webpack 下 serverExternalPackages 对经 ESM adapter
  // 引入的依赖链不生效（会打包 bindings.js 导致 'fs' 解析失败），需手动外部化
  // 同时将 node: 内置模块外部化，避免 instrumentation 打包时解析 node:fs 报错
  webpack(config, { isServer }) {
    if (isServer) {
      const externals = config.externals ?? [];
      const externalModules = ["better-sqlite3", "bindings", "file-uri-to-path"].map(
        (m) => ({ [m]: `commonjs ${m}` }),
      );
      config.externals = [
        ...(Array.isArray(externals) ? externals : [externals]),
        ...externalModules,
        ({ request }: { request?: string }, callback: (err?: unknown, result?: unknown) => void) => {
          if (request && request.startsWith("node:")) {
            return callback(null, `commonjs ${request}`);
          }
          callback();
        },
      ];
    }
    return config;
  },
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
        // 公开图片/Logo 缓存 7 天
        source: "/:path*.(svg|png|jpg|jpeg|gif|webp|ico)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=604800" },
        ],
      },
      // 注意：不再为 HTML 页面设置 public 缓存头。
      // 前台查询会按登录态返回私有文章（见 server/queries/public.ts），
      // 而 Caddy + Cloudflare 会复用公共缓存 —— public/s-maxage 存在把私有笔记
      // 回给匿名访客的风险。HTML 缓存一律交给 Next（use cache / cacheComponents）自行决定。
      {
        // API 路由、TRPC 不缓存，保持动态
        source: "/(api|trpc|_trpc)/:path*",
        headers: [
          { key: "Cache-Control", value: "private, no-cache, no-store, must-revalidate" },
        ],
      },
      {
        // 全站安全响应头 + CSP
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          { key: cspHeaderKey, value: csp },
          // 生产环境补 X-Frame-Options（legacy 兜底；现代浏览器由 frame-ancestors 覆盖）
          ...(isDev ? [] : [{ key: "X-Frame-Options", value: "DENY" }]),
        ],
      },
    ];
  },
};

export default nextConfig;
