import { test } from "node:test";
import assert from "node:assert/strict";
import { plainTextFromHtml, buildSnippet } from "./search";

test("plainTextFromHtml 去标签并解码实体", () => {
  assert.equal(
    plainTextFromHtml("<p>你好&nbsp;世界 &amp; <strong>朋友</strong></p>"),
    "你好 世界 & 朋友",
  );
});

test("buildSnippet 命中关键词时带上下文与省略号", () => {
  const html = `<p>${"前".repeat(60)}关键词${"后".repeat(60)}</p>`;
  const s = buildSnippet(html, "关键词", 10);
  assert.ok(s);
  assert.ok(s!.startsWith("…"));
  assert.ok(s!.endsWith("…"));
  assert.ok(s!.includes("关键词"));
});

test("buildSnippet 未命中返回 null", () => {
  assert.equal(buildSnippet("<p>abc</p>", "zzz"), null);
});

test("buildSnippet 空关键词返回开头片段", () => {
  const s = buildSnippet("<p>hello world</p>", "");
  assert.equal(s, "hello world");
});
