import type { Metadata } from "next";
import { Suspense } from "react";
import { getCategoryTree } from "@/server/queries/public";
import { createServerCaller } from "@/trpc/server";
import KnowledgeBase from "@/components/knowledge-base";
import { KnowledgeBaseSkeleton } from "@/components/skeletons";

export const metadata: Metadata = {
  title: "知识库",
};

export default async function CategoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ cat?: string }>;
}) {
  // searchParams 是运行时 URL 数据，包 Suspense 使导航即时（先显示骨架，内容流式填充）
  return (
    <div className="max-w-250 mx-auto px-4 sm:px-6 py-10">
      <Suspense fallback={<KnowledgeBaseSkeleton />}>
        <CategoriesContent searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function CategoriesContent({
  searchParams,
}: {
  searchParams: Promise<{ cat?: string }>;
}) {
  const { cat } = await searchParams;
  // 首屏分类树 + 首批文章都由服务端备好，客户端不再发首次 tRPC 请求
  const caller = await createServerCaller();
  const [tree, firstPage] = await Promise.all([
    getCategoryTree(),
    caller.article.list({
      status: "normal",
      categoryId: cat ?? undefined,
      pageSize: 20,
    }),
  ]);

  return (
    <KnowledgeBase
      tree={tree}
      initialCategoryId={cat ?? null}
      initialPage={firstPage}
    />
  );
}
