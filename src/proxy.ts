import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { ADMIN_BASE_PATH, ADMIN_HOME, ADMIN_LOGIN } from "@/lib/config";

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const forwarded = req.headers.get("x-forwarded-proto");
  const secureCookie = forwarded
    ? forwarded.split(",")[0].trim() === "https"
    : req.nextUrl.protocol === "https:";
  const token = await getToken({ req, secret: process.env.AUTH_SECRET, secureCookie });

  // 隐藏登录页：未登录放行渲染，已登录直接进后台
  if (pathname === ADMIN_LOGIN) {
    if (token) {
      return NextResponse.redirect(new URL(ADMIN_HOME, req.url));
    }
    return NextResponse.next();
  }

  // 其它后台路径：未登录跳转到隐藏登录页
  if (pathname.startsWith(`/${ADMIN_BASE_PATH}/`) || pathname === ADMIN_HOME) {
    if (!token) {
      return NextResponse.redirect(new URL(ADMIN_LOGIN, req.url));
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|p/).*)"],
};
