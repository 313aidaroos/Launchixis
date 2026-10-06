import * as wallet from "../../../lib/apixis-wallet.ts";
import { currentUser } from "../../../lib/server-auth.js";
import { db } from "../../../lib/db.js";
import { purchaseStore } from "../../../lib/purchase-store.js";
import { purchaseChecklist } from "../../../lib/purchase-service.js";
import { json, failure, readJson, sameOrigin } from "../../../lib/http.js";
import { limitByIp } from "../../../lib/rate-limit.js";
export const dynamic = "force-dynamic";
export async function POST(request) {
  try {
    sameOrigin(request);
    const user = await currentUser();
    if (!user?.email_confirmed_at) return json({ error: "Sign in with Apixis to purchase." }, 401);
    const limited = await limitByIp(request, "redeem", 10); if (limited) return limited;
    const body = await readJson(request);
    const result = await purchaseChecklist({ user, attemptId: body.attemptId, productKey: body.productKey }, { store: purchaseStore(db()), wallet });
    if (!result.ok) return json({ ...result, error: "You need more Ixis to unlock this checklist.", buyUrl: wallet.buyIxisUrl("launchixis", new URL("/pricing", process.env.APP_URL || request.url).toString()) }, 402);
    return json({ ...result, download: "/api/checklist", workspace: "/" });
  } catch (e) { return failure(e); }
}
