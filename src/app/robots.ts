import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/config";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // 注意：robots.txt 是公开文件，写入 Disallow 会直接暴露后台路径。
      // 后台入口与登录页改为页面级 noindex（不泄漏路径，且不会收录），这里只屏蔽通用 API 前缀。
      disallow: "/api/",
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
