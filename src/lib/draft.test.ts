import { test } from "node:test";
import assert from "node:assert/strict";
import { draftKey, serializeDraftState } from "./draft";

test("draftKey：新建与编辑使用不同键", () => {
  assert.equal(draftKey(undefined), "kb:draft:new");
  assert.equal(draftKey("abc123"), "kb:draft:article:abc123");
});

test("serializeDraftState：相同内容稳定、不同内容可区分", () => {
  const base = {
    title: "标题",
    content: "<p>正文</p>",
    categoryId: "c1",
    visibility: "private",
    tagIds: ["t1", "t2"],
  };
  assert.equal(serializeDraftState(base), serializeDraftState({ ...base }));
  assert.notEqual(
    serializeDraftState(base),
    serializeDraftState({ ...base, content: "<p>改了</p>" })
  );
  assert.notEqual(
    serializeDraftState(base),
    serializeDraftState({ ...base, tagIds: ["t1"] })
  );
});
