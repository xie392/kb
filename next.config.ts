import type { NextConfig } from "next";

const adminPath = process.env.ADMIN_BASE_PATH ?? "kb-9f3x";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      { source: `/${adminPath}/:path*`, destination: "/internal-admin/:path*" },
      { source: `/${adminPath}`, destination: "/internal-admin" },
      // 物理路径直接访问 → 404，防止后台目录被扫描到
      { source: "/internal-admin/:path*", destination: "/_kb-missing" },
      { source: "/internal-admin", destination: "/_kb-missing" },
    ];
  },
};

export default nextConfig;
