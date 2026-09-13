"use client";

/**
 * 全局错误边界：兜底 root layout 自身抛错的极端情况。
 * 由于会替换 root layout，必须自带 <html>/<body>，且不能依赖任何 Provider。
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="zh-CN">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f6f5f4",
          color: "#4a4641",
          fontFamily: "system-ui, -apple-system, sans-serif",
          padding: 24,
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 64, fontWeight: 700 }}>✕</div>
          <p style={{ fontSize: 20, fontWeight: 700, marginTop: 12 }}>
            站点出了点问题
          </p>
          <p style={{ fontSize: 14, color: "#8a847c", marginTop: 8 }}>
            刷新页面试试，如果仍然无法访问请稍后再来。
          </p>
          {error.digest && (
            <p style={{ fontSize: 12, color: "#aaa49c", marginTop: 8 }}>
              错误编号：{error.digest}
            </p>
          )}
          <button
            onClick={() => reset()}
            style={{
              marginTop: 24,
              padding: "10px 24px",
              fontSize: 16,
              fontWeight: 700,
              color: "#fff",
              background: "#4a4641",
              border: "2px solid #4a4641",
              borderRadius: 4,
              cursor: "pointer",
            }}
          >
            重新加载
          </button>
        </div>
      </body>
    </html>
  );
}
