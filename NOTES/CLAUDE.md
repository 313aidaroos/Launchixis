# Claude notes (Launchixis)

Dated notes from Claude (Claude Code), same purpose as `NOTES/GROK.md`: what Claude checked or changed here, what it found, what is still open and who owns it. The one family status board is `ApixisWallet/docs/FAMILY_STATUS.md`.

## 2026-10-04 (UTC) — Claude: full-portfolio review (read-only; this note and the AI_CHANGELOG line are the only changes)

### Snapshot
- Reviewed `main` @ `3aa8772`; the owner admin allowlist merged → `main` is `6329f61`. Vercel `launchixis` production READY.
- Supabase `ebhzfgdavzwemrqxpvvk`: no tracked migrations and no schema file in the repo; tables live: `launches` (14 rows), `support_tickets` (2). `ADMIN_EMAILS` set on Vercel 10-02.

### Verified this session (on 3aa8772)
- `npm test` (node --test, 6 files) and `npm run build`: pass on Node 22. No lint / typecheck scripts (JavaScript project).
- SDK: wallet, redirect, cixy identical to canonical; `lib/apixis-login.ts` differs on purpose (extra `SUPABASE_URL` / `SUPABASE_ANON_KEY` fallbacks).
- Advisors: RLS-no-policy INFO on `launches`, `support_tickets` (server-only, intended); leaked-password WARN.

### Done (live)
Launch board (checklist persisted per company), login (magic link + Apixis ID), pricing page (redeem answers 409 "not on sale" by design), Wallet balance, Cixy, support, companies page, admin gate, rate limit, CI.

### Open — needs Awad
- Turn sales on or keep them off — the four `launchixis.*` SKUs already exist in the Wallet catalog.

### Open — Claude can do on your go
- Record the live schema as `supabase/schema.sql` (today nothing in the repo describes `launches`).
- Move `typescript` and `@types/node` from `dependencies` to `devDependencies`; remove `archive/landing-pack.html`; expand the five-line README.
