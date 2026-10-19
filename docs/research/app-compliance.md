# App compliance: wiki credit and the User-Agent on direct WFM calls

Ticket #38 (part of map #21, follow-up to #25). Findings come from reading the
code. The app was not launched. Checked 2026-10-18 against `main` @ `5e0ce794`.

## Short answer

1. **Wiki credit: partial, and the licence named is wrong.** Only the Codex
   panel carries a credit line, and it says "CC BY-SA 4.0". The wiki's text
   licence is CC BY-NC-SA 3.0 (CC BY-SA 3.0 for revisions before 31 Jan 2025).
   It has never been 4.0. The Nightwave and adversary-vendor views name the wiki
   but give no licence. The enemy detail modal, the dojo-research tags and the
   About credits don't credit the wiki at all.
2. **User-Agent: no WFM call identifies the app the way WFM asks.** Renderer
   `fetch` calls send Electron's default browser-shaped UA. The main-process
   client deliberately sends a spoofed plain-Chrome UA, and it solves Cloudflare
   challenges in a hidden window. The WebSocket and node-https fallback send no
   UA at all. WFM's rules ask for a dedicated, descriptive UA and say clients
   that "impersonate browsers" may be blocked.

## Sources

- Wiki licence: https://meta.weirdgloop.org/w/Licensing, Warframe Wiki row:
  "revisions on this wiki after 31 January 2025, 19:00 UTC are licensed under
  Creative Commons BY-NC-SA 3.0 ... Revisions created prior ... are licensed
  under CC BY-SA 3.0." The wiki's own
  https://wiki.warframe.com/w/WARFRAME_Wiki:Licensing contradicts itself: its
  text says "CC BY-SA" but its links point to `by-nc/3.0`. The host's table
  above is the clearer statement. The same page says media (icons, textures,
  art) are DE assets, used with DE's permission or as fair use, not CC content.
- WFM rules: https://docs.warframe.market/docs/rules/overview/ ("Every
  application should use a dedicated and descriptive `User-Agent` header" with
  name, version and contact URL. Clients that "hide their identity, impersonate
  browsers, or intentionally make traffic difficult to classify may be
  blocked"). The quotes come from #25's doc (`research/wfm-api-rules` branch).
  The page is a JS app and a plain curl GET returns only the shell.
- Electron default UA: `GetApplicationUserAgent()` in
  https://github.com/electron/electron/blob/v41.0.0/shell/common/application_info.cc
  (lines 35-50) builds
  `Mozilla/5.0 (...) AppleWebKit/537.36 (KHTML, like Gecko) <AppName>/<appVersion> Chrome/<ver> Electron/<ver> Safari/537.36`.
  The app pins `electron ^41.10.7` (`package.json:105`).

## 1. Wiki-sourced data and its credit

| Surface | Wiki data | Credit today |
|---|---|---|
| Codex panel `src/components/mastery/CodexPanel.svelte:344-350` | scan requirements from `Module:Enemies/data` (`src/data/codexScanRequirements.ts:2`) | "Descriptions from the Warframe Wiki (CC BY-SA 4.0)" (`src/i18n/en.json:21`). **Wrong licence.** "Descriptions" is also inaccurate, since the data is scan counts |
| Nightwave shop `src/components/world/NightwaveShop.svelte:249-261` | offerings from `Nightwave/Offerings` (backend `backend/worker/src/services/nightwaveOfferings.ts`) | "Offerings from the wiki, checked {date}" plus a Source link (`en.json:2662`, `NightwaveShop.svelte:42`). No licence |
| Adversary vendor strips `src/components/world/VendorRotations.svelte:139` | bonus % from the wiki (`backend/worker/src/services/adversaryVendors.ts`) | "Bonus % player-reported (wiki)" (`en.json:1870`). No link, no licence |
| Enemy detail modal `src/modals/EnemyDetailModal.svelte:204,255` | spawn locations and enemy data from `Module:Enemies/data`, wiki enemy art | only a WikiButton link. No credit line |
| Mastery roadmap dojo tag `src/components/mastery/MasteryRoadmap.svelte:251-256` | `src/data/dojoResearch.json:3` (`Module:Research/data`) | none |
| Mod/arcane card art `services/itemDatabase.ts:63-69` | URLs from `config/shared/wikiModArt.ts:2`, `config/shared/wikiItemArt.ts:2` | none (media are DE assets, so CC does not apply, but credit is courteous) |
| About credits `src/components/settings/AboutCard.svelte:56-98` | — | no wiki row |

Internal source comments also say "CC BY-SA": `codexScanRequirements.ts:2`,
`dojoResearch.json:3`, `wikiModArt.ts:2`, `wikiItemArt.ts:2`,
`scripts/codex-scans/build-codex-scan-data.mjs:1`,
`scripts/codex-scans/parseEnemyModule.mjs:1`.

