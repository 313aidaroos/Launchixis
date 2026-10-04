Grok Bot (Developer Bot hub + product leads) notes. Every change Grok Bot makes to this product (code, env, database, deploys) gets a dated entry here so Claude, Hermes and Codex stay on the same page.

## 2026-10-04 summary

- **Grok:** added the two-owner verified admin allowlist.
- **Claude:** merged PR #21 (`cbb79eb`) around 6:30 PM CT, adding the full-portfolio review to `NOTES/CLAUDE.md` and `AI_CHANGELOG.md` (notes/docs only).
- **Hermes:** no 2026-10-04 commit or merged PR identified in this repository.
- **Juno:** no 2026-10-04 commit or merged PR identified in this repository.

## Catch-up correction — 2026-10-04 (CT)

Claude activity was present; the earlier “no Claude activity” line was incorrect. Each item below has an undo pointer.

- **Claude, 2026-10-04 6:31 PM CT — PR #21, merge `cbb79eb10ebbe70ed991d749f53af227ae1eeeb7`:** notes: Claude full-portfolio review 2026-10-04 (NOTES/CLAUDE.md, AI_CHANGELOG); added `NOTES/CLAUDE.md` and `AI_CHANGELOG.md` (notes/docs only). Undo: `git revert cbb79eb10ebbe70ed991d749f53af227ae1eeeb7`.
- **2026-10-04 6:31 PM CT — 313aidaroos:** `notes: Claude full-portfolio review 2026-10-04 (NOTES/CLAUDE.md, AI_CHANGELOG) (#21)` landed as `cbb79eb10ebbe70ed991d749f53af227ae1eeeb7`. Where: commit `cbb79eb10ebbe70ed991d749f53af227ae1eeeb7`. Undo: `git revert cbb79eb10ebbe70ed991d749f53af227ae1eeeb7`.

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

## 2026-10-02 (CT) — Backfill by Launchixis Lead (Grok): changes since the 2026-09-27 entries
Logged from git history and PR records, read-only. All times CT. Everything below was merged through a PR into `main`. After `cefbb03` (the last notes commit) nothing went straight to `main` until this entry.

- **2026-09-28 04:08, Juno, PR #10** (`junoai/ai-changelog`, merge `27d08f2`): added `AI_CHANGELOG.md` and the AI change-log rule in `CLAUDE.md`. Undo: `git revert 27d08f2`.
- **2026-09-28 04:46, Juno, PR #11** (`junoai/ci`, merge `c7bd234`): added `.github/workflows/ci.yml`, which calls the shared `313aidaroos/github-actions` node-ci workflow, plus `JUNOAI_NOTES.md`. Undo: `git revert c7bd234`.
- **2026-09-30 01:22, Codex, PR #12** (`codex/tester-readiness`, merge `8d09c4a`): hardened shared-login return destinations with new `lib/apixis-redirect.ts`, changes to `lib/apixis-login.ts`, and a new test `lib/__tests__/apixis-redirect.test.mjs`. Undo: `git revert 8d09c4a`.
- **2026-09-30 02:34, Claude, PR #13** (`claude/awesome-newton-3tygzi`, merge `19a6ce8`): re-synced the Apixis kits. Login now uses verifyOtp type `email`, `lib/apixis-wallet.ts` moves to SDK v3.1, and the world kit is updated. Also deleted `lib/apixis-wallet.ts.bak`. Undo: `git revert 19a6ce8`.
- **2026-09-30 02:56, Claude, PR #14** (same branch, merge `467144d`): Cixy now uses the shared family persona core (new `lib/apixis-cixy.js`). Provider errors return a calm 503/429 reply instead of the vendor error. Undo: `git revert 467144d`.
- **2026-10-01 20:56, Claude, PR #15** (same branch, merge `148d468`): `.env.example` now lists every env var the code reads. No code changes. Undo: `git revert 148d468`.
- **2026-10-01 23:19–23:20, Claude (Claude Code), PR closures in the family cleanup** (51 PRs closed across repos): two of them are Launchixis PRs.
  - Closed #8 (`launchixis/notes-refresh-0927`, my 9/27 docs refresh). Reason given: outdated, and `ApixisWallet/docs/FAMILY_STATUS.md` is the live board.
  - Closed #2 (`cursor/cixy-wardrobe-stub-7e94`, the paused Cixy wardrobe stub).
  - Both branches are kept. Undo: reopen the PR.
- **2026-10-02 02:22, Codex, PR #16** (`codex/apixis-companies-20261002`, merge `de8f99e`): new `/companies` page (Apixis Companies directory).
  - New files: `app/companies/page.jsx` and `companies.css`.
  - New images in `public/companies/`: `recovra.jpg` and `scenes-1..5.jpg`.
  - `app/board.jsx` now links to the page.
  - Undo: `git revert de8f99e`.
