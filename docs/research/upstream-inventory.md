# Upstream-specific values the app and worker depend on

Research for #22 (map #21). Snapshot of `main` at `5e0ce794`, 2026-10-18.
Read from the fork's own source; no upstream infrastructure was contacted.

Verdicts: **Change** = the fork backend cannot work (or keeps talking to upstream)
unless this changes. **Keep** = fine as-is on the owner's account. **Drop** = can be
removed or left unset. **Decide** = depends on an open map question.

## Answer in brief

- Worker: only the two **KV namespace ids** (prod and `env.dev`) are hard account
  bindings that block a deploy on another account. The two **grafana** observability
  destinations must exist on the new account or be removed. Discord guild and role ids are
  upstream's but harmless once `DISCORD_BOT_TOKEN` is unset. Everything else in
  `wrangler.jsonc` can stay.
- Worker secrets: `ADMIN_API_KEY`, `BOOTSTRAP_TOKEN_SECRET` (required, because
  `PUBLIC_BOOTSTRAP_REQUIRED=1`), optional `STATS_SALT`. `FEEDBACK_DISCORD_WEBHOOK_URL` and
  `DISCORD_BOT_TOKEN` are upstream-Discord features and the fork drops both. Feedback to
  GitHub issues needs new code and a new secret.
- App: the switch is the one constant `BACKEND_URL` in `config/shared/backendConfig.ts:4`,
  plus the `assets.wfhelper.com` mirror base, which is hard-coded in **six places plus 766 URLs
  baked into a data file**. Setting `VITE_WFM_BACKEND_URL` at build time is not enough on its
  own: the main process and the CSP read it only at runtime (see "Env overrides" below).
- Endpoints: every worker route the app calls is in the worker README. `/v1/items`,
  `/v1/riven`, `/v1/auctions` are **warframe.market** paths the app calls directly, not worker
  routes. The app no longer calls `/v1/supporters` (removed in `488d6dff`).

## Worker: `backend/worker/wrangler.jsonc`

| Value | Where | What it does | Verdict |
|---|---|---|---|
| `name: "worker"` | :3 | Worker script name on the account | Keep (rename optional) |
| No `routes` / custom domain | (absent) | Upstream binds `api.wfhelper.com` in the dashboard; `workers_dev: false` :6 | Change: attach the owner's custom domain (dashboard or a `routes` entry) |
| `observability.traces.destinations: ["grafana-traces"]` | :15 | Ships traces to a named destination on upstream's account | Decide (map: Observability). Must be created on the new account or removed |
| `observability.logs.destinations: ["grafana-logs"]` | :21 | Same, for logs | Decide (same) |
| KV `PRICE_CACHE` id `93e17278…` / preview `f5030272…` | :31-32, dup in `env.dev` :129-130 | All cached prices, snapshot, archives | **Change**: ids belong to upstream's account |
| KV `ITEM_META` id `e4990d24…` / preview `b332ce4e…` | :36-37, dup :134-135 | Item meta, catalog, supporters, archives | **Change** |
| DO `DAILY_BUDGET`, `SNAPSHOT_COORDINATOR` + migration `v1` | :40-51 | Class bindings only, no ids | Keep (created fresh on first deploy) |
| Rate limiters `namespace_id` 31001-31007 | :52-60, dup :145-153 | Per-account integers you choose | Keep (no clash on a new account) |
| `ALLOW_ORIGIN: "https://wfhelper.com"` | :71 (dev :159 is localhost) | Browser CORS only; requests with no Origin always pass (`src/security/cors.ts:15-24`) | Keep. Worker tests assert this exact value (`test/clientIdentity.spec.ts:8`, `test/index.spec.ts:190,1752`), so changing it costs test edits and merge conflicts |
| `FEEDBACK_DISCORD_FORUM: "1"` | :75 | Discord forum thread per report | Drop with Discord feedback |
| `PUBLIC_BOOTSTRAP_REQUIRED: "1"` | :82 | Gates `/v1/prices`, `/v1/meta`, `/v1/order-summary` on a token (`src/routes/public.ts:685,704,716`); fails closed with 503 if the secret is missing (:139-148) | Keep, set `BOOTSTRAP_TOKEN_SECRET` before first deploy |
| `PUBLIC_CLIENT_POLICY: "log"`, `PUBLIC_CLIENT_ALLOW: "WFHelper"`, `PUBLIC_CLIENT_DENY: ""` | :103-105 | Client allowlist on `x-wfhelper-client`; app sends `APP_PRODUCT_NAME` = `WFHelper` (`config/shared/appMeta.ts`) | Keep |
| `DISCORD_GUILD_ID: "1486065926192500746"` | :108, dup :178 | Upstream's Discord server, supporter sync | Drop (set `""`); sync is a no-op without it (`src/services/supporters.ts:217-221`) |
| `DISCORD_ROLE_TIER_MAP` (roles `1541598934718349332`, `1541843190779224124`) | :109, dup :179 | Upstream's supporter roles | Drop (set `""` or `{}`) |
| Crons `*/15 * * * *`, `0 4 * * *` | :117 | Prewarm, archives, seed, top-traded, supporter sync | Keep |
| Tuning vars (TTLs, batch sizes, budget 300000, retention 730, seed, top-traded) | :63-100 | Not account-specific | Keep |

