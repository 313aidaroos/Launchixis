import { cleanTicketInput, validateTicketInput, normalizeTicketStatus } from "./support.js";
import { adminOf } from "./access.js";
import { json, failure, problem, readJson, sameOrigin } from "./http.js";
export function supportHandlers({ user, db, limit }) {
  async function admin() {
    if (!adminOf(await user())) throw problem("Administrator access required.", 403);
  }
  return {
    POST: async request => {
      try {
        sameOrigin(request);
        const limited = await limit(request, "support", 5); if (limited) return limited;
        const ticket = cleanTicketInput(await readJson(request));
        const errors = validateTicketInput(ticket);
        if (errors.length) throw problem(errors[0]);
        const { data, error } = await db().from("support_tickets").insert(ticket).select("id").single();
        if (error) throw error;
        return json({ ok: true, ticket: { id: data.id } }, 201);
      } catch (e) { return failure(e); }
    },
    GET: async request => {
      try {
        await admin();
        const status = new URL(request.url).searchParams.get("status") || "new";
        if (status !== "all" && !normalizeTicketStatus(status)) throw problem("Invalid ticket status.");
        let query = db().from("support_tickets").select("*").order("created_at", { ascending: false }).limit(100);
        if (status !== "all") query = query.eq("status", status);
        const { data, error } = await query;
        if (error) throw error;
        return json({ tickets: data || [] });
      } catch (e) { return failure(e); }
    },
    PATCH: async request => {
      try {
        sameOrigin(request); await admin();
        const body = await readJson(request);
        const status = normalizeTicketStatus(body.status);
        if (!status || !/^[0-9a-f-]{36}$/i.test(body.id || "") || !body.updated_at) throw problem("Invalid ticket update.");
        const { data, error } = await db().from("support_tickets").update({ status, updated_at: new Date().toISOString() }).eq("id", body.id).eq("updated_at", body.updated_at).select("*").maybeSingle();
        if (error) throw error;
        if (!data) throw problem("Ticket changed. Refresh the queue and try again.", 409);
        return json({ ticket: data });
      } catch (e) { return failure(e); }
    },
  };
}
