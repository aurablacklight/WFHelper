# What the fork backend costs on Workers Paid

Research for #23 (map #21). Written 2026-10-18 from `backend/worker` at `5e0ce794` and the
Cloudflare docs as published that day. Counts come from reading the code. Nothing was deployed or
measured.

## Answer

**$5.00 a month, the plan minimum.** Every metered line stays inside what the plan includes. The
closest one is KV writes, at about 50% of the included 1M a month.

The cost is set by the **crons, not by users**. Prewarm walks the whole Warframe Market catalog
whatever the traffic, so a backend for a few friends costs about the same as upstream's does for
its crons. User traffic only adds requests, and a few users come to well under 1% of the
included 10M.

One limit needs checking after deploy. The KV docs still list **1,000 KV operations per
invocation** on Paid, but the Workers docs say internal subrequests now follow the 10,000 default.
A cold-start tick (the first ~8 hours after deploy, while the 2-day price seed is also running)
does about 1,400 KV operations. See [Limits](#limits-the-worker-can-hit).

## Prices and limits used

| Item | Workers Paid includes | Overage | Source |
| --- | --- | --- | --- |
| Worker requests | 10M/mo | $0.30/M | [1] |
| Worker CPU | 30M ms/mo | $0.02/M ms | [1] |
| KV reads | 10M/mo | $0.50/M | [1] |
| KV writes / deletes / lists | 1M/mo each | $5.00/M | [1] |
| KV storage | 1 GB | $0.50/GB-mo | [1] |
| DO requests | 1M/mo | $0.15/M | [3] |
| DO duration | 400,000 GB-s/mo | $12.50/M GB-s | [3] |
| DO SQLite rows read / written / stored | 25B / 50M / 5 GB-mo | ... | [3] |
| Workers Logs (until 2026-11-30) | 20M events/mo | $0.60/M | [1] |
| Observability (from 2026-12-01: logs + traces) | 50 GB ingest, 10 GB-mo storage | $0.25/GB, $0.10/GB-mo | [6] |
| Subrequests per invocation | 10,000 default (configurable up to 10M) | | [2][7] |
| KV operations per invocation | **1,000** (KV page) | | [4] |
| CPU per cron invocation | 30 s for crons under 1 h apart; `cpu_ms` sets a lower cap | | [2] |
| Wall time per cron invocation | 15 min | | [2] |
| Cron Triggers per account | 250 | | [2] |
| Rate Limiting binding | no line item on the pricing page; per-PoP counters, period 10 or 60 s | | [1][5] |

Subrequests themselves are not billed ([1], footnote 1).

## Inputs

- Catalog: `GET api.warframe.market/v2/items` returned **N = 3,892** items, **R = 1,521** with
  `maxRank > 0` (2026-10-18). ARCHITECTURE.md's "~4,000" agrees.
- `wrangler.jsonc`: crons `*/15 * * * *` and `0 4 * * *`, so 96 + 1 = 97 invocations a day and
  about 2,910 a month (30 days). `PREWARM_BATCH_SIZE=125`, `ORDER_SUMMARY_PREWARM_BATCH_SIZE=36`,
  `STALE_REFRESH_SEC` and `ORDERS_SUMMARY_STALE_REFRESH_SEC` both 75,600 (21 h),
  `CACHE_TTL_SEC=86400`, `TOP_TRADED_BATCH_SIZE=150`, `PRICE_SEED_BATCH_SIZE=20`,
  `RIVEN_ARCHIVE_BATCH_SIZE=12`, `cpu_ms=1000`.

## How often prewarm refreshes an item

Prewarm (`prewarmBatch`, `src/services/prewarm.ts`):

- 125 × 96 = 12,000 visits a day ÷ 3,892 slugs = 3.08 visits per slug a day, one every 7.78 h.
- An entry refreshes on the first visit after it is 21 h old, which is the third visit:
  3 × 7.78 = 23.35 h. So each slug refreshes about 1.03 times a day.
- This is tight against the 24 h TTL. Past about 4,000 slugs the third visit lands after
  24 h, so keys expire minutes before their refresh (12,000 ÷ 4,000 = 3 visits ⇒ exactly 24 h).
  The snapshot keeps its own copy, so the effect is small. Still, catalog growth will cause it.

Order summaries (`prewarmOrderSummaryCatalog`):

- 36 × 96 = 3,456 entry visits a day ÷ 1,521 = 2.27 a day, one every 10.56 h.
- The refresh comes on the second visit, at 21.12 h, so 1.14 refreshes a day.
- Each entry covers 2 ranks (`[0, maxRank]`), and each rank writes 1 order summary and
  1 ranked price.

## Per-tick operations (15-minute tick)

R = KV read, W = KV write or delete, F = upstream fetch, DO = Durable Object request.

| Stage | Fixed per tick | Per item | Ordinary tick | Worst tick (everything due) |
| --- | --- | --- | --- | --- |
| Budget gate (`isDailyBudgetExceeded`) | 1 DO | | 1 DO | 1 DO |
| Baro retry | 1–2 R | | 2 R | 2 R (+F/W while Baro is live) |
| Prewarm, 125 slugs | catalog R + **catalog W**¹, ranked R, cursor R, cursor W, last-run W, 1 DO | 3 R; if due 2 F + 2 W (3 W on `noSales`) | 375 R + ~42 due × (2F+2W) ≈ **381 R, 87 W, 84 F** | 125 × (3R+2F+3W) ≈ **379 R, 378 W, 250 F** |
| Order summary, 72 rank entries | catalog R, cursor R, cursor W, last-run W, 1 DO | 2 R; if due 1–2 F + 1 W (orders) and 1 F + 1–2 W (price) | 144 R + ~18 due × 4 ≈ **146 R, 38 W, 36 F** | 72 × (2R+3F+3W) ≈ **146 R, 218 W, 216 F** |
| Riven sweep (≈21 ticks/day) | state R, list R, day R, state W, day W, index R/W | 1 F | ≈5 R, 4 W, 12 F | ≈5 R, 12 W, 13 F |
| Price seed (first ~200 ticks only) | state R, slugs R, ranked R, state W | 1 F; flush ≤90 days × (R+W) | ≈95 R, 95 W, 20 F | ≈95 R, 100 W, 20 F |
| Price seed (after it latches) | 1 R | | 1 R | 1 R |
| Top traded | catalog R + **catalog W**¹, ranked R, state R/W | 1 F; merge ≤8 days × (R+W); hourly rebuild 9 R + 1 W | ≈14 R, 10 W, 150 F | ≈20 R, 12 W, 150 F |
| Price-history fold | state R/W, doc R/W, index R | ≤30 day R | ≈10 R, 2 W | ≈33 R, 2 W |
| Adversary vendors, Nightwave, WFCD relics | 1 R each | hourly: 1–3 F + 1–2 W each | 3 R | ≈6 R, 6 W, 6 F |

¹ `fetchCatalogSlugs` rewrites `order-summary:catalog:v1` every time it is called with a fresh
catalog, which is twice per tick (prewarm and top traded). That costs about 5,800 KV writes a
month for nothing. It is upstream code, so leave it unless upstream changes it.

The snapshot read-modify-write (1 R + 1 W of `snapshot:full:v1`) runs inside the
`SnapshotCoordinator` DO's own invocation, 2 calls a tick, so it does not count toward the cron's
per-invocation limits.

**Totals per cron invocation:**

| | KV ops | Fetches | All subrequests |
| --- | --- | --- | --- |
| Ordinary tick, seed finished | ≈ 700 | ≈ 300 | ≈ 1,000 |
| Ordinary tick, seed running | ≈ 890 | ≈ 320 | ≈ 1,210 |
| Worst tick (cold start + seed) | ≈ **1,420** | ≈ 655 | ≈ 2,080 |

ARCHITECTURE.md (Top traded section) gives about 1,700 for prewarm and order summaries in a
worst tick. That agrees with the 1,587 those two stages add up to above.

## Monthly totals (30 days, seed finished)

**Worker requests:** 2,910 cron invocations plus users. Even 10 users at 2,000 requests a day
come to 600k a month, 6% of the included 10M. **$0.**

**Worker CPU:** this was not measured. The heavy parts are JSON parsing: about 250 WFM statistics
payloads a tick, the catalog key read twice, up to 30 archive days in the fold, and the hourly
WFCD check, which parses a 4.9 MB doc when a release changes. Assume a ceiling of
`cpu_ms` = 1,000 ms per tick. Then 2,910 × 1,000 = 2.9M ms, which is 10% of the included 30M.
Raising `cpu_ms` to 30,000 would still cap the worst case at 87M ms, about $1.15 of overage.
**$0.**

**KV reads per day:**

- prewarm 12,000 × 3 = 36,000
- order summaries 3,456 × 2 = 13,824 (6,912 entry visits × 2 R)
- fixed reads plus the other stages ≈ 96 × 45 ≈ 4,300
- users: small, because the snapshot is edge-cached

That is about 54,000 a day, **1.6M a month** (16% of 10M). **$0.**

**KV writes per day:**

- prewarm: 3,892 × 1.03 × 2 = 8,020
- order summaries: 1,521 × 1.14 × 4 = 6,910
- fixed cursor, last-run and catalog writes: 96 × 5 = 480
- top-traded merge: ≤ 96 × 7 = 670
- snapshot (inside the DO): 192
- fold: 192
- riven, hourly docs and daily archives: ≈ 150

That is about 16,600 a day, **≈ 500k a month (50% of 1M)**. The one-time seed adds about 200
ticks × 95 = 19k. Deletes, from `noSales` and index pruning, are a few thousand against a separate
1M. **$0.** This is the line to watch. Halving `STALE_REFRESH_SEC`, doubling a batch size or a
much larger catalog would push it toward the included amount. Each extra million writes costs
$5.

**KV storage:**

- live caches, about 13,800 keys × ~200 B ≈ 3 MB
- snapshot and catalogs ≈ 3 MB
- WFCD doc 4.9 MB
- `archive:prices:{date}`: about 6,900 rows plus `priceBasisByKey`, roughly 0.6 MB a day. At the
  730-day `HISTORY_RETENTION_DAYS` that grows to about 440 MB by year two, plus about 30 MB of
  seeded days.
- the 64 `history:prices:v2` buckets, up to about 85 MB (400 points × ~7,000 keys)

That approaches about 0.6 GB after two years. It stays under the included 1 GB, and beyond that it
costs $0.50/GB-mo. **$0.**

**Durable Objects:**

- Requests: 2,910 budget checks, 5,820 snapshot patches, and sampled public requests at 1/100.
  That is about 9k a month, 0.9% of 1M.
- Duration: 5,820 patches × ≤1 s × 0.128 GB ≈ 750 GB-s, 0.2% of 400k.
- SQLite: the `DailyBudgetCounter` holds 2 keys and runs `deleteAll()` at midnight. Rows written
  are about 1 per 100 public requests.

**$0.**

**Rate Limiting:** the 7 bindings (`namespace_id` 31001–31007) carry no price on the pricing page
[1]. The binding docs describe counters cached per PoP and do not mention any charge [5]. **$0.**

**Logs and traces:** `head_sampling_rate: 1` for both.

- Logs: about 15 events a tick plus 1 per user request comes to about 50–700k events a month,
  under 20M.
- Traces: from 2026-12-01 they count toward the 50 GB ingest. Automatic tracing makes a span for
  each KV and fetch call, about 1,000–2,000 a tick, or 3–6M spans a month. At ~1 KB each that is
  roughly 3–6 GB, inside 50 GB.

**$0.** The `grafana-*` export destinations are an open question on the map (Observability).

**Crons:** 2 of 250 per account. Wall time: about 300–650 serialized fetches at ~150–300 ms each
take about 1–3 minutes, well inside 15 minutes.

## Limits the worker can hit

1. **KV operations per invocation (1,000), unresolved.** The KV limits page [4] and the KV read
   API page still say 1,000 on Paid. The Workers limits page [2] and the 2026-02-11 changelog [7]
   say internal-service subrequests follow the configured limit (10,000 by default). The worker's
   ordinary tick (≈700–890) fits either reading. A worst tick (≈1,420) breaks the 1,000 reading.
   It happens during the cold walk, about 31 ticks or 8 hours after a fresh deploy with an empty
   KV, and around catalog refreshes. Stages run in order with prewarm first, so an enforced cap
   would fail the later stages (top traded, fold, wiki docs) on those ticks. Each stage catches its
   own error and retries the next tick. Upstream's production presumably runs the same code
   without trouble, which hints that the 1,000 is stale, but that is not confirmed.
2. **`cpu_ms: 1000`** is a self-imposed cap, far below the 30 s cron limit. A heavy tick (cold
   walk + seed flush + WFCD release parse) could pass 1 s and fail with `exceededCpu`. Raising it
   costs nothing at this scale (see CPU above).
3. **Subrequests (10,000):** the ≈2,080 worst case fits. No change needed.
4. **Write-same-key 1/s:** already handled in code (WFCD state, snapshot through the DO).

## Knobs for a fork-scale backend

All of these are `vars` in `wrangler.jsonc`, so changing them leaves upstream's code untouched.

| Knob | Now | Suggestion | Effect |
| --- | --- | --- | --- |
| `TOP_TRADED_BATCH_SIZE` | 150 (a full pass every ~6.5 h, ~3.7 a day) | **41** (⌈3,892/96⌉, one pass a day) | The sweep only merges complete past days, so one pass a day is enough. Cuts ~14,400 → ~3,900 WFM statistics requests a day, the largest single upstream load, plus the CPU spent parsing them. KV writes barely change (≤7 day keys a tick either way). |
| `cpu_ms` | 1,000 | 5,000–30,000 | Removes the heavy-tick CPU risk. The worst-case bill stays under about $1.15 a month. |
| `PREWARM_BATCH_SIZE` / `ORDER_SUMMARY_PREWARM_BATCH_SIZE` | 125 / 36 | **Keep.** | Already sized to refresh once a day inside the 24 h TTL. Lowering prewarm below ~125 pushes the refresh past the TTL. Raising either adds KV reads, not writes. |
| `STALE_REFRESH_SEC` | 21 h | Keep | Lower means more writes, which is the line closest to its included amount. |
| `PRICE_SEED_ENABLED` | 1 | Keep (the map settled the seed) | One-time ~2 days, about 19k writes and 4k fetches. |
| `HISTORY_RETENTION_DAYS` | 730 | Keep; 365 halves archive storage | Storage stays under 1 GB either way. |
| `DAILY_BUDGET_MAX_REQUESTS` | 300,000 | Optional: lower, for example to 50,000 | 300k a day is about 9M a month, so it already holds requests under the 10M included. Requests refused after the trip are still billed, since the Worker runs and returns 503 from memory. The budget limits downstream work, not request charges. |

No sweep needs disabling for cost reasons.

## Sources

1. Workers pricing (updated 2026-10-02): https://developers.cloudflare.com/workers/platform/pricing/
2. Workers limits: https://developers.cloudflare.com/workers/platform/limits/
3. Durable Objects pricing (updated 2026-10-18): https://developers.cloudflare.com/durable-objects/platform/pricing/
4. KV limits: https://developers.cloudflare.com/kv/platform/limits/ ; also https://developers.cloudflare.com/kv/api/read-key-value-pairs/
5. Rate Limiting binding (updated 2026-10-12): https://developers.cloudflare.com/workers/runtime-apis/bindings/rate-limit/
6. Observability pricing (updated 2026-10-15): https://developers.cloudflare.com/observability/pricing/
7. Changelog, "Workers are no longer limited to 1000 subrequests" (2026-02-11): https://developers.cloudflare.com/changelog/post/2026-02-11-subrequests-limit/
8. Wrangler `limits` config: https://developers.cloudflare.com/workers/wrangler/configuration/#limits
9. Code: `backend/worker/wrangler.jsonc`, `src/index.ts`, `src/config.ts`, `src/services/prewarm.ts`,
   `prewarmCatalog.ts`, `history.ts`, `priceHistorySeed.ts`, `topTraded.ts`, `priceHistory.ts`,
   `src/security/dailyBudget.ts`, `ARCHITECTURE.md`.
