import { currentUser } from "../../../../lib/server-auth.js";
import { isAdminEmail } from "../../../../lib/auth.js";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await currentUser();
  return Response.json({
    user: user ? { id: user.id, email: user.email } : null,
    admin: Boolean(user?.email && isAdminEmail(user.email)),
  });
}
