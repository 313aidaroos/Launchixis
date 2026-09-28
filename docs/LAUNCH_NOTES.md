# Launchixis: launch notes

_Refreshed 2026-09-27 by Launchixis Lead (hub full-refresh audit, read twice against the repo and production). Prior entries from 2026-09-25 are kept below._

## Status (verified 2026-09-27)

- Production: https://launchixis.vercel.app serves `main` at `edae7c5` (PR #7). Vercel status: success.
- Live pages: `/`, `/pricing`, `/login`, `/support`, `/api/launches`, `/LAUNCHIXIS-Playbook.pdf` all return 200.
- Buy Ixis links point at Apixis Wallet (`?tab=buy&origin=launchixis&return_url=...`) on `/pricing` and in the board header. The old `wallet.apixis.dev` link is gone.
- Products are **not on sale**: `/api/redeem` returns 401 when signed out and 409 "not on sale" when signed in, before any hold.
- Board data (`/api/launches`): Launchixis 7/13. The other 13 companies show 0/13, which is stale versus reality.
- Sign-in today is magic link only. "Sign in with Apixis" is in open PR #3, not on `main`.

## Family locks (hub, 2026-09-27)

1. **Every signup gets its own Apixis world agent via Apixis ID.** Entry: `https://www.apixis.dev/enter?from=launchixis`. Rollout order: Apixis.dev (live), Renoxis next, then one product at a time. Launchixis is not wired to `/enter` yet.
2. **Apixis Bank takes 5% of every Apixis-universe transaction**, including agent-to-agent deals.
3. **Payments only via Apixis Wallet.** Launchixis has no Stripe of its own and must never add one. Pricing is in Ixis (100 Ixis = $1).

## Known bugs

- **Cixy chat is down in production.** `POST /api/cixy {"message":"..."}` returns `{"error":"invalid_request_error"}`. `lib/cixy.js` sends `anthropic-version: 2024-06-15`, which is not a valid Anthropic API version (the valid one is `2023-06-01`). The default model `claude-sonnet-5` should also be checked against the key's available models, or set `ANTHROPIC_MODEL` in Vercel.
- `www.apixis.dev/enter?from=launchixis` goes to Wallet SSO with `client_id=apixis` and a callback to apixis.dev. The `from` value is not visible in the redirect, so attribution back to Launchixis is unconfirmed.
- Wallet does not read `tab=buy` yet, so Buy Ixis lands on the Wallet home.
- `lib/apixis-wallet.ts.bak` is a stray backup file on `main`; delete it.
- Board scores for the 13 other companies are all 0/13.

## Open PRs

- **#3 Sign in with Apixis + one shared Apixis Wallet** (open, last updated 2026-09-25). Adds Apixis ID login, Wallet SDK v3, shared balance chip. Needs Vercel env `WALLET_API_KEY`, `APIXIS_CLIENT_ID=launchixis`, `SUPABASE_SERVICE_ROLE_KEY`. Should be reconciled with the `/enter?from=launchixis` lock before merge.
- **#2 Cixy wardrobe stub** (draft). Paused by Awad on 2026-09-21. Do not merge until the hub says go.

## Pricing (Ixis, redeem disabled)

| SKU | Price |
|---|---|
| Launch Checklist Template | 1,000 Ixis one-time |
| Brand Kit One-off | 1,000 Ixis one-time |
| Launch Ops Seat | 10,000 Ixis/mo |
| Enterprise Launch Suite | 30,000 Ixis/mo |

Every redemption is subject to the Apixis Bank 5% take once redeem is enabled.

## To reach first sale (order)

1. Fix Cixy (API version header).
2. Merge PR #3 after aligning it with `/enter?from=launchixis`, and set its env keys.
3. Define what each SKU delivers (the Checklist Template and Brand Kit can deliver today as files), then turn on redeem for those two only.
4. Waitlist, admin gate, support inbox, domain (the open board steps).

---

## Connect (in order)

1. Supabase: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.
2. `ADMIN_EMAILS`: who can edit.
3. AI: `ANTHROPIC_API_KEY` (optional `ANTHROPIC_MODEL`).

Every key this repo reads is listed in `.env.example` (required, optional, and legacy names to leave unset).

## Apixis Wallet

App `launchixis`. Redeem refuses before any hold (not on sale).

## Database

None pending.

## What changed, file by file (2026-09-25)

Each changed backend code file also starts with a one-line `Change note (Claude, Sep 2026)` comment saying the same thing.

| File | Change |
|---|---|
| `.env.example` | Added 13 key(s) the code reads that were missing: `ADMIN_EMAILS`, `ANTHROPIC_API_KEY`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_URL`, `WALLET_API_KEY`, `APIXIS_WALLET_API_URL`, `APP_URL`, `NEXT_PUBLIC_APP_URL`, `ANTHROPIC_MODEL`, `SUPABASE_ACCESS_TOKEN`, `VERCEL_TOKEN`, `APIXIS_WALLET_API_KEY`. |
| `app/api/auth/magic-link/route.js` | Rate limited. |
| `app/api/cixy/route.js` | Rate limited. |
| `app/api/support/route.js` | Rate limited. |
| `app/page.jsx` | Board shows with an empty list instead of a 500 if the first load fails. No visual change. |
| `docs/LAUNCH_NOTES.md` | This file. |
| `lib/cixy.js` | Part of: Replace the retired Claude model so Cixy doesn't fail. |
| `lib/rate-limit.js` | New. Per-IP limiter. |

_Changes are backend and plumbing only. Pages, design and UI are not changed except where noted as a build or lint fix with no visual change._
