import { randomUUID } from "node:crypto";
import { CHECKLIST_PRODUCT } from "./product.js";
export function purchaseStore(client) {
  async function check(result) { if (result.error) throw result.error; return result.data; }
  return {
    async claim(userId, attemptId, content, templateVersion) {
      const existing = await check(await client.from("launch_orders").select("*").eq("user_id", userId).eq("attempt_id", attemptId).maybeSingle());
      if (existing) return existing;
      const result = await client.from("launch_orders").insert({ id: randomUUID(), user_id: userId, attempt_id: attemptId, product_key: CHECKLIST_PRODUCT, content, template_version: templateVersion }).select("*").single();
      if (result.error?.code !== "23505") return check(result);
      const active = await check(await client.from("launch_orders").select("*").eq("user_id", userId).eq("product_key", CHECKLIST_PRODUCT).in("status", ["pending", "captured"]).maybeSingle());
      if (!active) throw result.error;
      return active;
    },
    async provision(id, reservationId) {
      const rows = await check(await client.from("launch_orders").update({ reservation_id: reservationId }).eq("id", id).eq("status", "pending").select("id"));
      if (!rows?.length) {
        const order = await this.get(id);
        if (order?.status !== "captured") throw new Error("Order is no longer available.");
      }
    },
    async released(id) { await check(await client.from("launch_orders").update({ status: "released" }).eq("id", id).eq("status", "pending")); },
    async captured(id, receiptId) { await check(await client.from("launch_orders").update({ status: "captured", receipt_id: receiptId }).eq("id", id)); },
    async get(id) { return check(await client.from("launch_orders").select("*").eq("id", id).single()); },
  };
}
