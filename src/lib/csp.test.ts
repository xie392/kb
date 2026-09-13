import { test } from "node:test";
import assert from "node:assert/strict";
import { buildCsp } from "./csp";

test("buildCsp：dev 放行 unsafe-eval 与 ws，且不设 frame-ancestors", () => {
  const csp = buildCsp(true);
  assert.ok(csp.includes("'unsafe-eval'"));
  assert.ok(csp.includes("ws: wss:"));
  assert.ok(!csp.includes("frame-ancestors"));
  assert.ok(csp.includes("img-src 'self' data: blob: https:"));
});

test("buildCsp：prod 收紧脚本来源并禁止被嵌套", () => {
  const csp = buildCsp(false);
  assert.ok(!csp.includes("'unsafe-eval'"));
  assert.ok(csp.includes("frame-ancestors 'none'"));
  assert.ok(csp.includes("object-src 'none'"));
  assert.ok(csp.includes("base-uri 'self'"));
});