Unlisted vars with code defaults: `BOOTSTRAP_TOKEN_TTL_SEC` (900), `WFCD_RELEASE_AGE_HOURS` (24),
`WFCD_RELICS_ENABLED` (1) at `src/config.ts:82,104-105`. Keep the defaults.

`backend/worker/worker-configuration.d.ts:48` is generated from these vars (`npm run cf-typegen`).

## Worker: secrets (read in code, not in `wrangler.jsonc`)

| Secret | Read at | Effect if unset | Verdict |
|---|---|---|---|
| `ADMIN_API_KEY` | `src/security/adminAuth.ts:5-7` | All `/admin/*` refuse | Set (new value) |
| `BOOTSTRAP_TOKEN_SECRET` | `src/security/bootstrap.ts:56` | With `PUBLIC_BOOTSTRAP_REQUIRED=1`, price/meta/order-summary return 503 | **Set before first deploy** |
| `STATS_SALT` | `src/services/activeUsers.ts:21`, `src/routes/admin.ts:60` | No daily-active counting | Optional |
| `FEEDBACK_DISCORD_WEBHOOK_URL` | `src/routes/feedback.ts:103` | `/v1/feedback` returns 503 `unavailable` (:104) | Drop; GitHub-issue feedback needs a new secret (token) and code |
| `DISCORD_BOT_TOKEN` | `src/services/supporters.ts:216` | Supporter sync is a no-op | Drop |

The README setup (`backend/worker/README.md:180-181`) lists only the first two.

## Worker: external services it calls

None of these are upstream-run. All are third-party public sources the fork keeps calling.

| Service | Where |
|---|---|
| `api.warframe.market` v1/v2 (items, statistics, orders, riven weapons, auctions) | `src/services/prewarm.ts:163,198,261,277`, `prewarmCatalog.ts:241`, `wfmStatistics.ts:63`, `history.ts:445,501` |
| `api.warframe.com/cdn/worldState.php`, `api.warframestat.us/pc/voidTrader` | `src/services/history.ts:34-35` |
| `wiki.warframe.com` raw pages (Coda, Tenet, Nightwave) | `src/services/adversaryVendors.ts:9-10`, `nightwaveOfferings.ts:19` |
| `registry.npmjs.org/@wfcd/items`, `cdn.jsdelivr.net` | `src/services/wfcdRelics.ts:26,222` |
| `discord.com` API (supporters) and the feedback webhook | `src/services/supporters.ts:8`, `src/routes/feedback.ts` |

Upstream branding in outbound requests: `User-Agent: WFHelper-worker/1.0 (+https://wfhelper.com)` at
`adversaryVendors.ts:12`, `history.ts:36`, `nightwaveOfferings.ts:21`, `wfcdRelics.ts:27`. It points
third parties at upstream's site as the contact. Tests pin the string
(`test/adversaryVendors.spec.ts:104`, `test/nightwaveOfferings.spec.ts:101`). Verdict: Decide
(courtesy says change it, the "merge upstream" rule says it must become config to avoid conflicts).

## Desktop app

