import Link from "next/link";

export default function NotFound() {
  return (
    <div className="graph-paper min-h-screen flex items-center justify-center p-6 font-hand-body text-ink-secondary">
      <div className="text-center fade-up">
        <div className="font-hand-display text-[96px] font-bold text-secondary rotate-[-3deg] leading-none">
          404
        </div>
        <p className="mt-4 font-hand-display text-[24px] font-bold text-ink-secondary rotate-[-1deg]">
          这里没有你要找的内容<span className="marker-highlight">（画了个圈）</span>
        </p>
        <Link
          href="/"
          className="inline-block mt-8 px-6 py-2.5 bg-primary text-white font-hand-display text-[19px] font-bold sketch-border sketch-shadow rotate-[-1deg] hover:rotate-0 transition-transform"
        >
          ← 返回首页
        </Link>
      </div>
    </div>
  );
}
