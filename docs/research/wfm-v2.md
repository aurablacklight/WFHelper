# Does WFM's v2 API replace the v1 endpoints the worker still uses?

Research for #35 (part of map #21; follows #25). Sources read and endpoints
probed 2026-10-18.

## Short answer

**Only one of the three has a v2 replacement, and that one is already dead on
v1.**

| Worker use | v1 endpoint | v1 status today | v2 replacement |
| --- | --- | --- | --- |
| Price statistics (closed trades) | `/v1/items/{slug}/statistics` | works (200, about 100 KB) | **none** |
| Riven auctions | `/v1/auctions/search?type=riven` | works (200, about 540 KB for `soma`) | **none** |
| Order-book fallback | `/v1/items/{slug}/orders` | **gone**: `403 Deprecated` | `/v2/orders/item/{slug}` (already the primary path) |

So moving to v2 cannot be part of the cutover: v2 has nothing to move
statistics or rivens to. The orders fallback can simply be deleted. The fork
lives with the v1 statistics and auction risk until WFM ships v2 equivalents.

## What v2 offers

WFM's docs are generated from the public repo
https://github.com/42bytes-team/wfm-docs (last change 2026-06-22, "update API
version to v0.25.0"). The full public v2 surface is these pages:

- Manifests: `/v2/versions`, `/v2/items`, `/v2/item/{slug}`,
  `/v2/item/{slug}/set`, `/v2/riven/weapons`, `/v2/riven/weapon/{slug}`,
  `/v2/riven/attributes`, lich and sister manifests, locations, NPCs,
  missions. https://docs.warframe.market/docs/api/manifests
- Orders: `/v2/orders/recent`, `/v2/orders/item/{slug}`,
  `/v2/orders/item/{slug}/top`, `/v2/orders/user/{slug}`, plus authenticated
  order CRUD. https://docs.warframe.market/docs/api/orders
- Groups, users, achievements, authentication, `/v2/dashboard/showcase`.
- WebSocket: a new-order subscription only. Item order subscriptions are
  stubs, "not registered as public WebSocket routes".
  https://docs.warframe.market/docs/websockets/subscriptions

