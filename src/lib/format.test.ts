import { test, mock } from "node:test";
import assert from "node:assert/strict";
import { formatBytes, formatDate } from "./format";

test("formatBytes 按 B / KB / MB 切换单位", () => {
  assert.equal(formatBytes(512), "512 B");
  assert.equal(formatBytes(1024), "1.0 KB");
  assert.equal(formatBytes(2048), "2.0 KB");
  assert.equal(formatBytes(1024 * 1024), "1.0 MB");
  assert.equal(formatBytes(3 * 1024 * 1024), "3.0 MB");
});

test("formatDate：今天 / 昨天 / N 天前 / 绝对日期", () => {
  mock.timers.enable({ apis: ["Date"] });
  mock.timers.setTime(new Date(2026, 0, 10, 12, 0, 0).getTime());

  try {
    assert.equal(formatDate(new Date(2026, 0, 10, 9, 30, 0).toISOString()), "今天 09:30");
    assert.equal(formatDate(new Date(2026, 0, 9, 9, 30, 0).toISOString()), "昨天");
    assert.equal(formatDate(new Date(2026, 0, 7, 9, 30, 0).toISOString()), "3 天前");
    assert.ok(formatDate(new Date(2026, 0, 1, 9, 30, 0).toISOString()).includes("2026"));
  } finally {
    mock.timers.reset();
  }
});
