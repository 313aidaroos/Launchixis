// Change note (Claude, Sep 2026): Rate limited. See docs/LAUNCH_NOTES.md.
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
    // 2026-10-04 (Grok, Apixis ID only): existing accounts only; new accounts use Apixis ID.
    options: { shouldCreateUser: false, emailRedirectTo: `${appUrl()}/auth/callback` },
  });
  if (error) {
    if (/signups? not allowed|otp_disabled|user not found/i.test(`${error.code ?? ""} ${error.message}`)) {
      return Response.json(
        {
          error: "No Launchixis account uses this email yet. New here? Use Sign in with Apixis to create your account.",
          apixis_id_url: "/auth/apixis/start?next=%2F",
        },
        { status: 404 }
      );
    }
    return Response.json({ error: error.message }, { status: 400 });
  }
  return Response.json({ ok: true, email });
}
