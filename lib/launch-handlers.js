import { randomUUID } from "node:crypto";
import { emptyItems, mergeItems, LAUNCH_STEPS } from "./steps.js";
import { adminOf, scopeLaunches } from "./access.js";
import { json, failure, problem, readJson, sameOrigin } from "./http.js";

const statuses = ["not_started", "active", "launched", "blocked"];
const limits = { name: 120, one_liner: 500, domain: 253, repo: 200, vercel_project: 100, notes: 5000 };
export function launchPatch(body, current) {
  const patch = {};
  for (const [key, max] of Object.entries(limits)) {
    if (body[key] === undefined) continue;
    if (typeof body[key] !== "string" || body[key].length > max) throw problem(`Invalid ${key}.`);
    patch[key] = body[key].trim();
  }
  if (patch.name === "") throw problem("Company name is required.");
  if (body.status !== undefined) {
    if (!statuses.includes(body.status)) throw problem("Invalid launch status.");
    patch.status = body.status;
  }
  if (body.toggle) {
    if (!LAUNCH_STEPS.some(s => s.id === body.toggle.id) || typeof body.toggle.done !== "boolean") throw problem("Invalid checklist item.");
    patch.items = mergeItems(current.items).map(i => i.id === body.toggle.id ? { ...i, done: body.toggle.done } : i);
  }
  return patch;
}

export function launchHandlers({ user: getUser, db, serialize, entitled, limit }) {
  async function user() {
    const u = await getUser();
    if (!u?.email_confirmed_at) throw problem("Sign in with Apixis to open your workspace.", 401);
    return u;
  }
  return {
    GET: async () => {
      try {
        const u = await user();
        const client = db();
        const { data, error } = await scopeLaunches(client.from("launches").select("*"), u).order("name");
        if (error) throw error;
        let unlocked = adminOf(u), accessError = false;
        if (!unlocked) { try { unlocked = await entitled(u); } catch { accessError = true; } }
        let newTickets = 0;
        if (adminOf(u)) {
          const result = await client.from("support_tickets").select("id", { count: "exact", head: true }).eq("status", "new");
          if (!result.error) newTickets = result.count || 0;
        }
        return json({ launches: (data || []).map(serialize), admin: adminOf(u), unlocked, accessError, newTickets });
      } catch (e) { return failure(e); }
    },
    POST: async request => {
      try {
        sameOrigin(request);
        const u = await user();
        const limited = await limit(request, "launch-create", 10); if (limited) return limited;
        const body = await readJson(request);
        const clean = launchPatch(body, { items: [] });
        if (!clean.name) throw problem("Company name is required.");
        const row = { ...clean, id: randomUUID(), slug: `launch-${randomUUID()}`, owner_id: adminOf(u) ? null : u.id, status: "not_started", items: emptyItems() };
        const { data, error } = await db().from("launches").insert(row).select("*").single();
        if (error?.code === "23505") throw problem("Your private launch workspace already exists. Reload the board.", 409);
        if (error) throw error;
        return json({ launch: serialize(data) }, 201);
      } catch (e) { return failure(e); }
    },
    PATCH: async request => {
      try {
        sameOrigin(request);
        const u = await user();
        const body = await readJson(request);
        if (!/^[0-9a-f-]{36}$/i.test(body.id || "") || !Number.isSafeInteger(body.version) || body.version < 1) throw problem("Reload the launch before saving.");
        const client = db();
        const { data: current, error } = await scopeLaunches(client.from("launches").select("*").eq("id", body.id), u).maybeSingle();
        if (error) throw error;
        if (!current) throw problem("Launch not found.", 404);
        if (!adminOf(u) && !(await entitled(u))) throw problem("Unlock the Launch Checklist to edit your launch.", 402);
        const patch = launchPatch(body, current);
        const { data, error: saveError } = await scopeLaunches(client.from("launches").update({ ...patch, version: body.version + 1, updated_at: new Date().toISOString() }).eq("id", body.id).eq("version", body.version), u).select("*").maybeSingle();
        if (saveError) throw saveError;
        if (!data) throw problem("This launch changed in another session. Reload it before saving your changes.", 409);
        return json({ launch: serialize(data) });
      } catch (e) { return failure(e); }
    },
  };
}
