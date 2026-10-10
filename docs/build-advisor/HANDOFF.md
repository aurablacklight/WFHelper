# Build advisor: where things stand

Last updated 2026-10-10, during offline validation of the feature-complete gun MVP. Read
this first when picking the work back up. `damage-rules.md` has the three
in-game checks behind the arsenal numbers, `../adr/` the two design decisions,
and `reports/` the research the later work was built from.

## Offline follow-up (2026-10-10)

### Final Windows Electron rerun after the game closed

Rebuilt the production app and ran the complete suite at the normal four
workers. Command exited 0: 356 passed, three flaky passes, one intentional
overlay-stress skip, 9.8 minutes. `.last-run.json` reports `passed` with no
failed tests. The earlier outside-test worker failure did not recur. This
supersedes the earlier failed full-suite gate, but is not a flake-free run.

The three retried cases were drop-source ingredient lookup (180s timeout),
Foundry modular categories (120s beforeAll timeout), and relic tier layout
(process failed to launch). Each then passed. A focused four-worker rerun of
those three cases, repeated three times with retries disabled, passed all nine
in 29.6s. That did not reproduce the failures, so no speculative code fix or
timeout increase was made. Root cause remains undiagnosed.

Evidence: `.tmp/build-advisor-validation/e2e-full-rerun.log` and its adjacent
`e2e-full-rerun/` artifacts; focused run `e2e-timeout-repro.log` and
`e2e-timeout-repro/`. No Electron, WFHelper or Warframe processes remained at
the final process check. Production build retained the previously documented
chunk-size and mixed-import warnings.

### Mechanics and offline changes

- Initial in-game A/B series is now recorded in `validation.md`: three Brozime
  trials average ~6.4s; three Codex trials without a mid-fight van explosion
  average ~2.5s. An additional Codex run with the van exploding took ~3.2s
  and is marked confounded. A repeat with the van already destroyed took
  ~2.3s. This supports the predicted ordering for this matchup, not absolute
  DPS or general rankings. All seven combat trial recordings were renamed by
  build/trial in the local captures folder; originals' timestamps are mapped
  in the validation record. Screenshots confirm both builds' Arsenal stats.

- After the Simulacrum clip, added Hunter Munitions' rank-scaled forced Slash
  chance to target-faction estimates and build search. It operates with Stacks
  up off too, since its chance is rolled per critical hit. Critical-only damage
  weighting excludes noncritical hits; crit tiers above 100% increase damage
  without increasing the proc chance. Natural Slash procs remain separate.
  Raw Arsenal stats/DPS are unchanged. Other forced-Slash sources, Hunter set
  bonuses and Galvanized Savvy damage remain outside the model.
- The actual Tenet config now reads Hunter Munitions as modelled. With Grineer
  selected and stacks off, its steady-state estimate rises from 17,665 to
  62,725 burst DPS, of which 45,060 is estimated bleed. These are estimates,
  not measured DPS from the single-shot clip. The manual tick comparison still
  has an unexplained 0.031% difference; no fitted adjustment was made.
- Hunter Munitions follow-up verification: all 419 unit files passed (6,012
  tests, seven skipped), including 144 advisor tests; all four typechecks,
  main build, changed-file ESLint, formatting and diff whitespace checks passed.
  The real local snapshot diagnostic confirms the saved effect and updated
  faction score. No Electron/game-memory launch was needed. The earlier full
  Electron timeout was still unresolved at that point; the later full rerun
  above passed the gate while retaining three reported flaky cases.

- Fixed capacity for zero-XP and low-rank weapons: the Update 38.5 base floor and
  Mastery Rank contribution are now included. Missing XP is explicitly shown as
  unchecked capacity. The later Tenet screenshot confirms wrong-polarity rounding.
- Removed the assumption that every inventory polarity adds a new slot. The
  advisor checks all possible replacements of innate polarities and uses the
  highest drain. Ambiguous layouts display "Capacity at most". Actual drain can
  be lower. This avoids double-counting without inventing original slot positions.
