import { isValidEmail, normalizeEmail } from "./auth.js";

export const SUPPORT_INBOX = "launchixis@apixis.dev";
export const SUPPORT_OWNER = "awad@apixis.dev";
export const TICKET_STATUSES = ["new", "in_progress", "done"];

export function normalizeTicketStatus(status) {
  const s = String(status || "").trim();
  return TICKET_STATUSES.includes(s) ? s : null;
}

export function cleanTicketInput(input = {}) {
  return {
    email: normalizeEmail(input.email),
    subject: String(input.subject || "").trim().slice(0, 160),
    message: String(input.message || "").trim().slice(0, 5000),
    company_slug: String(input.company_slug || "launchixis").trim().toLowerCase() || "launchixis",
    source_inbox: SUPPORT_INBOX,
    route_to: SUPPORT_OWNER,
    status: "new",
  };
}

export function validateTicketInput(input = {}) {
  const ticket = cleanTicketInput(input);
  const errors = [];
  if (!isValidEmail(ticket.email)) errors.push("valid_email_required");
  if (!ticket.subject) errors.push("subject_required");
  if (ticket.message.length < 10) errors.push("message_too_short");
  return errors;
}
