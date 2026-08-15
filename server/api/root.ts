import { router } from "@/server/api/trpc";
import { authRouter } from "@/server/api/routers/auth";
import { articleRouter } from "@/server/api/routers/article";
import { categoryRouter } from "@/server/api/routers/category";
import { tagRouter } from "@/server/api/routers/tag";
import { searchRouter } from "@/server/api/routers/search";
import { statsRouter } from "@/server/api/routers/stats";

export const appRouter = router({
  auth: authRouter,
  article: articleRouter,
  category: categoryRouter,
  tag: tagRouter,
  search: searchRouter,
  stats: statsRouter,
});

export type AppRouter = typeof appRouter;
