import { notFound } from "next/navigation";
import { createServerCaller } from "@/trpc/server";
import ArticleEditor from "@/components/article-editor";

export default async function EditArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const caller = await createServerCaller();

  let article;
  try {
    article = await caller.article.get({ id });
  } catch {
    notFound();
  }

  return (
    <ArticleEditor
      article={{
        id: article.id,
        title: article.title,
        content: article.content,
        categoryId: article.categoryId,
        visibility: article.visibility,
        tagIds: article.tags.map((t) => t.tag.id),
      }}
    />
  );
}
