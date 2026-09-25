import { callCixyModel, isCixyHealthy } from "../../../lib/cixy.js";
import { limitByIp } from "../../../lib/rate-limit.js";

const MAX_CHARS = 2000;

export const dynamic = "force-dynamic";

export async function POST(request) {
  if (!isCixyHealthy()) {
    return Response.json(
      { error: "anthropic_api_key_missing" },
      { status: 503 }
    );
  }

  const limited = limitByIp(request, "cixy", 20);
  if (limited) return limited;

  try {
    const body = await request.json().catch(() => ({}));
    const userMessage = String(body.message || "").trim();

    if (!userMessage) {
      return Response.json(
        { error: "message_required" },
        { status: 400 }
      );
    }
    if (userMessage.length > MAX_CHARS) {
      return Response.json({ error: "message_too_long" }, { status: 400 });
    }

    const result = await callCixyModel(userMessage);
    
    if (!result.ok) {
      return Response.json(
        { error: result.error },
        { status: result.status || 500 }
      );
    }

    return Response.json({ text: result.text });
  } catch (err) {
    return Response.json(
      { error: err.message || "server_error" },
      { status: 500 }
    );
  }
}
