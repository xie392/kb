import ArticleEditor from "@/components/article-editor";

// 编辑器含 request-time 值，允许阻塞路由（后台无需 instant 预渲染）
export const instant = false;

export default function NewArticlePage() {
  return <ArticleEditor />;
}