| Value | Where | What it does | Verdict |
|---|---|---|---|
| `BACKEND_URL = "https://api.wfhelper.com"` | `config/shared/backendConfig.ts:4` | Default backend for renderer and main | **Change** |
| `assets.wfhelper.com` icon mirror base | `services/itemDatabase.ts:35` (icons, item-art, mod-art :52,70,75), `config/shared/wfm.ts:50` (WFM thumbs) | Item images | **Change** (Decide: assets ticket) |
| `assets.wfhelper.com/arbi-minimaps/` | `src/lib/arbi/arbiMinimap.ts:39` | Arbitration tile maps | Change |
| `assets.wfhelper.com/enemies/` | `src/lib/codexScans.ts:44` | Codex enemy images | Change |
| 766 baked `https://assets.wfhelper.com/icons/…` URLs | `src/data/codexScanRequirements.json`, generated by `scripts/codex-scans/build-codex-scan-data.mjs:141` | Codex icons | Change (regenerate or rewrite at load) |
| CSP `connect-src` includes `https://assets.wfhelper.com` | `config/runtime/security.ts:27` | html-to-image fetches minimaps | Change |
| CSP `connect-src` adds backend origin from `VITE_WFM_BACKEND_URL` or `BACKEND_URL` | `config/runtime/security.ts:58-65` | Allows renderer fetches to the backend | Follows `BACKEND_URL` |
| Trade-notification `img-src https://assets.wfhelper.com` | `renderer/trade-notification.html:7` | Static CSP meta tag | Change |
| `openExternal` allowlist `wfhelper.com`, `www.wfhelper.com`, `discord.gg` | `config/runtime/security.ts:12-14` | Links the app may open | Keep (links only) |
| Docs links `https://wfhelper.com/docs/…` | `src/components/DocsLink.svelte:9` | Opens upstream docs | Keep (out of backend scope) |
| About card: upstream repo, `wfhelper.com`, Discord invite | `src/components/settings/AboutCard.svelte:89,92`, `src/config/links.ts:2` | Credits and links | Keep (not infra) |
| Arbi share card footer text `wfhelper.com` | `src/components/world/ArbiSchedule.svelte:295` | Branding text | Keep |
| `package.json` `build.publish` → GitHub `WFHelper/WFHelper` | `package.json:245-252` | Updater feed for stable builds | Keep for now: friends get beta builds, whose feed is the fork (`scripts/package-beta.cjs` publish → `aurablacklight/WFHelper/releases/download/friends-beta/`) |
| Icon mirror deploy: Pages project `wfhelper-icons` | `package.json:73` (`icons:deploy`) | Uploads the mirror | Change (Decide: assets ticket) |
| `scripts/icon-mirror/download-arbi-minimaps.mjs:18` UA `(+https://wfhelper.com)` | script only | Contact string to arbi.guide | Decide (courtesy) |
| `scripts/prewarm-order-summaries.ps1:16` default `https://api.wfhelper.com` | admin helper | Needs `-WorkerUrl` or a new default | Change |

### Env overrides and a trap

| Variable | Read at | When it is read |
|---|---|---|
| `VITE_WFM_BACKEND_URL` | renderer `src/lib/wfm/backendLite.ts:27` (`import.meta.env`) | **Build time**, by Vite |
| same name | main `services/wfmCatalog.ts:77`, `services/relicDataUpdate.ts:177`, `ipc/feedbackIpc.ts:68`, CSP `config/runtime/security.ts:58` (`process.env`) | **Runtime** of the packaged app; nothing bakes it in (`vite.config.mjs:53-55` defines only `VITE_APP_VERSION`; main is plain `tsc`) |
| `VITE_WFM_BACKEND_BOOTSTRAP_ENABLED` | `backendLite.ts:35` | Build time. Forced to `1` by `scripts/package-beta.cjs:30-34`; required for prices because of `PUBLIC_BOOTSTRAP_REQUIRED` |
| `VITE_WFM_BACKEND_DIRECT_FALLBACK` | `backendLite.ts:106` | Build time; default `high` |
| `WFHELPER_ICON_MIRROR_URL` / `_DISABLED` | `services/itemDatabase.ts:35,47`, `config/shared/wfm.ts:50,76` | Runtime `process.env`. In the renderer bundle `readEnv` finds no `process`, so the default host always wins there |
| `WF_CONNECT_SRC_EXTRA` | `config/runtime/security.ts:67` | Runtime, extra CSP origins |

The trap: a beta built with only `VITE_WFM_BACKEND_URL=<fork>` sends renderer requests to the
fork, while catalog, relics, feedback **and the CSP** in main stay on `api.wfhelper.com`. The CSP
would then block the renderer's fork requests. Change the `BACKEND_URL` constant (or make
it build-time config for main too). Do not rely on the env var alone. The same holds for the
icon mirror env var.

## Tests and workflows that encode upstream values

