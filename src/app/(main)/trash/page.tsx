import { createServerCaller } from "@/trpc/server";
import TrashList from "@/components/trash-list";

export default async function TrashPage() {
  const caller = await createServerCaller();
  const list = await caller.article.list({ status: "trash", page: 1, pageSize: 100 });
  const items = list.items.map((a) => ({
    id: a.id,
    title: a.title,
    updatedAt: String(a.updatedAt),
  }));

  return (
    <div className="max-w-250 mx-auto px-4 sm:px-6 py-10">
      <header className="mb-8 text-center pt-4 fade-up">
        <h1 className="font-hand-display text-[40px] font-bold text-secondary rotate-[-1deg]">回收站</h1>
        <p className="mt-2 font-hand-body text-[16px] text-ink-muted">
          删除的笔记会在这里保留，可恢复或永久删除
        </p>
      </header>

      <TrashList initial={items} />
    </div>
  );
}
