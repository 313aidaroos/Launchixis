import { createClient } from "@supabase/supabase-js";
import { FAMILY_SEED, LIVE_HOSTS, liveUrl, mergeItems } from "./steps.js";

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
  const { data: existing, error } = await client.from("launches").select("slug");
  if (error) throw error;
  const have = new Set((existing || []).map((r) => r.slug));
  const missing = FAMILY_SEED.filter((c) => !have.has(c.slug)).map((c) => ({
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
  if (missing.length) {
    const { error: insErr } = await client.from("launches").insert(missing);
    if (insErr && insErr.code !== "23505") throw insErr;
  }
  await backfillLiveHosts(client);
}

async function backfillLiveHosts(client) {
  const { data, error } = await client.from("launches").select("id, slug, domain");
  if (error || !data) return;
  const now = new Date().toISOString();
  for (const row of data) {
    const host = LIVE_HOSTS[row.slug];
    if (!host) continue;
    if (row.domain === host) continue;
    if (row.domain && row.domain !== host && !String(row.domain).includes("vercel.app")) {
      continue;
    }
    await client.from("launches").update({ domain: host, updated_at: now }).eq("id", row.id);
  }
}

export function publicLaunch(row) {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    one_liner: row.one_liner,
    domain: row.domain,
    live_url: liveUrl(row),
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
