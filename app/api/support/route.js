import { db } from "../../../lib/db.js";
import { currentUser } from "../../../lib/server-auth.js";
import { limitByIp } from "../../../lib/rate-limit.js";
import { supportHandlers } from "../../../lib/support-handlers.js";
export const dynamic = "force-dynamic";
const handlers = supportHandlers({ db, user: currentUser, limit: limitByIp });
export const GET = handlers.GET;
export const POST = handlers.POST;
export const PATCH = handlers.PATCH;
