import { createCallerFactory } from "@/server/api/trpc";
import { appRouter } from "@/server/api/root";
import { createTRPCContext } from "@/server/api/trpc";

export const createCaller = createCallerFactory(appRouter);

/** RSC 中使用的 caller：自动创建 context（含登录态） */
export async function createServerCaller() {
  const context = await createTRPCContext();
  return createCaller(context);
}
