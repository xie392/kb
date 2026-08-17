import type { NextConfig } from "next";
import { ADMIN_BASE_PATH } from "./src/lib/config";

const nextConfig: NextConfig = {
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
};

export default nextConfig;
