# Build advisor: damage rules

The rules `services/buildAdvisor` implements, where each came from, and what is
left out. Updated 2026-10-10. The screenshot comparisons below are historical
evidence for the tested rules, not validation of every later addition.

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
  Merciless, was not modelled at the time. Its structured +30% reload bonus is
  now read and produces 3.08s.
- The arsenal lists a separate Radial Attack section for this weapon, which the
  original calculator did not read. It now includes the radial component from
  `@wfcd/items`, so the current damage rows sum direct and radial damage and no
  longer match this historical screenshot row for row.

Pyrana Prime, saved config A, from a third screenshot: Barrel Diffusion, Sure
Shot, Convulsion, Augur Pact, Heated Charge, No Return and Gunslinger.

- Every stat matched with no change to the code: fire rate 6.88, multishot 22,
  magazine 12, reload 1.6s, critical chance 24%, critical damage 2.2x, status
  6.8%, radiation 82.1, slash 38.3, puncture 6.9, impact 3.6 and the Total row
  2,881.2 (130.96 × 22).
- For a multi-pellet weapon the arsenal heads the section "Damage / Projectile"
  and labels status "Status / Projectile". So `damagePerShot` and the top-level
  `procChance` are the per-pellet values the arsenal shows, and both open
  questions about multi-pellet weapons are closed.
- This also confirms a physical bonus (No Return) scaling its own type only.

Still not checked in game: a leftover single element next to a combined one on
a weapon without an innate element, and magazine or reload bonuses.

## Tenet Arca Plasmor Arsenal comparison (2026-10-10)

Config A "Brozime 3yr old", stacks off, MR 27. The supplied screenshots and
matching local snapshot agree on 28.6% Toxin, total capacity 80, fire rate 1,
multishot 2.1, magazine 10, reload 2.3s, critical chance 66%, critical damage
4.2× and status 102%. Radiation is 2,584 and Viral is 4,727; the calculator's
unrounded per-projectile sum times 2.1 is 15,353.0544, matching Total 15,353.1.
An initial critical damage reading of 5.4× fell to 4.2× when the user removed
the companion equipped with Tenacious Bond. That external bonus is outside
the weapon-only model. Wrong-polarity Cannonade costs 11 from a normal drain
of 9, confirming nearest rounding rather than ceiling. See `validation.md`
for screenshot references and limits; this is not a combat DPS validation.

## Hunter Munitions (2026-10-10)

The parser reads +5% through +30% forced Slash chance from the owned mod rank.
The effect is active independently of the Stacks up setting and is scored only
when a target faction is selected. It does not alter Arsenal damage rows.
The expected bleed contribution is projectile rate × mod proc chance ×
critical-hit-weighted multiplier × six ticks × 0.35 × modded base damage ×
the model's expected Viral multiplier. At critical chance below 100%, the
critical weight is chance × critical multiplier; at or above 100%, it is
1 + chance × (critical multiplier - 1). The roll remains once per hit even at
higher critical tiers. It ignores armour and does not need native Slash or
status chance; natural status procs are added separately.

