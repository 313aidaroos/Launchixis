export const OWNER_EMAIL = "awad@apixis.dev";

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
  if (set.size === 0) set.add(OWNER_EMAIL);
  return set;
}

export function isAdminEmail(email, admins) {
  const e = normalizeEmail(email);
  if (!e) return false;
  const list = admins || parseAdminList(process.env.ADMIN_EMAILS);
  return list.has(e);
}
