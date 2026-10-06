import { redirect } from "next/navigation";
import { serverSupabase } from "../../../lib/server-auth.js";
import { safeLocalRedirect } from "../../../lib/apixis-redirect.ts";

export const dynamic = "force-dynamic";
export async function GET(request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = safeLocalRedirect(url.searchParams.get("next"));
  if (!code) redirect("/login?error=login_expired");
  const supabase = await serverSupabase();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) redirect("/login?error=login_expired");
  redirect(next);
}
