# Build advisor: where things stand

Last updated 2026-10-06, when the gun advisor MVP reached feature complete. Read
this first when picking the work back up. `damage-rules.md` has the three
in-game checks behind the arsenal numbers, `../adr/` the two design decisions,
and `reports/` the research the later work was built from.

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
- **Tests.** Nine unit test files in `tests/main/buildAdvisor*.test.ts` and six
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

- Validate the target estimate in the Simulacrum for two or three builds.
- The in-product agent that calls the advisor as a tool was deferred; see
  `../adr/0001-deterministic-build-calculator-before-any-agent.md`.
- The German and Chinese strings for the Builds view were written without a
  native review.

The section below is the build log: what was added after the first session, in
order, with the detail behind each piece.

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
