import { quote } from "../../../lib/apixis-wallet.ts";
import { currentUser } from "../../../lib/server-auth.js";
import { checklistAccess } from "../../../lib/product-access.js";
import { CHECKLIST_PRODUCT } from "../../../lib/product.js";
import { json, failure } from "../../../lib/http.js";
export const dynamic = "force-dynamic";
export async function GET() {
  try {
    const user = await currentUser();
    const [price, owned] = await Promise.all([quote(CHECKLIST_PRODUCT), user?.email_confirmed_at ? checklistAccess(user) : false]);
    return json({ price: price.xp, owned, signedIn: Boolean(user?.app_metadata?.apixis_sub && user?.email_confirmed_at) });
  } catch (e) { return failure(e); }
}
