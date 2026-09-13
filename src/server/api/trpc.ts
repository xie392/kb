import { initTRPC, TRPCError } from "@trpc/server";
import { io } from "next/cache";
import type { Session } from "next-auth";
import { auth } from "@/server/auth";
import { db } from "@/server/db";
import type { PrismaClient, User } from "@prisma/client";

interface CreateContextOptions {
  user: User | null;
  db: PrismaClient;
}

export async function createTRPCContext() {
  // 显式声明接下来读取请求期数据（auth 会读 cookie 且内部使用 new Date()/crypto）。
  // 必须在 try/catch 之前调用：Cache Components 预渲染时在此挂起，
  // 否则动态信号被下方的 try/catch 吞掉，Next 会继续预渲染并报 "unstable value" 错误。
  await io();
  let session: Session | null = null;
  try {
    session = await auth();
  } catch {
    session = null;
  }
  let user: User | null = null;
  if (session?.user?.id) {
    user = await db.user.findUnique({ where: { id: session.user.id } });
  }
  return { db, user } satisfies CreateContextOptions;
}

const t = initTRPC.context<CreateContextOptions>().create();

export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({ ctx: { ...ctx, user: ctx.user } });
});

export const router = t.router;
export const createCallerFactory = t.createCallerFactory;
