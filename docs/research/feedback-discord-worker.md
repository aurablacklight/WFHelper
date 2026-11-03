# A feedback-only Worker that posts to Discord: does the plan hold?

Stress test of the plan to move in-app Feedback off upstream onto a small Worker on the owner's
account. Related to map #21 and issues #27, #28, #30, #31, #39, #40. Written 2026-11-02 from `main`
at `55041656`, the official docs as published that day, and read-only `cf` checks. Nothing was
deployed, nothing was posted to Discord or `api.wfhelper.com`, and the app was not launched.

Facts below are verified against a source unless marked **Inference**. Community reports are
labelled as such.

## Verdict

**The Worker half is sound. The plan's premise is wrong, and the app change is not small.**

The fork has no in-app feedback form. Commit `7f27b982` (2026-10-10, the commit that created the
friends beta) deleted `src/components/FeedbackModal.svelte`. The Sidebar button opens
`https://github.com/aurablacklight/WFHelper/issues/new/choose` in the browser. Nothing in the
renderer calls `submitFeedback`, so `ipc/feedbackIpc.ts:68-69` is dead code in every beta.

So friends' reports do not go to the upstream maintainer. They go nowhere: a signed-out visitor is
redirected to GitHub's login page, and these friends have no accounts.

The need is real and more urgent than stated, but the work is "restore a 397-line modal and its 29
strings, plus a Worker", not "repoint a URL". Old builds cannot leak to upstream, which removes the
main worry in question 7.

Two more things to act on: Bot Fight Mode is on for the chosen zone and cannot be skipped per
hostname, and the log tail needs a token scrub before it ships. No token was found in the log, but
the only redaction is for file paths.

| #   | Question                          | Answer                                                                                                                                                                                       |
| --- | --------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Cloudflare plan and fit           | **Confirmed:** Workers Paid. Plan fits Paid. **Refuted** for Free when a screenshot is attached (about 65 ms CPU measured locally, limit 10 ms). **One conflict:** Bot Fight Mode is on.     |
| 2   | Discord limits vs `discordBody`   | **Confirmed fits.** Worst case 4,712 of 6,000 characters. One low-severity bug: `thread_name` can split an emoji.                                                                            |
| 3   | Discord blocking Workers egress   | **Refuted as a current problem.** Discord staff said it was fixed with Cloudflare (2025-11-11) and reaffirmed Workers support (2026-10-10). The route handles a 1015 acceptably.             |
| 4   | Privacy of the log                | **Opt-in in the old modal. No session token path found, none in the owner's real log.** Contains third-party player names, WFM names, and possibly the Windows username on one failure path. |
| 5   | Reusing the route                 | **Confirmed feasible** with one new entry file and one new wrangler config inside `backend/worker`. No KV, DO or cron needed.                                                                |
| 6   | App change                        | **Larger than planned.** Restore the modal, add a separate feedback base constant, no CSP change.                                                                                            |
| 7   | Old builds                        | **Nothing to redirect.** beta.3 to beta.6 open GitHub and never call the route. The in-app updater moves friends to beta.7 without a reinstall.                                              |
| 8   | Other flaws, licence, terms, cost | **No extra cost, MIT is fine, webhook stays out of the client as Discord requires.** The plan contradicts #21's settled decision, which the owner should change on the record.               |

## Evidence

### Premise: what Feedback does today

- `src/config/links.ts:4` sets `FEEDBACK_URL` to the fork's `issues/new/choose`.
- `src/components/Sidebar.svelte:299` runs `send("open-external", FEEDBACK_URL)`.
- `e2e/feedback.spec.ts:26` asserts `[data-feedback-modal]` has count 0, and `:35` asserts the
  GitHub URL. `scripts/test-beta-update.mjs:179` asserts the same URL.
- `src/i18n/en.json:13` keeps only `feedback.title`. The other 29 strings left with the modal.
- A repo-wide search finds `submitFeedback` and `getFeedbackContext` only in `ipc/feedbackIpc.ts:51-52`,
  `config/shared/ipcRoutes.ts:311,315` and the tests. The handler is registered at `main.ts:519`.
- Unauthenticated `GET https://github.com/aurablacklight/WFHelper/issues/new/choose` returned 302
  to `https://github.com/login?return_to=...` on 2026-11-02.
- `docs/features/builds.md:76-77` still tells readers to use Feedback or an issue on
  `github.com/WFHelper/WFHelper`, which is upstream. That link should change either way.

### 1. Cloudflare

