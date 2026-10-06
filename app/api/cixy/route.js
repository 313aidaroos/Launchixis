import { callCixyModel } from "../../../lib/cixy.js";
import { limitByIp } from "../../../lib/rate-limit.js";
import { currentUser } from "../../../lib/server-auth.js";
import { db } from "../../../lib/db.js";
import { scopeLaunches, adminOf } from "../../../lib/access.js";
import { checklistAccess } from "../../../lib/product-access.js";
import { json, failure, readJson, sameOrigin, problem } from "../../../lib/http.js";
export const dynamic = "force-dynamic";
export async function POST(request) {
  try {
    sameOrigin(request);
    const user = await currentUser();
    if (!user?.email_confirmed_at) return json({ error: "Sign in with Apixis to use Cixy." }, 401);
    if (!adminOf(user) && !(await checklistAccess(user))) return json({ error: "Unlock the Launch Checklist to use Cixy." }, 402);
    const limited = await limitByIp(request, "cixy", 20); if (limited) return limited;
    const body = await readJson(request, 24000);
    if (typeof body.message !== "string" || !body.message.trim() || body.message.length > 2000) throw problem("Please enter a message of up to 2,000 characters.");
    let launch = null;
    if (body.launchId) {
      const { data, error } = await scopeLaunches(db().from("launches").select("name,one_liner,status,notes,items").eq("id", body.launchId), user).maybeSingle();
      if (error) throw error;
      if (!data) throw problem("Launch not found.", 404);
      launch = data;
    }
    const result = await callCixyModel(body.message, process.env, { history: body.history, launch });
    return json(result.ok ? { text: result.text } : { error: result.error }, result.ok ? 200 : result.status);
  } catch(e) { return failure(e); }
}
