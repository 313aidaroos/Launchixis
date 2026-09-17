import { readFileSync, existsSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

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

const env = loadEnvFile("/Users/awadalaiaroos/src/Launchixis/.env.local");
const client = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});
const { data, error } = await client
  .from("launches")
  .select("slug,name,created_at")
  .order("created_at", { ascending: true });
if (error) {
  console.log("error", error.message);
  process.exit(1);
}
console.log("db_count", data.length);
for (const r of data) console.log(r.slug);
