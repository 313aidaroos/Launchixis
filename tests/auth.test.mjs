import { test } from "node:test";
import assert from "node:assert/strict";
import { isAdminEmail, normalizeEmail, isValidEmail, parseAdminList } from "../lib/auth.js";

test("owner email is admin regardless of case", () => {
  const admins = parseAdminList("awad@apixis.dev");
  assert.equal(isAdminEmail("Awad@Apixis.dev", admins), true);
  assert.equal(isAdminEmail("awad@apixis.dev ", admins), true);
});

test("non-listed email is not admin", () => {
  const admins = parseAdminList("awad@apixis.dev");
  assert.equal(isAdminEmail("someone@apixis.dev", admins), false);
  assert.equal(isAdminEmail("", admins), false);
  assert.equal(isAdminEmail(null, admins), false);
});

test("admin list parses comma and whitespace separated env value", () => {
  const admins = parseAdminList(" awad@apixis.dev, ops@apixis.dev ;alaidaroosawad@gmail.com ");
  assert.deepEqual(
    [...admins].sort(),
    ["alaidaroosawad@gmail.com", "awad@apixis.dev", "ops@apixis.dev"]
  );
});

test("admin list defaults to owner when env is empty", () => {
  const admins = parseAdminList("");
  assert.equal(admins.has("awad@apixis.dev"), true);
});

test("email validation rejects garbage and accepts real addresses", () => {
  assert.equal(isValidEmail("awad@apixis.dev"), true);
  assert.equal(isValidEmail("a@b.co"), true);
  assert.equal(isValidEmail("nope"), false);
  assert.equal(isValidEmail("a@b"), false);
  assert.equal(isValidEmail("a b@c.com"), false);
  assert.equal(isValidEmail(""), false);
});

test("normalizeEmail lowercases and trims", () => {
  assert.equal(normalizeEmail("  AwAd@Apixis.DEV "), "awad@apixis.dev");
});
