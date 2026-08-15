import { initTRPC, TRPCError } from "@trpc/server";
import { auth } from "@/server/auth";
import { db } from "@/server/db";
import type { PrismaClient, User } from "@prisma/client";

interface CreateContextOptions {
  user: User | null;
  db: PrismaClient;
}

export async function createTRPCContext() {
  const session = await auth();
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
