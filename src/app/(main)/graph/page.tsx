import type { Metadata } from "next";
import { Suspense } from "react";
import { getGraphData } from "@/server/queries/graph";
import KnowledgeGraph from "@/components/knowledge-graph";
import { pageAlternates } from "@/lib/config";

export const metadata: Metadata = {
  title: "关系图谱",
  description: "以力导向图呈现笔记之间的双向链接关系，直观看到知识是如何连接起来的。",
  alternates: pageAlternates("/graph"),
};

export default function GraphPage() {
  return (
    <div className="max-w-250 mx-auto px-4 sm:px-6 py-10">
      <header className="mb-6">
        <h1 className="font-hand-display text-[32px] sm:text-[40px] font-bold text-ink-secondary marker-underline inline-block rotate-[-0.5deg]">
          关系图谱
        </h1>
        <p className="mt-3 font-hand-body text-[15px] text-ink-muted">
          每个圆点是一篇笔记，连线来自正文里的 <span className="font-bold text-primary">[[标题]]</span> 双向链接。
          拖拽可移动节点，悬停查看标题，点击进入笔记。
        </p>
      </header>
      <Suspense fallback={<GraphSkeleton />}>
        <GraphContent />
      </Suspense>
    </div>
  );
}

async function GraphContent() {
  const data = await getGraphData();
  return (
    <KnowledgeGraph nodes={data.nodes} links={data.links} truncated={data.truncated} />
  );
}

function GraphSkeleton() {
  return (
    <div className="w-full h-[calc(100vh-260px)] min-h-100 bg-white sketch-border animate-pulse" />
  );
}
