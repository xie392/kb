import type { MetadataRoute } from "next";
import { SITE_NAME, SITE_DESCRIPTION } from "@/lib/config";

// Web App Manifest：让站点可被"添加到主屏"，并声明主题色（与 viewport.themeColor 保持一致）。
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE_NAME,
    // 主屏名以名字部分为主（完整名过长会被系统截断）
    short_name: process.env.NEXT_PUBLIC_SITE_NAME ?? "XIE392",
    description: SITE_DESCRIPTION,
    start_url: "/",
    display: "standalone",
    background_color: "#f6f5f4",
    theme_color: "#f6f5f4",
    icons: [
      { src: "/icon", sizes: "512x512", type: "image/png" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  };
}
