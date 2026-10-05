# Build advisor: damage rules

The rules `services/buildAdvisor` implements, where each came from, and what is
left out. The code and any later agent should work from this page, not memory.

## Status

| Rule                                                    | Source                                  | Checked against the game |
| ------------------------------------------------------- | --------------------------------------- | ------------------------ |
| Modded stat = base stat × (1 + summed bonuses)          | Wiki, Damage/Calculation                | No                       |
| Elemental bonus is a share of the full base damage      | Wiki, Damage/Calculation                | No                       |
| Physical bonus scales that one physical type            | Wiki, Damage/Calculation                | No                       |
| Elements combine in mod slot order, innate element last | Wiki, Damage                            | No                       |
| A mod of the innate element moves it to the mod's slot  | Wiki, Damage                            | No                       |
| Innate combined elements never combine further          | Wiki, Damage                            | No                       |
| Reload time = base ÷ (1 + reload speed bonus)           | Written from memory                     | No                       |
| Magazine = base × (1 + bonus), rounded                  | Written from memory                     | No                       |
| `damagePerShot` is indexed in DE's damage type order    | Trumna Prime (heat), Prisma Detron data | n/a                      |
| `damagePerShot` is per pellet when multishot is above 1 | Hek data: 75 × 7 pellets = 525          | No                       |

Wiki pages were read on 2026-10-05. The "Checked against the game" column
predates the validation section below, which is the current record. To check
another weapon, run
`node scripts/dev/advise-gun-build.cjs <inventory.json> "<weapon name>"` after
`pnpm run build:main` and compare each saved config with the arsenal.

## In-game validation (2026-10-05)

Lex Prime, saved config A, read from an arsenal screenshot: Hornet Strike,
Primed Convulsion, Barrel Diffusion, Magnetic Might, Primed Pistol Gambit,
Frostbite and an unranked Accelerated Isotope.

Every stat the arsenal shows matched the calculator: fire rate 2.29, multishot
2.2, magazine 8, critical chance 71.8%, critical damage 2.8x, status 40%,
impact 57.6, puncture 460.8, slash 57.6, radiation 86.4 and magnetic 1,641.6.
Reload shows as 2.3s against a computed 2.35s, which one decimal cannot tell
apart.

What this settles:

- Summed bonuses, base damage, elemental share of base damage, and the plain
  stats are right for a single-pellet semi-auto gun.
- Cold and electricity from two mods combined into magnetic and merged with a
  magnetic mod's own bonus, while a radiation mod stayed separate.
- The arsenal's per-type rows are per projectile. Its Total row, 5,068.8, is the
  per-type sum (2,304.0) times multishot (2.2).

Trumna Prime, saved config A, from a second screenshot: Malignant Force, Primed
Shred, Rifle Elementalist, Rime Rounds, Vital Sense, Galvanized Chamber,
Critical Delay and Thermite Rounds, with Stabilizer and Primary Merciless.

- The first run was wrong: it gave blast 155 and toxin 51 where the arsenal
  shows viral 102 and heat 104. The inventory stores the eight mod slots in the
  reverse of the arsenal's order. With the order reversed, every damage number
  matches, as do fire rate 5.83, multishot 1.8, critical chance 72%, critical
  damage 5.3x, status 95.2% and the Total row 428.4 (238.0 × 1.8).
- This confirms an innate element joining a mod of the same element, a negative
  fire rate bonus, and a Galvanized mod's unconditional part.
- Reload shows 3.1s against a computed 4.00s. The equipped arcane, Primary
  Merciless, is not modelled; a +30% reload speed from it would give 3.08s, but
  that figure is from memory and unchecked.
- The arsenal lists a separate Radial Attack section for this weapon, which the
  weapon data here does not contain.

Still not checked in game: physical bonuses, leftover single elements, magazine
bonuses, and any multi-pellet weapon.

## Cross-check against Overframe (2026-10-05)

Two public Overframe builds were fed through `evaluateGunConfig` with the same
mods at the same ranks. This shows agreement with another calculator, not with
the game.

| Build                                   | Result                                                                                                                                                 |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Lex Prime, overframe.gg/build/983       | Every number matches: damage by type, crit, multishot, fire rate, status, burst DPS 19,136.8 and sustained DPS 11,871.6.                               |
| Trumna Prime, overframe.gg/build/785990 | Impact, crit, multishot, fire rate and status match; heat is 310.8 against 310.9. DPS is lower here (42,451 against 68,051) for the two reasons below. |

- Overframe adds a radial heat attack to Trumna Prime's primary fire that
  `ExportWeapons.damagePerShot` does not contain. Weapons with a radial part are
  understated here until that damage is read from somewhere.
- Overframe counts the Vigilante set bonus. Set bonuses are not modelled, and
  `@wfcd/items` does not list them as a stat line, so they are not reported as
  left out either.

Element combining was not exercised by either build; it rests on the wiki rules
and the unit tests.

## What is calculated

For one gun and a list of mods in slot order:

- Damage by type. Base damage bonuses are summed and applied to every base type.
  A physical bonus then multiplies its own type. An elemental bonus adds that
  share of the modded base total. Heat, cold, electricity and toxin then pair up
  in slot order (first with second, third with fourth); a leftover stays single.
- Multishot, critical chance, critical multiplier, status chance and fire rate,
  each as base × (1 + summed bonuses).
- Magazine size and reload time.
- Burst damage per second: total damage × multishot × average crit × fire rate,
  where average crit is 1 + critical chance × (critical multiplier − 1).
- Sustained damage per second: burst spread over one magazine plus its reload.

The build search ranks by burst damage per second.

## What is left out, on purpose

- Enemies: armour, health types, faction bonuses, status effects and their
  damage. A status-heavy build will look weaker here than it plays.
- Conditional bonuses ("On Kill", "when Aiming", stacks). A Galvanized mod is
  counted at its unconditional value only, so its plain form can outrank it.
- Rivens, arcanes, the exilus slot, mod capacity and polarities. A recommended
  build may not fit the weapon's capacity.
- Punch through, recoil, accuracy, ammo, projectile speed and zoom.
- Bows, crossbows, and charge, held, burst and duplex triggers. The advisor
  refuses these weapons rather than print numbers it would get wrong.
- Mods for a narrower weapon class (sniper, bow, assault rifle) that the game
  data does not link to the weapon. They are never recommended.
- A Kuva, Tenet or Coda weapon's bonus element. It is stored per weapon in the
  inventory and is not read yet, so those weapons come out low.
- Damage quantization. The game rounds each damage type to 1/32 of base damage
  when it deals damage; the arsenal does not show this and neither do we.

## Known unknowns to settle during validation

- Whether the arsenal shows per-pellet damage or damage × base multishot for
  shotgun-style weapons such as Pyrana Prime. The wiki's "arsenal total damage"
  formula includes multishot.
- Whether the arsenal's status chance for multi-pellet weapons is the top-level
  `procChance` (per pellet) or the per-shot value in `behaviours`.
- Whether mod families are caught well enough. A mod and its Flawed, Primed,
  Galvanized or Amalgam form are treated as exclusive when their data paths
  share a stem or their names differ only by that prefix; a pair linked neither
  way would be recommended together. A sweep of one real inventory (50 guns)
  found no such pair after the Amalgam case was fixed.

## Mod text

Mod effects come from the per-rank stat lines in `@wfcd/items`, because
`warframe-public-export-plus` has no numbers for them. A line is used only when
it matches a known pattern in full; anything else is reported as not modelled.
A rule written in a mod's description is handled the same way: "Fire Rate cannot
be modified." is modelled, and a mod with any other rule is not recommended.
