import { test } from "node:test";
import assert from "node:assert/strict";
import { escapeXml, plainText } from "./feed-format";

test("escapeXml 转义全部 XML 特殊字符", () => {
  assert.equal(escapeXml(`<a href="x">Tom&Jerry's</a>`), "&lt;a href=&quot;x&quot;&gt;Tom&amp;Jerry&apos;s&lt;/a&gt;");
});

test("escapeXml 先处理 & 避免二次转义", () => {
  assert.equal(escapeXml("&amp;"), "&amp;amp;");
  assert.equal(escapeXml("1 < 2 && 3 > 2"), "1 &lt; 2 &amp;&amp; 3 &gt; 2");
});

test("plainText 去除标签并压缩空白", () => {
  assert.equal(plainText("<p>你好   <b>世界</b></p>"), "你好 世界");
  assert.equal(plainText("<h1>标题</h1>\n<p>正文</p>"), "标题 正文");
  assert.equal(plainText("<p></p>"), "");
});
