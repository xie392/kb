import CategorySidebar from "@/components/category-sidebar";

export default function ArticleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="max-w-350 mx-auto px-4 sm:px-6 py-6 sm:py-8 flex gap-6 items-start">
      <CategorySidebar />
      {children}
    </div>
  );
}