- Drain uses exact assignment across equivalent polarity groups, with a cache
  during each build search. Universal slots no longer halve Umbra mods. Slot
  validation excludes negative/fractional/exilus indices, handles duplicate
  records, and recognises cleared polarities.
- Arcane eligibility no longer depends on XP or the Fit capacity toggle. Turning
  the toggle off cannot recommend an arcane to a weapon without an unlocked slot.
- Corrected stale English, German and Chinese caveats that claimed Rivens and
  capacity were not included, and removed the unsupported promise that approximate
  firing rates cannot affect mod ranking. Native translation review remains open.
- Updated `damage-rules.md`, added the beta guide in `../features/builds.md`, and
  prepared [the in-game checks](validation.md). The diagnostic script now accepts
  wrapped inventories, fallback weapon names, target/stacks/capacity options and
  structured JSON output. It defaults to stacks off for arsenal comparisons.
- The site guide's screenshot is generated by the Builds E2E test and saved at
  `.github/screenshots/docs-builds.png` for the site maintainer.
  The guide is labelled development beta until a release version is assigned.
- Updated `sharp` to 0.35.5 and its explicitly bundled Linux binding/libvips to
  0.35.5/1.3.4 for GHSA-wq5f-xc86-pv6w. The production audit's high-severity gate
  passes. One moderate `sprintf-js` advisory remains: the registry still lists
  1.1.3 as latest, while the advisory names an unavailable 1.1.4 fix. Do not claim
  the audit is completely clean.

Remaining capacity limits: the drain assumes cheapest mod placement, does not
solve element order against physical slots, and does not reserve exilus drain.
Missing Mastery Rank uses the base capacity floor. Rank-40 and Legendary Rank
capacity still need an in-game check for the low-rank/Legendary cases.

### User screenshot follow-up (2026-10-10)

Located the existing snapshot at
`C:\Users\derek\Documents\code_projects\wfhelper-profile\api-helper\inventory.json`
(saved October 5). Its MR 27 and Tenet Arca Plasmor config A match the supplied
screenshots. The 28.6% Toxin bonus, rank-40 total capacity of 80, and nearest
rounding for wrong-polarity drain (Cannonade 9 → 11) pass. Card drains including
exilus total 72, matching 8/80 remaining. Visible stats match except critical
damage: 5.4× shown versus 4.2× calculated. Follow-up screenshots show max-rank
Tenacious Bond on Huras Kubrow; its conditional +1.2× final multiplier explains
the difference exactly. The user then removed the companion: screenshot
`Warframe.x64_bTXLrnxgI1.jpg` shows 4.2×, confirming the calculator's weapon-only
value and resolving the discrepancy. The advisor excludes external companion buffs.
The scrolled screenshot `Warframe.x64_i4lFT7FDbP.png` also matches Radiation
2,584, Viral 4,727 and Total 15,353.1 (per-projectile sum × 2.1 multishot).
This completes the modelled Arsenal stats comparison for this saved config;
conditional damage and combat rankings remain unvalidated.
See `validation.md` for the observations and their limits. No formula was changed.

### Verification in this pass

- Full unit suite after the dependency update: 419 files passed, 6,003 tests
  passed and seven skipped. The advisor contributes 135 tests in nine files.
- Worker typecheck and all 325 tests passed. All four app typechecks, Svelte
  check (zero errors/warnings), lint, formatting, colour tokens, dead-code audit
  and ONNX resource verification passed. The dead-code tool has an existing
  unused-ignore configuration hint, not a failed check.
- Production build passed with existing chunk-size/dynamic-import warnings.
- Builds E2E: eight passed. The screenshots were inspected; the site screenshot
  is saved as `.github/screenshots/docs-builds.png`.
- Full Windows E2E at four workers: 350 clean passes, nine flaky passes and one
  intentional overlay-stress skip. The command exited 1 because a worker timeout
  was reported outside a test. This is **not a green full-suite result**.