- **2026-10-02 02:47, Codex, PR #17** (`codex/refine-companies-motion-20261002`, merge `0708d0c`): reworked the Companies card animation and matched the copy to the directory. Undo: `git revert 0708d0c`.
- **2026-10-02 03:19, Codex, PR #18** (`codex/fix-recovra-company-link-20261002`, merge `7d35d63`): fixed the Recovra link on `/companies`. **This is the current production commit.** Undo: `git revert 7d35d63`.
- **Env:** `ADMIN_EMAILS` on the Launchixis Vercel project is set to Awad's two addresses (source: `FAMILY_STATUS.md`, hub). This env change doesn't appear in git history.
- **Known open items (not changed, report only):**
  - `lib/cixy.js` still sends `anthropic-version: 2024-06-15`, and prod `/api/cixy` returns 503 "Cixy is resting".
  - `docs/LAUNCH_NOTES.md` is dated 9/25 and out of date.
  - Redeem returns 409 "not on sale" by design.
- **This entry:** a notes-only commit that touches only `NOTES/GROK.md`. Undo: revert this commit.

## 2026-10-04 (CT) — Grok: owner admin allowlist (alaidaroosawad@gmail.com, awad@apixis.dev)
- What: Awad's rule — both owner emails are Launchixis admin as soon as they sign in with a verified email, by any method. How admin works: email allowlist `ADMIN_EMAILS` (Vercel env, already `awad@apixis.dev,alaidaroosawad@gmail.com`) via `parseAdminList()` / `isAdminEmail()` (`lib/auth.js`), used by `requireAdminUser()` for launch writes (`/api/launches`) and the `admin` flag in `/api/auth/me`. Before, the code fallback was awad@apixis.dev only, and only when the env was empty. Now both owner emails are always in the list (env adds, never removes), still case-insensitive, and admin needs a confirmed email. Nobody else's access changed. No accounts or passwords were created.
- Where: `lib/auth.js`, `lib/server-auth.js`, `app/api/auth/me/route.js`, `tests/auth.test.mjs`. Vercel env unchanged.
- Who: Grok.
- Undo: `git revert <squash SHA>`.

## 2026-10-04 (CT) — Grok Bot: Feed tab on Launchixis (PR open, NOT merged)
- Why: Awad asked for the Socixis Social family feed as a Feed tab on every Ixis site. Awad put feed changes on hold, so this PR is for preview review only; do not merge until Awad says so.
- What: new public `/feed` page in Launchixis's own shell (same header, footer, fonts, colors and buttons). For You is the unfiltered mixed feed from every Apixis company with source-site badges and AI labels; Following, Search · Trending and You tabs; video/photo/text posts, like, comment, follow, save, share, report, tips and boosts in Ixis. Signed-out visitors can browse; the 4th tab says "You" and shows a sign-in card (Apixis ID). Text-only posts use the site's body font, wrap long words and size to their content; media posts keep the full-height layout; feed modals sit above everything.
- Where: `app/feed/` (page with the launch board's own header pills and footer from `app/board.jsx`, Launchixis skin, `feed.css` mapped to Launchixis tokens), `feed-client/` (shared client), `app/api/feed-session/route.js`, "Feed" pill in `app/board.jsx`, and `data-floating-widget` on the Cixy bubble (`app/cixy.jsx`) so it hides while a feed modal is open.
- Backend: https://www.apixis.dev/api/feed. `/api/feed-session` calls POST /api/feed/session server-side with the existing `APIXIS_WORLD_KEY` + X-Apixis-Client/Sub/Email and returns the short-lived fdt_ token. No new env vars, no DB change, no SVGs.
- Who: Grok Bot (for Awad).
- Undo: close this PR, or `git revert <squash sha>` if it is ever merged.

## 2026-10-04 19:00 (CT) — Grok Bot: Feed phone tab fit (same PR, still NOT merged)
- What: at 375px the 4th "You" tab was pushed off-screen by "Search · Trending". Under 560px the tab now reads "Search", tabs are tighter, and if a wide site font still can't fit the tabs and "+ Post" on one row, Post drops to its own row instead of covering "You". Desktop is unchanged; the site's colors, fonts and buttons are untouched; no SVGs.
- Where: feed client `FeedView.tsx` (tab label) and the shared layout section of the site's feed CSS.
- Who: Grok Bot (for Awad). No merge, no production deploy.
- Undo: revert this commit on the PR branch.
## 2026-10-04 catch-up provenance (CT)

The entries below record the day's observed commits and merged PRs. Existing detailed entries above remain the change descriptions; this section supplies exact provenance and undo pointers.

### Commits
- `6329f61` (2026-10-04T17:47:53-05:00, 313aidaroos; alaidaroosawad@gmail.com) — Owner admin allowlist: both owner emails always admin; verified email required (#19). Undo: undo via the merged PR below: git revert 6329f61.

### Merged PRs
- PR #19, merge `6329f61`, `grok/owner-admin-allowlist` → `main`, merged 2026-10-04 CT by 313aidaroos: Owner admin allowlist for alaidaroosawad@gmail.com and awad@apixis.dev. Undo: `git revert 6329f61`.
