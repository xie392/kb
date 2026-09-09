import type { Metadata } from "next";
import { Suspense } from "react";
import { getCategoryTree } from "@/server/queries/public";
import KnowledgeBase from "@/components/knowledge-base";

export const metadata: Metadata = {
  title: "知识库",
};

function CategoriesSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-8">
      <aside className="hidden lg:block space-y-2">
        {[...Array(7)].map((_, i) => (
          <div
            key={i}
            className="bg-hairline/40 rounded-sm animate-pulse"
            style={{ width: `${60 + (i % 4) * 10}%`, height: 18 }}
          />
        ))}
      </aside>
      <div className="space-y-5">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white sketch-border sketch-shadow p-5">
            <div className="bg-hairline/40 rounded-sm animate-pulse mb-3" style={{ width: "70%", height: 22 }} />
            <div className="bg-hairline/40 rounded-sm animate-pulse mb-2" style={{ height: 14 }} />
            <div className="bg-hairline/40 rounded-sm animate-pulse" style={{ width: "60%", height: 14 }} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default async function CategoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ cat?: string }>;
}) {
  // searchParams 是运行时 URL 数据，包 Suspense 使导航即时（先显示骨架，内容流式填充）
  return (
    <div className="max-w-250 mx-auto px-4 sm:px-6 py-10">
      <Suspense fallback={<CategoriesSkeleton />}>
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
  const tree = await getCategoryTree();

  return <KnowledgeBase tree={tree} initialCategoryId={cat ?? null} />;
}
