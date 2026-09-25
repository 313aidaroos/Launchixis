import Board from "./board.jsx";
import { db, ensureSeed, publicLaunch } from "../lib/db.js";

export const dynamic = "force-dynamic";

async function loadLaunches() {
  const client = db();
  await ensureSeed(client);
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const res = await fetch(
    `${url}/rest/v1/launches?select=*&order=name.asc&limit=100`,
    {
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        Prefer: "count=exact",
      },
      cache: "no-store",
    }
  );
  if (!res.ok) {
    throw new Error(`launches_fetch_${res.status}`);
  }
  const data = await res.json();
  return (data || []).map(publicLaunch);
}

export default async function Page() {
  // A database hiccup should not take the whole board down: the board reloads
  // from /api/launches in the browser and shows its own error there.
  const initialLaunches = await loadLaunches().catch((e) => {
    console.error("launches_initial_load_failed", e?.message ?? e);
    return [];
  });
  return <Board initialLaunches={initialLaunches} />;
}