**Account (read-only `cf`, 2026-11-02).** `cf accounts subscriptions get` lists `workers_paid`
("Workers Paid", $5 monthly). #21's assumption is **confirmed**. Four Workers exist, none named
`worker` or `wfhelper-feedback`. The zone is active on Free Website. DNS holds `clips` (CNAME,
proxied) and `partyline` (AAAA, Worker-owned), so the new hostname is free. Universal SSL is enabled.
`cf o11y destinations list` returns zero destinations. `cf workers get` does not show bindings, so
the other Workers' `namespace_id` values were not read.

**Bot Fight Mode: the one real conflict.** `cf bot-management get` shows `fight_mode: true` on this
zone, with Browser Integrity Check on and security level medium.

- Bot Fight Mode "may challenge API or mobile app traffic", protects "entire domains without
  endpoint restrictions" and "cannot be customized, adjusted, or reconfigured via WAF custom
  rules" [9]. It "operates outside this phase system and cannot be skipped with custom rules" [10].
- Browser Integrity Check "challenges visitors without a user agent or with a non-standard user
  agent" [11]. The app's main-process `fetch` sends no explicit User-Agent (`ipc/feedbackIpc.ts:71-75`).
- A challenge is a non-2xx status, so `feedbackIpc.ts:85` reports `failed`, which the old modal words
  as "Delivery could not be confirmed... may send a duplicate". That text would be wrong, and
  `feedbackIpc.ts` logs nothing, so the cause would be invisible.
- Weak evidence it may be fine: 6 of 6 Node `fetch` GETs and one curl from the owner's PC to
  `partyline` on the same zone came back 302 with no `cf-mitigated` header, with both the default
  and an app-like User-Agent. That is a GET from one residential IP to a different Worker, and the
  302 might itself come from something in front of that Worker. It says nothing about friends' IPs.
- **Inference:** a Custom Domain Worker is "treated as an origin" [3], so zone security runs before
  it. The docs read do not state the order for Bot Fight Mode specifically.
- Options: test as in the revised plan and keep it if clean. If challenged, turn Bot Fight Mode off
  for this zone (it also covers `clips` and `partyline`), use a zone on the account where it is
  already off, or drop the Custom Domain for a `workers.dev` hostname (not tested).

**Rate Limiting binding.** Config is `{ name, namespace_id, simple: { limit, period } }`.
`namespace_id` is a string holding a positive integer, unique per account. `period` "must be either
`10` or `60`" [2]. The existing 60 s values are valid. The binding docs state no plan restriction
and the pricing page has no line for it [2][4], so Free availability is **unknown**, and moot on Paid.

**Flaw: `FEEDBACK_GLOBAL_LIMITER` is not global.** The comment at `routes/feedback.ts:108` says "One
ceiling for every sender". The docs say counts in different locations "do not combine into one
worldwide limit", and that a strict limit needs a Durable Object [2]. `ARCHITECTURE.md:64` repeats
the claim. Real ceiling: 10 per minute per Cloudflare location, approximately. Fine for a few
friends, but it does not bound forum spam the way the comment says. `period` also rules out a daily
cap on this binding.

**Custom Domains.** Cloudflare "will create DNS records and issue necessary certificates" [3].
Creating one generates an Advanced Certificate on the zone, and Universal SSL also covers the apex
and one level of subdomain, so `wfhelper-feedback.docker-senpai.dev` is covered either way, with no
Advanced Certificate Manager subscription needed [3]. The block is "a hostname with an existing
CNAME DNS record" [3], and none exists. Config is `routes: [{ pattern, custom_domain: true }]` [3].
Nothing in the page restricts this by zone plan. **Confirmed.**

**Limits vs this route.**

| Limit                       | Free     | Paid                 | This route                                       |
| --------------------------- | -------- | -------------------- | ------------------------------------------------ |
| CPU per request [1]         | 10 ms    | 30 s default, to 5 m | about 65 ms with a 1 MiB screenshot (see below)  |
| Subrequests [1]             | 50       | 10,000               | 1                                                |
| Memory [1]                  | 128 MB   | 128 MB               | a few MB                                         |
| Request body, Free zone [1] | 100 MB   | 100 MB               | 2,000,000 bytes (`config/shared/feedback.ts:10`) |
| Requests [1][4]             | 100k/day | 10M/mo, +$0.30/M     | a handful                                        |

Local measurement, Node 24 (same V8 family, different hardware from Cloudflare, so **Inference** as
applied to Workers): a 1,668,826-byte worst-case body took a median 64.8 ms, nearly all in
`Uint8Array.from(binary, fn)` at `routes/feedback.ts:68`. A text-only report parses in well under
1 ms. So on Free, plain text reports would probably pass and screenshot reports would hit error 1102.
Paid has no such issue, and the `cpu_ms: 1000` copied from `wrangler.jsonc:25` leaves plenty of room.

