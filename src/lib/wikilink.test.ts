import { test } from "node:test";
import assert from "node:assert/strict";
import {
  extractWikiLinkTitles,
  renderWikiLinks,
  createTitleResolver,
  normalizeTitle,
} from "./wikilink";

test("normalizeTitle 折叠空白", () => {
  assert.equal(normalizeTitle("  读书   笔记 "), "读书 笔记");
});

test("extractWikiLinkTitles 提取并去重保序", () => {
  const html = "<p>看 [[A]]，再看 [[B]]，又见 [[A]]</p><p>[[ C ]]</p>";
  assert.deepEqual(extractWikiLinkTitles(html), ["A", "B", "C"]);
});

test("extractWikiLinkTitles 不匹配属性中的中括号", () => {
  const html = '<a title="[[不该命中]]">正文</a><p>[[真命中]]</p>';
  // 标签被剥离后仅剩文本，属性里的引用不会被解析
  assert.deepEqual(extractWikiLinkTitles(html), ["真命中"]);
});

test("extractWikiLinkTitles 忽略空引用与跨行引用", () => {
  assert.deepEqual(extractWikiLinkTitles("<p>[[]]</p>"), []);
  assert.deepEqual(extractWikiLinkTitles("<p>[[a\nb]]</p>"), []);
});

test("extractWikiLinkTitles 遵守 max 上限", () => {
  const html = Array.from({ length: 80 }, (_, i) => `[[t${i}]]`).join(" ");
  assert.equal(extractWikiLinkTitles(html, 10).length, 10);
});

test("renderWikiLinks 命中转链接、未命中转占位", () => {
  const resolve = createTitleResolver(new Map([["读书笔记", "a1"]]));
  const out = renderWikiLinks("<p>[[读书笔记]] 与 [[不存在]]</p>", resolve);
  assert.match(out, /<a href="\/article\/a1" class="wiki-link" data-wiki-link="a1">读书笔记<\/a>/);
  assert.match(out, /<span class="wiki-link wiki-link-missing" title="引用的笔记不存在">不存在<\/span>/);
});

test("renderWikiLinks 保留 HTML 结构与转义标题", () => {
  const resolve = createTitleResolver(new Map());
  const out = renderWikiLinks('<p class="x">[[a<b>]]</p>', resolve);
  assert.match(out, /<p class="x">/);
  assert.match(out, /a&lt;b&gt;/);
});

test("renderWikiLinks 标题归一化后匹配", () => {
  const resolve = createTitleResolver(new Map([["读书 笔记", "a2"]]));
  const out = renderWikiLinks("<p>[[  读书   笔记 ]]</p>", resolve);
  assert.match(out, /href="\/article\/a2"/);
});
