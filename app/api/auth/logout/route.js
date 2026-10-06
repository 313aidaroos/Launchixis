import { serverSupabase } from "../../../../lib/server-auth.js";

export const dynamic = "force-dynamic";

export async function POST() {
  const supabase = await serverSupabase();
  await supabase.auth.signOut();
  return Response.json({ ok: true });
}
