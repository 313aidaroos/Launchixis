import { serverSupabase } from "../../../../lib/server-auth.js";
import { limitByIp } from "../../../../lib/rate-limit.js";
import { isValidEmail, normalizeEmail } from "../../../../lib/auth.js";

export const dynamic = "force-dynamic";

function appUrl() {
  return process.env.APP_URL || "https://launchixis.vercel.app";
}

export async function POST(request) {
  const limited = limitByIp(request, "magic-link", 5);
  if (limited) return limited;
  const body = await request.json().catch(() => ({}));
  const email = normalizeEmail(body.email);
  if (!isValidEmail(email)) {
    return Response.json({ error: "valid_email_required" }, { status: 400 });
  }
  const supabase = serverSupabase();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: `${appUrl()}/auth/callback` },
  });
  if (error) {
    return Response.json({ error: error.message }, { status: 400 });
  }
  return Response.json({ ok: true, email });
}
