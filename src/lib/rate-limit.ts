// 登录防爆破：基于内存的失败次数限制（#09）。
// 适用场景：单实例 Docker 部署（本项目 docker-compose 仅一个 kb 容器）。
// 按客户端 IP 计数，窗口内超过阈值即临时锁定，阻止对认证端点的高频暴力破解。
// 注意：多副本/多实例部署时需换成共享存储（如 Redis），此实现为进程内存态。

const MAX_ATTEMPTS = 5; // 窗口内允许的最大尝试次数
const WINDOW_MS = 15 * 60 * 1000; // 滑动窗口：15 分钟
const LOCK_MS = 15 * 60 * 1000; // 触发后的锁定时间：15 分钟

interface Entry {
  count: number;
  firstAt: number; // 窗口起点时间戳
  lockedUntil: number; // 0 = 未锁定
}

const store = new Map<string, Entry>();

// 从请求中解析客户端 IP（Caddy / Cloudflare 反代通过 X-Forwarded-For 透传）
export function ipFromRequest(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0]!.trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

export interface RateLimitResult {
  allowed: boolean;
  retryAfterSeconds: number;
}

// 校验当前是否被锁定（每次认证请求前调用）
export function isLocked(key: string): RateLimitResult {
  const e = store.get(key);
  if (!e) return { allowed: true, retryAfterSeconds: 0 };
  const now = Date.now();
  if (e.lockedUntil > now) {
    return { allowed: false, retryAfterSeconds: Math.ceil((e.lockedUntil - now) / 1000) };
  }
  return { allowed: true, retryAfterSeconds: 0 };
}

// 记录一次尝试，返回是否触发锁定。窗口过期后重新计数。
export function recordAttempt(key: string): RateLimitResult {
  const now = Date.now();
  let e = store.get(key);
  if (!e || now - e.firstAt > WINDOW_MS) {
    store.set(key, { count: 1, firstAt: now, lockedUntil: 0 });
    return { allowed: true, retryAfterSeconds: 0 };
  }
  e.count += 1;
  if (e.count >= MAX_ATTEMPTS) {
    e.lockedUntil = now + LOCK_MS;
    e.count = 0; // 锁定结束后重新计数
    return { allowed: false, retryAfterSeconds: Math.ceil(LOCK_MS / 1000) };
  }
  return { allowed: true, retryAfterSeconds: 0 };
}

// 顺带清理过期条目，避免 Map 无限增长
export function cleanup(): void {
  const now = Date.now();
  for (const [k, e] of store) {
    if (now - e.firstAt > WINDOW_MS && e.lockedUntil <= now) store.delete(k);
  }
}
