import { test } from "node:test";
import assert from "node:assert/strict";
import { canWriteLaunches, requireAdminEmail } from "../lib/admin.js";

test("owner can write launch board", () => {
  assert.equal(canWriteLaunches("awad@apixis.dev"), true);
  assert.equal(canWriteLaunches("Awad@Apixis.dev"), true);
});

test("anonymous and non-admin users cannot write launch board", () => {
  assert.equal(canWriteLaunches(null), false);
  assert.equal(canWriteLaunches("customer@example.com"), false);
});

test("requireAdminEmail returns a 403 error marker for non-admin", () => {
  assert.equal(requireAdminEmail("customer@example.com").ok, false);
  assert.equal(requireAdminEmail("customer@example.com").status, 403);
  assert.equal(requireAdminEmail("customer@example.com").error, "admin_required");
  assert.deepEqual(requireAdminEmail("awad@apixis.dev"), { ok: true });
});
