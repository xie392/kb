import { z } from "zod";
import { router, protectedProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import {
  backupPayloadSchema,
  createBackup,
  deleteBackup,
  listBackups,
  loadSchedule,
  readBackup,
  restoreBackup,
  saveSchedule,
  scheduleSchema,
} from "@/server/backup";

export const backupRouter = router({
  /** 立即备份：构建全量 JSON 并落盘，返回备份元信息 */
  create: protectedProcedure.mutation(async ({ ctx }) => {
    try {
      return await createBackup(ctx.db);
    } catch {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "备份失败，请检查服务器备份目录权限",
      });
    }
  }),

  /** 备份列表：关键字搜索 + 分页 */
  list: protectedProcedure
    .input(
      z.object({
        keyword: z.string().max(100).default(""),
        page: z.number().int().min(1).default(1),
        pageSize: z.number().int().min(1).max(100).default(20),
      })
    )
    .query(async ({ input }) => listBackups(input)),

  /** 下载备份：返回完整 JSON（客户端触发下载） */
  download: protectedProcedure
    .input(z.object({ name: z.string().min(1).max(200) }))
    .query(async ({ input }) => {
      try {
        return await readBackup(input.name);
      } catch {
        throw new TRPCError({ code: "NOT_FOUND", message: "备份文件不存在或已损坏" });
      }
    }),

  /** 恢复备份：全量覆盖文章/分类/标签/附件数据（不含账号），事务内回滚 */
  restore: protectedProcedure
    .input(z.object({ name: z.string().min(1).max(200) }))
    .mutation(async ({ ctx, input }) => {
      let raw: unknown;
      try {
        raw = await readBackup(input.name);
      } catch {
        throw new TRPCError({ code: "NOT_FOUND", message: "备份文件不存在或已损坏" });
      }
      const parsed = backupPayloadSchema.safeParse(raw);
      if (!parsed.success) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "备份文件格式无效，无法恢复" });
      }
      try {
        await restoreBackup(ctx.db, parsed.data);
      } catch {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "恢复失败，数据已回滚" });
      }
      return { ok: true };
    }),

  /** 删除备份文件 */
  delete: protectedProcedure
    .input(z.object({ name: z.string().min(1).max(200) }))
    .mutation(async ({ input }) => {
      try {
        await deleteBackup(input.name);
      } catch {
        throw new TRPCError({ code: "NOT_FOUND", message: "备份文件不存在" });
      }
      return { ok: true };
    }),

  /** 读取自动备份计划 */
  getSchedule: protectedProcedure.query(async () => loadSchedule()),

  /** 保存自动备份计划 */
  updateSchedule: protectedProcedure
    .input(scheduleSchema)
    .mutation(async ({ input }) => {
      await saveSchedule(input);
      return { ok: true };
    }),
});