- All nine flaky cases passed serially with retries disabled (1.1 minutes).
  They were filter customization, inventory card art, modular inventory, order
  edit details, riven overlay resize, overlay interaction/settings, reward editor
  tools and encrypted-session restore. Concurrency/startup timing is suspected,
  not diagnosed. Full-run artifacts remain in `test-results`; the isolated run
  is under `.tmp/build-advisor-validation/e2e-isolated`.
- The diagnostic smoke passed for a wrapped inventory, default stacks-off
  output, faction/stacks JSON, unknown weapon, invalid target and a fallback-only
  weapon. Synthetic data is under `.tmp/build-advisor-validation`.
- An unpacked Windows package built successfully using the installed native
  dependencies (`--config.npmRebuild=false`). Its archive contains sharp 0.35.5.
  Linux and installer upgrade acceptance have not been run on this Windows host.
- Native DBWIN regression passed: 12 lines for 12 sends, clean shutdown and no
  crash. Reward OCR passed all 35 gating screen/reader runs with Windows and ONNX
  readers; absent private fixtures were skipped as designed. Riven OCR fixtures
  passed, including the blank frame and weapon/stat identification.
- Packaged runtime smoke passed: the setup view rendered, sharp generated an
  image, both ONNX models loaded, and the process exited cleanly. Evidence is in
  `test-results/packaged-1791650455161`.

The later full Windows suite passed as recorded above; its flaky cases remain
a reliability follow-up. Do not describe the isolated passes as a root-cause
fix. The initial controlled Simulacrum comparison is also complete, within the
limits recorded in `validation.md`. Future mechanics validation should use a
simpler single-projectile weapon and an open, non-destructible firing lane to
isolate effects. Linux and installer acceptance still require their respective
environments before release. Changes remain local and uncommitted.

## What exists

- **Electron bump.** `[deps] - bump electron to 41.10.7` on
  `deps/electron-41.10.7`, which clears the three high-severity Electron
  advisories. `feat/build-advisor` is branched from it.
- **The advisor** in `services/buildAdvisor/`. For an owned primary or secondary
  it recommends up to eight mods and a weapon arcane from what the inventory
  holds, and returns the computed stats, each mod's share of the damage, and
  every stat line it assumed or left out. It models: mod exclusivity; "On Kill"
  and similar bonuses at full stacks; the six damage arcanes; Rivens; Kuva, Tenet
  and Coda bonus elements; mod capacity and polarities; and, with a target
  faction chosen, its weaknesses, armour and status effects.
- **The Builds view** (`src/views/BuildsView.svelte`), a sidebar entry between
  Rivens and Run Analysis. Owned guns on the left with search; the recommendation
  and an arsenal-style stats table on the right, beside each saved config.
  Controls: a Target faction, "Stacks up" and "Fit capacity". It talks to the
  advisor through two IPC calls in `ipc/buildAdvisorIpc.ts` and holds no build
  logic itself.
- **A script** for checking a gun from the command line:
  `node scripts/dev/advise-gun-build.cjs <inventory.json> "<weapon name>"` after
  `pnpm run build:main`.
- **Tests.** Nine unit test files in `tests/main/buildAdvisor*.test.ts` and eight
  end-to-end tests in `e2e/builds.spec.ts`.

## How far it can be trusted

Three layers, from firm to soft:

1. **Arsenal numbers: checked in game.** The calculator matched the arsenal on
   every stat it models for Lex Prime, Trumna Prime and Pyrana Prime, read from
   screenshots, and matched an Overframe build for Lex Prime exactly. Mod costs
   on matching polarities match the mod cards in the same screenshots.
2. **Game rules: from the wiki, not checked in game.** Faction weaknesses, the
   armour formula, status effect values, conditional mod values and arcane
   values are as the wiki and the game data state them.
3. **The combined damage estimate: this project's own model.** How procs,
   Viral, armour strip and status ticks add up to one number against a target
   is an assumption-laden estimate. Treat it as a ranking, and check it in the
   Simulacrum before relying on its absolute figures.

Unverified readings to confirm in game, cheapest first:

- A Kuva, Tenet or Coda weapon's bonus percentage (the view shows what was
  computed; compare with the arsenal).
