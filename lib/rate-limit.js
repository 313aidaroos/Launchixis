import { createHash } from "node:crypto";
import { db } from "./db.js";
export function clientIp(request) {
  return request.headers.get("x-vercel-forwarded-for")?.split(",")[0]?.trim()
    || request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}
export async function limitByIp(request, route, max, windowMs = 10 * 60 * 1000, client) {
  const key = createHash("sha256").update(`${route}:${clientIp(request)}`).digest("hex");
  try {
    client ||= db();
    const { data, error } = await client.rpc("consume_rate_limit", { p_key: key, p_limit: max, p_window_seconds: Math.ceil(windowMs / 1000) });
    if (error) throw error;
    if (data) return null;
    return Response.json({ error: "Too many requests. Please try again later." }, { status: 429, headers: { "Retry-After": String(Math.ceil(windowMs / 1000)) } });
  } catch {
    return Response.json({ error: "This service is temporarily unavailable. Please try again." }, { status: 503 });
  }
}
