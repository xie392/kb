import { db } from "@/server/db";
import { maybeRunScheduledBackup } from "@/server/backup";

/**
 * 自动备份定时器：服务启动后在 Node.js 运行时挂载每分钟的检查任务，
 * 依据备份计划（schedule.json）判断是否到点执行。默认计划未启用，需在后台"备份管理"开启。
 */

let timer: NodeJS.Timeout | null = null;

function startScheduler() {
  if (timer) return;
  timer = setInterval(async () => {
    try {
      await maybeRunScheduledBackup(db);
    } catch (err) {
      console.error("[backup] 自动备份执行失败:", err);
    }
  }, 60_000);
  // 不阻塞进程退出（生产为常驻服务，仅保险）
  if (typeof timer.unref === "function") timer.unref();
}

export function register() {
  // 构建阶段也会执行 register，此时不应启动定时任务
  if (process.env.NEXT_RUNTIME === "nodejs") {
    if (process.env.NEXT_PHASE === "phase-production-build") return;
    startScheduler();
  }
}
