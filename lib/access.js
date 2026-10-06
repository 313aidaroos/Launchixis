import { isAdminEmail } from "./auth.js";
export function adminOf(user) { return Boolean(user?.email_confirmed_at && isAdminEmail(user.email)); }
export function canAccessLaunch(user, launch) {
  return Boolean(user?.email_confirmed_at && (adminOf(user) || (launch.owner_id && launch.owner_id === user.id)));
}
export function scopeLaunches(query, user) {
  return adminOf(user) ? query : query.eq("owner_id", user.id);
}