There is no statistics, price history, auction or contract endpoint anywhere
in the docs. The data models include a `Transaction` (a closed order), but it
is only returned by the authenticated "close order" call, not as a market
history feed (https://docs.warframe.market/docs/data-models#transaction).
The rules page mentions "contract search endpoints" with a 10-20/min limit,
which suggests contracts are coming, but none is documented
(https://docs.warframe.market/docs/rules/overview).

A probe of the obvious guess, `/v2/items/{slug}/statistics`, returned `404`.

The intro still says "The legacy v1 API is deprecated and unsupported. We do
not plan to publish new v1 documentation", and that v2 is below 1.0 with
breaking changes expected (https://docs.warframe.market/docs/intro).

The only open issue on the docs repo
(https://github.com/42bytes-team/wfm-docs/issues/1, 2026-07-29) confirms the
gap from the outside: "Besides `v2/items`, there are currently no bulk API
routes available to fetch item details (specifically on price history)". It
says WFM support points people to relics.run for daily price history. That is
a third party, not WFM.

## Each use in detail

### 1. Price statistics

Callers: `fetchPricePayload` in `backend/worker/src/services/prewarm.ts`
(the live price behind `/v1/prices/:slug`, used by the prewarm sweep and
`readThrough.ts`), and `fetchItemStatistics` in
`services/wfmStatistics.ts` (used by `priceHistorySeed.ts` and
`topTraded.ts`).

What v1 returns: `payload.statistics_closed` with `48hours` (hourly) and
`90days` (daily) rows. Each row has `datetime`, `volume`, `min_price`,
`max_price`, `open_price`, `closed_price`, `avg_price`, `wa_price`, `median`,
`moving_avg`, `donch_top`, `donch_bot` (probe of `mirage_prime_set`). The
worker reads `wa_price`, `median` and `volume`, plus `mod_rank` on ranked
items (`config/shared/wfmStats.ts`, `services/wfmStatistics.ts`).

v2 equivalent: none. The nearest v2 data is the live order book, which gives
**asking** prices, not **traded** prices. A median of current sell orders
would be a different number with a different meaning, and it has no history.

If v1 statistics went away: the worker's live price, the 90-day price-history
seed and the top-traded list would all stop updating. Cached KV data would go
stale, not vanish. This is the core of the app's price display, so it is the
biggest single risk to the fork's backend.

### 2. Riven auctions

Caller: `fetchRivenAggregate` in `backend/worker/src/services/history.ts`
(12 searches per 15-minute tick; see #25 for the rate problem). The weapon
list already comes from v2 (`/v2/riven/weapons`).

What v1 returns: `payload.auctions[]` with `starting_price`, `buyout_price`,
`top_bid`, `visible`, `closed`, `platform`, `crossplay`, timestamps, owner and
the riven's `item` attributes. The worker reads only the prices, `closed` and
`visible`.

v2 equivalent: none. Rivens appear in v2 only as manifests (weapons,
attributes). There is no auction search.

If it went away: the riven archive would stop gaining rows. Nothing else in
the worker depends on it. The family can already be turned off for a fork
(#25).

### 3. Order-book fallback

Caller: `fetchOrdersPayload` in `prewarm.ts`. It tries
`/v2/orders/item/{slug}` first and only calls v1 when v2 fails with a
non-transient error (a 4xx other than 429).

v1 status: `GET /v1/items/mirage_prime_set/orders` returned `403` with the
body `Deprecated`. WFM has already switched this endpoint off.

Effect on the worker today: none visible. A 403 is treated as non-transient
with no data, which is the same result the v2 failure already gave. The
fallback only costs one extra wasted request per failed slug. It can be
deleted without changing behaviour.

v2 shape, for reference: `/v2/orders/item/{slug}` returns a flat `Order[]`
(`type`, `platinum`, `quantity`, `perTrade`, `rank`, `subtype`, `visible`,
`user` with status), limited to users seen in the last 48 h. The worker's
`normalizeWfmOrderBookSide` already handles it. `/v2/orders/item/{slug}/top`
returns the top 5 buy and sell orders from online users, filtered server-side
by `rank` or `subtype`. That could replace the client-side filtering and cut
payload size, but it is optional.

## Smaller findings

- **The worker calls an undocumented path.** `fetchMetaPayload` uses
  `/v2/items/{slug}` (plural). The docs list `/v2/item/{slug}` (singular).
  Both returned the same body in a probe, but only the singular one is
  contracted. Switching is a one-word change.
- **The desktop app also calls v1 directly**, outside the worker:
  `src/lib/wfm/wfmPrice.ts` and `src/components/market/MarketBrowseStats.svelte`
  (statistics), `src/lib/wfm/orderBook.ts` (the same dead orders fallback),
  `src/components/market/MarketBrowseView.svelte` (`/v1/items/{slug}`), and
  `services/wfmClient.ts`, whose base URL is v1 (auth, riven search, auction
  create). Out of scope for #35, but the same risk applies.
- `config/shared/wfmRivenVocabulary.ts` cites `/v1/riven/attributes` as its
  source. `/v2/riven/attributes` exists, if it is ever regenerated.

## Recommendation

- **Cutover:** delete the v1 orders fallback (worker and client), and switch
  `/v2/items/{slug}` to `/v2/item/{slug}`. Both are small and remove calls to
  something already dead or undocumented.
- **Keep v1 statistics and auctions**, because nothing replaces them. Make the
  failure visible rather than silent: log or alert when statistics calls start
  returning 403 or 404, since a stale cache looks healthy.
- **Later:** check the docs repo for new statistics or contract pages when
  WFM bumps the API version. relics.run is the only known alternative source
  of daily price history, and it would need its own look at terms and fit.

## Probes made

Six GETs, a few seconds apart, with
`User-Agent: WFHelper-fork-research/0.1` and `Platform: pc`:
`/v2/item/mirage_prime_set` (200), `/v2/items/mirage_prime_set` (200),
`/v1/items/mirage_prime_set/statistics` (200),
`/v1/auctions/search?type=riven&weapon_url_name=soma&sort_by=price_asc` (200),
`/v1/items/mirage_prime_set/orders` (403 `Deprecated`),
`/v2/items/mirage_prime_set/statistics` (404).
