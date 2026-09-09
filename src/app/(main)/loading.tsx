function SkeletonLine({
  width = "100%",
  height = "16px",
  className = "",
}: {
  width?: string;
  height?: string;
  className?: string;
}) {
  return (
    <div
      className={`bg-hairline/40 rounded-sm animate-pulse ${className}`}
      style={{ width, height }}
    />
  );
}

export default function Loading() {
  return (
    <div className="max-w-250 mx-auto px-4 sm:px-6 py-10">
      {/* 页面标题骨架 */}
      <div className="flex items-end gap-3 mb-8">
        <SkeletonLine width="160px" height="38px" className="rotate-[-1deg]" />
        <SkeletonLine width="220px" height="16px" className="mb-1.5" />
      </div>

      {/* 侧栏 + 内容区 */}
      <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-8">
        {/* 分类侧栏骨架 */}
        <aside className="hidden lg:block space-y-2">
          {[...Array(7)].map((_, i) => (
            <SkeletonLine
              key={i}
              width={`${60 + (i % 4) * 10}%`}
              height="18px"
              className="rotate-[-0.6deg]"
            />
          ))}
        </aside>

        {/* 内容卡片骨架 */}
        <div className="space-y-5">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="bg-white sketch-border sketch-shadow p-5"
              style={{ transform: `rotate(${i % 2 ? "0.4" : "-0.3"}deg)` }}
            >
              <div className="flex items-center gap-2 mb-3">
                <SkeletonLine width="60px" height="14px" className="rotate-[-0.5deg]" />
                <SkeletonLine width="90px" height="14px" className="rotate-[0.5deg]" />
              </div>
              <SkeletonLine width="80%" height="24px" className="mb-3 rotate-[-0.4deg]" />
              <SkeletonLine width="100%" height="14px" className="mb-2" />
              <SkeletonLine width="95%" height="14px" className="mb-2" />
              <SkeletonLine width="60%" height="14px" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
