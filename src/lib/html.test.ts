import { test } from "node:test";
import assert from "node:assert/strict";
import { trimTrailingEmptyParagraphs } from "./html";

test("trimTrailingEmptyParagraphs 去掉末尾空段落", () => {
  assert.equal(
    trimTrailingEmptyParagraphs("<p>内容</p><p></p><p><br></p>"),
    "<p>内容</p>"
  );
  assert.equal(
    trimTrailingEmptyParagraphs("<p>内容</p>\n<p>&nbsp;</p>\n<p></p>\n"),
    "<p>内容</p>\n"
  );
});

test("trimTrailingEmptyParagraphs 保留中间空段落", () => {
  assert.equal(
    trimTrailingEmptyParagraphs("<p>上</p><p></p><p>下</p>"),
    "<p>上</p><p></p><p>下</p>"
  );
});

test("trimTrailingEmptyParagraphs 空输入原样返回", () => {
  assert.equal(trimTrailingEmptyParagraphs(""), "");
  assert.equal(trimTrailingEmptyParagraphs("<p>有内容</p>"), "<p>有内容</p>");
});
