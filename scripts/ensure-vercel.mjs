import { readFileSync, existsSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const ROOT = resolve(import.meta.dirname, "..");
const ENV_LOCAL = resolve(ROOT, ".env.local");
const HERMES_ENV = "/Users/awadalaiaroos/.hermes/.env";

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

const local = loadEnvFile(ENV_LOCAL);
const hermes = loadEnvFile(HERMES_ENV);
const vercelToken = hermes.VERCEL_TOKEN || process.env.VERCEL_TOKEN;
if (!vercelToken) {
  console.error("missing VERCEL_TOKEN");
  process.exit(1);
}
if (!local.SUPABASE_URL || !local.SUPABASE_SERVICE_ROLE_KEY) {
  console.error("missing supabase env in .env.local");
  process.exit(1);
}

async function vfetch(path, { method = "GET", body } = {}) {
  const res = await fetch(`https://api.vercel.com${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${vercelToken}`,
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

const who = await vfetch("/v2/user");
if (!who.ok) {
  console.error("vercel_whoami_failed", who.status);
  process.exit(1);
}
const user = who.data.user || who.data;
console.log("vercel_user", user.username || user.id);

let projects = await vfetch("/v9/projects?limit=100");
if (!projects.ok) {
  console.error("list_projects_failed", projects.status);
  process.exit(1);
}
let project = (projects.data.projects || []).find((p) => p.name === "launchixis");
if (!project) {
  const created = await vfetch("/v11/projects", {
    method: "POST",
    body: {
      name: "launchixis",
      framework: "nextjs",
      gitRepository: {
        type: "github",
        repo: "313aidaroos/Launchixis",
      },
    },
  });
  if (!created.ok) {
    console.log("create_with_git_failed", created.status, created.data?.error?.code || created.data?.error?.message);
    const created2 = await vfetch("/v11/projects", {
      method: "POST",
      body: { name: "launchixis", framework: "nextjs" },
    });
    if (!created2.ok) {
      console.error("create_project_failed", created2.status);
      process.exit(1);
    }
    project = created2.data;
  } else {
    project = created.data;
  }
  console.log("created_project", project.name, project.id);
} else {
  console.log("existing_project", project.name, project.id);
}

const envs = [
  { key: "SUPABASE_URL", value: local.SUPABASE_URL, target: ["production", "preview", "development"] },
  { key: "SUPABASE_SERVICE_ROLE_KEY", value: local.SUPABASE_SERVICE_ROLE_KEY, target: ["production", "preview", "development"] },
  { key: "SUPABASE_ANON_KEY", value: local.SUPABASE_ANON_KEY, target: ["production", "preview", "development"] },
];

const existingEnv = await vfetch(`/v9/projects/${project.id}/env`);
const have = new Set((existingEnv.data?.envs || []).map((e) => e.key));
for (const row of envs) {
  if (!row.value) continue;
  if (have.has(row.key)) {
    console.log("env_exists", row.key);
    continue;
  }
  const add = await vfetch(`/v10/projects/${project.id}/env`, {
    method: "POST",
    body: {
      key: row.key,
      value: row.value,
      type: "encrypted",
      target: row.target,
    },
  });
  console.log(add.ok ? "env_added" : "env_add_failed", row.key, add.status);
}

const linkPath = resolve(ROOT, ".vercel/project.json");
writeFileSync(
  resolve(ROOT, ".vercel-project.json"),
  JSON.stringify({ projectId: project.id, name: project.name }, null, 2)
);
console.log("ready", project.name, project.id);
