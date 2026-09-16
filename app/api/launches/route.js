import { db, ensureSeed, publicLaunch, slugify } from "../../../lib/db.js";
import { emptyItems, mergeItems } from "../../../lib/steps.js";

export const dynamic = "force-dynamic";

function json(data, status = 200) {
  return Response.json(data, { status });
}

function fail(err) {
  const status = err.status || 500;
  const message = err.message || "server_error";
  return json({ error: message }, status);
}

export async function GET() {
  try {
    const client = db();
    await ensureSeed(client);
    const { data, error } = await client
      .from("launches")
      .select("*")
      .order("created_at", { ascending: true });
    if (error) throw error;
    return json({ launches: (data || []).map(publicLaunch) });
  } catch (err) {
    return fail(err);
  }
}

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const name = String(body.name || "").trim();
    const one_liner = String(body.one_liner || "").trim();
    if (!name) return json({ error: "name_required" }, 400);
    const slug = slugify(body.slug || name);
    if (!slug) return json({ error: "slug_required" }, 400);

    const client = db();
    await ensureSeed(client);
    const row = {
      slug,
      name,
      one_liner,
      domain: String(body.domain || "").trim(),
      repo: String(body.repo || "").trim(),
      vercel_project: String(body.vercel_project || "").trim(),
      status: "active",
      notes: String(body.notes || "").trim(),
      items: emptyItems(),
    };
    const { data, error } = await client
      .from("launches")
      .insert(row)
      .select("*")
      .single();
    if (error) {
      if (error.code === "23505") return json({ error: "slug_taken" }, 409);
      throw error;
    }
    return json({ launch: publicLaunch(data) }, 201);
  } catch (err) {
    return fail(err);
  }
}

export async function PATCH(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const id = String(body.id || "").trim();
    if (!id) return json({ error: "id_required" }, 400);

    const client = db();
    const { data: current, error: getErr } = await client
      .from("launches")
      .select("*")
      .eq("id", id)
      .single();
    if (getErr) {
      if (getErr.code === "PGRST116") return json({ error: "not_found" }, 404);
      throw getErr;
    }

    const patch = { updated_at: new Date().toISOString() };
    for (const key of [
      "name",
      "one_liner",
      "domain",
      "repo",
      "vercel_project",
      "status",
      "notes",
    ]) {
      if (body[key] !== undefined) patch[key] = String(body[key] ?? "");
    }
    if (body.status) {
      const allowed = ["not_started", "active", "launched", "blocked"];
      if (!allowed.includes(body.status)) {
        return json({ error: "bad_status" }, 400);
      }
    }
    if (body.items) {
      patch.items = mergeItems(body.items);
    }
    if (body.toggle && body.toggle.id) {
      const items = mergeItems(current.items).map((i) =>
        i.id === body.toggle.id ? { ...i, done: Boolean(body.toggle.done) } : i
      );
      patch.items = items;
    }

    const { data, error } = await client
      .from("launches")
      .update(patch)
      .eq("id", id)
      .select("*")
      .single();
    if (error) throw error;
    return json({ launch: publicLaunch(data) });
  } catch (err) {
    return fail(err);
  }
}
