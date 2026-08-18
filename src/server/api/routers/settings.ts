import { z } from "zod";
import { router, protectedProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import bcrypt from "bcryptjs";
import { buildBackupPayload } from "@/server/backup";

export const settingsRouter = router({
  /** 修改密码：验证原密码 */
  changePassword: protectedProcedure
    .input(
      z.object({
        oldPassword: z.string().min(1).max(100),
        newPassword: z.string().min(6).max(100),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const ok = await bcrypt.compare(input.oldPassword, ctx.user.passwordHash);
      if (!ok) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "原密码错误" });
      }
      const passwordHash = await bcrypt.hash(input.newPassword, 10);
      await ctx.db.user.update({
        where: { id: ctx.user.id },
        data: { passwordHash },
      });
      return { ok: true };
    }),

  /** 修改昵称 */
  updateProfile: protectedProcedure
    .input(z.object({ nickname: z.string().min(1).max(30) }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.user.update({
        where: { id: ctx.user.id },
        data: { nickname: input.nickname },
      });
      return { ok: true };
    }),

  getProfile: protectedProcedure.query(async ({ ctx }) => {
    return { username: ctx.user.username, nickname: ctx.user.nickname };
  }),

  /** 全量备份：JSON 导出（与备份管理共用同一份全量数据） */
  backup: protectedProcedure.query(async ({ ctx }) => buildBackupPayload(ctx.db)),
});