Body budget: the owner's real 256 KiB log tail costs 4,758 bytes of JSON escaping, so a realistic
maximum is about 1,669,500 bytes, leaving about 330 KB. Only a log full of control characters could
pass 2,000,000, and that returns 400 and "invalid". **Not worth changing.**

**Secrets.** A secret is an encrypted binding whose value is hidden in Wrangler and the dashboard, and
`wrangler secret put` creates and deploys a new version [5]. **Confirmed fit.**

### 2. Discord

Worst-case embed against the limits [7]:

| Field                  | Max in code                                | Discord limit | Fits |
| ---------------------- | ------------------------------------------ | ------------- | ---- |
| `title`                | 120 (`config/shared/feedback.ts:5`)        | 256           | yes  |
| `description`          | 4,000 (`:6`)                               | 4,096         | yes  |
| `author.name`          | 15 ("Feature request")                     | 256           | yes  |
| Field count            | 4                                          | 25            | yes  |
| `Contact` value        | 120 (`:7`)                                 | 1,024         | yes  |
| `Diagnostics` value    | about 324 (128+32+32+64, labels, a number) | 1,024         | yes  |
| App version / Platform | 64 / 32 (`:47-48`)                         | 1,024         | yes  |
| **Total**              | **4,712**                                  | **6,000**     | yes  |

Total: 15 + 120 + 4,000 + 37 (field names) + 64 + 32 + 120 + 324. Empty field values cannot occur:
`text()` requires non-blank input and trims it (`feedback.ts:41-44`).

If a report did exceed, "Violating any of these constraints will result in a `Bad Request`" [7]. The
route logs `discord_<code>` and returns 502 (`routes/feedback.ts:142-143`), the client shows `failed`,
and the old modal kept the draft except the screenshot. Nothing is sent partially.

- **`wait=true`:** "waits for server confirmation of message send... and returns the created message
  body"; the default false means "a message that is not saved does not return an error" [6].
  `routes/feedback.ts:12,146` uses it correctly.
- **`thread_name`:** a forum webhook must send `thread_id` or `thread_name` [6]. Channel names are
  "1-100 characters" [12]. `routes/feedback.ts:81` slices to 100.
- **Bug, low severity:** `.slice(0, 100)` cuts UTF-16 units. With a title of 96+ characters, an emoji
  across position 100 leaves a lone surrogate. Discord's reaction is **unknown**; if it rejects, that
  report fails with `failed`. One-line fix: `Array.from(name).slice(0, 100).join("")`.
- **`applied_tags`:** supported, an array of tag ids for forum threads [6]. The route does not send
  them, and the `Bug:`/`Feature:` prefix does the job. A forum with `REQUIRE_TAG` needs a tag "when
  creating a thread" [12]. What that does to a webhook post without tags is **unknown**, so leave
  "Require tag" off.
- **Attachments:** default upload limit is 20 MiB per file, and the request maximum is 25 MiB [8][7].
  The route sends at most 1 MiB and about 256 KiB. `attachment://` in the embed matches the docs [8].
- **Webhook and thread creation limits:** Discord publishes no number for either. It says to read
  the response headers, and that active threads per guild are limited, without a figure in the pages
  read [13][14]. **Unknown numbers.** At a few friends' volume, **Inference:** not a concern.
- **Webhook URL trap:** the check at `routes/feedback.ts:10` only accepts `discord.com`. A URL
  copied from the PTB or Canary client (`ptb.discord.com`) gets 503 `unavailable`.

**Sound, for this owner specifically.** Every report creates a forum post, which can make Discord
play a notification sound on the owner's PC. `SUPPRESS_NOTIFICATIONS` is a permitted webhook flag
that "will disable push notifications and only cause a notification badge" [6][7], but the route does
not set it. Muting the channel in Discord needs no code. Any end-to-end test post should wait until
that is done and the owner has agreed to it.

### 3. Discord reachability from Workers

Documented fact:

- IPs making too many invalid requests are "automatically and temporarily restricted". The limit is
  "10,000 per 10 minutes", counting 401, 403 and 429 [13].
- 429s with `X-RateLimit-Scope: shared` do not count [13].
- With no authorization header, the 50 requests per second global limit "is applied to the IP
  address" [13]. Webhook calls carry no such header (**Inference** that this applies to them).
- Repeated use of a webhook returning 404 "will result in a temporary restriction" [13].

First-party statements in Discord's public docs repo, from accounts writing as Discord:

