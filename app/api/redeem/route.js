import { redeem, buyIxisUrl } from "../../../lib/apixis-wallet.ts";
import { currentUser } from "../../../lib/server-auth.js";

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
    
    if (!productKey) {
      return Response.json({ error: "product_key_required" }, { status: 400 });
    }

    // Generate unique idempotency key per attempt (includes timestamp)
    const idempotencyKey = `launchixis-${user.email}-${productKey}-${Date.now()}`;

    // Redeem: reserve → provision → capture (or release on failure)
    const result = await redeem({
      ownerEmail: user.email,
      productKey,
      idempotencyKey,
      provision: async (reservation) => {
        // Provision step: grant entitlement
        // For Launchixis, this is currently a no-op since product definition
        // is unclear (tool vs service). Wallet writes the entitlement; we read it.
        return { granted: true, reservationId: reservation.reservationId };
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