- The cost of a mod on the wrong polarity (rounding).
- Whether Deadhead and Dexterity share Merciless's damage bucket.
- Burst, held and charge weapons' shots a second.

Bugs found by checking against real data, all fixed:

- A mod and its Amalgam form were recommended together.
- The inventory stores the eight mod slots in the reverse of the arsenal's
  order, so elements combined in the wrong order when reading a saved config.
- Critical Delay was recommended with Point Strike, which the game forbids.
- The bundled mod text writes line breaks as a backslash and an n, so
  conditional lines were not matched at first.
- The search got stuck when bringing in a second element or a cheaper pair of
  mods needed two changes at once.

## What it still does not do

- Melee, warframes and companions.
- Shields, Overguard, status immunity, light units, sub-factions and Bane mods.
- Ramp-up time: the target estimate is a steady state, which flatters status
  builds against enemies that die fast.
- The "damage per status type" bonus of Galvanized Aptitude, Savvy and Shot.
- Arcanes other than Merciless, Deadhead and Dexterity; set bonuses; the exilus
  slot; Incarnon forms.
- Elite Archimedea weekly modifiers and loadout restrictions.
- Kitguns and other modular weapons.
- A guaranteed best build: the search is greedy with single and paired swaps.

## Next steps

- Follow `validation.md`: first compare one Kuva/Tenet/Coda Upgrade screen and
  polarity costs, then validate two or three builds in the Simulacrum.
- The in-product agent that calls the advisor as a tool was deferred; see
  `../adr/0001-deterministic-build-calculator-before-any-agent.md`.
- The German and Chinese strings for the Builds view were written without a
  native review.

The section below is the historical build log. The follow-up section above and
`damage-rules.md` supersede its old capacity handling and validation claims.

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
- Done after the research: Kuva, Tenet and Coda bonus elements. The inventory
  stores the bonus on the weapon as `UpgradeFingerprint.buffs[0]`: a tag
  (`InnateHeatDamage`, `InnateRadDamage` and so on) and an integer up to
  `0x3FFFFFFF`. The bonus is added as base damage of that element, so mods scale
  it and it combines with the weapon's own element. The Builds view shows it
  beside the weapon name. **Unverified:** the integer is read as a straight line
  from 25% to 60% (the wiki's range). On the test inventory that gives Kuva Brakk
  44.0% Heat, Tenet Arca Plasmor 28.6% Toxin and Coda Sporothrix 60.0%
  Radiation; compare one with the arsenal to confirm.
- Done after the research: wider weapon coverage. On the test inventory the
  advisor builds for 81 of 86 owned guns, up from 51.
  - Burst, held, charge and duplex weapons and bows are built for, with
    `approximate: true` and a warning in the view: how a burst or a charge turns
    into shots a second is not modelled, so their damage per second is an
    estimate while the mod ranking holds. Bows count every fire rate bonus twice,
    as the mod text says.
  - `ExportWeapons.damagePerShot` already includes the explosion for most
    explosive weapons (Acceltra Prime, Ogris, Staticor). For 19 guns it does not
    (Trumna Prime, Opticor, Coda Sporothrix and others); there the radial attack
    `@wfcd/items` lists right after the direct hit, at the same fire rate, is
    added to base damage. The figures then sum direct and radial damage, where
    the arsenal shows them in separate sections; the view says so. This
    supersedes the earlier statement that Trumna Prime's saved config matches the
    arsenal row for row: its Heat now includes the radial part.
  - A weapon missing from the bundled `ExportWeapons` (Steflos Prime, Nunchasa,
    Aksondol) is built from its `@wfcd/items` entry.
  - Still refused: kitguns and other modular weapons (no source has assembled
    stats), and three guns whose data lacks a usable stat (Nataruk, Convectrix,
    Grimoire).
- The bundled `@wfcd/items` text writes a line break inside a stat line as a
  literal backslash and n, not a newline. The parser accepts both.

Creator coverage is thin: TheKengineer is well covered, Brozime is one older
video plus three tables from his vault, and nothing from Tactical Potato could
be read.

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
