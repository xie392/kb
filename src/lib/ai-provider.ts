import type { AIProvider } from "@tipkit/core";

/**
 * DeepSeek AI provider：客户端只负责把请求转发到 /api/ai 代理并消费文本增量流，
 * 真实 key 在服务端，不会下发到浏览器。
 */
export const deepSeekProvider: AIProvider = {
  async *streamText(req) {
    const res = await fetch("/api/ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: req.prompt, selection: req.selection }),
      signal: req.signal,
    });

    if (!res.ok) {
      const body = (await res.json().catch(() => ({}))) as { error?: string };
      throw new Error(body.error ?? `AI 请求失败（HTTP ${res.status}）`);
    }
    if (!res.body) throw new Error("AI 响应无内容流");

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const text = decoder.decode(value, { stream: true });
        if (text) yield text;
      }
    } finally {
      reader.releaseLock();
    }
  },
};
