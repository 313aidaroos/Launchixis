// Per-instance limiter for public routes that spend money (AI) or send email. Serverless
// instances don't share memory: a speed bump against scripted abuse, not a global quota.
const buckets = new Map();

export function clientIp(request) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}

export function limitByIp(request, route, max, windowMs = 10 * 60 * 1000, now = Date.now()) {
  const key = `${route}:${clientIp(request)}`;
  const recent = (buckets.get(key) || []).filter((t) => now - t < windowMs);
  recent.push(now);
  buckets.set(key, recent);
  if (buckets.size > 5000) buckets.clear();
  if (recent.length <= max) return null;
  return Response.json({ error: "rate_limited", message: "Too many requests. Please wait a few minutes." }, { status: 429 });
}
