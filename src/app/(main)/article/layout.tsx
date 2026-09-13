import { Suspense } from "react";
import CategorySidebar from "@/components/category-sidebar";
import { createServerCaller } from "@/trpc/server";

async function SidebarData() {
  // 走 tRPC server caller（携带登录态）：登录用户能看到自己的私有笔记，
  // 同时避免客户端发 category.tree / article.list / article.get 三个请求。
  const caller = await createServerCaller();
  const [tree, list] = await Promise.all([
    caller.category.tree(),
    caller.article.list({ status: "normal", page: 1, pageSize: 100 }),
  ]);

  const articles = list.items.map((a) => ({
    id: a.id,
    title: a.title,
    categoryId: a.category?.id ?? null,
  }));

  return <CategorySidebar tree={tree} articles={articles} />;
}

/** 与 CategorySidebar 同外框，避免内容流入时侧栏宽度跳动 */
function SidebarSkeleton() {
  return (
    <aside className="hidden xl:block w-55 shrink-0" aria-hidden="true">
      <div className="font-hand-display text-[17px] font-bold text-secondary mb-2 flex items-center gap-2">
        <span className="w-5 h-5 grid place-items-center sketch-border bg-white text-[12px] rotate-[-3deg]">
          ☰
        </span>
        目录
      </div>
      <div className="sketch-dashed p-1.5 bg-white/50 space-y-1.5">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="flex items-center gap-1.5 py-0.5 px-1"
            style={{ paddingLeft: (i % 3) * 10 + 2 }}
          >
            <div className="w-1.5 h-1.5 rounded-full bg-hairline/70 shrink-0 rotate-12" />
            <div
              className="h-3 bg-hairline/50 rounded-sm animate-pulse"
              style={{ width: `${58 + (i % 4) * 9}%` }}
            />
          </div>
        ))}
      </div>
    </aside>
  );
}

export default function ArticleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="max-w-350 mx-auto px-4 sm:px-6 py-6 sm:py-8 flex gap-6 items-start">
      <Suspense fallback={<SidebarSkeleton />}>
        <SidebarData />
      </Suspense>
      {children}
    </div>
  );
}
