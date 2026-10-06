import { currentUser } from "../../../lib/server-auth.js";
import { checklistAccess } from "../../../lib/product-access.js";
import { adminOf } from "../../../lib/access.js";
import { launchGuide } from "../../../lib/product.js";
import { json, failure } from "../../../lib/http.js";
import { db } from "../../../lib/db.js";
export const dynamic = "force-dynamic";
export async function GET() {
  try {
    const user = await currentUser();
    if (!user?.email_confirmed_at) return json({ error: "Sign in to download your checklist." }, 401);
    if (!adminOf(user) && !(await checklistAccess(user))) return json({ error: "Unlock the Launch Checklist first." }, 402);
    const { data, error } = await db().from("launch_orders").select("content").eq("user_id", user.id).neq("status", "released").maybeSingle();
    if (error) throw error;
    return new Response(data?.content || launchGuide(), { headers: { "content-type": "text/markdown; charset=utf-8", "content-disposition": 'attachment; filename="launchixis-launch-checklist.md"', "cache-control": "private, no-store" } });
  } catch (e) { return failure(e); }
}
