# Build advisor: where things stand

Written 2026-10-05 at the end of the first working session. Read this first
when picking the work back up; `damage-rules.md` has the detail behind the
numbers and `../adr/` has the two design decisions.

## What exists

- **Electron bump.** `[deps] - bump electron to 41.10.7` on
  `deps/electron-41.10.7`, which clears the three high-severity Electron
  advisories. `feat/build-advisor` is branched from it.
- **The advisor** in `services/buildAdvisor/`: a parser for mod stat text, a gun
  stat calculator, a build search and an adapter that joins the inventory to the
  bundled game data. Given an owned primary or secondary it returns the best
  eight owned mods by burst DPS, the computed arsenal stats, each mod's share of
  the damage, and every stat line it left out.
- **The Builds view** (`src/views/BuildsView.svelte`), a sidebar entry between
  Rivens and Run Analysis. Owned guns on the left with search; the recommended
  mods and an arsenal-style stats table on the right, with the recommendation
  beside each saved config. It talks to the advisor through two IPC calls in
  `ipc/buildAdvisorIpc.ts` and holds no build logic itself.
- **A script** for checking a gun from the command line:
  `node scripts/dev/advise-gun-build.cjs <inventory.json> "<weapon name>"` after
  `pnpm run build:main`.
- **Tests.** 39 unit tests across four files in `tests/main/buildAdvisor*.test.ts`
  and four end-to-end tests in `e2e/builds.spec.ts`.

## How far it can be trusted

The calculator matched the in-game arsenal on every stat it models for three
guns, read from screenshots: Lex Prime, Trumna Prime and Pyrana Prime. It also
matched an Overframe build for Lex Prime exactly. `damage-rules.md` lists what
each check covered.

Two bugs were found by checking against real data, and both are fixed:

- A mod and its Amalgam form were recommended together.
- The inventory stores the eight mod slots in the reverse of the arsenal's
  order, so elements combined in the wrong order when reading a saved config.

## What the recommendations get wrong today

In rough order of how much they change a recommendation:

1. Conditional bonuses are ignored. A Galvanized mod counts only its always-on
   part, so its plain form usually outranks it.
2. Mod capacity and polarities are not checked, so a build may not fit.
3. There is no enemy. Status, faction and armour-related mods add nothing, and
   the ranking is burst DPS alone.
4. Arcanes, rivens, set bonuses and the exilus slot are not counted.
5. Radial damage is missing from the weapon data, so weapons with an explosion
   come out low (seen on Trumna Prime).
6. Kuva, Tenet and Coda bonus elements are not read.
7. Bows, crossbows, and charge, held, burst and duplex weapons are refused. In
   the test inventory that was 30 of 85 guns, plus 5 missing from the game data.
8. The search is greedy with single swaps and can miss the best set.

## Next steps, as discussed

- "On Kill" stacks with a stacks-up toggle (item 1). Suggested first.
- Capacity and polarities (item 2).
- An in-product agent that calls the advisor as a tool was considered and
  deferred; see `../adr/0001-deterministic-build-calculator-before-any-agent.md`.

The German and Chinese strings for the Builds view were written without a
native review.

## Working on this machine

- pnpm is installed through corepack into `%LOCALAPPDATA%\corepack-shims`
  because `corepack enable` cannot write to Program Files without admin rights.
  That folder is on the user PATH.
- `backend/worker` has its own npm dependencies; run `npm --prefix
backend/worker ci` once or the pre-push hook fails at the worker tests.
- Run the app from source on a throwaway profile:
  `$env:WFHELPER_USER_DATA = "<folder>"; pnpm run dev`. The inventory lands in
  `<folder>\api-helper\inventory.json`.
- Close Warframe before pushing. With the game running, two Playwright tests
  (`smoke.spec.ts` "keeps one process and restores its window" and
  `setup-wizard.spec.ts` "survives a reload") fail with Electron exiting 134,
  on untouched `main` as well. Both pass with the game closed. The cause was
  not investigated further.

## Standing rules

- Never push to or open a pull request against upstream unless asked.
- Do not bypass the pre-push hook without asking.
- Launching the app with Warframe open reads the session token from game
  memory with no click. Digital Extremes does not sanction that; treat anything
  that increases exposure as needing a reminder first.
