import { isAdminEmail, parseAdminList } from "./auth.js";

export function canWriteLaunches(email, adminEnv = process.env.ADMIN_EMAILS) {
  return isAdminEmail(email, parseAdminList(adminEnv));
}

export function requireAdminEmail(email, adminEnv = process.env.ADMIN_EMAILS) {
  if (canWriteLaunches(email, adminEnv)) return { ok: true };
  return { ok: false, status: 403, error: "admin_required" };
}
