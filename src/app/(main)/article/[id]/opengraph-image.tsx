import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { cache } from "react";
import { ImageResponse } from "next/og";
import { createServerCaller } from "@/trpc/server";

export const runtime = "nodejs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// 中文字体（自托管离线可用，构建后跟随代码部署）
// TODO: 后续替换为子集化后的精简字体（含 Bold 字重）
const fontData = await readFile(
  join(process.cwd(), "assets/fonts/NotoSansCJKsc-Regular.otf"),
);

// 与页面共用同一查询（同一请求内去重）
const getArticle = cache(async (id: string) => {
  const caller = await createServerCaller();
  return caller.article.get({ id });
});

// 设计系统色板（docs/DESIGN.md）
const COLORS = {
  canvasSoft: "#f6f5f4",
  surface: "#ffffff",
  ink: "#000000",
  inkSecondary: "#31302e",
  inkMuted: "#615d59",
  inkFaint: "#a39e98",
  hairline: "#e6e6e6",
  primary: "#0075de",
  sky: "#62aef0",
  purple: "#d6b6f6",
  pink: "#ff64c8",
  orange: "#dd5b00",
  teal: "#2a9d99",
  green: "#1aae39",
};

function formatDate(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default async function Image({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let article: {
    title: string;
    summary: string | null;
    categoryName: string | null;
    tagNames: string[];
    updatedAt: Date;
  } | null = null;
  try {
    article = await getArticle(id);
  } catch {
    article = null;
  }

  const title = article?.title ?? "个人知识库";
  const category = article?.categoryName ?? "";
  const tags = article?.tagNames ?? [];
  const date = article ? formatDate(article.updatedAt) : "";
  const chip = category || tags[0] || "";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: COLORS.canvasSoft,
          padding: 56,
          position: "relative",
          fontFamily: "NotoSC",
          color: COLORS.ink,
        }}
      >
        {/* 手绘双描边画框 */}
        <div
          style={{
            position: "absolute",
            inset: 24,
            border: `3px solid ${COLORS.ink}`,
            borderRadius: 18,
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 32,
            border: `2px solid ${COLORS.primary}`,
            borderRadius: 12,
          }}
        />

        {/* 顶部：分类标签 + 日期 */}
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          {chip ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                padding: "10px 22px",
                background: COLORS.surface,
                border: `2px solid ${COLORS.hairline}`,
                borderRadius: 9999,
                color: COLORS.primary,
                fontSize: 26,
                fontWeight: 700,
              }}
            >
              {chip}
            </div>
          ) : (
            <div />
          )}
          {date ? (
            <div
              style={{
                display: "flex",
                color: COLORS.inkMuted,
                fontSize: 26,
              }}
            >
              {date}
            </div>
          ) : null}
        </div>

        {/* 文章标题 */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            justifyContent: "center",
            marginTop: 28,
            position: "relative",
          }}
        >
          {/* 马克笔高亮条：压在标题首行上方 */}
          <div
            style={{
              position: "absolute",
              left: -10,
              top: 18,
              width: 56,
              height: 40,
              background: COLORS.pink,
              opacity: 0.85,
              transform: "rotate(-3deg)",
            }}
          />
          <div
            style={{
              display: "flex",
              fontSize: 56,
              fontWeight: 700,
              lineHeight: 1.28,
              color: COLORS.ink,
              maxWidth: "100%",
              flexWrap: "wrap",
            }}
          >
            {title}
          </div>
        </div>

        {/* 底部：站点名 + 标签 */}
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              fontSize: 30,
              fontWeight: 700,
              color: COLORS.primary,
            }}
          >
            {/* 便签方块 */}
            <div
              style={{
                width: 26,
                height: 26,
                marginRight: 14,
                background: COLORS.sky,
                transform: "rotate(8deg)",
              }}
            />
            个人知识库
          </div>
          {tags.length > 1 ? (
            <div
              style={{
                display: "flex",
                gap: 10,
              }}
            >
              {tags.slice(0, 3).map((t, i) => (
                <div
                  key={t}
                  style={{
                    display: "flex",
                    padding: "6px 16px",
                    borderRadius: 8,
                    border: `2px solid ${COLORS.hairline}`,
                    background: COLORS.surface,
                    color: COLORS.inkSecondary,
                    fontSize: 22,
                  }}
                >
                  {t}
                </div>
              ))}
              <div style={{ display: "flex", width: 14 }} />
            </div>
          ) : null}
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [{ name: "NotoSC", data: fontData, style: "normal" }],
    },
  );
}
