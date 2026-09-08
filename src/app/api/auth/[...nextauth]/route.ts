import { handlers } from "@/server/auth";
import { NextResponse, type NextRequest } from "next/server";
import { cleanup, ipFromRequest, isLocked, recordAttempt } from "@/lib/rate-limit";

export const { GET } = handlers;

// 对认证端点按 IP 限流（#09），阻止暴力破解。
// 只拦截凭据登录的实际 POST（前端 signIn("credentials") 请求 /api/auth/callback/credentials），
// 不影响 providers / csrf / session 等 GET 探测与正常登录。
export async function POST(req: NextRequest) {
  const url = new URL(req.url);
  const isCredAuth =
    url.pathname.includes("/signin/credentials") ||
    url.pathname.includes("/callback/credentials");

  if (req.method === "POST" && isCredAuth) {
    cleanup();
    const ip = ipFromRequest(req);

    const pre = isLocked(ip);
    if (!pre.allowed) {
      return NextResponse.json(
        { error: "尝试次数过多，请稍后再试" },
        { status: 429, headers: { "Retry-After": String(pre.retryAfterSeconds) } },
      );
    }

    const attempt = recordAttempt(ip);
    if (!attempt.allowed) {
      return NextResponse.json(
        { error: "尝试次数过多，已临时锁定，请 15 分钟后再试" },
        { status: 429, headers: { "Retry-After": String(attempt.retryAfterSeconds) } },
      );
    }
  }

  return handlers.POST(req);
}