| File | Value | Verdict |
|---|---|---|
| `tests/main/relicDataUpdate.test.ts:206` | expects `https://api.wfhelper.com/v1/wfcd-relics` | Change with `BACKEND_URL` |
| `tests/main/itemDatabaseAliases.test.ts:230,233`, `tests/main/wfmAssetUrl.test.ts:39`, `tests/main/wfmContractsNormalization.test.ts:91`, `tests/renderer/lib/arbi/arbiMinimap.test.ts:156` | expect `assets.wfhelper.com` URLs | Change with the mirror base |
| `tests/main/relicSelection.test.ts:59,140`, `tests/main/rewardPresentation.test.ts:25` | fixture URLs only | Keep |
| `tests/renderer/lib/wfm/backend*.test.ts` | stub `https://backend.test` | Keep |
| `e2e/codex-image-fallback.spec.ts:33` | routes `**/assets.wfhelper.com/**` | Change with mirror base |
| `e2e/docs-links.spec.ts:71-73` | `wfhelper.com/docs` | Keep |
| `backend/worker/test/smoke.spec.ts:5` | default `WORKER_URL` `https://api.wfhelper.com` | Change, or always pass `WORKER_URL` |
| `backend/worker/test/*` origin and UA asserts | see above | Keep unless those values change |
| `.github/workflows/backend-smoke.yml:5,30` | cron every 6 h against `api.wfhelper.com` | Schedules do not run on forks; Decide (map: Verification) |
| `.github/workflows/release.yml:87-88,107-109,142-144,215-217,237-239` | `CSC_*`, `VITE_WFM_BACKEND_*` secrets/vars | Fork has **no** Actions secrets or variables (`gh secret list` / `gh variable list` empty), so this workflow cannot release from the fork today; betas are built locally |
| `.github/workflows/audit.yml:7` | nightly cron | Does not run on forks |
| `scripts/validate-release-env.mjs:22-31` | requires the three `VITE_WFM_BACKEND_*` | Only for `release.yml` |

## Client endpoints vs the worker README

The app calls: `/v1/bootstrap` (`backendLite.ts:69`), `/v1/snapshot` (`snapshotLoader.ts:71`),
`/v1/wfm-items` (`services/wfmCatalog.ts:78`), `/v1/prices/:slug` (`backendLite.ts:267`),
`/v1/meta/:slug` (:299), `/v1/order-summary/:slug` (:334), `/v1/price-history/:slug`
(`priceHistory.ts:68`), `/v1/top-traded` (`topTraded.ts:105`), `/v1/baro-history`
(`backendLite.ts:215`), `/v1/adversary-vendors` (`src/lib/world/adversaryVendors.ts:165`),
`/v1/nightwave-offerings` (`src/lib/world/nightwaveOfferings.ts:80`), `/v1/wfcd-relics`
(`services/relicDataUpdate.ts:33`), `POST /v1/feedback` (`ipc/feedbackIpc.ts:69`).

**All 13 are listed** in `backend/worker/README.md:10-25`. Worker routes the app does not call:
`/healthz`, `/v1/supporters`, `/v1/orders/:slug` (disabled by default). `/v1/items/...`,
`/v1/riven/...`, `/v1/auctions/...` in app code are direct `api.warframe.market` calls
(`src/lib/wfm/wfmPrice.ts:178`, `orderBook.ts:145`, `MarketBrowseView.svelte:263`,
`MarketBrowseStats.svelte:193`), unaffected by the cutover.

README gaps (docs only): `WFCD_RELEASE_AGE_HOURS` and `WFCD_RELICS_ENABLED` are in `ARCHITECTURE.md`
but not the README config list. The secrets setup omits `STATS_SALT`, `DISCORD_BOT_TOKEN`
and `FEEDBACK_DISCORD_WEBHOOK_URL` (they are explained elsewhere in the README).

## Leads for other tickets

- **Where fork values live without forking `wrangler.jsonc`.** KV ids, Discord vars, grafana
  destinations and any custom-domain route all sit in the file upstream keeps editing. One
  option is a fork-only `wrangler.fork.jsonc` deployed with `wrangler deploy -c`, but worker tests read
  `./wrangler.jsonc` (`vitest.config.mts:7`).
- **Main process vs renderer config.** `BACKEND_URL` and the mirror base need one build-time source
  that both bundles see. An edited constant conflicts on upstream merges.
- **Observability destinations** may fail a deploy if they do not exist on the account. Not verified
  here (no deploy was run).
