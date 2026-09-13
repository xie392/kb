import { NextResponse } from "next/server";
import { auth } from "@/server/auth";
import { hit, ipFromRequest } from "@/lib/rate-limit";

const DEEPSEEK_URL = "https://api.deepseek.com/chat/completions";
const DEFAULT_MODEL = "deepseek-chat";

// 单次请求的输入上限，避免超大 body 造成的内存/费用放大
const MAX_PROMPT_CHARS = 4000;
const MAX_SELECTION_CHARS = 20000;
// 每 IP 每分钟最多 20 次（后台编辑器使用足够宽松）
const RATE_MAX = 20;
const RATE_WINDOW_MS = 60_000;

interface AiBody {
  prompt?: string;
  selection?: string;
}

/**
 * AI 助手流式代理：把 DeepSeek 的 SSE 响应转换为纯文本增量流。
 * DeepSeek key 只在服务端读取，不会下发前端。
 * 客户端消费方式：fetch("/api/ai", { method: "POST", body }) → res.body 逐块读取。
 *
 * 安全：这是会产生真实费用的出网转发，必须登录 + 按 IP 限流 + 限制输入长度，
 * 否则任何知道该路径的人都能匿名刷爆额度。
 */
export async function POST(request: Request) {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "DEEPSEEK_API_KEY 未配置，无法使用 AI 助手" }, { status: 500 });
  }

  // 1) 仅登录用户可用
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "未授权" }, { status: 401 });
  }

  // 2) 按客户端 IP 限流
  const quota = hit(`ai:${ipFromRequest(request)}`, RATE_MAX, RATE_WINDOW_MS);
  if (!quota.allowed) {
    return NextResponse.json(
      { error: "请求过于频繁，请稍后再试" },
      { status: 429, headers: { "Retry-After": String(quota.retryAfterSeconds) } },
    );
  }

  let body: AiBody = {};
  try {
    body = (await request.json()) as AiBody;
  } catch {
    return NextResponse.json({ error: "请求体不是合法 JSON" }, { status: 400 });
  }

  const prompt = typeof body.prompt === "string" ? body.prompt.trim() : "";
  const selection = typeof body.selection === "string" ? body.selection.trim() : "";
  if (!prompt) {
    return NextResponse.json({ error: "缺少 prompt" }, { status: 400 });
  }

  // 3) 限制输入长度
  if (prompt.length > MAX_PROMPT_CHARS) {
    return NextResponse.json({ error: `prompt 过长（上限 ${MAX_PROMPT_CHARS} 字）` }, { status: 413 });
  }
  if (selection.length > MAX_SELECTION_CHARS) {
    return NextResponse.json(
      { error: `selection 过长（上限 ${MAX_SELECTION_CHARS} 字）` },
      { status: 413 },
    );
  }

  const messages: { role: string; content: string }[] = [
    { role: "system", content: "你是一名写作助手，帮助用户改写、续写、润色文档内容。直接输出结果文本，不要解释过程。" },
  ];
  if (selection) {
    messages.push({ role: "user", content: `以下是需要处理的文本：\n\n${selection}\n\n指令：${prompt}` });
  } else {
    messages.push({ role: "user", content: prompt });
  }

  let upstream: Response;
  try {
    upstream = await fetch(DEEPSEEK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        messages,
        stream: true,
        temperature: 0.7,
      }),
    });
  } catch (e) {
    return NextResponse.json({ error: `连接 DeepSeek 失败：${(e as Error).message}` }, { status: 502 });
  }

  if (!upstream.ok) {
    const text = await upstream.text().catch(() => "");
    return NextResponse.json({ error: `DeepSeek 请求失败（HTTP ${upstream.status}）：${text}` }, { status: 502 });
  }

  const reader = upstream.body?.getReader();
  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      if (!reader) {
        controller.close();
        return;
      }
      const decoder = new TextDecoder();
      let buffer = "";
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";
          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed.startsWith("data:")) continue;
            const data = trimmed.slice(5).trim();
            if (!data || data === "[DONE]") continue;
            try {
              const json = JSON.parse(data) as {
                choices?: { delta?: { content?: string } }[];
              };
              const delta = json.choices?.[0]?.delta?.content;
              if (delta) {
                controller.enqueue(encoder.encode(delta));
              }
            } catch {
              // 忽略无法解析的心跳/非数据行
            }
          }
        }
      } catch (e) {
        controller.error(e);
      } finally {
        controller.close();
      }
    },
    cancel() {
      reader?.cancel();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
    },
  });
}
