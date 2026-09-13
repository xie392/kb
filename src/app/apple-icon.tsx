import { ImageResponse } from "next/og";
import { SITE_INITIAL } from "@/lib/config";

// iOS 添加到主屏图标（180×180，Next 自动注入 <link rel="apple-touch-icon">）。
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0075de",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 110,
            fontWeight: 700,
            color: "#ffffff",
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
