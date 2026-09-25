# Launchixis: launch notes

_Updated 2026-09-25. One notes file per repo: what was changed, file by file, and everything you need to connect. The full family report: https://claude.ai/artifact/QERxA6PMsFK1vdR51Ex2NQ_

## Status

Internal launch board. Ready after keys. Products not on sale (nothing to deliver yet).

## Connect (in order)

1. Supabase: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.
2. `ADMIN_EMAILS`: who can edit.
3. AI: `ANTHROPIC_API_KEY`.

Every key this repo reads is listed in `.env.example` (required, optional, and legacy names to leave unset).

## Apixis Wallet

App `launchixis`. Redeem refuses before any hold (not on sale).

## Database

None pending.

## What changed, file by file

| File | Change |
|---|---|
| `.env.example` | Added 12 key(s) the code reads that were missing: `ADMIN_EMAILS`, `ANTHROPIC_API_KEY`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_URL`, `WALLET_API_KEY`, `APIXIS_WALLET_API_URL`, `APP_URL`, `NEXT_PUBLIC_APP_URL`, `SUPABASE_ACCESS_TOKEN`, `VERCEL_TOKEN`, `APIXIS_WALLET_API_KEY`. |
| `app/api/auth/magic-link/route.js` | Rate limited. |
| `app/api/cixy/route.js` | Rate limited. |
| `app/api/support/route.js` | Rate limited. |
| `app/page.jsx` | Board shows with an empty list instead of a 500 if the first load fails. No visual change. |
| `docs/LAUNCH_NOTES.md` | This file. |
| `lib/rate-limit.js` | New. Per-IP limiter. |

_Changes are backend and plumbing only. Pages, design and UI are not changed except where noted as a build or lint fix with no visual change._
