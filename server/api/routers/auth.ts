import { z } from "zod";
import { router, publicProcedure } from "@/server/api/trpc";
import { signIn } from "@/server/auth";
import { AuthError } from "next-auth";

export const authRouter = router({
  login: publicProcedure
    .input(
      z.object({
        username: z.string().min(1).max(50),
        password: z.string().min(1).max(100),
      })
    )
    .mutation(async ({ input }) => {
      try {
        await signIn("credentials", {
          username: input.username,
          password: input.password,
          redirect: false,
        });
        return { ok: true };
      } catch (error) {
        if (error instanceof AuthError) {
          return { ok: false, error: "用户名或密码错误" };
        }
        throw error;
      }
    }),
  getSession: publicProcedure.query(async () => {
    const session = await import("@/server/auth").then((m) => m.auth());
    return session;
  }),
});
