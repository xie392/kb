import { ImageResponse } from "next/og";
import { SITE_INITIAL } from "@/lib/config";

// 站点图标（favicon / PWA 图标），由 Next 文件约定自动注入 <link rel="icon">。
// 手绘风格：暖纸底 + 双描边圆角方框 + 蓝色首字母（取自站点名，与导航 Logo 一致）。
export const size = { width: 512, height: 512 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f6f5f4",
          border: "20px solid #31302e",
          borderRadius: 112,
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 300,
            fontWeight: 700,
            color: "#0075de",
            lineHeight: 1,
          }}
        >
          {SITE_INITIAL}
        </div>
      </div>
    ),
    { ...size },
  );
}
