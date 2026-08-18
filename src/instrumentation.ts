/**
 * 应用启动入口：在 Node.js 运行时挂载自动备份定时器。
 * node-only 模块（node:fs/path）通过动态导入按运行时加载，
 * Edge 构建下该分支会被构建期常量折叠剔除，不会编入 Edge 包。
 */

export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  // 构建阶段也会执行 register，此时不应启动定时任务
  if (process.env.NEXT_PHASE === "phase-production-build") return;
  const { startBackupScheduler } = await import("./instrumentation-node");
  startBackupScheduler();
}
