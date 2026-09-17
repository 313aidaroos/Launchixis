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
const names = [
  "launchixis",
  "apixis-dev-1iqh",
  "apixis-dev",
  "socixis",
  "awadbot",
  "awad-command",
  "personalcontentbot",
  "contraxis-dev",
  "halaxis",
  "lyrixis",
  "qahwahworld",
  "rawixis",
  "recovra",
  "geoxis",
];

const list = await fetch("https://api.vercel.com/v9/projects?limit=100", {
  headers: { Authorization: `Bearer ${token}` },
});
const data = await list.json();
const projects = data.projects || [];
for (const n of names) {
  const p = projects.find((x) => x.name === n);
  if (!p) {
    console.log(n, "MISSING");
    continue;
  }
  const targets = (p.targets && p.targets.production && p.targets.production.alias) || [];
  const aliases = (p.alias || []).slice(0, 8);
  console.log(
    n,
    "prod",
    p.targets?.production?.url || "",
    "aliases",
    (targets.length ? targets : aliases).join(",")
  );
}
