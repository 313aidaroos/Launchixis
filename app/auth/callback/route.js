import { redirect } from "next/navigation";
import { serverSupabase } from "../../../lib/server-auth.js";

export const dynamic = "force-dynamic";

export async function GET(request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") || "/";
  if (code) {
    const supabase = serverSupabase();
    await supabase.auth.exchangeCodeForSession(code);
  }
  redirect(next.startsWith("/") ? next : "/");
}
