import { redeem, buyIxisUrl } from "../../../lib/apixis-wallet.ts";
import { currentUser } from "../../../lib/server-auth.js";
import { apixisOwner } from "@/lib/apixis-login";

export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    // Auth check BEFORE reading body (money route safety)
    const user = await currentUser();
    if (!user?.email) {
      return Response.json(
        { error: "auth_required", message: "Sign in to redeem" },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const productKey = String(body.productKey || "").trim();
    const attemptId = String(body.attemptId || "").trim();
    
    if (!productKey) {
      return Response.json({ error: "product_key_required" }, { status: 400 });
    }

    if (!attemptId || attemptId.length > 80) {
      return Response.json({ error: "attempt_id_required_under_80_chars" }, { status: 400 });
    }

    // Idempotency key: user hash + product + client attemptId (no email, under 80 chars)
    const userHash = user.email.split('@')[0].slice(0, 10);
    const productShort = productKey.split('.').pop() || productKey;
    const idempotencyKey = `lx-${userHash}-${productShort}-${attemptId}`.slice(0, 80);

    // NOT_ON_SALE: no Launchixis SKU delivers anything yet (provision is a no-op). Refuse before any hold.
    return Response.json(
      { error: "Launchixis products are not on sale yet — nothing to deliver, so we do not take Ixis for them." },
      { status: 409 }
    );
    // eslint-disable-next-line no-unreachable
    // Redeem: reserve → provision → capture (or unprovision + release on failure)
    const result = await redeem({
      owner: (await apixisOwner(user.email)) ?? user.email,
      productKey,
      idempotencyKey,
      provision: async (reservation) => {
        // Provision step: grant entitlement
        // For Launchixis, product definition is unclear (tool vs service).
        // Wallet writes the entitlement; we read it via hasEntitlement().
        // When product is defined, this will write board access or similar.
        return { granted: true, reservationId: reservation.reservationId };
      },
      unprovision: async (reservation, result) => {
        // Undo provision if capture fails
        // Currently no local access rows to revoke; Wallet entitlement not yet written.
        // When provision writes access, this will DELETE that row.
        console.log(`unprovision called for ${reservation.reservationId}`);
      },
    });

    if (!result.ok) {
      // 402 insufficient Ixis - return Buy link
      const returnUrl = `${process.env.NEXT_PUBLIC_APP_URL || "https://launchixis.vercel.app"}/pricing`;
      return Response.json(
        {
          error: "insufficient_ixis",
          needed: result.needed,
          message: result.message,
          buyUrl: buyIxisUrl("launchixis", returnUrl),
        },
        { status: 402 }
      );
    }

    return Response.json({
      ok: true,
      receiptId: result.receiptId,
      productKey,
    });
  } catch (err) {
    console.error("Redeem error:", err);
    return Response.json(
      { error: err.message || "redeem_failed" },
      { status: 500 }
    );
  }
}
