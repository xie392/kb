import type { NextRequest } from "next/server";
import { promises as fs } from "node:fs";
import path from "node:path";
import { db } from "@/server/db";
import { getAttachmentStorageDir } from "@/server/storage";

export const dynamic = "force-dynamic";

/** 附件文件访问入口：仅服务数据库中有记录的附件，与存储目录位置解耦 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  const { name } = await params;

  // 只允许安全字符，防止路径穿越
  if (!/^[a-zA-Z0-9_.-]+$/.test(name)) {
    return new Response("Not Found", { status: 404 });
  }

  // 仅提供数据库中存在的附件，避免任意文件读取
  const rec = await db.attachment.findFirst({
    where: { url: { endsWith: `/${name}` } },
  });
  if (!rec) {
    return new Response("Not Found", { status: 404 });
  }

  try {
    const buf = await fs.readFile(path.join(getAttachmentStorageDir(), name));
    return new Response(new Uint8Array(buf), {
      status: 200,
      headers: {
        "Content-Type": rec.mimeType || "application/octet-stream",
        "Content-Length": String(buf.length),
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new Response("Not Found", { status: 404 });
  }
}
