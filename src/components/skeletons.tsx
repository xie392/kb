/**
 * 手绘风格骨架屏集合。
 *
 * 设计原则：
 * 1. 结构与各页面真实布局对齐（标题位置、卡片列数、列表行高），减少内容到达时的 CLS 跳动；
 * 2. 沿用页面设计语言（sketch-border / sketch-shadow / 便签 / 轻微 rotate），
 *    避免"灰块"与手绘页面割裂；
 * 3. 纯展示组件，无 "use client"，可在 server / client 两侧复用。
 */

export function SketchLine({
  width = "100%",
  height = 14,
  className = "",
}: {
  width?: string | number;
  height?: string | number;
  className?: string;
}) {
  return (
    <div
      className={`bg-hairline/50 rounded-sm animate-pulse ${className}`}
      style={{ width, height }}
    />
  );
}

/** 便签块：对应首页统计 / 精选卡片的外形 */
export function SketchNote({
  className = "",
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className={`sticky-note sketch-border px-5 py-3 ${className}`}>{children}</div>
  );
}

/** 文章列表行骨架（首页 feed / 标签分组 / 知识库共用外形） */
export function SketchPostRow({ index = 0 }: { index?: number }) {
  return (
    <div className="flex items-start gap-4 px-4 sm:px-5 py-4">
      <div
        className="w-10 h-10 shrink-0 sketch-border sketch-shadow bg-white"
        style={{ transform: `rotate(${index % 3 === 0 ? -3 : index % 3 === 1 ? 2 : -1}deg)` }}
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-2">
          <SketchLine width={64} height={12} className="rotate-[-0.6deg]" />
          <SketchLine width={48} height={12} className="rotate-[0.6deg]" />
        </div>
        <SketchLine width={`${72 - (index % 3) * 8}%`} height={20} className="mb-2 rotate-[-0.3deg]" />
        <SketchLine width="96%" height={12} className="mb-1.5" />
        <SketchLine width="80%" height={12} />
      </div>
    </div>
  );
}

/** 首页骨架：Hero + 趋势卡 + 精选三卡 + 文章流 */
export function HomeSkeleton() {
  return (
    <div className="graph-paper min-h-screen font-hand-body text-ink-secondary">
      {/* Hero */}
      <section className="relative max-w-250 mx-auto px-4 sm:px-6 pt-10 sm:pt-14 pb-10 text-center">
        <div className="inline-block">
          <SketchLine width="360px" height="64px" className="mx-auto rotate-[-1.5deg]" />
          <SketchLine width="100%" height="6px" className="mt-3 rotate-[-1deg]" />
        </div>
        <div className="mt-6 flex justify-center">
          <SketchLine width="320px" height="20px" />
        </div>
        <div className="mt-10 flex items-center justify-center gap-6 flex-wrap">
          {[0, 1, 2].map((i) => (
            <SketchNote key={i} className="w-28">
              <SketchLine width="60%" height="30" className="mb-2 mx-auto rotate-[-0.6deg]" />
              <SketchLine width="80%" height="12" className="mx-auto" />
            </SketchNote>
          ))}
        </div>
        <div className="mt-10 flex items-center justify-center gap-3 flex-wrap">
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="px-4 py-1.5 bg-white sketch-border sketch-shadow"
              style={{ transform: `rotate(${i % 2 ? 1 : -1}deg)` }}
            >
              <SketchLine width={70 + (i % 3) * 14} height={16} />
            </div>
          ))}
        </div>
      </section>

      {/* 趋势卡 */}
      <div className="max-w-250 mx-auto px-4 sm:px-6">
        <div className="mb-10 sketch-dashed p-4 rotate-[-0.5deg]">
          <SketchLine width="180px" height="22" className="mb-3 rotate-[-0.5deg]" />
          <SketchLine width="240px" height="13" className="mb-4" />
          <div className="h-50 w-full bg-hairline/35 rounded-sm animate-pulse" />
        </div>
      </div>

      {/* 精选三卡 */}
      <section className="max-w-250 mx-auto px-4 sm:px-6 pb-14">
        <div className="flex items-center gap-3 mb-4">
          <SketchLine width="120px" height="24" className="rotate-[-0.5deg]" />
          <span className="flex-1 pencil-line h-[2px]" />
        </div>
        <div className="bg-white sketch-border sketch-shadow p-5 grid grid-cols-1 md:grid-cols-3 gap-5">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="sketch-dashed p-4"
              style={{ transform: `rotate(${[-1.5, 1, -1][i]}deg)` }}
            >
              <SketchLine width="45%" height="12" className="mb-3" />
              <SketchLine width="86%" height="20" className="mb-3 rotate-[-0.3deg]" />
              <SketchLine width="100%" height="12" className="mb-1.5" />
              <SketchLine width="88%" height="12" />
            </div>
          ))}
        </div>
      </section>

      {/* 文章流 */}
      <section className="max-w-250 mx-auto px-4 sm:px-6 pb-16">
        <div className="flex items-center gap-3 mb-4">
          <SketchLine width="120px" height="24" className="rotate-[-0.5deg]" />
          <span className="flex-1 pencil-line h-[2px]" />
        </div>
        <div className="bg-white sketch-border sketch-shadow divide-y divide-dashed divide-hairline">
          {[0, 1, 2, 3].map((i) => (
            <SketchPostRow key={i} index={i} />
          ))}
        </div>
      </section>
    </div>
  );
}

