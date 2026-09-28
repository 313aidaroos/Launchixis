// Change note (Claude, Sep 2026): Rate limited. See docs/LAUNCH_NOTES.md.
import { db } from "../../../lib/db.js";
import { limitByIp } from "../../../lib/rate-limit.js";
import { cleanTicketInput, validateTicketInput } from "../../../lib/support.js";

export const dynamic = "force-dynamic";

export async function POST(request) {
  const limited = limitByIp(request, "support", 5);
  if (limited) return limited;
  try {
    const body = await request.json().catch(() => ({}));
    const ticket = cleanTicketInput(body);
    const errors = validateTicketInput(ticket);

    if (errors.length > 0) {
      return Response.json({ error: errors[0] }, { status: 400 });
    }

    const client = db();
    const { data, error } = await client
      .from("support_tickets")
      .insert({
        email: ticket.email,
        subject: ticket.subject,
        message: ticket.message,
        company_slug: ticket.company_slug,
        source_inbox: ticket.source_inbox,
        route_to: ticket.route_to,
        status: ticket.status,
      })
      .select("*")
      .single();

    if (error) {
      throw error;
    }

    return Response.json({ ok: true, ticket: { id: data.id } }, { status: 201 });
  } catch (err) {
    return Response.json(
      { error: err.message || "server_error" },
      { status: 500 }
    );
  }
}
