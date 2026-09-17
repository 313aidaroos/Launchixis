import { test } from "node:test";
import assert from "node:assert/strict";
import { LAUNCH_STEPS, mergeItems, emptyItems } from "../lib/steps.js";

test("launch steps include auth, admin and support tracking", () => {
  const ids = LAUNCH_STEPS.map((s) => s.id);
  assert.ok(ids.includes("auth"), "auth step missing");
  assert.ok(ids.includes("admin"), "admin step missing");
  assert.ok(ids.includes("support"), "support step missing");
});

test("existing saved items gain new steps as not done", () => {
  const saved = [{ id: "name", done: true }];
  const merged = mergeItems(saved);
  const byId = Object.fromEntries(merged.map((i) => [i.id, i.done]));
  assert.equal(byId.name, true);
  assert.equal(byId.auth, false);
  assert.equal(byId.admin, false);
  assert.equal(byId.support, false);
  assert.equal(merged.length, LAUNCH_STEPS.length);
});

test("emptyItems has one unchecked entry per step", () => {
  const items = emptyItems();
  assert.equal(items.length, LAUNCH_STEPS.length);
  assert.ok(items.every((i) => i.done === false));
});
