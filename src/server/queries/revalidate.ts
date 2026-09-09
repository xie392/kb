// 后台写操作（文章/分类/标签增删改等）完成后调用，使前台 "use cache" 缓存（tag 'kb'）即时失效，
// 新内容发布后前台立即可见，无需等待 cacheLife 的 revalidate 周期。
// 仅可在 Server Function / Route Handler 中调用（tRPC 走 /api/trpc Route Handler，满足条件）。
import { revalidateTag } from "next/cache";

export function revalidateKb() {
  revalidateTag("kb", "max");
}
