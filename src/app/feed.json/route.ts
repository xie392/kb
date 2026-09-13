import { NextResponse } from "next/server";
import { io } from "next/cache";
import { buildJsonFeed, getFeedItems } from "@/lib/feed";

export async function GET() {
  // 请求期挂起点：cacheComponents 下确保不参与构建期预渲染（CI 构建环境无数据库）
  await io();
  const items = await getFeedItems(20);
  return new NextResponse(JSON.stringify(buildJsonFeed(items), null, 2), {
    headers: {
      "Content-Type": "application/feed+json; charset=utf-8",
      "Cache-Control": "public, max-age=600, s-maxage=1800",
    },
  });
}
