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
