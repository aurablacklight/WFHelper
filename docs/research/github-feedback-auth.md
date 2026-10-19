# How the worker should authenticate to GitHub to file feedback issues

Research for #27 (map #21). Sources checked 2026-10-18.

## Recommendation

Use a **GitHub App installed only on `aurablacklight/WFHelper`**, with the
single repository permission **Issues: write** (Metadata: read comes with it).
The worker mints a short JWT from the App's private key with WebCrypto, trades
it for a 1-hour installation token scoped to that one repo, caches the token in
memory until shortly before expiry, and calls `POST /repos/{owner}/{repo}/issues`.

Why over a fine-grained PAT:

- Issues are filed as the App's bot identity, not as the owner.
- What the worker holds as a secret is the private key, but what goes over the
  wire is a token that dies in an hour. A fine-grained PAT is a long-lived bearer
  token that acts as the owner.
- GitHub's own guidance: PATs are for "API testing or short-lived scripts"; a
  GitHub App is recommended for "a long-lived integration" [14].

A fine-grained PAT is an acceptable **stopgap** if the App setup is deferred: it
can be limited to the one repo with Issues write and nothing else, and it needs
about 10 fewer lines of worker code. If used, give it an expiry and note the date
in the deploy runbook.

Either way, the bigger design problems are not authentication. They are the
public visibility of issues and the loss of attachments (see "What does not
carry over").

## Comparison

| | Fine-grained PAT | GitHub App installation token |
| --- | --- | --- |
| Smallest scope | One repo (the owner's account), Issues: write. "Tokens always include read-only access to all public repositories" [1] | App granted Issues: write, installed on one repo. Each token request can narrow further with `repositories`/`permissions` [3] |
| Identity on the issue | The owner's user account | The App, shown as `<app-name>[bot]`. "API requests made by an app installation are attributed to the app" [3] |
| Expiry | 1 to 366 days, or none ("Infinite lifetimes are allowed") [1]. Auto-revoked after a year of no use [6] | Installation token: 1 hour [3]. The private key behind it "do[es] not expire and instead need[s] to be manually revoked" [4] |
| Rotation | Create a new token, update the worker secret, revoke the old one. Downtime-free if done in that order | Up to 25 private keys at once "to rotate keys without downtime" [4]. Tokens rotate themselves hourly |
| If the stored secret leaks | Attacker can file and edit issues as the owner on that repo until revoked or expired | A leaked installation token works for at most an hour. A leaked private key gives "persistent authentication as the GitHub App" until the key is deleted [4], but only with the App's permissions on the repos it is installed on |
| Leak into a public repo | Auto-revoked when pushed to a public repo or gist [6] | Same for installation tokens [6] |
| Worker code | `Authorization: Bearer <secret>` | JWT signing + token exchange + cache (below) |
| Rate limit | 5,000 req/h primary for a user token; content limits below | Installation minimum 5,000 req/h [2]; content limits below |

Classic PATs and a separate "machine account" were not considered further: a
classic PAT cannot be limited to one repository [1], and a machine account is
allowed (one free one per person [7]) but adds an account to maintain just to
get a different name on issues, which the App gives for free.

## Permissions for "Create an issue"

From the endpoint reference [5]:

- Works with fine-grained PATs, GitHub App installation tokens and GitHub App
  user tokens. Needs `"Issues" repository permissions (write)`.
- "Any user with pull access to a repository can create an issue." Returns `410
  Gone` if issues are disabled.
- `labels`, `assignees`, `milestone` and `type`: "Only users with push access can
  set [them] for new issues. [They are] silently dropped otherwise." A PAT acting
  as the owner has push access. For an App with only Issues: write, check during
  implementation that labels such as `feedback`/`bug` stick (labels are covered by
  the Issues permission, but test it rather than assume, since the drop is silent).

## Rate limits and anti-abuse

- Secondary limits: "no more than 80 content-generating requests per minute and
  no more than 500 content-generating requests per hour", and "some endpoints have
  lower content creation limits". These include the owner's web UI activity when
  the PAT acts as the owner [2]. A bot identity keeps feedback traffic out of the
  owner's personal budget.
- On a secondary limit GitHub returns 403 or 429. Honour `retry-after`, else
  `x-ratelimit-reset`, else wait at least a minute. "Continuing to make requests
  while you are rate limited may result in the banning of your integration" [2].
- Best practice: make write requests serially and "wait at least one second
  between each request" [8].
- Acceptable Use bans "automated excessive bulk activity" and spam [9]. Filing
  issues that real users submitted is fine; a flood of junk relayed by the worker
  would not be.

The existing Cloudflare rate limiters (2/min per IP, 10/min global, see below)
already keep the worker far below 80/min and 500/h if they stay. The route must
not retry on 403/429 from GitHub (today it already does not retry Discord). The
abuse-gate ticket should treat GitHub's limits as the outer ceiling the gate has
to stay under.

## Workers-specific notes

**Minting the App JWT.** The JWT must be RS256 with `iat` (set "60 seconds in the
past" for clock drift), `exp` ("no more than 10 minutes into the future") and
`iss` (client ID recommended over app ID) [10]. Workers WebCrypto supports
RSASSA-PKCS1-v1_5 `sign` and `importKey` [11], so no library is needed.

The catch is the key format. GitHub downloads the private key as "PKCS#1
RSAPrivateKey" PEM [4], while WebCrypto's `importKey` only accepts `raw`, `spki`,
`pkcs8` and `jwk` [12]. Two options:

1. Convert once, offline, before storing it:
   `openssl pkcs8 -topk8 -nocrypt -in app.pem -out app-pkcs8.pem`, then store the
   PKCS#8 PEM as the secret and `importKey('pkcs8', ...)` it. Recommended: no
   runtime dependency, nothing to parse in the worker.
2. Use `node:crypto` (`createPrivateKey` accepts PKCS#1). Workers support all of
   `node:crypto` except a short list that does not touch RSA signing [13], but
   only with `nodejs_compat` or a compatibility date of 2026-08-04 or later [13].
   This worker's `wrangler.jsonc` has `compatibility_date: 2026-03-01` and no
   flags, so this means a config change that has to survive upstream merges.

**Token caching.** One installation token is good for an hour [3], so cache it in
a module-scope variable with its `expires_at` and re-mint a few minutes early.
Isolates are short-lived and not shared, so expect a cold mint now and then (two
subrequests instead of one). That is fine at feedback volumes. KV or a Durable
Object is not needed.

**Secrets.** Store the PKCS#8 key (about 1.7 KB) plus the App client ID and
installation ID with `wrangler secret put` (or as plain vars for the two IDs),
following the existing `FEEDBACK_DISCORD_WEBHOOK_URL` pattern. GitHub advises
that a key in an environment variable is weaker than a sign-only key vault [4].
Workers have no such vault for RSA keys, so the leak story above applies.

**Fetch.** Keep the route's `redirect: 'manual'` and timeout. Send
`Accept: application/vnd.github+json`, `X-GitHub-Api-Version` (current reference
version is `2026-03-10` [5]) and a `User-Agent` header (the GitHub API rejects
requests that have none).

## The current `POST /v1/feedback` route

File: `backend/worker/src/routes/feedback.ts`. Validation is shared with the app
in `config/shared/feedback.ts`. Tests: `backend/worker/test/feedback.spec.ts`.

**What it accepts.** A JSON body (`content-type: application/json`, max 2,000,000
bytes, streamed and capped without trusting `Content-Length`, 10 s read timeout),
normalised by `normalizeFeedback`:

- `kind`: `"bug" | "feature"`
- `title` (≤120 chars), `description` (≤4000), `appVersion` (≤64), `platform`
  (≤32), all required and trimmed
- `contact` (optional, ≤120)
- `diagnostics` (optional): `osVersion`, `arch`, `locale`, `view`, `uiScale`
  (0.25 to 4), and an optional `log` of up to 262,144 chars
- `screenshot` (optional): PNG, JPEG or WebP, ≤1 MiB, base64, magic bytes checked
- Unknown fields are dropped.

It replies `{ ok: true }` or `{ ok: false, error: "invalid" | "unavailable" |
"rate_limited" | "failed" }` with status 200/400/503/429 (`retry-after: 60`)/502.

**What is not Discord-specific (keep as is):** the limiter checks
(`FEEDBACK_RATE_LIMITER` 2/min keyed by `cf-connecting-ip`, `FEEDBACK_GLOBAL_LIMITER`
10/min global, failing closed when missing or throwing), the bounded body reader,
`normalizeFeedback`, the result shape, global CORS and daily-budget handling, and
the logging rule that report text never appears in logs.

**What is Discord-specific (replace):**

- `webhookUrl()` and the `FEEDBACK_DISCORD_WEBHOOK_URL` secret, validated against
  `https://discord.com/api/webhooks/<id>/<token>` and given `?wait=true`
- `discordBody()`: embed with fields, `allowed_mentions: { parse: [] }`, and
  `thread_name` when `FEEDBACK_DISCORD_FORUM=1`
- Screenshot and log tail sent as multipart file attachments (`files[n]`,
  `attachment://screenshot.png`)
- Success check: the receipt's numeric `id`. Error logs `discord_<code>`
- The 503 when the webhook is not configured. That stays, keyed on the GitHub
  config instead
- `FEEDBACK_DISCORD_FORUM` in `wrangler.jsonc` and both types in `src/types.ts`
- Most of `feedback.spec.ts` asserts on Discord payload shapes and URL validation

The GitHub version maps `kind` to a title prefix or label, puts the description in
the issue body, and puts app version, platform and diagnostics in a fenced block.
Mentions need handling differently: there is no `allowed_mentions`, so an `@name`
or `#123` in user text will notify or cross-link unless escaped (for example,
wrap user text in a code block or insert a zero-width joiner after `@`). The
existing test that sends `@everyone` should become a test for this.

## What does not carry over

- **Attachments.** The Issues REST API has no endpoint for uploading an image or
  file to an issue [5]. Screenshots and logs need another home (for example an R2
  object behind an unguessable link), or the GitHub version drops them. The log can
  be up to 262,144 chars. GitHub rejects issue bodies over 65,536 chars (this is
  the API's own error message, not a documented limit), so the full log cannot go
  inline either.
- **Privacy.** `aurablacklight/WFHelper` is a **public** repository (checked via
  `gh api repos/aurablacklight/WFHelper`). Every issue the worker files, including
  `contact`, OS details and any log text, would be world-readable. Discord was a
  private channel. This is the decision most likely to change the plan.

## Sources

1. Managing your personal access tokens: https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens
2. Rate limits for the REST API: https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api
3. Authenticating as a GitHub App installation: https://docs.github.com/en/apps/creating-github-apps/authenticating-with-a-github-app/authenticating-as-a-github-app-installation
4. Managing private keys for GitHub Apps: https://docs.github.com/en/apps/creating-github-apps/authenticating-with-a-github-app/managing-private-keys-for-github-apps
5. REST API endpoints for issues (Create an issue): https://docs.github.com/en/rest/issues/issues#create-an-issue
6. Token expiration and revocation: https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/token-expiration-and-revocation
7. GitHub Terms of Service, B. Account Terms (machine accounts): https://docs.github.com/en/site-policy/github-terms/github-terms-of-service
8. Best practices for using the REST API: https://docs.github.com/en/rest/using-the-rest-api/best-practices-for-using-the-rest-api
9. GitHub Acceptable Use Policies, 4. Spam and Inauthentic Activity: https://docs.github.com/en/site-policy/acceptable-use-policies/github-acceptable-use-policies
10. Generating a JWT for a GitHub App: https://docs.github.com/en/apps/creating-github-apps/authenticating-with-a-github-app/generating-a-json-web-token-jwt-for-a-github-app
11. Cloudflare Workers Web Crypto: https://developers.cloudflare.com/workers/runtime-apis/web-crypto/
12. W3C Web Cryptography API, `enum KeyFormat { "raw", "spki", "pkcs8", "jwk" }`: https://w3c.github.io/webcrypto/
13. Cloudflare Workers `node:crypto`: https://developers.cloudflare.com/workers/runtime-apis/nodejs/crypto/
14. Deciding when to build a GitHub App: https://docs.github.com/en/apps/creating-github-apps/about-creating-github-apps/deciding-when-to-build-a-github-app
