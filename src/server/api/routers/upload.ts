import { z } from "zod";
import { router, protectedProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { promises as fs } from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const EXT_MAP: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/gif": ".gif",
  "image/webp": ".webp",
  "image/svg+xml": ".svg",
};

export const uploadRouter = router({
  /** 本地上传图片，保存到 public/uploads，返回可访问 URL */
  image: protectedProcedure
    .input(
      z.object({
        data: z.string().min(1).max(MAX_SIZE * 2), // base64 字符串上限（约 5MB 二进制）
      })
    )
    .mutation(async ({ input }) => {
      const m = input.data.match(/^data:(image\/[a-z+.-]+);base64,(.+)$/);
      if (!m) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "仅支持图片数据" });
      }
      const ext = EXT_MAP[m[1]];
      if (!ext) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "不支持的图片格式（支持 JPG/PNG/GIF/WebP/SVG）" });
      }
      const buf = Buffer.from(m[2], "base64");
      if (buf.length > MAX_SIZE) {
        throw new TRPCError({ code: "PAYLOAD_TOO_LARGE", message: "图片不能超过 5MB" });
      }

      const dir = path.join(process.cwd(), "public", "uploads");
      await fs.mkdir(dir, { recursive: true });
      const name = `${Date.now()}-${crypto.randomBytes(4).toString("hex")}${ext}`;
      await fs.writeFile(path.join(dir, name), buf);
      return { url: `/uploads/${name}` };
    }),
});
