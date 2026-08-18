import { db } from "@/server/db";
import { maybeRunScheduledBackup } from "@/server/backup";

/**
 * 自动备份定时器（仅 Node.js 运行时加载，见 instrumentation.ts）。
 * 服务启动后挂载每分钟的检查任务，依据备份计划（schedule.json）判断是否到点执行。
 * 默认计划未启用，需在后台"备份管理"开启。
 */

let timer: NodeJS.Timeout | null = null;

export function startBackupScheduler() {
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
