import Board from "./board.jsx";
import { db, ensureSeed, publicLaunch } from "../lib/db.js";

export const dynamic = "force-dynamic";

async function loadLaunches() {
  const client = db();
  await ensureSeed(client);
  const { data, error } = await client
    .from("launches")
    .select("*")
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data || []).map(publicLaunch);
}

export default async function Page() {
  const initialLaunches = await loadLaunches();
  return <Board initialLaunches={initialLaunches} />;
}
