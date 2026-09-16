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
  const initialLaunches = await loadLaunches();
  return <Board initialLaunches={initialLaunches} />;
}
