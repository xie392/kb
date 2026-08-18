import { NextResponse } from "next/server";

export const runtime = "nodejs";

const MAX_BYTES = 2 * 1024 * 1024;
const TIMEOUT_MS = 6000;

function isPrivateHost(hostname: string): boolean {
  const host = hostname.toLowerCase().replace(/\.$/, "");
  if (host === "localhost" || host === "0.0.0.0") return true;
  if (host.endsWith(".local") || host.endsWith(".internal")) return true;
  // IPv6 本地/链路本地/唯一本地
  if (host.includes(":")) {
    return (
      host === "::1" ||
      host.startsWith("fc") ||
      host.startsWith("fd") ||
      host.startsWith("fe8") ||
      host.startsWith("fe9") ||
      host.startsWith("fea") ||
      host.startsWith("feb")
    );
  }
  const parts = host.split(".").map(Number);
  if (parts.length !== 4 || parts.some((p) => Number.isNaN(p) || p < 0 || p > 255)) return true;
  if (parts[0] === 10) return true;
  if (parts[0] === 127) return true;
  if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true;
  if (parts[0] === 192 && parts[1] === 168) return true;
  if (parts[0] === 169 && parts[1] === 254) return true;
  return false;
}

function getMeta(html: string, key: string): string | null {
  const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  // 兼容 property= 与 name=，content 在前后两种顺序
  const re = new RegExp(
    `<meta[^>]+(?:property|name)=["']${escaped}["'][^>]*content=["']([^"']*)["']`,
    "i"
  );
  const re2 = new RegExp(
    `<meta[^>]+content=["']([^"']*)["'][^>]+(?:property|name)=["']${escaped}["']`,
    "i"
  );
  const m = html.match(re) ?? html.match(re2);
  return m ? m[1] : null;
}

function getTitle(html: string): string {
  const og = getMeta(html, "og:title");
  if (og) return og;
  const m = html.match(/<title[^>]*>([^<]*)<\/title>/i);
  return m ? m[1].trim() : "";
}

function getDescription(html: string): string {
  return (
    getMeta(html, "og:description") ??
    getMeta(html, "description") ??
    ""
  );
}

function getImage(html: string, base: URL): string | null {
  const og = getMeta(html, "og:image");
  if (!og) return null;
  try {
    return new URL(og, base).toString();
  } catch {
    return null;
  }
}

function getFavicon(html: string, base: URL): string | null {
  const re = /<link[^>]+rel=["'][^"']*icon[^"']*["'][^>]*href=["']([^"']+)["']/i;
  const re2 = /<link[^>]+href=["']([^"']+)["'][^>]*rel=["'][^"']*icon[^"']*["']/i;
  const m = html.match(re) ?? html.match(re2);
  if (m) {
    try {
      return new URL(m[1], base).toString();
    } catch {
      return null;
    }
  }
  return `${base.origin}/favicon.ico`;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const raw = searchParams.get("url")?.trim();
  if (!raw) {
    return NextResponse.json({ error: "缺少 url 参数" }, { status: 400 });
  }

  let target: URL;
  try {
    target = new URL(raw);
  } catch {
    return NextResponse.json({ error: "无效的 URL" }, { status: 400 });
  }
  if (target.protocol !== "http:" && target.protocol !== "https:") {
    return NextResponse.json({ error: "仅支持 http/https 链接" }, { status: 400 });
  }
  if (isPrivateHost(target.hostname)) {
    return NextResponse.json({ error: "不允许访问内网地址" }, { status: 403 });
  }

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    const res = await fetch(target.toString(), {
      signal: controller.signal,
      headers: {
        "user-agent": "Mozilla/5.0 (compatible; KbLinkPreview/1.0)",
        accept: "text/html,application/xhtml+xml",
      },
      redirect: "follow",
    });
    clearTimeout(timer);

    if (!res.ok) {
      return NextResponse.json({ error: `抓取失败（HTTP ${res.status}）` }, { status: 502 });
    }
    const contentType = res.headers.get("content-type") ?? "";
    if (!contentType.includes("text/html")) {
      return NextResponse.json({ error: "目标页面不是 HTML" }, { status: 415 });
    }
    const html = (await res.text()).slice(0, MAX_BYTES);
    const base = new URL(res.url || target.toString());

    return NextResponse.json({
      title: getTitle(html).slice(0, 200),
      description: getDescription(html).slice(0, 300),
      image: getImage(html, base),
      favicon: getFavicon(html, base),
    });
  } catch (error) {
    const aborted = error instanceof Error && error.name === "AbortError";
    return NextResponse.json(
      { error: aborted ? "抓取超时" : "抓取失败" },
      { status: 502 }
    );
  }
}
