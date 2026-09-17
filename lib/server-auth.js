import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { requireAdminEmail } from "./admin.js";

export function serverSupabase() {
  const cookieStore = cookies();
  return createServerClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name) {
          return cookieStore.get(name)?.value;
        },
        set(name, value, options) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name, options) {
          cookieStore.set({ name, value: "", ...options });
        },
      },
    }
  );
}

export async function currentUser() {
  const supabase = serverSupabase();
  const { data } = await supabase.auth.getUser();
  return data?.user || null;
}

export async function requireAdminUser() {
  const user = await currentUser();
  const gate = requireAdminEmail(user?.email);
  if (!gate.ok) return { ...gate, user };
  return { ok: true, user };
}
