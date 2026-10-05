import { test } from "node:test";
import assert from "node:assert/strict";
import { cleanCixyMessage, isCixyHealthy } from "../lib/cixy.js";

test("Cixy message is trimmed and routed correctly", () => {
  const msg = cleanCixyMessage("  Hello Cixy  ");
  assert.equal(msg, "Hello Cixy");
});

test("Cixy rejects empty messages", () => {
  assert.equal(cleanCixyMessage("  "), "");
  assert.equal(cleanCixyMessage(""), "");
});

test("Cixy health check requires ANTHROPIC_API_KEY", () => {
  const mockEnv = { ANTHROPIC_API_KEY: "" };
  assert.equal(isCixyHealthy(mockEnv), false);
  
  const mockEnv2 = { ANTHROPIC_API_KEY: "sk-test-key" };
  assert.equal(isCixyHealthy(mockEnv2), true);
});

test("Cixy prompt and welcome have no religious content outside Halaxis (Awad lock 2026-10-04)", async () => {
  const { CIXY_SYSTEM_PROMPT } = await import("../lib/cixy.js");
  const { readFileSync } = await import("node:fs");
  const ui = readFileSync(new URL("../app/cixy.jsx", import.meta.url), "utf8");
  const banned = /salaam|salam|insha|alhamdulillah|bismillah|halal|haram|prayer|ramadan|hijri|\beid\b|muslim|scholar|riba|alcohol|pork|gambl/i;
  assert.doesNotMatch(CIXY_SYSTEM_PROMPT, banned);
  assert.doesNotMatch(ui, banned);
});