Not wiki-sourced: Drop Data comes from `drops.warframestat.us`
(`services/dropData.ts:19-20`).

## 2. What UA reaches warframe.market

| Path | Code | UA sent |
|---|---|---|
| Renderer `fetch`: order book v2/v1, item meta v2, statistics v1 | `src/lib/wfm/orderBook.ts:86,108,145`, `wfmItemMeta.ts:81-84`, `wfmPrice.ts:177-180`. Headers are `WFM_HEADERS` (`config/shared/wfm.ts:34-39`): Platform, Language, Crossplay, Accept, no UA | Electron default: `Mozilla/5.0 ... WFHelper/<ver> Chrome/... Electron/41.x Safari/537.36`. Nothing sets `app.userAgentFallback` or `session.setUserAgent` (grep). It carries the app name and version, but no contact URL, and its form is a browser UA |
| Main `wfmClient` CSRF bootstrap | `services/wfmClient.ts:268-285`, `_browserUa()` at `:96-100` | first attempt: a **forged plain Chrome UA** without the app or Electron tokens ("We ARE a Chromium runtime - identify as one"). Fallback: `Mozilla/5.0 WFHelper/1.0` (`:274`) |
| Main `wfmClient` API calls (authenticated orders, profile, contracts) | `_request` `:360-392` over `net.request` `:420` | Electron default UA from the default session. Once a Cloudflare challenge has been solved, every call is pinned to `_clearanceUa` plus the `cf_clearance` cookie (`:373-380`) |
| Cloudflare challenge window | `_solveChallengeInWindow` `:148-221` | hidden `BrowserWindow` on `persist:wfm-clearance`. It keeps the native UA on purpose (`:154`, "Turnstile detects mismatched client hints") and shows itself after 8 s if interaction is needed (`:203-207`) |
| node-https fallback | `_nodeRequest` (`wfmClient.ts:462-495`), latched after `net::ERR_` (`:383-390`) | none unless clearance pinned one |
| WebSocket `wss://ws.warframe.market/socket` | `services/wfmWebSocketCommon.ts:15-21` (`ws` library) | no UA. Origin set to `https://warframe.market` |

Note: the fallback `Mozilla/5.0 WFHelper/1.0` at `wfmClient.ts:274` shows that a
descriptive UA has worked for WFM at least some of the time.

## Needed changes

Wiki credit:

1. Fix `codex.attribution` (`en.json:21`): drop "4.0", say "CC BY-NC-SA 3.0",
   link the licence, and replace "Descriptions" with "Scan data".
2. Add the licence (and a link for vendors) to `world.nightwaveFromWiki`
   (`en.json:2662`) and `dailies.vendorBonusWiki` (`en.json:1870`).
3. Add a credit line to the enemy detail modal (spawn data) and to the
   dojo-research tag's title.
4. Add a "Warframe Wiki (CC BY-NC-SA 3.0)" row to `AboutCard.svelte` credits.
   One About row does not replace credit at the point of use, but it covers the
   art and the dojo data cheaply.
5. Correct the "CC BY-SA" source comments listed above.

User-Agent:

6. Define one fork UA constant (e.g. in `config/shared/appMeta`), such as
   `WFHelper-fork/<version> (+https://github.com/aurablacklight/WFHelper)`.
7. Renderer: set it for WFM hosts only with
   `session.defaultSession.webRequest.onBeforeSendHeaders({ urls: ["https://api.warframe.market/*"] }, ...)`
   in `main.ts`, next to the existing `onHeadersReceived` at `main.ts:391`.
   Setting `User-Agent` in the page's `fetch` headers is not reliable in
   Chromium. A global `app.userAgentFallback` would also change the UA the
   clearance window sends, which the code says breaks Turnstile.
8. Main `wfmClient`: send the fork UA instead of `_browserUa()` and
   `Mozilla/5.0 WFHelper/1.0`, and set it on the node-https path. Add it to the
   WebSocket's `headers` as well.
9. **Conflict to settle first:** the clearance flow (`:142-221`, `:373-380`)
   depends on replaying a browser UA, because `cf_clearance` is bound to the UA
   it was earned under. With a descriptive UA everywhere, the challenge window
   has to earn clearance under that same UA, which the code comment says
   Turnstile rejects. Otherwise the clearance path goes away. Whether WFM's
   Cloudflare still challenges an identified client can only be learned by
   trying it, which needs a launch (and reads the Warframe session token while
   the game runs).

## Open questions (owner calls)

- Keep or drop the automated Cloudflare-challenge solver, given WFM's "make
  traffic difficult to classify" clause. Ask WFM staff about it?
- Are the About card's Source, Website and Community rows pointing at upstream
  (`AboutCard.svelte:87-97`) in scope here or in the cutover client-changes
  work?
