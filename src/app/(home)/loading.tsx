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
      {/* Hero 骨架 */}
      <div className="mb-10 text-center">
        <SkeletonLine width="120px" height="18px" className="mx-auto mb-4 rotate-[-1deg]" />
        <SkeletonLine width="320px" height="52px" className="mx-auto mb-6 rotate-[0.6deg]" />
        <div className="flex justify-center gap-3">
          {[...Array(3)].map((_, i) => (
            <SkeletonLine
              key={i}
              width="90px"
              height="20px"
              className="rotate-[-0.4deg]"
            />
          ))}
        </div>
      </div>

      {/* 卡片流骨架 */}
      <div className="space-y-6">
        <SkeletonLine width="180px" height="24px" className="rotate-[-0.5deg]" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="bg-white sketch-border sketch-shadow p-5"
              style={{ transform: `rotate(${i % 3 === 0 ? "0.6" : i % 3 === 1 ? "-0.5" : "0.2"}deg)` }}
            >
              <div className="flex items-center gap-2 mb-3">
                <SkeletonLine width="50px" height="14px" className="rotate-[-0.5deg]" />
                <SkeletonLine width="70px" height="14px" className="rotate-[0.5deg]" />
              </div>
              <SkeletonLine width="85%" height="20px" className="mb-3 rotate-[-0.3deg]" />
              <SkeletonLine width="100%" height="13px" className="mb-2" />
              <SkeletonLine width="92%" height="13px" className="mb-4" />
              <SkeletonLine width="120px" height="16px" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
