import { hasEntitlement } from "./apixis-wallet.ts";
import { CHECKLIST_PRODUCT } from "./product.js";
export function walletOwner(user) {
  if (!user?.email_confirmed_at) return null;
  return user.app_metadata?.apixis_sub || user.email;
}
export async function checklistAccess(user) {
  const owner = walletOwner(user);
  return owner ? hasEntitlement(owner, "launchixis", CHECKLIST_PRODUCT) : false;
}
