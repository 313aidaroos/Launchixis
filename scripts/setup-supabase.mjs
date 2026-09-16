import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { randomBytes } from "node:crypto";

const ROOT = resolve(import.meta.dirname, "..");
const ENV_LOCAL = resolve(ROOT, ".env.local");
const SCHEMA = readFileSync(resolve(ROOT, "scripts/schema.sql"), "utf8");
const HERMES_ENV = "/Users/awadalaiaroos/.hermes/.env";
const ORG = "aqrfqmskbwxyfdzaibue";
const NAME = "launchixis";

function loadEnvFile(path) {
  if (!existsSync(path)) return {};
  const out = {};
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i < 1) continue;
    let v = t.slice(i + 1);
    if (
      (v.startsWith('"') && v.endsWith('"')) ||
      (v.startsWith("'") && v.endsWith("'"))
    ) {
      v = v.slice(1, -1);
    }
    out[t.slice(0, i)] = v;
  }
  return out;
}

function writeEnvLocal(map) {
  const existing = loadEnvFile(ENV_LOCAL);
  const merged = { ...existing, ...map };
  const body = Object.entries(merged)
    .map(([k, v]) => `${k}=${v}`)
    .join("\n");
  writeFileSync(ENV_LOCAL, body + "\n", { mode: 0o600 });
}

async function api(path, { method = "GET", body, token } = {}) {
  const res = await fetch(`https://api.supabase.com${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      apikey: token,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { raw: text.slice(0, 400) };
  }
  return { ok: res.ok, status: res.status, data };
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

const hermes = loadEnvFile(HERMES_ENV);
const token = hermes.SUPABASE_ACCESS_TOKEN || process.env.SUPABASE_ACCESS_TOKEN;
if (!token) {
  console.error("missing SUPABASE_ACCESS_TOKEN");
  process.exit(1);
}

const listed = await api("/v1/projects", { token });
if (!listed.ok) {
  console.error("list_projects_failed", listed.status);
  process.exit(1);
}
let project = (listed.data || []).find((p) => p.name === NAME);

if (!project) {
  const dbPass = randomBytes(24).toString("base64url") + "Aa1!";
  writeEnvLocal({ SUPABASE_DB_PASSWORD: dbPass });
  const created = await api("/v1/projects", {
    token,
    method: "POST",
    body: {
      name: NAME,
      organization_id: ORG,
      region: "us-east-1",
      db_pass: dbPass,
    },
  });
  if (!created.ok) {
    console.error("create_project_failed", created.status);
    process.exit(1);
  }
  project = created.data;
  console.log("created", project.ref, project.status);
} else {
  console.log("exists", project.ref, project.status);
}

let status = project.status;
for (let i = 0; i < 40 && status !== "ACTIVE_HEALTHY"; i++) {
  await sleep(5000);
  const again = await api("/v1/projects", { token });
  const p = (again.data || []).find((x) => x.id === project.id || x.ref === project.ref);
  status = p?.status || status;
  console.log("status", status);
}
if (status !== "ACTIVE_HEALTHY") {
  console.error("project_not_healthy", status);
  process.exit(1);
}

const keys = await api(`/v1/projects/${project.ref}/api-keys`, { token });
if (!keys.ok) {
  console.error("keys_failed", keys.status);
  process.exit(1);
}
const list = Array.isArray(keys.data) ? keys.data : [];
const anon = list.find((k) => k.name === "anon")?.api_key;
const service = list.find((k) => k.name === "service_role")?.api_key;
if (!anon || !service) {
  console.error("keys_missing", list.map((k) => k.name).join(","));
  process.exit(1);
}

writeEnvLocal({
  SUPABASE_URL: `https://${project.ref}.supabase.co`,
  SUPABASE_ANON_KEY: anon,
  SUPABASE_SERVICE_ROLE_KEY: service,
  NEXT_PUBLIC_SUPABASE_URL: `https://${project.ref}.supabase.co`,
});
console.log("env_local_written", project.ref);

const q = await api(`/v1/projects/${project.ref}/database/query`, {
  token,
  method: "POST",
  body: { query: SCHEMA },
});
if (!q.ok) {
  console.error("schema_via_mgmt_failed", q.status);
  const { createClient } = await import("@supabase/supabase-js");
  // fallback: try rpc later; still write env
} else {
  console.log("schema_ok");
}

console.log("done", NAME, project.ref);
