import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { isAdminEmail } from "./auth.js";

export async function serverSupabase() {
  const jar = await cookies();
  return createServerClient(
    process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { cookies: {
      getAll: () => jar.getAll(),
      setAll: (list) => {
        try { list.forEach(({ name, value, options }) => jar.set(name, value, options)); }
        catch { /* Server Components cannot set cookies; the next route request refreshes them. */ }
      },
    } }
  );
}

export async function currentUser() {
  if (!(process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL)) return null;
  const supabase = await serverSupabase();
  const { data, error } = await supabase.auth.getUser();
  if (error) return null;
  return data?.user || null;
}

export function isVerifiedAdmin(user) {
  return Boolean(user?.email_confirmed_at && isAdminEmail(user.email));
}

export async function requireUser() {
  const user = await currentUser();
  if (!user?.email_confirmed_at) return { ok: false, status: 401, error: "Sign in with Apixis to continue." };
  return { ok: true, user, admin: isVerifiedAdmin(user) };
}

export async function requireAdminUser() {
  const auth = await requireUser();
  if (!auth.ok) return auth;
  if (!auth.admin) return { ...auth, ok: false, status: 403, error: "admin_required" };
  return auth;
}
