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

Wiki pages were read on 2026-10-05. Nothing has been compared with in-game
arsenal numbers yet; that is the next step. Run
`node scripts/dev/advise-gun-build.cjs <inventory.json> "<weapon name>"` after
`pnpm run build:main` and compare each saved config with the arsenal.

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
- Whether mod families are caught well enough. A mod and its Flawed, Primed or
  Galvanized form are treated as exclusive when their data paths share a stem;
  a pair named differently would be recommended together.

## Mod text

Mod effects come from the per-rank stat lines in `@wfcd/items`, because
`warframe-public-export-plus` has no numbers for them. A line is used only when
it matches a known pattern in full; anything else is reported as not modelled.
A rule written in a mod's description is handled the same way: "Fire Rate cannot
be modified." is modelled, and a mod with any other rule is not recommended.
