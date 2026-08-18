import { createServerCaller } from "@/trpc/server";
import CategorySidebar from "@/components/category-sidebar";

export default async function ArticleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const caller = await createServerCaller();
  const [tree, list] = await Promise.all([
    caller.category.tree(),
    caller.article.list({ status: "normal", page: 1, pageSize: 100 }),
  ]);

  type CatNode = (typeof tree)[number];
  const pruneTree = (nodes: CatNode[]): CatNode[] =>
    nodes
      .map((n) => ({ ...n, children: pruneTree(n.children) }))
      .filter((n) => n.count > 0 || n.children.length > 0);

  const articles = list.items.map((a) => ({
    id: a.id,
    title: a.title,
    categoryId: a.category?.id ?? null,
  }));

  return (
    <div className="max-w-350 mx-auto px-4 sm:px-6 py-6 sm:py-8 flex gap-6 items-start">
      <CategorySidebar tree={pruneTree(tree)} articles={articles} />
      {children}
    </div>
  );
}
