import path from "node:path";

/**
 * 附件存储目录（服务端专用，禁止客户端引用）。
 * 通过环境变量 ATTACHMENT_STORAGE_DIR 配置；相对路径以项目根目录为基准，也支持绝对路径。
 * 未配置时默认 public/uploads/attachments。
 */
export function getAttachmentStorageDir(): string {
  const raw = process.env.ATTACHMENT_STORAGE_DIR?.trim();
  const dir = raw || "public/uploads/attachments";
  return path.isAbsolute(dir) ? path.normalize(dir) : path.join(process.cwd(), dir);
}

/**
 * 附件文件的公开访问 URL。
 * 统一通过 /api/attachments/file/<name> 提供，与物理存储位置解耦（目录可任意配置）。
 */
export function attachmentFileUrl(storedName: string): string {
  return `/api/attachments/file/${storedName}`;
}

/** 从附件 URL 反解存储文件名；非法格式返回 null */
export function storedNameFromUrl(url: string): string | null {
  const m = url.match(/\/api\/attachments\/file\/([a-zA-Z0-9_.-]+)$/);
  return m ? m[1] : null;
}
