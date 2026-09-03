import type { Metadata } from "next";
import { createServerCaller } from "@/trpc/server";
import AboutHero from "@/components/about/about-hero";
import AboutContent from "@/components/about/about-content";

// 关于页内容不常变，缓存 1 小时
export const revalidate = 3600;

export const metadata: Metadata = {
  title: "关于我",
  description:
    "XIE392 的个人主页：全栈开发者、开源爱好者。这里记录技术思考、项目实践与这个知识库背后的故事。",
  alternates: { canonical: "/about" },
};

export default async function AboutPage() {
  const caller = await createServerCaller();
  const [list, cats, tags] = await Promise.all([
    caller.article.list({ status: "normal", page: 1, pageSize: 1 }),
    caller.category.tree(),
    caller.tag.list(),
  ]);

  const stats = [
    { label: "笔记", value: list.total },
    { label: "分类", value: cats.length },
    { label: "标签", value: tags.length },
    { label: "置顶精选", value: list.items.filter((a) => a.isPinned).length },
  ];

  return (
    <div className="font-hand-body text-ink-secondary">
      <AboutHero />
      <AboutContent stats={stats} />
    </div>
  );
}