Sources: [Hunter Munitions](https://wiki.warframe.com/w/Hunter_Munitions) and
[Slash damage](https://wiki.warframe.com/w/Damage/Slash_Damage), read October 10.
The captured Tenet tick supports the mechanics approximately (see validation
record), not the steady-state DPS estimate. Other forced-Slash sources and their
interactions are not implemented. The model retains its existing independence,
firing-cycle and combined direct/radial damage approximations.

## Cross-check against Overframe (2026-10-05)

Two public Overframe builds were fed through `evaluateGunConfig` with the same
mods at the same ranks. This shows agreement with another calculator, not with
the game.

| Build                                   | Result                                                                                                                                                 |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Lex Prime, overframe.gg/build/983       | Every number matches: damage by type, crit, multishot, fire rate, status, burst DPS 19,136.8 and sustained DPS 11,871.6.                               |
| Trumna Prime, overframe.gg/build/785990 | Impact, crit, multishot, fire rate and status match; heat is 310.8 against 310.9. DPS is lower here (42,451 against 68,051) for the two reasons below. |

- Overframe adds a radial heat attack to Trumna Prime's primary fire that
  `ExportWeapons.damagePerShot` does not contain. The advisor now reads the
  corresponding radial attack from `@wfcd/items`; this comparison predates it.
- Overframe counts the Vigilante set bonus. Set bonuses are not modelled, and
  `@wfcd/items` does not list them as a stat line, so they are not reported as
  left out either.

Element combining was not exercised by either Overframe build; the arsenal
checks above and unit tests cover the tested combinations.

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

The build search ranks by burst damage per second, or estimated burst damage
against a faction when one is selected. Its greedy search with single and paired
swaps does not guarantee a global optimum. Saved configurations in the Builds
view use the same Stacks up and Target settings as the recommendation; turn
Stacks up off for arsenal comparisons.

## Capacity and polarity handling (2026-10-10)

- Rank comes from `floor(sqrt(XP / 500))`, capped at the weapon's maximum.
  Zero XP is a valid unranked weapon. Missing, negative or non-finite XP leaves
  capacity unknown, and the view says it was not checked.
- The starting capacity floor is 15 plus one per two Mastery Ranks up to MR30,
  followed by one per Legendary Rank, capped at the weapon's maximum rank.
  Capacity is the greater of rank and this floor, doubled by a catalyst.
  [Official Update 38.5 notes](https://www.warframe.com/en/patch-notes/pc/38-5-0)
  confirm the base floor and ordinary Mastery Rank rule. The
  [Mod reference](https://wiki.warframe.com/w/Mod) describes Legendary Ranks.
  These rules still need an in-game check on this inventory. Missing Mastery
  Rank uses only the base floor, which may understate available capacity.
- A matching polarity costs half, rounded up. Wrong-polarity cost retains
  `round(drain * 1.25)` pending a game check: the Mod and Polarity wiki pages
  still disagree. Universal slots exclude Umbra.
- Inventory polarity records override slots; they are not added to the innate
  list. Because innate positions are absent, the advisor enumerates the possible
  remaining innate polarities and checks the most expensive outcome. Duplicate
  slot records use the last value, `AP_NONE` clears a slot, and invalid indices
  and the exilus slot are excluded. The view labels ambiguous layouts as
  "Capacity at most". Actual cost may be lower.
- Within each layout, the drain calculation searches all assignments, grouping
  equivalent polarities. Tests compare it to exhaustive slot permutations.
  Costs are cached per set of drains and polarities during a recommendation.
- Placement assumes mods can use their cheapest slots. The advisor does not
  return a physical slot layout or enforce element order against fixed slot
  positions. Check element combinations while equipping the recommendation.
  The exilus mod's drain is not reserved; the capacity figure covers only the
  recommended regular mods.
- Arcane eligibility checks the adapter feature bit or an already equipped
  arcane, regardless of XP availability or the Fit capacity toggle.

## Other implemented rules

- Conditional mod bonuses and the six Merciless, Deadhead and Dexterity damage
  arcanes are counted at full stacks when Stacks up is enabled.
- Owned Rivens are matched to their weapon family and rescaled by disposition.
  Unrecognised stats are reported, not estimated.
- Kuva, Tenet and Coda bonus elements are read from the inventory fingerprint.
  Their integer-to-percentage conversion matches the checked 28.6% Toxin Tenet
  sample; other rolls and the endpoints still need comparison.
- Faction ranking includes weaknesses, armour, status damage, Viral and armour
  strip under a steady-state model. The combination is this project's estimate,
  not an in-game-validated damage simulator.
- Bows, burst, held, charge and duplex triggers are supported approximately.
  Incorrect firing-cycle assumptions can affect both DPS and mod ranking.
- Direct and matching radial components are added where the export lacks the
  radial component. The UI identifies when it sums arsenal sections.

## What is left out, on purpose

- Shields, Overguard, status immunity, individual enemy exceptions and status
  ramp-up. Heat refresh and reload-time proc uptime are simplified.
- Galvanized Aptitude, Savvy and Shot damage per status type; set bonuses;
  faction damage mods; arcanes other than the six damage arcanes; Incarnon forms.
- Melee, warframes, companions, modular weapons and the exilus slot.
- Punch through, recoil, accuracy, ammo, projectile speed and zoom.
- Mods for a narrower weapon class (sniper, bow, assault rifle) that the game
  data does not link to the weapon. They are never recommended.
- Damage quantization. The game rounds each damage type to 1/32 of base damage
  when it deals damage; the arsenal does not show this and neither do we.

## Known unknowns to settle during validation

- Target ranking for two or three controlled builds in the Simulacrum.
- Bonus-element percentage, wrong-polarity rounding, firing cycles and whether
  Deadhead and Dexterity share Merciless's base-damage bucket.
- Inventory polarity overrides versus the actual slots and capacity, including
  replaced/removed polarities, an unranked weapon and a rank-40 weapon.
- Whether mod families are caught well enough. A mod and its Flawed, Primed,
  Galvanized or Amalgam form are treated as exclusive when their data paths
  share a stem or their names differ only by that prefix; a pair linked neither
  way would be recommended together. A sweep of one real inventory (50 guns)
  found no such pair after the Amalgam case was fixed.

The Pyrana Prime screenshot settled the earlier questions about per-pellet
damage and status chance. See [validation.md](validation.md) for the next checks.

## Mod text

Mod effects come from the per-rank stat lines in `@wfcd/items`, because
`warframe-public-export-plus` has no numbers for them. A line is used only when
it matches a known pattern in full; anything else is reported as not modelled.
A rule written in a mod's description is handled the same way: "Fire Rate cannot
be modified." is modelled, and a mod with any other rule is not recommended.