- 2024-09: staff declined to exempt shared IPs and suggested a dedicated egress IP [15][16].
- 2025-11-11: "We've worked with Cloudflare to resolve this issue so you shouldn't see incorrect
  1015 errors while using Workers anymore!" (issue then closed) [16].
- 2026-10-10: "we recommend making requests from an IP you control (with the exception of Cloudflare
  Workers which we have worked with Cloudflare to support)" [16].

Community reports (not authoritative): 1015s on Workers despite low volume, such as a webhook call
failing with "error code: 1015" [17], and many comments on [15][16] before the fix. I found none
dated after 2025-11-11, but the search was brief, so absence is weak evidence.

**Route handling is acceptable.** A 1015 arrives as HTTP 429 with a non-JSON body. `readJson` throws,
the catch at `routes/feedback.ts:139-141` cancels the body, `discord_rejected` plus status 429 is
logged, and the client gets 429 `rate_limited`. There is no retry (`feedback.spec.ts:239-245`), so
the Worker cannot worsen a ban.

Two gaps, both minor: the fixed `retry-after: 60` ignores Discord's value, and the old string blames
the user ("You have sent feedback recently"). **Mitigation not warranted.** No proxy or dedicated IP.

### 4. Log and data privacy

**What is sent** (`config/shared/feedback.ts:13-32`, `ipc/feedbackIpc.ts:53-64`):

- Always: kind, title, description, app version, platform.
- Optional: contact.
- Opt-in: diagnostics (OS release, architecture, locale, view, UI scale) plus the `main.log` tail up
  to 256 KiB, read in the main process, so the renderer cannot supply it (`feedback.test.ts:188-206`).
- Opt-in: one screenshot, re-encoded to drop metadata.

**Default.** In the deleted modal `includeDiagnostics` starts false (`7f27b982^:src/components/FeedbackModal.svelte`,
`emptyDraft`), but a saved draft can restore it to true. The log contents are never previewed.

**UI copy.** It was removed with the modal, so nothing is currently wrong. If restored unchanged,
`feedback.destination` ("to the WFHelper team on Discord") and `feedback.sentHint` are wrong, because
they name upstream's team. `feedback.diagnosticsHint` is accurate and should stay.

**Redaction.** Only `services/logPrivacy.ts:5-13` exists, and it only covers profile-path names. It
runs at write time (`services/logger.ts:61`), at startup (`:72-74`) and at read time
(`feedbackIpc.ts:39`).

**Session token.** No path into the log was found.

| Value                    | Handling                                                                                                                                | File:line                                                    |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| Helper output with authz | Buffered, matched, never logged                                                                                                         | `services/apiHelperRunner.ts:436-444,472`                    |
| Native scan result       | Only reason and counts logged                                                                                                           | `apiHelperRunner.ts:308,356`; `gameMemoryAuthz.ts:320-333`   |
| Inventory URL with nonce | Not logged on success or status failure. `https.get` errors are logged by message; **Inference:** Node's messages do not carry the path | `apiHelperRunner.ts:523,526-530`                             |
| Unreachable leak         | `assertHttps` would echo the URL, but every caller builds `https://`                                                                    | `apiHelperRunner.ts:672,517`                                 |
| Account id               | "captured" logged without the value. The fetch URL carries it, with no nonce                                                            | `services/codexProfile.ts:102,360`                           |
| WFM JWT                  | Logged as events only, never the value                                                                                                  | `services/wfmSession.ts:75`, `services/wfmClient.ts:120,125` |
| WFM password             | Sent, not logged. Failures log the extracted detail                                                                                     | `services/wfmClient.ts:910-922`                              |
| Discord channel webhooks | Masked                                                                                                                                  | `services/notificationChannels.ts:620`                       |

**What can land in the channel:**

| Data                                                | Where                                                                                |
| --------------------------------------------------- | ------------------------------------------------------------------------------------ |
| Third-party player names (whispers, trade partners) | `services/eeLogMonitor.ts:451`, and the "In-game conversation from" line near `:459` |
| The friend's WFM username                           | `services/wfmSession.ts:232,256`                                                     |
| Other players' names and rep actions                | `services/wfmReviews.ts:42-73`, `services/wfmProfileSlug.ts:43-55`                   |
| WFM error bodies, 500 chars, unscrubbed             | `services/wfmClient.ts:756`, and redirect targets at `:838`                          |
| WFM socket error payloads, whole                    | `services/wfmWebSocketListener.ts:109`                                               |
| **Windows username, unredacted**                    | `services/warframeLifecycle.ts:49` (task name from `:78`), only when removal fails   |
| Riven OCR text                                      | `ipc/overlay/rivenScanOcr.ts:224,236`                                                |
| Stacks of any error passed whole                    | `main.ts:200,205`                                                                    |

