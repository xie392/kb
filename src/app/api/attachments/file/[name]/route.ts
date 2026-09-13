import type { NextRequest } from "next/server";
import { promises as fs } from "node:fs";
import path from "node:path";
import { db } from "@/server/db";
import { getAttachmentStorageDir } from "@/server/storage";

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
    const mime = rec.mimeType || "application/octet-stream";
    // 仅媒体/PDF 内联展示，其余（.docx/.zip 等）强制下载，避免在浏览器内被直接渲染
    const inline =
      mime.startsWith("image/") ||
      mime.startsWith("audio/") ||
      mime.startsWith("video/") ||
      mime === "application/pdf";
    return new Response(new Uint8Array(buf), {
      status: 200,
      headers: {
        "Content-Type": mime,
        "Content-Length": String(buf.length),
        "Content-Disposition": `${inline ? "inline" : "attachment"}; filename*=UTF-8''${encodeURIComponent(name)}`,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new Response("Not Found", { status: 404 });
  }
}
