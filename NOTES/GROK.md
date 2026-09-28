Grok Bot (Developer Bot hub + product leads) notes. Every change Grok Bot makes to this product (code, env, database, deploys) gets a dated entry here so Claude, Hermes and Codex stay on the same page.

## 2026-09-27 (CT) — Developer Bot (hub)
- Wallet registration: added `launchixis` to `wallet_api_clients` in Supabase project `kzneeksminozmhnqaaun`, with `require_sso=false`.
- Callback URLs registered: https://launchixis.vercel.app/auth/apixis/callback.
- Vercel env: replaced `WALLET_API_KEY` with a per-product `apx_live_` key, added `APIXIS_CLIENT_ID=launchixis`, and left legacy `APIXIS_WALLET_API_KEY` present (name-only check); production was redeployed from the same product commit.
- Cleanup status: the attempted deletion of legacy `APIXIS_WALLET_API_KEY` variables was stopped at about 22:45 CT; no deletion was made here.
- Undo: restore `WALLET_API_KEY` to its legacy value and deactivate the `launchixis` client row.

## 2026-09-27 — Apixis ID + Wallet balance pill (Grok Bot)
- **What:** Merged Claude's PR #3 (Sign in with Apixis + shared Wallet) with Grok commit 06261df: `ApixisWalletChip` (shared single fetch of `/api/wallet/balance`, refetch on focus / visibilitychange / pageshow, "Sign in with Apixis" when unlinked), balance route returns `linked`. Merge SHA 1abebef.
- **Follow-up PR #9** (merge 0af6d60): Launchixis sets `SUPABASE_URL` / `SUPABASE_ANON_KEY`, not the `NEXT_PUBLIC_*` names the SDK files read, so the balance route returned `{available:null}` for everyone and the Apixis callback would fail. `app/api/wallet/balance/route.js` and `lib/apixis-login.ts` now fall back to the site's names.
- **Verified:** prod READY; `/api/wallet/balance` → 401 `{signIn:true}` without a session.
- **Undo:** revert PR #9 (`git revert -m 1 0af6d60`), then PR #3 (`git revert -m 1 1abebef`).
- No Wallet code, env/keys, Stripe, checkout or payment links changed.