/** 标签页骨架：标题 + 标签云 + 分组列表 */
export function TagsSkeleton() {
  return (
    <div className="max-w-250 mx-auto px-4 sm:px-6 py-10">
      <header className="mb-10 text-center pt-4">
        <div className="font-hand-display text-[40px] font-bold text-hairline rotate-[-1deg]">
          标签
        </div>
        <SketchLine width="220px" height={16} className="mx-auto mt-3" />
      </header>

      {/* 标签云 */}
      <div className="flex items-center justify-center gap-3 flex-wrap max-w-175 mx-auto mb-12">
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
          <div
            key={i}
            className="px-4 py-2 rounded-full bg-white sketch-border"
            style={{ transform: `rotate(${i % 2 ? 0.6 : -0.6}deg)` }}
          >
            <SketchLine width={54 + (i % 4) * 16} height={16} />
          </div>
        ))}
      </div>

      {/* 分组列表 */}
      <div className="space-y-10">
        {[0, 1, 2].map((i) => (
          <section key={i}>
            <div className="flex items-center gap-3 mb-4">
              <SketchLine width={110 + i * 20} height={22} className="rotate-[-0.4deg]" />
              <span className="flex-1 pencil-line h-[2px]" />
            </div>
            <div className="bg-white sketch-border sketch-shadow divide-y divide-dashed divide-hairline">
              {[0, 1, 2].map((j) => (
                <div key={j} className="flex items-center gap-4 py-3.5 px-4 sm:px-5">
                  <SketchLine width="80px" height={14} />
                  <SketchLine width={`${70 - j * 12}%`} height={19} className="rotate-[-0.3deg]" />
                  <SketchLine width="56px" height={13} className="hidden sm:block ml-auto" />
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

/** 知识库骨架：标题 + 目录侧栏 + 文章流 */
export function KnowledgeBaseSkeleton() {
  return (
    <div className="max-w-250 mx-auto px-4 sm:px-6 py-10">
      <header className="mb-8 text-center pt-4">
        <div className="font-hand-display text-[40px] font-bold text-hairline rotate-[-1deg]">
          知识库
        </div>
        <SketchLine width="240px" height={16} className="mx-auto mt-3" />
      </header>

      <div className="flex gap-6 items-start">
        {/* 目录树 */}
        <aside className="hidden md:block w-60 shrink-0">
          <div className="bg-white sketch-border sketch-shadow p-2.5 space-y-1.5">
            {[0, 1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="flex items-center gap-2 px-1.5 py-1"
                style={{ paddingLeft: (i % 3) * 12 + 6 }}
              >
                <div className="w-1.5 h-1.5 rounded-full bg-hairline/70 shrink-0 rotate-12" />
                <SketchLine width={`${58 + (i % 4) * 9}%`} height={13} />
              </div>
            ))}
          </div>
        </aside>

        {/* 文章流 */}
        <section className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-4">
            <SketchLine width="120px" height={22} className="rotate-[-0.4deg]" />
            <span className="flex-1 pencil-line h-[2px]" />
          </div>
          <div className="bg-white sketch-border sketch-shadow divide-y divide-dashed divide-hairline">
            {[0, 1, 2, 3].map((i) => (
              <SketchPostRow key={i} index={i} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

/** 关于页骨架：标题 + 数据便签 + 正文段落 */
export function AboutSkeleton() {
  return (
    <div className="max-w-250 mx-auto px-4 sm:px-6 py-10">
      <header className="mb-10 text-center pt-4">
        <SketchLine width="200px" height={40} className="mx-auto rotate-[-1deg]" />
        <SketchLine width="300px" height={16} className="mx-auto mt-4" />
      </header>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
        {[0, 1, 2, 3].map((i) => (
          <SketchNote key={i} className="text-center">
            <SketchLine width="50%" height={26} className="mx-auto mb-2" />
            <SketchLine width="70%" height={12} className="mx-auto" />
          </SketchNote>
        ))}
      </div>
      <div className="bg-white sketch-border sketch-shadow p-6 sm:p-10 space-y-3">
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
          <SketchLine key={i} width={i % 4 === 3 ? "72%" : "100%"} height={14} />
        ))}
      </div>
    </div>
  );
}

/** 通用页面骨架（回收站等） */
export function PageSkeleton() {
  return (
    <div className="max-w-250 mx-auto px-4 sm:px-6 py-10">
      <header className="mb-8 text-center pt-4">
        <SketchLine width="180px" height={40} className="mx-auto rotate-[-1deg]" />
        <SketchLine width="280px" height={16} className="mx-auto mt-4" />
      </header>
      <div className="space-y-3">
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white sketch-border sketch-shadow px-4 py-4">
            <SketchLine width={`${60 - (i % 3) * 10}%`} height={18} className="rotate-[-0.3deg]" />
          </div>
        ))}
      </div>
    </div>
  );
}
