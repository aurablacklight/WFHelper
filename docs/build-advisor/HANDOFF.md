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

1. (Addressed, see the research section below.) Conditional bonuses were
   ignored, so a Galvanized mod's plain form usually outranked it.
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

## Research (added later on 2026-10-05)

A research pass on how the game works for build purposes is in
`reports/Warframe weapon build mechanics.md`, with an independent review beside
it and the eight sets of source notes under `research_notes/`. Read the
corrections block at the top of the report first. It supersedes parts of this
page:

- Radial damage is not missing from the bundled data. It is under
  `behaviours[].projectile.explosiveAttack` in `warframe-public-export-plus`
  and in `attacks[]` in `@wfcd/items`; the advisor reads neither yet.
- Set bonuses, arcanes, Riven stats, the Kuva/Tenet/Coda bonus element,
  polarities and the exilus and arcane slot positions all have structured
  sources. Mod effects per rank do not, so the text parser stays.
- Conditional bonuses should be assumed up. A fully stacked Galvanized
  multishot mod is +230% against +90% or +120% for the plain one.
- Fixed after the research: the advisor used to recommend Critical Delay with
  Point Strike. The wiki states that a corrupted crit chance mod cannot be
  equipped with its standard counterpart (also Critical Deceleration with
  Blunderbuss, Creeping Bullseye with Pistol Gambit); those three pairs are now
  listed explicitly in `gunBuildAdvisor.ts`.
- Done after the research: conditional bonuses. "On Kill", "On Weak Point Hit"
  and "On Reload" bonuses to multishot, critical chance, critical damage, fire
  rate and status chance are counted at full stacks by default, and each mod
  lists the lines that were assumed. The Builds view has a "Stacks up" toggle;
  turning it off ranks on arsenal numbers. Saved configs are still checked
  against the arsenal without stacks. Not covered: the Galvanized Aptitude,
  Savvy and Shot "damage per status type" bonus, which needs a status model,
  and anything whose text does not match the pattern in full.
- Done after the research: the six damage arcanes (Primary and Secondary
  Merciless, Deadhead and Dexterity). They are read from `ExportArcanes`, whose
  bonuses are structured, so no text is parsed. The advisor runs one search per
  owned arcane and keeps the strongest whole build, because +360% damage in the
  base damage bucket changes which mods are worth a slot. A saved config's
  arcane (stored at index 9) is read too; Primary Merciless's +30% reload speed
  closes the Trumna Prime reload gap (3.08s computed, 3.1s in the arsenal). Not
  checked: whether the weapon has an arcane adapter fitted. Every other arcane is
  still listed as unrecognised.
- Done after the research: ranking against a faction, the first piece of an
  enemy model. The Builds view has a Target selector with ten factions. With one
  chosen, each damage type is worth 1.5, 1 or 0.5 by the faction's weaknesses
  and resistances (the wiki's Damage overview table, in
  `services/buildAdvisor/factions.ts`), builds are ranked on that, and the
  search also orders elemental mods so the best pair combines. The search adds
  two elemental mods at once when neither helps alone, because a third element
  changes which ones combine. Not modelled yet: armour and armour strip (armour
  scales every type alike, so it does not change this ranking), shields,
  Overguard, every status effect, sub-factions and per-enemy exceptions. Until
  statuses exist, Viral and Slash builds are undervalued against armour.
- Done after the research: a status and armour model
  (`services/buildAdvisor/statusModel.ts`), which supersedes the "not modelled
  yet" list in the item above. With a target chosen the ranking is estimated
  damage per second to one heavy unit under sustained fire:
  - Procs a second are fire rate × multishot × status chance, shared between
    damage types by their share of the hit.
  - Viral stacks multiply damage to health (2 + 0.25 a stack past the first, to
    4.25 at ten); the average over the stacks a proc rate keeps up is used.
  - Grineer, Corrupted, Scaldra, Techrot and Anarchs targets have 2,700 armour
    (90% reduction). Corrosive stacks strip 26% to 80% and an active Heat proc
    halves what is left. Other factions are treated as unarmoured.
  - Slash, Heat, Toxin, Electricity and Gas procs deal six ticks of 35% or 50%
    of modded base damage, times the hit's average crit; a matching single
    element mod boosts its own proc; Slash ignores armour and faction.
  - The rules are the wiki's. Combining them (random arrivals, independent
    effects, steady state) is this project's own model and is **not validated
    in game**. Known simplifications: no ramp-up time, so it flatters status
    builds against enemies that die fast; a refreshed Heat burn is counted as
    six ticks a proc, which understates it; no shields, Overguard, status
    immunity, light units, sub-factions or Bane mods.
  - The search now also trades two mods for two elemental mods at once, since
    bringing in Viral one mod at a time passes through Blast or Gas.
- Done after the research: mod capacity and polarities
  (`services/buildAdvisor/modCapacity.ts`). A recommendation now has to fit the
  weapon as it is, unless the "Fit capacity" toggle is off.
  - Capacity is the weapon's rank (from its affinity, 500 × rank²), doubled by a
    catalyst. A mod costs its base drain plus its rank, halved rounding up on a
    matching polarity. Those costs match the mod cards in three arsenal
    screenshots.
  - The inventory's `Features` bits were worked out from 86 owned guns: 1 is the
    catalyst, 2 the exilus adapter, 32 the arcane adapter. An arcane is only
    recommended to a weapon with bit 32 or one already equipped.
  - Slot positions are not modelled. The game data gives a weapon's built-in
    polarities without saying which slots they are in, so the advisor works out
    the cheapest placement and assumes the player uses it. Built-in polarities
    and forma are added together, which double counts a forma that replaced a
    built-in polarity. The capacity of a saved config is not shown for the same
    reason.
  - Wrong-polarity cost is rounded to nearest (the wiki's pages disagree).
  - Under a capacity limit the search also trades any two mods for any two
    others, since one costly pick can block a cheaper pair worth more. A full
    recommendation takes up to about 0.6 s.
- Done after the research: Rivens. An unveiled Riven is offered to every owned
  gun in its weapon family (a Furis Riven fits every Furis variant), with its
  stats rescaled from the named weapon's disposition to the variant's. The
  numbers come from the app's own decoder (`services/rivenFingerprint.ts`);
  `services/buildAdvisor/rivenEffects.ts` maps its stat tags to the bonuses the
  calculator models and lists the rest (faction damage, status duration, punch
  through, zoom and so on) as not counted. A Riven costs 10 capacity plus its
  rank, takes one slot, and is read on saved configs too. Riven Splicing
  (2026-10-07) may add stat types this mapping does not know.
- The bundled `@wfcd/items` text writes a line break inside a stat line as a
  literal backslash and n, not a newline. The parser accepts both.

Creator coverage is thin: TheKengineer is well covered, Brozime is one older
video plus three tables from his vault, and nothing from Tactical Potato could
be read.

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
