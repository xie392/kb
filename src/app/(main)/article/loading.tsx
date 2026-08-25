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

function TocSkeleton() {
  return (
    <aside className="hidden xl:block w-50 shrink-0 sticky top-20 self-start max-h-[calc(100vh-100px)] overflow-y-auto">
      <div>
        <div className="font-hand-display text-[17px] font-bold text-secondary mb-2 flex items-center gap-2">
          <span className="w-5 h-5 grid place-items-center sketch-border-2 bg-white text-[12px] rotate-[2deg]">
            ¶
          </span>
          <div className="w-16 h-[14px] bg-hairline/40 rounded-sm animate-pulse rotate-[-1deg]" />
        </div>
        <nav className="sketch-dashed p-1.5 bg-white/50">
          <ul className="space-y-0">
            {[...Array(5)].map((_, i) => (
              <li key={i}>
                <div
                  className="block py-0.5 px-1.5 rounded-xs"
                  style={{ paddingLeft: `${(Math.min(i, 2)) * 8 + 6}px` }}
                >
                  <div
                    className="h-[12px] bg-hairline/40 rounded-sm animate-pulse rotate-[0.3deg]"
                    style={{ width: `${85 - i * 8}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </aside>
  );
}

function ArticleSkeleton() {
  return (
    <div className="flex-1 min-w-0">
      <div className="max-w-205 mx-auto">
        <div className="flex items-center gap-2 font-hand-body text-[15px] text-ink-faint mb-8">
          <SkeletonLine width="40px" height="14px" />
          <span className="text-hairline">/</span>
          <SkeletonLine width="80px" height="14px" className="rotate-[-1deg]" />
        </div>

        <div className="bg-white sketch-border sketch-shadow p-5 sm:p-8 lg:p-12">
          <header className="mb-10">
            <div className="flex items-center gap-2 flex-wrap mb-4">
              <SkeletonLine width="70px" height="16px" className="rotate-[-0.5deg]" />
              <SkeletonLine width="50px" height="14px" className="rotate-[1deg]" />
              <SkeletonLine width="45px" height="14px" className="rotate-[-0.8deg]" />
            </div>

            <div className="space-y-2">
              <SkeletonLine width="90%" height="42px" className="sm:h-[50px] lg:h-[58px] rotate-[-0.5deg]" />
            </div>

            <div className="mt-5 flex items-center gap-x-4 gap-y-1 flex-wrap">
              <SkeletonLine width="120px" height="14px" />
              <span className="text-hairline">·</span>
              <SkeletonLine width="120px" height="14px" />
              <span className="text-hairline">·</span>
              <SkeletonLine width="80px" height="14px" />
            </div>

            <div className="mt-5 flex items-center gap-2 flex-wrap">
              {[...Array(3)].map((_, i) => (
                <SkeletonLine
                  key={i}
                  width={`${50 + i * 10}px`}
                  height="22px"
                  className="rotate-[-1deg]"
                />
              ))}
            </div>
          </header>

          <div className="border-t-2 border-dashed border-hairline pt-8 space-y-4">
            {[...Array(12)].map((_, i) => (
              <SkeletonLine
                key={i}
                width={i % 3 === 0 ? "85%" : i % 4 === 0 ? "92%" : "100%"}
                height="16px"
              />
            ))}
          </div>

          <div className="mt-10 pt-6 border-t-2 border-dashed border-hairline">
            <SkeletonLine width="100px" height="13px" />
          </div>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-4">
          <div className="sticky-note sketch-border px-4 py-3 rotate-[-1deg]">
            <SkeletonLine width="50px" height="12px" className="mb-1" />
            <SkeletonLine width="70%" height="18px" />
          </div>
          <div className="sticky-note sketch-border-2 px-4 py-3 rotate-[1deg] text-right">
            <SkeletonLine width="50px" height="12px" className="ml-auto mb-1" />
            <SkeletonLine width="70%" height="18px" className="ml-auto" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Loading() {
  return (
    <>
      <ArticleSkeleton />
      <TocSkeleton />
    </>
  );
}
