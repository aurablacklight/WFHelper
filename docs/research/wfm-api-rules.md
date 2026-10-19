# Can the fork run its own Warframe Market caching backend within WFM's rules?

Research for #25 (part of map #21). Sources read 2026-10-18.

## Short answer

Yes, at the worker's current volume a fork-run cache fits WFM's published
rules, **if three things change first**:

1. **Identify the fork.** WFM calls send no `User-Agent` at all. The wiki, npm
   and jsDelivr calls send `WFHelper-worker/1.0 (+https://wfhelper.com)`,
   which is upstream's site. A fork deployment should send its own UA
   (for example `WFHelper-fork-worker/<version> (+https://github.com/aurablacklight/WFHelper)`)
   on every outbound call.
2. **Pace WFM calls.** Calls are serialized but nothing waits between them, so
   the request rate is set by latency alone. Add a minimum gap: about 350 ms
   for item and order endpoints (3 req/s), and 6 s or more for riven auction
   search (10 req/min).
3. **The riven sweep breaks the contract limit as written.** It sends 12
   `v1/auctions/search` calls back to back every 15-minute tick. That is above
   the ToS limit of 10 per minute for contracts.

Two rules are judgment calls for the owner, not code changes (see "Owner
decisions" below): WFM asks to be contacted before a public API app launches,
and it rejects "data mirrors or traffic offloading layers".

## What WFM publishes

**Rules page**, https://docs.warframe.market/docs/rules/overview/:

- "Every application should use a dedicated and descriptive `User-Agent`
  header", with project name, version and a contact URL. Clients that "hide
  their identity, impersonate browsers, or intentionally make traffic difficult
  to classify may be blocked."
- "Do Not Clone Warframe.market": "We may restrict applications that are
  primarily website clones, data mirrors, or traffic offloading layers."
  Tools should "add meaningful value", and the examples given include overlays,
  analytics and notifications.
- "Use caching, reuse responses, avoid tight polling loops ... Do not
  repeatedly fetch large collections or high-traffic endpoints when local
  caching would work."
- "The general public API limit is `3` requests per second." Contract search
  is "expected to be limited to roughly `10` to `20` requests per minute".
  Limits "may change without notice".
- Access can be restricted per client, IP, network, cloud provider or traffic
  pattern, without notice.

**Terms of Service §11 API**, https://warframe.market/tos:

1. "Requests may not be made at a rate faster than 3 per second for listings
   or 10 per minute for contracts."
2. Unless the use is personal or educational, API data "may only be used to
   provide additional features not available on the Site. Site staff should be
   contacted prior to making applications using the API public."
3. Copy/paste trade messages must match the Site's format and include the
   application name.
4. "Applications using the API may be blocked at the discretion of the Site
   developers."

**API version**, https://docs.warframe.market/docs/intro/ and
https://docs.warframe.market/docs/api/overview: "The legacy v1 API is
deprecated and unsupported." v2 is at `v0.25.0`, is below 1.0, and "expect
changes, including breaking changes". The documented headers are `Language`,
`Platform` and `Crossplay`. The worker already sends all three
(`config/shared/wfm.ts`, `WFM_HEADERS`).

## What the worker sends today

From `backend/worker/src`. The crons are `*/15 * * * *` and `0 4 * * *`
(`wrangler.jsonc`).

| Upstream | Endpoints | UA sent | Cadence / volume |
| --- | --- | --- | --- |
| WFM v2 | `/v2/items` (catalog), `/v2/items/{slug}`, `/v2/orders/item/{slug}`, `/v2/riven/weapons` | none (only `WFM_HEADERS`) | catalog every 24 h; per tick, prewarm checks up to 125 slugs (meta + price) and the order-summary sweep up to 36 slugs x 2 ranks. Entries fresher than about 21 h are skipped. |
| WFM v1 (deprecated) | `/v1/items/{slug}/statistics`, `/v1/items/{slug}/orders` (fallback), `/v1/auctions/search?type=riven` | none | top-traded sweep 150 slugs/tick, price seed 20/tick, riven sweep 12 auction searches/tick |
| wiki.warframe.com | `Coda_Weapons`, `Tenet_Weapons`, `Nightwave/Offerings`, all `?action=raw` | `WFHelper-worker/1.0 (+https://wfhelper.com)` | rebuilt at most hourly, so 3 small pages/hour |
| npm registry | `@wfcd/items` packument (about 368 KB gzipped) | same | checked per tick, subject to the stored refresh state |
| jsDelivr | `@wfcd/items@{v}/data/json/Relics.json` | same | only when a new release is picked |
| DE / warframestat.us | `worldState.php`, `/pc/voidTrader` (Baro archive) | same | daily, plus retries |

There is no delay anywhere in the WFM loops (no `setTimeout` or
`scheduler.wait` in `src`). The comment in `history.ts` reads: "Serialized like
the prewarm sweep: one upstream request at a time, never a burst." Being
serialized does not cap the rate, though. At around 150 ms per round trip, a
sequential loop runs at roughly 6 req/s.

In the worst case, when every entry is due, one tick makes roughly 600 to 650
WFM calls. A tick is 900 s, and 3 req/s allows 2,700 calls in that time, so the
total volume fits if the calls are spread out. Only the burst rate is out of
bounds.

Cloudflare adds `CF-Worker: <zone>` to every Worker subrequest
(https://developers.cloudflare.com/fundamentals/reference/http-headers/#cf-worker),
and WAF rules can block on `cf.worker.upstream_zone`. WFM can therefore tell a
fork deployment apart from upstream's, and block it, even without a UA. This
means the fork's traffic carries its own reputation.

## Is a second cache acceptable?

- **Volume:** yes. A cache that refreshes each slug about once per 21 h is the
  "use caching, reuse responses" pattern the rules ask for. For a few friends
  it is far below what each client hitting WFM directly would cost. Even so,
  it doubles upstream's cron load on WFM, because a second full sweep runs
  whether or not anyone uses it. The way to stay well clear of the limits is
  to cut the sweep to what the fork's users actually use: smaller
  `PREWARM_BATCH_SIZE` and `TOP_TRADED_BATCH_SIZE`, or turning off the
  price-seed and riven archive families.
- **Purpose:** WFHelper's value is in-game overlays, relic and inventory
  pricing, and history. That is "additional features not available on the
  Site", so it is not a clone. The cache itself serves only WFHelper clients
  (bootstrap-gated public routes), not a general WFM mirror. It should stay
  that way: no open endpoint that re-serves raw WFM order books.
- **v1 dependence:** statistics, the orders fallback and riven auctions still
  use deprecated, unsupported v1. They can break without notice, and a fork
  has no say in that.

## Other upstream sources

- **Wiki (wiki.warframe.com, hosted by Weird Gloop):** the text licence is
  CC BY-NC-SA 3.0 (https://meta.weirdgloop.org/w/Licensing). That requires
  attribution, non-commercial use and share-alike. A free tool for friends
  meets non-commercial, and the docs already record `source`. The UI should
  credit the wiki wherever vendor or Nightwave data is shown.
  https://wiki.warframe.com/robots.txt disallows `/*?action=` for all user
  agents. robots.txt is aimed at crawlers, and 3 identified fetches an hour is
  not crawling, but the worker's `?action=raw` URLs fall in that pattern. The
  wiki publishes no reader rate limit. Its bot policy
  (https://wiki.warframe.com/w/WARFRAME_Wiki:Bots) covers editing bots only.
  Keep the descriptive UA. The code already notes that browser-spoofed UAs get
  a 403.
- **`@wfcd/items`:** MIT licence (npm registry `license` field,
  https://registry.npmjs.org/@wfcd%2Fitems/latest). It can be redistributed in
  trimmed form, keeping the copyright notice. The fetch pattern (one packument
  check, then the release file only on a version change) is already light.
  The registry and jsDelivr publish no limit that this volume comes close to.

## Owner decisions

- **Contacting WFM.** ToS §11.2 says staff "should be contacted prior to
  making applications using the API public". A private fork for a few friends
  arguably is not "public". Making the fork's backend reachable by anyone, or
  publishing fork builds widely, would be. Whether to reach out on WFM's
  Discord is the owner's call. This research contacted no one.
- **Turning off families on a fork deployment.** Price seed, top-traded and
  the riven archive are the heaviest and least essential for a small group.
