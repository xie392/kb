import type { Metadata } from "next";
import { Suspense } from "react";
import { io } from "next/cache";
import { listArticles, getCategoryTree, getTagList } from "@/server/queries/public";
import AboutHero from "@/components/about/about-hero";
import AboutContent from "@/components/about/about-content";

export const metadata: Metadata = {
  title: "关于我",
  description:
    "XIE392 的个人主页：全栈开发者、开源爱好者。这里记录技术思考、项目实践与这个知识库背后的故事。",
  alternates: { canonical: "/about" },
};

export default async function AboutPage() {
  return (
    <Suspense fallback={null}>
      <AboutPageContent />
    </Suspense>
  );
}

async function AboutPageContent() {
  await io(); // 动态渲染：规避相对时间等 request-time 值，放 Suspense 内不阻止 instant 导航
  const [list, cats, tags] = await Promise.all([
    listArticles({ page: 1, pageSize: 1 }),
    getCategoryTree(),
    getTagList(),
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
