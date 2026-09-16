import { createClient } from "@supabase/supabase-js";
import { FAMILY_SEED, mergeItems } from "./steps.js";

function required(name) {
  const v = process.env[name];
  if (!v) {
    const err = new Error(`missing_${name}`);
    err.status = 503;
    throw err;
  }
  return v;
}

export function db() {
  const url = required("SUPABASE_URL");
  const key = required("SUPABASE_SERVICE_ROLE_KEY");
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export async function ensureSeed(client) {
  const { count, error } = await client
    .from("launches")
    .select("id", { count: "exact", head: true });
  if (error) throw error;
  if (count && count > 0) return;
  const rows = FAMILY_SEED.map((c) => ({
    slug: c.slug,
    name: c.name,
    one_liner: c.one_liner,
    domain: c.domain,
    repo: c.repo,
    vercel_project: c.vercel_project,
    status: c.status,
    notes: c.notes,
    items: mergeItems(c.items),
  }));
  const { error: insErr } = await client.from("launches").insert(rows);
  if (insErr && insErr.code !== "23505") throw insErr;
}

export function publicLaunch(row) {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    one_liner: row.one_liner,
    domain: row.domain,
    repo: row.repo,
    vercel_project: row.vercel_project,
    status: row.status,
    notes: row.notes,
    items: mergeItems(row.items),
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

export function slugify(name) {
  return String(name || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
}
