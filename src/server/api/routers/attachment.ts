import { z } from "zod";
import { router, protectedProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { promises as fs } from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { ATTACH_LIMITS, classifyExt } from "@/lib/attachment-config";
import {
  attachmentFileUrl,
  getAttachmentStorageDir,
  storedNameFromUrl,
} from "@/server/storage";

/** 图片魔数校验，防止伪造扩展名的伪装文件（如把 exe 改成 png） */
function verifyImageMagic(buf: Buffer, ext: string): boolean {
  switch (ext.toLowerCase()) {
    case "jpg":
    case "jpeg":
      return buf.length > 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff;
    case "png":
      return (
        buf.length > 8 &&
        buf.subarray(0, 8).equals(
          Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
        )
      );
    case "gif":
      return buf.length > 4 && buf.subarray(0, 4).toString("ascii") === "GIF8";
    case "webp":
      return (
        buf.length > 12 &&
        buf.subarray(0, 4).toString("ascii") === "RIFF" &&
        buf.subarray(8, 12).toString("ascii") === "WEBP"
      );
    default:
      return false;
  }
}

export const attachmentRouter = router({
  /** 附件列表：关键字搜索 + 类型筛选 + 分页 */
  list: protectedProcedure
    .input(
      z.object({
        keyword: z.string().max(100).default(""),
        kind: z.enum(["all", "image", "file"]).default("all"),
        page: z.number().int().min(1).default(1),
        pageSize: z.number().int().min(1).max(100).default(20),
      })
    )
    .query(async ({ ctx, input }) => {
      const where = {
        ...(input.kind !== "all" ? { kind: input.kind } : {}),
        ...(input.keyword ? { name: { contains: input.keyword } } : {}),
      };
      const [items, total] = await Promise.all([
        ctx.db.attachment.findMany({
          where,
          orderBy: { createdAt: "desc" },
          skip: (input.page - 1) * input.pageSize,
          take: input.pageSize,
        }),
        ctx.db.attachment.count({ where }),
      ]);
      return { items, total, limits: ATTACH_LIMITS };
    }),

  /** 上传附件：base64 传输，校验扩展名 / 危险文件 / 大小 / 图片魔数 */
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(255),
        data: z.string().min(1), // base64，可带 data:...;base64, 前缀
      })
    )
    .mutation(async ({ ctx, input }) => {
      // 解析 base64（兼容 data URI 前缀）
      let raw = input.data;
      let mime = "application/octet-stream";
      const m = raw.match(/^data:([^;]+);base64,(.+)$/);
      if (m) {
        mime = m[1];
        raw = m[2];
      }
      const buf = Buffer.from(raw, "base64");
      if (buf.length === 0) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "文件内容为空" });
      }

      // 清洗文件名，取原始扩展名
      const base = path
        .basename(input.name)
        .replace(/[\\/:*?"<>|]/g, "_")
        .trim();
      const dot = base.lastIndexOf(".");
      if (dot <= 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "无法识别的文件类型（请保留文件扩展名）",
        });
      }
      const ext = base.slice(dot + 1).toLowerCase();

      // 危险文件黑名单
      const kind = classifyExt(ext);
      if (kind === "reject") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `禁止上传危险文件类型 .${ext}`,
        });
      }

      // 大小限制：图片 / 其它文件分别限制
      const limit = kind === "image" ? ATTACH_LIMITS.image : ATTACH_LIMITS.file;
      if (buf.length > limit.maxBytes) {
        throw new TRPCError({
          code: "PAYLOAD_TOO_LARGE",
          message: `${kind === "image" ? "图片" : "文件"}不能超过 ${limit.label}（当前 ${(
            buf.length /
            1024 /
            1024
          ).toFixed(1)}MB）`,
        });
      }

      // 图片校验魔数
      if (kind === "image" && !verifyImageMagic(buf, ext)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "图片内容与扩展名不符，已拒绝上传",
        });
      }

      // 落盘：服务端随机命名，避免路径穿越与重名覆盖；目录由环境变量控制
      const dir = getAttachmentStorageDir();
      await fs.mkdir(dir, { recursive: true });
      const stored = `${Date.now()}-${crypto.randomBytes(4).toString("hex")}.${ext}`;
      const filePath = path.join(dir, stored);
      await fs.writeFile(filePath, buf);

      // 若数据库写入失败，回滚已落盘文件，避免残留孤儿文件
      try {
        return await ctx.db.attachment.create({
          data: {
            name: base,
            url: attachmentFileUrl(stored),
            mimeType: mime,
            size: buf.length,
            kind,
          },
        });
      } catch (err) {
        await fs.rm(filePath).catch(() => {});
        throw err;
      }
    }),

  /** 重命名（仅改显示名，不改存储文件） */
  rename: protectedProcedure
    .input(z.object({ id: z.string().min(1), name: z.string().min(1).max(255) }))
    .mutation(async ({ ctx, input }) => {
      const rec = await ctx.db.attachment.findUnique({ where: { id: input.id } });
      if (!rec) throw new TRPCError({ code: "NOT_FOUND" });
      const name = input.name.trim();
      if (!name) throw new TRPCError({ code: "BAD_REQUEST", message: "文件名不能为空" });
      return ctx.db.attachment.update({ where: { id: input.id }, data: { name } });
    }),

  /** 删除：移除数据库记录与物理文件 */
  delete: protectedProcedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const rec = await ctx.db.attachment.findUnique({ where: { id: input.id } });
      if (!rec) throw new TRPCError({ code: "NOT_FOUND" });
      const stored = storedNameFromUrl(rec.url);
      if (stored) {
        await fs.rm(path.join(getAttachmentStorageDir(), stored)).catch(() => {});
      }
      await ctx.db.attachment.delete({ where: { id: input.id } });
      return { ok: true };
    }),
});
