export default function Loading() {
  return (
    <div className="graph-paper min-h-[calc(100vh-4rem)] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="relative w-10 h-10">
          <div className="absolute inset-0 border-[3px] border-hairline rounded-full" />
          <div className="absolute inset-0 border-[3px] border-primary border-t-transparent rounded-full animate-spin" />
        </div>
        <span className="font-hand-body text-[14px] text-ink-faint">加载中…</span>
      </div>
    </div>
  );
}
