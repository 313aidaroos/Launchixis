export const OWNER_EMAIL = "awad@apixis.dev";
// Owner admin allowlist (Awad's rule, 2026-10-04 Grok): both owner emails are always admin.
// ADMIN_EMAILS (Vercel env) adds more; it can no longer remove the owners.
export const OWNER_ADMIN_EMAILS = Object.freeze(["alaidaroosawad@gmail.com", OWNER_EMAIL]);

export function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

export function isValidEmail(email) {
  const e = normalizeEmail(email);
  if (!e || e.length > 254) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e);
}

export function parseAdminList(value) {
  const set = new Set();
  for (const part of String(value || "").split(/[,;\s]+/)) {
    const e = normalizeEmail(part);
    if (e && isValidEmail(e)) set.add(e);
  }
  for (const owner of OWNER_ADMIN_EMAILS) set.add(owner);
  return set;
}

export function isAdminEmail(email, admins) {
  const e = normalizeEmail(email);
  if (!e) return false;
  const list = admins || parseAdminList(process.env.ADMIN_EMAILS);
  return list.has(e);
}
