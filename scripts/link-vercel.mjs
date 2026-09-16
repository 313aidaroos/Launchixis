import { readFileSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const HERMES_ENV = "/Users/awadalaiaroos/.hermes/.env";
const ROOT = resolve(import.meta.dirname, "..");

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

const token = loadEnvFile(HERMES_ENV).VERCEL_TOKEN;
const meta = JSON.parse(readFileSync(resolve(ROOT, ".vercel-project.json"), "utf8"));

async function vfetch(path, { method = "GET", body } = {}) {
  const res = await fetch(`https://api.vercel.com${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { raw: text.slice(0, 500) };
  }
  return { ok: res.ok, status: res.status, data };
}

const proj = await vfetch(`/v9/projects/${meta.projectId}`);
if (!proj.ok) {
  console.error("project_get_failed", proj.status);
  process.exit(1);
}
const accountId = proj.data.accountId;
console.log("account", accountId);
console.log("framework", proj.data.framework);
console.log("link", proj.data.link?.org || proj.data.link?.repo || "none");

mkdirSync(resolve(ROOT, ".vercel"), { recursive: true });
writeFileSync(
  resolve(ROOT, ".vercel/project.json"),
  JSON.stringify({ orgId: accountId, projectId: meta.projectId }, null, 2)
);

if (!proj.data.link) {
  const linked = await vfetch(`/v9/projects/${meta.projectId}/link`, {
    method: "POST",
    body: { type: "github", repo: "313aidaroos/Launchixis" },
  });
  console.log(
    "git_link",
    linked.status,
    linked.data?.error?.code || linked.data?.error?.message || "ok"
  );
} else {
  console.log("already_linked");
}
