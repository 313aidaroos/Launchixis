export function json(data, status = 200) {
  return Response.json(data, { status, headers: { "cache-control": "private, no-store" } });
}
export function failure(error) {
  console.error("request_failed", error?.code || error?.name || "unknown");
  return json({ error: error?.status ? error.message : "Something went wrong. Please try again." }, error?.status || 503);
}
export function problem(message, status = 400) {
  return Object.assign(new Error(message), { status });
}
export async function readJson(request, maxBytes = 20000) {
  if (Number(request.headers.get("content-length")) > maxBytes) throw problem("Request is too large.", 413);
  const reader = request.body?.getReader();
  if (!reader) throw problem("Request body is required.");
  const chunks = []; let size = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > maxBytes) { await reader.cancel(); throw problem("Request is too large.", 413); }
    chunks.push(value);
  }
  try {
    const body = JSON.parse(Buffer.concat(chunks).toString("utf8"));
    if (!body || Array.isArray(body) || typeof body !== "object") throw new Error();
    return body;
  } catch { throw problem("Invalid request."); }
}
export function sameOrigin(request) {
  const origin = request.headers.get("origin");
  const allowed = new Set([new URL(request.url).origin, process.env.APP_URL, process.env.NEXT_PUBLIC_SITE_URL].filter(Boolean));
  if (origin && !allowed.has(origin)) throw problem("Request origin is not allowed.", 403);
}
