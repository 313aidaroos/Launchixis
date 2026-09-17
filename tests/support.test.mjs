import { test } from "node:test";
import assert from "node:assert/strict";
import {
  cleanTicketInput,
  validateTicketInput,
  normalizeTicketStatus,
  SUPPORT_INBOX,
  SUPPORT_OWNER,
} from "../lib/support.js";

test("support ticket input is trimmed and routed to the Launchixis inbox and owner", () => {
  const input = cleanTicketInput({
    email: "  Customer@Example.COM ",
    subject: "  Need launch help  ",
    message: "  Please review my waitlist.  ",
    company_slug: "  launchixis  ",
  });
  assert.equal(input.email, "customer@example.com");
  assert.equal(input.subject, "Need launch help");
  assert.equal(input.message, "Please review my waitlist.");
  assert.equal(input.company_slug, "launchixis");
  assert.equal(input.source_inbox, SUPPORT_INBOX);
  assert.equal(input.route_to, SUPPORT_OWNER);
  assert.equal(input.status, "new");
});

test("support ticket validation rejects invalid email, subject and message", () => {
  assert.deepEqual(validateTicketInput({ email: "bad", subject: "Need", message: "Valid long message" }), ["valid_email_required"]);
  assert.ok(validateTicketInput({ email: "a@b.co", subject: "", message: "Valid long message" }).includes("subject_required"));
  assert.ok(validateTicketInput({ email: "a@b.co", subject: "Need", message: "short" }).includes("message_too_short"));
});

test("support ticket validation accepts clean intake", () => {
  assert.deepEqual(validateTicketInput({ email: "a@b.co", subject: "Need", message: "This is a real support request." }), []);
});

test("support status only allows truthful queue states", () => {
  assert.equal(normalizeTicketStatus("new"), "new");
  assert.equal(normalizeTicketStatus("in_progress"), "in_progress");
  assert.equal(normalizeTicketStatus("done"), "done");
  assert.equal(normalizeTicketStatus("bad"), null);
  assert.equal(normalizeTicketStatus(""), null);
});
