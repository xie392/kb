import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/config";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // === GEO 策略：允许AI检索引用，禁止AI模型训练 ===
      // 1. 允许：所有传统搜索引擎 + AI 搜索（检索/引用，不用于训练）
      {
        userAgent: [
          // 传统搜索引擎
          "Googlebot",
          "Bingbot",
          "Baiduspider",
          "360Spider",
          "Sogou web spider",
          "Sogou inst spider",
          "PetalBot",
          "YandexBot",
          "DuckDuckBot",
          // AI 搜索引擎（用户提问时检索引用，带来流量）
          "PerplexityBot",
          "ChatGPT-User", // ChatGPT 浏览模式
          "ClaudeBot", // Claude 检索
          "Anthropic-AI",
          "Applebot", // Siri/Spotlight 检索
          "Bytespider", // 字节跳动/豆包搜索
          "FacebookBot", // Meta AI
          "YouBot", // You.com
        ],
        allow: "/",
        disallow: "/api/",
      },
      // 2. 禁止：专门用于爬取内容训练大模型的爬虫
      {
        userAgent: [
          "GPTBot", // OpenAI 训练爬虫
          "Google-Extended", // Google Gemini 训练
          "CCBot", // Common Crawl（训练多数开源大模型）
          "Amazonbot", // Amazon Alexa/AI 训练
          "ClaudeBot-Training",
          "Applebot-Extended", // Apple 训练
          "meta-externalagent", // Meta 训练
          "Bytespider-Training",
          "Ai2bot", // Allen Institute AI 训练
          "Omgilibot",
          "Omgili",
          "Webzio-Extended",
          "Diffbot",
          "ImagesiftBot",
        ],
        disallow: "/",
      },
      // 3. 默认规则：其他爬虫默认允许，只屏蔽API
      {
        userAgent: "*",
        allow: "/",
        disallow: "/api/",
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
