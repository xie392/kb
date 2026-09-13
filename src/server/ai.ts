import { plainTextFromHtml } from "@/lib/search";

/**
 * 服务端 AI 能力（DeepSeek，非流式）：自动摘要、自动打标签。
 * key 只在服务端读取；输入做长度截断，避免费用/内存放大。
 * 注意：与 /api/ai 流式代理共用同一份 key，调用方（tRPC protectedProcedure）已要求登录。
 */

const DEEPSEEK_URL = "https://api.deepseek.com/chat/completions";
const MODEL = "deepseek-chat";
/** 送入模型的正文字符上限 */
const MAX_INPUT_CHARS = 6000;

export function aiConfigured(): boolean {
  return !!process.env.DEEPSEEK_API_KEY;
}

interface ChatMessage {
  role: "system" | "user";
  content: string;
}

async function chat(
  messages: ChatMessage[],
  { temperature = 0.3, maxTokens = 300 }: { temperature?: number; maxTokens?: number } = {},
): Promise<string> {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) throw new Error("DEEPSEEK_API_KEY 未配置");

  const res = await fetch(DEEPSEEK_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ model: MODEL, messages, stream: false, temperature, max_tokens: maxTokens }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`AI 请求失败（HTTP ${res.status}）：${text.slice(0, 200)}`);
  }
  const json = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  return json.choices?.[0]?.message?.content?.trim() ?? "";
}

/** 生成一句话摘要（不超过 ~80 字） */
export async function generateSummary(content: string): Promise<string> {
  const text = plainTextFromHtml(content).slice(0, MAX_INPUT_CHARS);
  if (!text) return "";
  const out = await chat([
    { role: "system", content: "你是笔记摘要助手。只输出摘要正文，不要任何前缀、引号或解释。" },
    { role: "user", content: `请用不超过 80 字概括以下笔记的核心内容：\n\n${text}` },
  ]);
  return out.replace(/^["“]|["”]$/g, "").trim().slice(0, 200);
}

/** 推荐 3-5 个标签（优先复用已有标签词表） */
export async function suggestTags(content: string, existing: string[]): Promise<string[]> {
  const text = plainTextFromHtml(content).slice(0, MAX_INPUT_CHARS);
  if (!text) return [];
  const hint = existing.length
    ? `已有标签：${existing.slice(0, 60).join("、")}。优先从中选择，不够再新建。`
    : "";
  const out = await chat([
    {
      role: "system",
      content:
        "你是知识库标签助手。只输出一个 JSON 字符串数组，元素为 3-5 个简短中文标签（每个 2-6 字），不要输出任何其他文字。",
    },
    { role: "user", content: `${hint}\n为以下笔记推荐标签：\n\n${text}` },
  ]);

  // 稳健解析：截取第一个 '[' 到最后一个 ']'
  const start = out.indexOf("[");
  const end = out.lastIndexOf("]");
  if (start === -1 || end <= start) return [];
  try {
    const arr = JSON.parse(out.slice(start, end + 1)) as unknown;
    if (!Array.isArray(arr)) return [];
    return arr
      .filter((t): t is string => typeof t === "string")
      .map((t) => t.trim().replace(/^#/, ""))
      .filter(Boolean)
      .slice(0, 5);
  } catch {
    return [];
  }
}
