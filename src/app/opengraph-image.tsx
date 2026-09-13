import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { SITE_NAME, SITE_DESCRIPTION } from "@/lib/config";

// 站点级默认 OG 图（1200×630 PNG）。
// 之前用 /logo.svg 作为 og:image，但 SVG 不被 Facebook/X/微信/Telegram 支持，
// 分享首页时预览图会缺失；这里用与文章页一致的画框风格生成 PNG。
export const alt = SITE_NAME;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// 中文字体（自托管离线可用，构建后跟随代码部署）
const fontData = await readFile(
  join(process.cwd(), "assets/fonts/NotoSansCJKsc-Regular.otf"),
);

// 设计系统色板（docs/DESIGN.md）
const COLORS = {
  canvasSoft: "#f6f5f4",
  surface: "#ffffff",
  ink: "#000000",
  inkMuted: "#615d59",
  hairline: "#e6e6e6",
  primary: "#0075de",
  sky: "#62aef0",
  pink: "#ff64c8",
  teal: "#2a9d99",
};

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: COLORS.canvasSoft,
          padding: 72,
          position: "relative",
          fontFamily: "NotoSC",
          color: COLORS.ink,
        }}
      >
        {/* 手绘双描边画框 */}
        <div
          style={{
            position: "absolute",
            inset: 28,
            border: `3px solid ${COLORS.ink}`,
            borderRadius: 20,
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 38,
            border: `2px solid ${COLORS.primary}`,
            borderRadius: 14,
          }}
        />

        {/* 顶部：便签方块 + 站点名 */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            fontSize: 34,
            fontWeight: 700,
            color: COLORS.primary,
          }}
        >
          <div
            style={{
              width: 30,
              height: 30,
              marginRight: 16,
              background: COLORS.sky,
              transform: "rotate(8deg)",
            }}
          />
          {SITE_NAME}
        </div>

        {/* 中部：标语 */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            justifyContent: "center",
            marginTop: 20,
            position: "relative",
          }}
        >
          <div
            style={{
              position: "absolute",
              left: -12,
              top: 6,
              width: 64,
              height: 44,
              background: COLORS.pink,
              opacity: 0.85,
              transform: "rotate(-3deg)",
            }}
          />
          <div
            style={{
              display: "flex",
              fontSize: 72,
              fontWeight: 700,
              lineHeight: 1.25,
              flexWrap: "wrap",
            }}
          >
            记录碎片化的想法
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 72,
              fontWeight: 700,
              lineHeight: 1.25,
              marginTop: 8,
              color: COLORS.primary,
            }}
          >
            沉淀系统化的知识
          </div>
        </div>

        {/* 底部：描述 + 装饰点 */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 26,
              color: COLORS.inkMuted,
              maxWidth: 900,
            }}
          >
            {SITE_DESCRIPTION}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 16, height: 16, borderRadius: 9999, background: COLORS.primary }} />
            <div style={{ width: 16, height: 16, borderRadius: 9999, background: COLORS.pink }} />
            <div style={{ width: 16, height: 16, borderRadius: 9999, background: COLORS.teal }} />
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [{ name: "NotoSC", data: fontData, style: "normal" }],
    },
  );
}