**Empirical check, counts only, of the owner's real `WFHelper Beta` log (753,849 characters):**
`accountId=` 0, `nonce=` 0, 24-hex ids 0, JWT 0, bearer 0, password 0, email 0, webhook URL 0,
unredacted `C:\Users\` 0, redacted paths 243, whisper names 27 (26 in the last 256 KiB). This log had
no WFM sign-in lines, so the WFM paths above were not exercised. **This is one machine, not proof.**

**Why it still matters.** The WFM bodies, socket payloads and whole error objects are outside the
fork's control, so nothing guarantees they stay clean. A token-shaped scrub is cheap: extend
`redactLogPaths`, or add a second pass in `readLogTail`, for `accountId=`, `nonce=`, JWT shapes,
`Bearer ...` and emails. Test it in `tests/main/logPrivacy.test.ts`.

### 5. Reusing the route

**Imports of `routes/feedback.ts` (all small):** `config/shared/feedback` (`objectValidation`,
`base64`), `config/shared/fetchWithTimeout`, `security/cors` (`config/shared/backendConfig`, then
`appMeta`), `services/logging`, `utils` (`config/shared/textNormalize`), and `types` as a type only.

**`getWorkerConfig` is not used by the route.** It reaches `index.ts` through `security/client.ts`,
and `dailyBudget`. A feedback-only entry does not need it.

**Env used at runtime:** `FEEDBACK_DISCORD_WEBHOOK_URL`, `FEEDBACK_RATE_LIMITER`,
`FEEDBACK_GLOBAL_LIMITER`, `FEEDBACK_DISCORD_FORUM`, `ALLOW_ORIGIN` (in `cors.ts`). The `Env` type
requires KV and DO bindings (`types.ts:1-10`), so the entry needs a cast. A narrower signature would
edit an upstream file.

**How `index.ts` gates it**, in order:

| Gate                    | Line     | Keep? | Why                                                                                                                                             |
| ----------------------- | -------- | ----- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `originIsAllowed`       | `:116`   | Yes   | Refuses browser cross-site posts. Electron's main process sends no Origin (`cors.ts:17-19`). An unset `ALLOW_ORIGIN` correctly refuses them all |
| `OPTIONS`               | `:120`   | No    | No browser caller, so return 404 or 405                                                                                                         |
| `clientPolicyRejection` | `:124`   | Maybe | The header is forgeable. `parseClientHeader` plus a `wfhelper` check only filters drive-by bots, but it costs one line                          |
| `checkDailyBudget`      | `:127`   | No    | Needs a DO. Its job is limiting downstream work, and the route's limiters do that here. It would not stop request billing anyway                |
| Method and path         | `:129`   | Yes   | `POST /v1/feedback` only                                                                                                                        |
| Public limiters         | not used | n/a   | They live in `handlePublicRoutes`, and feedback returns before them                                                                             |

**Where it lives.** Add two new fork-owned files, editing nothing upstream owns:

- `backend/worker/src/feedbackWorker.ts`: about 20 lines, the gates above, then `handleFeedbackRoute`.
- `backend/worker/wrangler.feedback.jsonc`: its own name, bindings and route.

Reasons: it reuses `node_modules`, wrangler and the Workers test pool, and it matches #21's "fork
values in config, not edited code" and #31's direction. `tsconfig.json` already includes `src/**/*.ts`,
so CI's Worker typecheck covers it. Merges only conflict if upstream adds the same filenames.
A sibling directory would need its own lockfile and CI step (`ci.yml:69`), for no gain.

**Tooling.** npm, not pnpm: `backend/worker/package-lock.json`, `npm ci --prefix backend/worker`.
Wrangler `^4.70.0` (4.120.0 installed), vitest `~3.2.0`, `@cloudflare/vitest-pool-workers` `^0.12.4`,
config `vitest.config.mts`, tests `test/feedback.spec.ts`, run by `pnpm run backend:test`. That spec
calls `worker.fetch` from `index.ts` with a hand-built `env`, so a new `test/feedbackWorker.spec.ts`
can do the same with no vitest config change.

**Traps in copying `wrangler.jsonc`:**

- `name: "worker"` (`:3`), `kv_namespaces` (`:28`, upstream's ids), `migrations`, `triggers`, and
  `DISCORD_GUILD_ID` (`:108`) must not come across.
- `ratelimits[].namespace_id` 31006 and 31007 (`:58-59`): same id on the same account means shared
  counters, "including across different Workers" [2]. If the full backend later deploys here, these
  would merge with it. Use new ids, for example 41006 and 41007.
- Keep `workers_dev: false` and `preview_urls: false` (`:6-7`), or an extra public URL exists.
- Drop `observability.*.destinations` (`:15,21`). The account has none, and whether a deploy fails on
  a missing name is **unknown** (still open on #21). Logs need no destination.
- Every wrangler command needs `--config wrangler.feedback.jsonc`. **Inference:** `wrangler secret put`
  without it targets the name in `wrangler.jsonc`, `worker`, on the owner's account. Also,
  `pnpm run backend:deploy` means the upstream config, so do not use it.
- Add a `package.json` script only if wanted; that file is upstream's and could conflict.
- `invocation_logs` default on, 7-day retention on Paid [18]. They hold "the Request, Response, and
  related metadata" [18]. No report content is logged by the route (`feedback.spec.ts:63`). Whether
  the metadata includes the IP was not checked. `invocation_logs: false` is available.

### 6. App change

CSP: **no change**. `MAIN_WINDOW_CSP`'s `connect-src` (`config/runtime/security.ts:86-94`) governs
renderers, and this request is a main-process `fetch` reached over IPC. **Inference:** `main.ts:391`'s
`webRequest` hook sits on the window's session, which Node's `fetch` does not use.

A separate constant **is** needed, since `BACKEND_URL` stays upstream. It must not fall back to
`VITE_WFM_BACKEND_URL`: this main-process read happens at runtime on the friend's PC, and
`scripts/package-beta.cjs` does not bake it for the main process. #22 already calls these overrides
unsafe. `backendClientHeader` stays as it is.

`scripts/package-beta.cjs` has **no constraint** beyond needing `docs/beta-notes/0.1.0-beta.7.md`
(`:22-24`). It reads no backend URL.

| File                                                 | Change                                                             |
| ---------------------------------------------------- | ------------------------------------------------------------------ |
| `config/shared/feedback.ts` or a new fork-owned file | `FEEDBACK_BASE_URL`                                                |
| `ipc/feedbackIpc.ts:6,68-69`                         | Use it, drop the env read                                          |
| `ipc/feedbackIpc.ts:71-75`                           | Add `User-Agent: WFHelper/<version>` (for Browser Integrity Check) |
| `ipc/feedbackIpc.ts:85,92-93`                        | Log the status or error class, so a challenge is diagnosable       |
| `services/logPrivacy.ts`                             | Token-shaped scrub                                                 |
| `services/warframeLifecycle.ts:49`                   | Do not log the account-bearing task name                           |
| `src/components/FeedbackModal.svelte`                | Restore from `7f27b982^`                                           |
| `src/components/Sidebar.svelte:26,299`               | Restore the modal state and import                                 |
| `src/config/links.ts:4`                              | Remove `FEEDBACK_URL`                                              |
| `src/i18n/en.json`                                   | Restore 29 `feedback.*` keys, reword `destination` and `sentHint`  |
| `docs/features/builds.md:76-77`                      | Stop pointing at upstream                                          |
| `docs/beta-notes/0.1.0-beta.7.md`                    | New                                                                |

| Test                                         | Change                                                                                                             |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `tests/main/feedback.test.ts:167`            | Tighten the regex to the exact URL. It passes today for any host, so it does not guard the destination             |
| `tests/main/logPrivacy.test.ts`              | Token-shape cases                                                                                                  |
| `tests/main/i18n.test.ts`                    | Should pass once the keys are used again. A past beta log shows unused keys fail a check, so restore both together |
| `e2e/feedback.spec.ts`                       | Restore from `7f27b982^` (169 lines). It stubs the IPC handler, so CI posts nothing real                           |
| `scripts/test-beta-update.mjs:172-182`       | Replace the GitHub URL assertion                                                                                   |
| `scripts/check-push.mjs:40`                  | Add `FeedbackModal` to the pattern, so the spec is selected                                                        |
| `backend/worker/test/feedbackWorker.spec.ts` | New                                                                                                                |

`e2e/visual-baselines.spec.ts-snapshots/feedback-win32.png` has no reference in its spec (it is left
over from before the fork change), so it can be ignored.

### 7. Old builds

**Nothing redirects them, and nothing needs to.** Every beta was built after `7f27b982` created the
distribution, so beta.3 to beta.6 open the GitHub page. A local log confirms it for beta.3
(`.tmp/build-advisor-validation/beta3-feedback.log`, not in the repo): "sidebar feedback opens the
fork". They never reach `api.wfhelper.com/v1/feedback`, so no friend's report has gone upstream from a
beta. `.github/ISSUE_TEMPLATE/config.yml` does not exist, and `contact_links` would not help, because
signed-out users are sent to login first.

**Updater: confirmed, no reinstall.**

- beta.yml on the fixed `friends-beta` release is the feed (`scripts/package-beta.cjs:73`).
- The app checks 8 s after start and every 6 h, but the user clicks to download and install
  (`services/autoUpdater.ts:21-22,268-269`).
- Installed-update runs passed from beta.4 to beta.5 and beta.5 to beta.6 (`docs/beta-testing.md:133-147`).
- A copy pinned to a build folder turns its updater off and says so (`docs/beta-testing.md:124-125`).
- Upload order: installer and blockmap first, `beta.yml` last (`docs/beta-testing.md:59-60`).

The beta.7 release notes are the only channel to tell friends the form is back. Mention it in them.
`scripts/test-installed-update.mjs` launches the app, so it needs the owner's agreement first.

### 8. Anything else

- **Contradicts #21.** #21 settled "Feedback: goes to GitHub issues on the fork, created by the worker",
  and #27 and #30 assume that. This plan replaces it, and effectively answers #39 (private Discord, not
  a public repo) and #40 (attachments stay on Discord). #27's GitHub App is no longer needed for this.
  Reasonable, since friends lack accounts and the repo is public, but it should be recorded on #21.
- **Licence:** MIT (`LICENSE`), so reusing the route is fine with the notice kept. The fork already has it.
- **Discord terms:** "developer credentials may not be embedded in open source projects" (§2(d)) [19].
  A webhook token is arguably such a credential, and the plan is correct to hold it only in the Worker.
  Direct posting from the app would be a real flaw. §5(a) asks for a privacy policy for an "Application",
  defined as anything using the APIs [19]. Whether a private webhook relay counts is **unknown**. A short
  note of what is sent, where it goes and how to ask for deletion costs little, and it is in the spirit.
- **Cost:** the $5 plan is already paid. A few reports are nothing against 10M requests [4]. Refused
  requests still bill, at $0.30 per million past that, with no hard cap (**Inference** from [4]).
- **Abuse:** the hostname will be public in an open source app, and reports are anonymous. Limits per
  location bound it loosely (see 1). Kill switch: `wrangler secret delete` returns 503. Delete the secret
  as well as any Discord webhook you delete, since repeatedly using a 404 webhook draws a restriction [13].
- **Hostname is a commitment.** Shipped builds post there until updated. Folding into the fork's backend
  later (#21) means moving the Custom Domain or keeping this Worker alive for old builds. Choose it
  knowing that. #28 is still open.
- **Merges:** restoring the modal shrinks the fork's diff from upstream instead of growing it (**Inference**:
  the local `upstream/main` ref, last fetched at `06fa6897`, still has `FeedbackModal.svelte`). No upstream action is involved.

**A cheaper alternative worth a look.** If the friends are, or can be, in the owner's Discord, a one-line
change sets `FEEDBACK_URL` to the invite (`discord.gg` is already allowed at
`config/runtime/security.ts:14`). They post in a channel and can drag `main.log` in by hand. No Worker,
hostname, modal, or log pipeline, and they see what they send. Loses the structured form and needs an
account. It could ship first if the full plan takes a while. Whether the friends have Discord is the owner's call.

## Revised plan

Steps 1 and 5 to 8 are the owner's, or need the owner's approval. Merging runs CI (Actions minutes).

1. **Decide:** full plan or Discord-link stopgap, and record the change from GitHub issues on #21, #39, #40.
2. Add `backend/worker/src/feedbackWorker.ts`, `wrangler.feedback.jsonc` (new `name`, new `namespace_id`s,
   `workers_dev: false`, `preview_urls: false`, no destinations, `FEEDBACK_DISCORD_FORUM: "1"`,
   `custom_domain: true` route) and `test/feedbackWorker.spec.ts`.
3. Fix `thread_name` slicing, and correct the "global" comment if touching `routes/feedback.ts` anyway. Both
   are small upstream-file edits; skip them if merge cleanliness matters more.
4. App: everything in the question 6 tables, including the token scrub, the User-Agent and failure logging.
5. Owner creates the private forum, leaves "Require tag" off, **mutes its notifications**, and copies the
   webhook from the stable client.
6. Deploy: `npx wrangler deploy --config wrangler.feedback.jsonc`, then
   `npx wrangler secret put FEEDBACK_DISCORD_WEBHOOK_URL --config wrangler.feedback.jsonc`.
7. **Probe for Bot Fight Mode without posting:** `POST /v1/feedback` with `content-type: text/plain` and the
   app's User-Agent. Expect JSON 400 from the Worker, and no Discord call (`routes/feedback.ts:116-118`).
   A 403 or `cf-mitigated: challenge` means it was challenged: change the zone setting or host. Ask a friend
   to run the same from another network if possible. This uses up rate limit only.
8. One real test report, only after the channel is muted and the owner agrees, with a realistic log and
   screenshot, to also exercise the Managed Free Ruleset on a log-shaped body.
9. Build `pnpm run dist:beta 0.1.0-beta.7`, publish in the documented order, and mention the form in the notes.

## Still unknown

- Whether Bot Fight Mode or Browser Integrity Check will challenge the app's POST, from any friend's network
  (step 7 answers this for the networks tried; it can change, since it is not configurable).
- The Workers runtime CPU for the route. 65 ms is from local Node.
- Discord's reaction to a lone surrogate in `thread_name`, and to a tagless webhook post in a `REQUIRE_TAG` forum.
- Numeric webhook and forum-thread-creation rate limits, which Discord does not publish in the pages read.
- Whether the existing Workers use `namespace_id` 41006 or 41007 (`cf workers get` shows no bindings). Unlikely.
- Whether Rate Limiting bindings work on Workers Free. Moot on Paid.
- Whether a deploy fails when named observability destinations are missing (avoided by omitting them).
- What WFM error bodies and socket error payloads can contain. They are upstream of this repo.
- Whether invocation logs store the client IP.
- Discord's Developer Policy, a separate page from the Developer Terms, was not read.
- Whether the Discord accounts quoted in question 3 are staff. They write as "we", and GitHub labels them
  contributors. Employment was not independently checked.

Sources 1 to 16, 18 and 19 were fetched on 2026-11-02. Source 17 was read only as search excerpts.

## Sources

1. Workers limits: https://developers.cloudflare.com/workers/platform/limits/
2. Rate Limiting binding (updated 2026-10-21): https://developers.cloudflare.com/workers/runtime-apis/bindings/rate-limit/
3. Custom Domains: https://developers.cloudflare.com/workers/configuration/routing/custom-domains/
4. Workers pricing: https://developers.cloudflare.com/workers/platform/pricing/
5. Secrets: https://developers.cloudflare.com/workers/configuration/secrets/
6. Discord webhook resource: https://docs.discord.com/developers/resources/webhook
7. Discord message resource (embed limits, request size, `SUPPRESS_NOTIFICATIONS`): https://docs.discord.com/developers/resources/message
8. Discord reference, Uploading Files: https://docs.discord.com/developers/reference
9. Bot Fight Mode (updated 2026-08-03): https://developers.cloudflare.com/bots/get-started/bot-fight-mode/
10. Security features interoperability: https://developers.cloudflare.com/waf/feature-interoperability/
11. Browser Integrity Check: https://developers.cloudflare.com/waf/tools/browser-integrity-check/
12. Discord channel resource: https://docs.discord.com/developers/resources/channel
13. Discord rate limits: https://docs.discord.com/developers/topics/rate-limits
14. Discord threads: https://docs.discord.com/developers/topics/threads
15. discord-api-docs #7137: https://github.com/discord/discord-api-docs/issues/7137
16. discord-api-docs #7146: https://github.com/discord/discord-api-docs/issues/7146
17. Community report, Answer Overflow: https://www.answeroverflow.com/m/1354843895376121867 ; also discord-api-docs #7040: https://github.com/discord/discord-api-docs/issues/7040
18. Workers Logs: https://developers.cloudflare.com/workers/observability/logs/workers-logs/
19. Discord Developer Terms of Service (effective 2024-07-08): https://support-dev.discord.com/hc/en-us/articles/8562894815383-Discord-Developer-Terms-of-Service
20. `cf` read-only checks, 2026-11-02: `accounts subscriptions get`, `workers list`, `workers get`, `zones list`, `dns records list`, `bot-management get`, `ssl universal settings get`, `zones settings get`, `rulesets list`, `o11y destinations list`.
21. Code: `ipc/feedbackIpc.ts`, `config/shared/feedback.ts`, `config/shared/backendConfig.ts`, `config/runtime/security.ts`, `backend/worker/src/routes/feedback.ts`, `src/index.ts`, `security/cors.ts`, `security/client.ts`, `wrangler.jsonc`, `services/logPrivacy.ts`, `services/logger.ts`, `services/apiHelperRunner.ts`, `services/autoUpdater.ts`, `scripts/package-beta.cjs`, and commit `7f27b982`.
