import { readFileSync, existsSync } from "node:fs";

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

const token = loadEnvFile("/Users/awadalaiaroos/.hermes/.env").VERCEL_TOKEN;
const res = await fetch(
  "https://api.vercel.com/v9/projects/launchixis?teamId=team_EP0sTs9ASamDfhs6j043ktTH",
  { headers: { Authorization: `Bearer ${token}` } }
);
const p = await res.json();
const prod = p.targets?.production;
console.log("prod_url", prod?.url);
console.log("prod_meta", prod?.meta?.githubCommitSha || prod?.meta?.githubCommitMessage);
console.log("alias", (p.alias || []).slice(0, 5).join(","));
