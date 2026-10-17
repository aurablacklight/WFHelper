# Agent instructions

## This is a fork

All work here is for the fork `aurablacklight/WFHelper` (git remote `origin`),
used by its owner and a few friends. Every task, issue, PR, CI run, status
report and priority list refers to the fork unless the owner says otherwise.

Upstream `WFHelper/wfhelper` (git remote `upstream`) is someone else's project.

- Only look at upstream to find meaningful updates worth bringing down into
  the fork (new features, fixes, dependency bumps). Report what you found and
  let the owner decide what to pull in.
- Never act on upstream: no comments, reviews, issues, PRs, pushes, reactions
  or messages to its maintainer or contributors.
- Upstream issues, PRs and CI results are not the fork's work queue. Do not
  include them in status reports or priorities.
- If the upstream maintainer ever asks for the fork's changes, the owner is
  open to it, but the owner makes that call and does the talking.

## Language

The fork supports English only. Do not write, update or ask for reviews of
translations; the German and Chinese files under `src/i18n/` are inherited
from upstream.

## Tooling

- `gh` resolves to upstream when no default repo is set. Pass
  `-R aurablacklight/WFHelper` explicitly, or check `gh repo set-default --view`
  shows the fork first.
- GitHub disables scheduled workflows on forks, so upstream's nightly jobs
  (such as the Dependency Audit) do not run here.
- The app reads prices from upstream's backend at `api.wfhelper.com`. Changes
  to `backend/worker` in this fork do not reach that server.

## Developing with Warframe open

The owner develops with Warframe running. Do not ask them to close it unless a
task truly needs it closed, and say why when it does.

- The pre-push hook runs format, lint, typecheck and unit tests only. Local
  Electron UI specs are opt-in (`WFH_PUSH_E2E=1`); CI runs the full e2e suite
  on every PR, so a green PR is the e2e gate.
- `git push --no-verify` is an accepted bypass when the hook gets in the way.
- Launching the app with Warframe open reads the session token from game
  memory. Mention it before anything that increases that exposure.
