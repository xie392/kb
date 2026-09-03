import type { Metadata } from "next";
import { createServerCaller } from "@/trpc/server";
import KnowledgeBase from "@/components/knowledge-base";

// 分类页使用 ISR，10分钟缓存，用户访问秒开
export const revalidate = 600;

export const metadata: Metadata = {
  title: "知识库",
};

export default async function CategoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ cat?: string }>;
}) {
  const { cat } = await searchParams;
  const caller = await createServerCaller();
  const tree = await caller.category.tree();

  return <KnowledgeBase tree={tree} initialCategoryId={cat ?? null} />;
}