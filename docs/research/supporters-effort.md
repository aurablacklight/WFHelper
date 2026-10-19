# Supporters: remove or serve an empty list?

Resolves #26 (part of #21). Researched 2026-10-18 against fork `main` at `5e0ce794`, which
already contains all of `upstream/main` (`git log HEAD..upstream/main` is empty).

## Choice

**(c) Keep the feature and let it serve an empty list.** It needs no code changes: leave the
`DISCORD_BOT_TOKEN` secret unset and blank two `wrangler.jsonc` vars. Removing it (a) means
editing 12 worker files that upstream changes often, and rewriting a test file that uses
`/v1/supporters` as its probe route.

## What exists in the fork today

- **Client: nothing.** Commit `488d6dff` ("remove upstream patreon and supporter promotions",
  noted in `docs/beta-notes/0.1.0-beta.5.md`) already removed `SupportersCard.svelte`,
  `src/lib/supporters.ts`, its test, the i18n keys and the settings e2e checks. Upstream still
  has them (`git grep -ic supporter upstream/main`: `src/components/settings/SupportersCard.svelte`,
  `src/lib/supporters.ts`, `tests/renderer/lib/supporters.test.ts`, `e2e/settings-layout.spec.ts`).
  The fork's app never calls `/v1/supporters`.
- **Worker: all of it.** `git grep -ic supporter` in the fork only finds hits under
  `backend/worker/` (plus that beta note).

## Option (c): serve an empty list

How it already behaves:

- `syncSupporters` (`backend/worker/src/services/supporters.ts:214-220`) returns
  `not_configured` and logs a 204 when the guild id, bot token or role map is missing.
  Comment: "Unconfigured deploys are a no-op, not an error." `ARCHITECTURE.md` ("Supporter
  credits") says the same.
- `GET /v1/supporters` (`src/routes/public.ts:474-501`) reads KV key `supporters:discord:v1`.
  The fork backend starts with fresh KV, so the key is never written and the route returns
  `{ ok: true, updatedAt: null, supporters: [] }`. Empty replies are never edge-cached.
- The admin `exclusions` and `sync` routes (`src/routes/admin.ts:162-181`) still work. Behind
  `ADMIN_API_KEY` they write an empty exclusion list or report `not_configured`.

Edits:

| File | Change |
| --- | --- |
| `backend/worker/wrangler.jsonc` (lines 108-109) | Set `DISCORD_GUILD_ID` and `DISCORD_ROLE_TIER_MAP` to `""`. Optional, because the missing token already turns the sync off, but it stops the fork's config from naming upstream's Discord guild. |
| Deploy runbook (secrets ticket) | Say that `DISCORD_BOT_TOKEN` is deliberately not set. |

Effort: about 2 lines. Tests: none change.

Merge-conflict risk: very low. Upstream has changed those two vars once (`d6ea0f8a`,
2026-08-26). The fork will edit `wrangler.jsonc` anyway for its own KV ids, routes and
observability, and #21 already puts fork-specific values there.

## Option (a): remove the feature

| File | Supporter references | What has to go |
| --- | --- | --- |
| `src/services/supporters.ts` | whole file, 256 lines | delete |
| `src/routes/public.ts` | 13 | import, `supportersRequests` stat, cache constants, the route block |
| `src/routes/admin.ts` | 5 | import, the exclusions and sync routes |
| `src/index.ts` | 4 | import, the route classifier entry, the `cron:supporters` stage |
| `src/config.ts` | 4 | `parseRoleTierMap`, two config fields |
| `src/constants.ts` | 3 | `SUPPORTERS_KEY`, `SUPPORTER_EXCLUSIONS_KEY`, `LEGACY_PATREON_KEYS` |
| `src/types.ts` | 5 | `Supporter*` types, three `DISCORD_*` env fields |
| `src/security/rateLimit.ts` | 1 | the `'supporters'` bucket |
| `wrangler.jsonc` | 2 | the Discord vars, the cron comment |
| `test/index.spec.ts` | 38 | the `discord supporters` describe (lines 2277-2555), plus cron tests such as "keeps the later daily stages running when the supporter sync throws" (line 2646), which also guard other cron stages |
| `test/clientIdentity.spec.ts` | 18 | uses `/v1/supporters` as its probe route for the client-policy tests, so every case has to move to another public route |
| `README.md`, `ARCHITECTURE.md` | 4, 14 | route lists, the "Supporter credits" section |

Effort: 12 files, about 600 lines removed, plus re-pointing the client-identity tests and
checking that the cron-resilience tests still cover the other stages. That is a small PR, but
real work.

Merge-conflict risk: high. In the 34 upstream worker commits since supporters landed
(2026-08-25 to 2026-09-27), upstream changed the files this option edits this many times:
`ARCHITECTURE.md` 20, `src/index.ts` 16, `src/constants.ts` 12, `wrangler.jsonc` 9,
`src/routes/public.ts` 8, `README.md` 8, `src/types.ts` 7, `src/config.ts` 7,
`test/index.spec.ts` 6, `src/security/rateLimit.ts` 6 (`git log upstream/main --since=2026-08-25
--name-only -- backend/worker`). Most of those commits did not touch supporters, but the edits
sit next to code upstream keeps adding to: route tables, the daily cron, constants, the env type.
`supporters.ts` itself changed only twice (`57b0bd76`, `d3f7a58e`). If upstream edits it again,
a deleted file causes a modify/delete conflict every time.

## Why (c)

- There is nothing left to remove from the client, so (a) only cleans up the worker, and the
  worker is the part #21 wants to keep merging from upstream.
- With no token, (c) never contacts Discord and publishes no names. That satisfies the
  privacy and courtesy goals as well as (a) does.
- If the owner later wants a static list, `POST /admin/supporters/exclusions` cannot add
  names. The only way is a one-off `wrangler kv key put supporters:discord:v1`. No code
  change either way.
