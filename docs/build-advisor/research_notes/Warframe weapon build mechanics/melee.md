# Warframe melee damage and modding system (state as of 2026-10-05, Update 44)

Research date: 2026-10-05. Latest live update seen in sources: Update 44.0 "Iceblade of Narin" (2026-09-23). No melee mechanic changes were found in the U44 notes ([forum patch notes](https://forums.warframe.com/topic/1523956-update-44-iceblade-of-narin/)).

Labels used on every rule:
- **WIKI-CONFIRMED**: stated on wiki.warframe.com (URL given). Note that several wiki pages carry their own "actively being worked on" banners; where they do, this is flagged.
- **COMMUNITY-CONSENSUS**: stated by a creator or forum thread (cited). Thin in these notes, see the Gaps sections.
- **DISPUTED**: two sources conflict, or one source contradicts itself.
- **UNKNOWN**: could not be sourced in this session. Never use as a rule without in-game verification.

Source access notes: wiki.warframe.com pages were read in full through a scraper (direct fetch is bot-blocked). Mod stat lines come from the wiki's own data module [Module:Mods/data](https://wiki.warframe.com/w/Module:Mods/data). Reddit could not be scraped. Brozime's Obsidian vault was searched; no dedicated melee mechanics note was found (only an Incarnon note and junction guides surfaced). No transcripts from TheKengineer or Tactical Potato were obtained. Meta claims are therefore weakly sourced and labelled accordingly.

---

## 1. The melee damage formula and order of operations

### Takeaway
Melee uses the same base-damage, elemental, crit and faction layers as guns, but has no multishot, adds a per-hit stance multiplier, and applies the combo multiplier only to heavy attacks (and heavy slams), not to normal attacks. Condition Overload and "Melee Damage on Heavy Attack" sit in the same additive bucket as Pressure Point.

### Cited Findings
- **WIKI-CONFIRMED.** Arsenal damage for melee: `Arsenal Total = Base x [1 + Elemental Bonuses + sum(unmodded IPS share x IPS bonus)] x (1 + Damage Bonuses)`. "For melee weapons, remove multishot from the equation. It does not include Stance damage multipliers." — [Damage Calculation](https://wiki.warframe.com/w/Damage/Calculation)
- **WIKI-CONFIRMED.** Condition Overload stacks additively with Pressure Point-type mods: `Total Damage = Base x [1 + Damage Mods + (CO x n)] x (1 + Elemental Mods)`, n = unique statuses on target. — [Condition Overload](https://wiki.warframe.com/w/Condition_Overload)
- **WIKI-CONFIRMED.** Stance physical bonuses are a separate multiplier: `Physical Damage = Base Physical x (1 + Stance Physical Bonus) x (1 + Modded Physical Bonus) x Combo Damage Multiplier On Hit`. Stance bonuses are typically +10/25/50/100% and stack multiplicatively with IPS mods. — [Stance](https://wiki.warframe.com/w/Stance)
- **WIKI-CONFIRMED.** "Melee Combo Multiplier does not multiply the damage of your normal attacks." Heavy attacks deal 2x to 12x from combo. — [Melee Combo](https://wiki.warframe.com/w/Melee_Combo)
- **WIKI-CONFIRMED.** Heavy attack: `Heavy = modded normal attack damage x class heavy multiplier x combo multiplier`. Wiki example: Staff, 400 modded damage, 3x combo: 400 x 5 x 3 = 6,000. — [Melee, Heavy Attack Damage](https://wiki.warframe.com/w/Melee)
- **WIKI-CONFIRMED.** Killing Blow's "+120% Melee Damage On Heavy Attack" is additive with Pressure Point. — [Killing Blow](https://wiki.warframe.com/w/Killing_Blow)
- **WIKI-CONFIRMED.** Slam damage bonus (Seismic Wave) is multiplicative to base damage mods such as Pressure Point and Arcane Fury. — [Seismic Wave](https://wiki.warframe.com/w/Seismic_Wave)
- **WIKI-CONFIRMED.** Melee average-hit and DPS formulas: `Average Hit = Average Combo Damage Multiplier x Total Damage x (1 + CC x (CM - 1))`, `Average DPS = Avg Hit x Modded Attack Speed / Base Combo Length`. — [Damage Calculation](https://wiki.warframe.com/w/Damage/Calculation)
- **WIKI-CONFIRMED.** Damage mod values (max rank): Pressure Point +120%, Primed Pressure Point +165%, Sacrificial Pressure +110% (x1.33 vs Sentients; the Sacrificial set raises each mod's primary value by 25% per other set piece), Spoiled Strike +100% damage / -20% attack speed, Condition Overload +80% per status. — [Module:Mods/data](https://wiki.warframe.com/w/Module:Mods/data), [Sacrificial Steel](https://wiki.warframe.com/w/Sacrificial_Steel), [Attack Speed](https://wiki.warframe.com/w/Attack_Speed)
- **WIKI-CONFIRMED.** Arcane Fury: on critical hit, 60% chance for +180% Melee Damage for 18 s (max rank). — [Arcane Enhancement](https://wiki.warframe.com/w/Arcane_Enhancement)

### Inferences
Proposed order of operations for one melee hit on the first target (assembled from the cited formulas; the combined expression is not printed anywhere on the wiki as one line):

```
1. BaseBucket    = 1 + sum(Pressure Point family, Arcane Fury, Riven dmg, frame buffs that are "melee damage")
                     + 0.8 x n_status        (Condition Overload, normal/heavy/slide hits only)
                     + Killing Blow etc.     (heavy attacks only)
                     + Tennokai damage       (Master's Edge, Truth's Flame; Tennokai heavies only)
2. Per damage type: Base_type x BaseBucket x (1 + stance IPS bonus) x (1 + IPS mod bonus)
   Elemental     = total modded base x sum(elemental mods)   (combined into Viral, Corrosive, ...)
3. x AttackMultiplier:
     normal  : stance hit multiplier for that swing (100% to 400%+)
     heavy   : class heavy multiplier (2x to 15x) x combo multiplier (1 to 12)
     slam    : 2 x (1 + slam bonus) x falloff(0.5..1)        [no CO]
     heavy slam: 3 x combo multiplier x (1 + slam bonus) x falloff(0.7..1)   [no CO]
     slide   : class slide multiplier (2x on the weapons checked)
4. x crit: 1 + CC x (CM - 1) on average (tiered, see section 4)
5. x faction multiplier, then enemy-side modifiers (armor, resistances, weak points) from the general formula
6. x follow-through FT^(k-1) for the k-th enemy struck by the same swing (not slams, not projectiles)
```

Worked example A (light attack, status build). Skana-like weapon, 120 base. Primed Pressure Point (+165%), Condition Overload with 3 statuses on target (+240%), two 60/60 elemental mods combining to +120% Viral, stance swing at 200%:
- 120 x (1 + 1.65 + 2.40) = 606
- 606 x (1 + 1.20) = 1,333.2 total (606 physical + 727.2 Viral)
- x 2.0 stance = 2,666.4 before crit, faction and enemy defences.

Worked example B (heavy attack). Heavy Blade (6x heavy multiplier), 250 base, Primed Pressure Point + Killing Blow, 12x combo:
- 250 x (1 + 1.65 + 1.20) = 962.5
- x 6 x 12 = 69,300 before crit and elementals.

Where melee differs from guns: no multishot term; a per-swing stance multiplier; a combo counter feeding crit and status chance (Blood Rush, Weeping Wounds) rather than damage on normal hits; follow-through instead of punch-through; range instead of falloff; forced procs from stances; attack speed scales animation length rather than a fire-rate stat.

### Gaps
- UNKNOWN: whether "Tennokai damage" (Master's Edge) is in the Pressure Point bucket. Truth's Flame is confirmed additive with Pressure Point ([Truth's Flame](https://wiki.warframe.com/w/Truth%27s_Flame)); Master's Edge was not checked.
- UNKNOWN: exact placement of the class slide multiplier. Only the Slide column of weapon tables was seen (e.g. Cerata normal 183, slide 366 — [Glaive (Weapon Type)](https://wiki.warframe.com/w/Glaive_(Weapon_Type))).
- The general formula (enemy defences, faction, weak points, quantization) is covered by other researchers and is not repeated here.

---

## 2. Combo counter

### Takeaway
Combo is a point counter: +1 point per 100% of stance multiplier per enemy hit, one tier per 20 points, capped at 12x at 220 points, decaying fully after 5 s without a hit or block. Its multiplier applies to heavy attacks, heavy slams, combo-scaled crit/status mods and some abilities, never to normal attacks.

### Cited Findings
- **WIKI-CONFIRMED.** Multiplier table: 2x at 20, 3x at 40 ... 12x at 220 points. Venka Prime reaches 13x at 240. Dex Nikana needs 11 hits per tier and caps at 11x at 110. — [Melee Combo](https://wiki.warframe.com/w/Melee_Combo)
- **WIKI-CONFIRMED.** Gain: "100% stance damage multiplier = 1 point"; a 300% hit adds 3 points per hit. Only successful strikes on enemies count; each blocked attack or projectile adds 1; hits on containers add nothing. Gain "is affected by the number of enemies hit". — [Melee Combo](https://wiki.warframe.com/w/Melee_Combo)
- **WIKI-CONFIRMED.** Additional Combo Count Chance starts at +0% and is additive across sources (Quickening, True Punishment, Enduring Strike, Guardian Derision, Relentless Combination, Zaw Exodias). Values: Quickening +20%, True Punishment +100% with -50% combo duration, Enduring Strike +20% on Lifted enemies, Relentless Combination +100% chance to add combo when a Slash status deals damage. — [Melee Combo](https://wiki.warframe.com/w/Melee_Combo), [Module:Mods/data](https://wiki.warframe.com/w/Module:Mods/data)
- **WIKI-CONFIRMED.** Duration: default 5 s; cannot go below 0.1 s; "a zero or negative combo duration prevents increasing the combo counter". Duration sources: Body Count +12 s, Drifting Contact +10 s (and +40% status chance), Gladiator Rush +6 s, Combo Killer +5 s, Swift Momentum aura +6 s, Amalgam Furax Body Count +15 s, Corrupt Charge -50%. Exceptions: Xoris infinite; Tenet Livia and Tenet Grigori pause while holstered; Guandao Prime 6 s, Pulmonars 9 s, Vitrica 10 s base. — [Melee Combo](https://wiki.warframe.com/w/Melee_Combo), [Module:Mods/data](https://wiki.warframe.com/w/Module:Mods/data)
- **WIKI-CONFIRMED.** Naramon Power Spike: combo decays by 5 per reset at max rank instead of clearing. — [Melee Combo](https://wiki.warframe.com/w/Melee_Combo)
- **WIKI-CONFIRMED.** Initial Combo is the floor after reset; "Heavy attacks spend initial combo, which regenerates at a rate of 40 combo points per second." Sources: Corrupt Charge +30, Covert Lethality +16 (daggers), Ready Steel aura +24, Galvanized Reflex +20 per stack x4 on melee kill for 20 s, Melee Crescendo +6 per finisher kill, innate on Synoid Heliocor 20, Furax Wraith 20, Fragor Prime 30, plus Incarnon evolutions (+20 or +30). — [Melee Combo](https://wiki.warframe.com/w/Melee_Combo), [Module:Mods/data](https://wiki.warframe.com/w/Module:Mods/data)
- **WIKI-CONFIRMED.** What scales with combo: heavy attacks, Blood Rush, Weeping Wounds, all Gladiator set bonuses, Jugulus set bonus, Lifted duration, some abilities (ability damage at 1:0.25, i.e. 1.5x to 4x), and the separate Ability Combo Counter (Blade Storm, Landslide, Shattered Lash, Whipclaw). — [Melee Combo](https://wiki.warframe.com/w/Melee_Combo)
- **WIKI-CONFIRMED.** Thrown glaive attacks are affected by the combo counter and get Blood Rush. — [Blood Rush](https://wiki.warframe.com/w/Blood_Rush)
- **WIKI-CONFIRMED.** Riven base values (melee column, before disposition and buff-count scaling): Additional Combo Count Chance 58.77%, Combo Duration 8.1 s, Initial Combo 24.5, Heavy Attack Efficiency 73.44%, Range 1.94 m, Melee Damage 164.7%, Attack Speed 54.9%, Critical Chance for Slide Attack 120%, Finisher Damage 119.7%. — [Riven Mods](https://wiki.warframe.com/w/Riven_Mods)

Change log relevant to combo (each line cites the page whose patch history carries it):
- U26.0 (2019-10-31): Blood Rush changed from multiplicative +165% to additive +60% on base crit; Condition Overload changed to additive; Killing Blow repurposed to heavy attacks; stances reworked. — [Blood Rush](https://wiki.warframe.com/w/Blood_Rush), [Condition Overload](https://wiki.warframe.com/w/Condition_Overload), [Killing Blow](https://wiki.warframe.com/w/Killing_Blow), [Stance](https://wiki.warframe.com/w/Stance)
- U30.5 (2021-07-06): Blood Rush +60% to +40%; Condition Overload lowered to +80%. — same pages
- U35.0 (2023-12-13): Tennokai and Melee Arcanes added. — [Arcane Enhancement](https://wiki.warframe.com/w/Arcane_Enhancement), [Module:Mods/data](https://wiki.warframe.com/w/Module:Mods/data)
- U35.5 (2024-03-27): slams became pure radial damage that scales with mods. — [Melee](https://wiki.warframe.com/w/Melee)
- U37.0 (2024-10-02): Galvanized Steel, Galvanized Reflex, Galvanized Elementalist. — [Galvanized Steel](https://wiki.warframe.com/w/Galvanized_Steel), [Module:Mods/data](https://wiki.warframe.com/w/Module:Mods/data)
- U39.0 (2025-06-25): slam radius scales with height; Nira set fixed and changed to +150% per mod. — [Melee](https://wiki.warframe.com/w/Melee)
- U41.0 (2025-12-10): "Fixed the Gladiator Mod Set bonuses not applying." — [Gladiator Might](https://wiki.warframe.com/w/Gladiator_Might)
- U42.0 (2026-03-25): Truth's Flame added; Blood Rush HUD icon fix (visual only). — [Truth's Flame](https://wiki.warframe.com/w/Truth%27s_Flame), [Blood Rush](https://wiki.warframe.com/w/Blood_Rush)

### Inferences
- Combo tier function for a calculator: `multiplier = min(cap, 1 + floor(points / 20))`, cap 12 (13 Venka Prime; Dex Nikana uses 11 points per tier, cap 11). At 0 to 19 points the multiplier is 1.
- Expected points per swing = `stance multiplier of that hit x enemies hit x (1 + additional combo count chance)`. The "x (1 + chance)" form is my reading of "awarding an extra combo point"; it is not printed as a formula.
- Worked example: Blind Justice neutral combo gives +19 points per loop per enemy ([Stance comparison table](https://wiki.warframe.com/w/Stance)). Against 3 enemies with Quickening (+20%): 19 x 3 x 1.2 = 68.4 points per 2.6 s loop at speed 1.0, so 12x (220 points) after about 3.2 loops.
- Because normal hits ignore the multiplier, combo only matters to a light-attack build through Blood Rush, Weeping Wounds and the Gladiator set. A build with none of those gains nothing from combo on light attacks.

### Gaps
- UNKNOWN: whether additional combo count chance above 100% can grant two extra points.
- UNKNOWN: whether Melee Crescendo's initial combo has a cap. The patch note says "Gain 6 Initial Combo for the rest of your mission" ([Arcane Enhancement](https://wiki.warframe.com/w/Arcane_Enhancement)); no cap was seen in the sources read.
- The statement that pre-U26 combo multiplied normal attacks is from memory, not sourced here.

---

## 3. Heavy attacks

### Takeaway
A heavy attack deals modded normal damage x a weapon-class multiplier x the current combo multiplier, then spends combo unless Heavy Attack Efficiency (cap 90%) or a Tennokai window preserves it. Wind-up is a separate stat from attack speed.

### Cited Findings
- **WIKI-CONFIRMED** (page carries a "being worked on" banner). Class heavy multipliers, first / second (or slide) heavy, and typical wind-up — [Melee](https://wiki.warframe.com/w/Melee):

| Class | 1st heavy | 2nd heavy | Wind-up | Forced proc |
|---|---|---|---|---|
| Assault Saw | 6x | 6x | 1.0 s | Bleed on part |
| Blade and Whip | 4x | 12x (3 x 400%) | 0.4 s | |
| Claws | 5x | 5x | 0.6 s | Bleed |
| Dagger | 5x | 5x | 0.4 s | Bleed on half |
| Dual Daggers | 5x | 5x | 0.5 s | Bleed |
| Dual Nikanas | 12x (3 x 200% + 600%) | 6x | 1.0 s | |
| Dual Swords | 5x | 5x | 0.7 s | |
| Fist | 5x | 5x | 0.6 s | |
| Glaive | 2x | 3x | 0.6 s | |
| Gunblade | 5x | 5x | 0.4 s | |
| Hammer | 6x | 6x | 1.2 s | |
| Heavy Blade | 6x | 6x | 1.1 s | |
| Heavy Scythe | 6x (3 x 200%) | 12x (2 x 600%) | 1.0 s | |
| Machete | 6x | 5x | 0.7 s | Bleed on part |
| Nikana | 5x | 5x | 0.5 s | Bleed |
| Nunchaku | 5x | 5x | 0.5 s | |
| Polearm | 6x | 6x | 0.9 s | |
| Rapier | 4.5x | 4.5x | 0.5 s | Bleed |
| Scythe | 6x | 6x | 1.0 s | Bleed |
| Sparring | 12x | 15x | 0.5 s | Bleed on part of 2nd |
| Staff | 5x | 5x | 0.5 s | |
| Sword | 5x | 5x | 0.6 s | |
| Sword and Shield | 5x | 5x | 0.7 s | |
| Tonfa | 5x | 5x | 0.7 s | Bleed |
| Two-Handed Nikana | 6x | 6x | 0.7 s | Bleed |
| Warfan | 5x | 5x | 0.5 s | Bleed |
| Whip | 4.5x | 4.5x | 0.4 s | Bleed |

- **WIKI-CONFIRMED.** Heavy Attack Efficiency keeps that percentage of current combo; capped at 90%. Example: 40% efficiency at 160 points keeps 64 (4x). "Combo Efficiency does not decrease the combo multiplier of a heavy attack." Kullervo's passive gives 75%. — [Melee Combo](https://wiki.warframe.com/w/Melee_Combo), [Melee](https://wiki.warframe.com/w/Melee)
- **WIKI-CONFIRMED.** Efficiency sources: Reflex Coil +60%, Galvanized Reflex +50%, Focus Energy +40% (with +60% Electricity), Focus Radon +40% (with +60% Radiation). — [Module:Mods/data](https://wiki.warframe.com/w/Module:Mods/data)
- **WIKI-CONFIRMED.** Initial-combo rebuild after a heavy: 3 s to regain 7x, 5.5 s to regain 12x at 40 points/s; with 90% efficiency 0.3 s and 0.55 s. — [Melee Combo](https://wiki.warframe.com/w/Melee_Combo)
- **WIKI-CONFIRMED.** Wind-up: attack speed does not reduce wind-up time, it shortens the interval between heavies and speeds the swing animation. Wind-up speed has no cap (diminishing returns). Heavy slams have no wind-up. Combo decay pauses during wind-up. A connecting heavy does not add combo. — [Melee](https://wiki.warframe.com/w/Melee), [Attack Speed](https://wiki.warframe.com/w/Attack_Speed)
- **WIKI-CONFIRMED.** Wind-up sources: Killing Blow +60% (with +120% heavy damage), Amalgam Organ Shatter +60% (with +85% crit damage), Melee Elementalist +60% (with +90% status damage, U36), Swift Momentum aura +30%. — [Module:Mods/data](https://wiki.warframe.com/w/Module:Mods/data)
- **WIKI-CONFIRMED.** Crit chance mods double on heavies: True Steel "+120% Critical Chance (x2 for Heavy Attacks)", Sacrificial Steel +220% (x2), Galvanized Steel +110% (x2) plus +30% crit damage per stack x4 on melee kill. Hotfix 37.0.4 (2024-10-10) clarifies the doubling means +220% total for Galvanized Steel on heavies, not +330%. — [Module:Mods/data](https://wiki.warframe.com/w/Module:Mods/data), [Galvanized Steel](https://wiki.warframe.com/w/Galvanized_Steel)
- **WIKI-CONFIRMED.** Corrupt Charge +30 Initial Combo / -50% Combo Duration; Life Strike +20% Life Steal on Heavy Attack; Dispatch Overdrive +60% movement speed for 15 s on heavy hit. — [Module:Mods/data](https://wiki.warframe.com/w/Module:Mods/data)
- **WIKI-CONFIRMED.** Chaining: pressing melee the moment a heavy lands starts a second heavy that still uses the current combo; combo drains only after the second swing. — [Melee](https://wiki.warframe.com/w/Melee)
- **WIKI-CONFIRMED.** "Increased base damage from Incarnon Genesis is not multiplied by the heavy attack multiplier, but is multiplied by the combo multiplier." — [Melee](https://wiki.warframe.com/w/Melee)
- **WIKI-CONFIRMED.** Heavy slam: performed with the heavy button in mid-air regardless of aim; benefits from combo multiplier; applies Lifted, longer at higher combo; 3x a normal attack; falloff to 70% at the edge. — [Melee](https://wiki.warframe.com/w/Melee)
- **WIKI-CONFIRMED.** Arcanes for heavies: Melee Animosity +42% heavy crit chance per melee hit, 10 stacks, consumed on heavy; Melee Assimilation (U43, 2026-06-17) on shield break +150% melee damage on heavy attack, heavy kills restore 30% max shields for 20 s. — [Arcane Enhancement](https://wiki.warframe.com/w/Arcane_Enhancement)

### Inferences
- Heavy crit chance: `CC_heavy = base x (1 + 2 x SteelMod + other additive crit mods + BloodRush x (combo - 1) + 0.42 x Animosity stacks) + flat`. Example: 20% base with Sacrificial Steel: 20% x (1 + 4.4) = 108%. Whether the Sacrificial set-boosted +275% also doubles (to +550%) is not stated.
- Sustained heavy-build cadence: `time per heavy ~ wind-up time + swing time + combo rebuild time`, with rebuild = points lost / 40 per second for initial-combo builds. With 90% efficiency the rebuild term nearly vanishes, so efficiency is a throughput stat, not a damage stat.
- Worked example: Corrupt Charge (30) + Galvanized Reflex at 4 stacks (80) = 110 initial combo, i.e. 6x. With Reflex Coil + Galvanized Reflex efficiency (110% capped at 90%) a heavy keeps 99 points (5x) and regains the missing 11 points in 0.275 s.
- Wind-up time presumably equals `base wind-up / (1 + wind-up speed bonus)`; the wiki gives no formula.

### Gaps
- UNKNOWN: exact wind-up formula and Tennokai's wind-up speed value.
- UNKNOWN: per-weapon heavy multipliers that deviate from class defaults. The Arsenal "Heavy" column should be read per weapon (e.g. Redeemer Prime shows 3,200, Stropha 2,800 — [Gunblade](https://wiki.warframe.com/w/Gunblade)).

---

## 4. Blood Rush, Weeping Wounds, Gladiator set, Sacrificial Steel / True Steel

### Takeaway
All four are additive multipliers of base crit or status chance. Combo-scaled ones use (combo multiplier - 1), so they give nothing below 20 combo points.

### Cited Findings
- **WIKI-CONFIRMED.** `Crit Chance = Weapon CC x [1 + Mod Crit Bonus + Blood Rush Bonus x (Combo Multi - 1)] + Static Crit Bonus`. Blood Rush is +40% per tier: +440% at 12x. Example: 20% base, True Steel (1.2), Blood Rush (0.4), 4x combo: 20% x (1 + 1.2 + 0.4 x 3) = 68%. Static bonuses (Arcane Avenger +45%, Cat's Eye +60%) add flat. — [Blood Rush](https://wiki.warframe.com/w/Blood_Rush)
- **WIKI-CONFIRMED.** Gladiator set: +10% crit chance per equipped set mod per combo tier, up to 6 mods (60%; 660% at 12x). It adds to the Blood Rush term: "using two Gladiator Mods will effectively bring the total value up to 60%". Set mods: Gladiator Might +60% crit damage, Gladiator Rush +6 s combo duration, Gladiator Vice +30% attack speed (melee), plus Aegis, Resolve, Finesse on the Warframe. — [Gladiator Might](https://wiki.warframe.com/w/Gladiator_Might), [Blood Rush](https://wiki.warframe.com/w/Blood_Rush), [Module:Mods/data](https://wiki.warframe.com/w/Module:Mods/data)
- **WIKI-CONFIRMED.** Since the exalted rework, set bonuses are counted from the active weapon: set mods on the regular melee do not count while an Exalted melee is active. — [Exalted Weapon](https://wiki.warframe.com/w/Exalted_Weapon)
- **WIKI-CONFIRMED.** `Status Chance = Weapon SC x [1 + Mod Status Bonus + Weeping Wounds Bonus x (Combo Multi - 1)]`, Weeping Wounds +40% per tier. Example: 20% base, Voltaic Strike (0.6), 4x combo: 20% x (1 + 0.6 + 1.2) = 56%. Weapons with 19% or more base status reach 100% at 12x. — [Weeping Wounds](https://wiki.warframe.com/w/Weeping_Wounds)
- **WIKI-CONFIRMED.** Sacrificial Steel +220% (x2 heavy), +275% with Sacrificial Pressure equipped; incompatible with True Steel and Galvanized Steel; Umbra polarity, drain 16. True Steel +120% (x2 heavy). Galvanized Steel +110% (x2 heavy), drain 12, standard polarity. — [Sacrificial Steel](https://wiki.warframe.com/w/Sacrificial_Steel), [Galvanized Steel](https://wiki.warframe.com/w/Galvanized_Steel)
- **WIKI-CONFIRMED.** Crit damage mods: Organ Shatter +90%, Amalgam Organ Shatter +85%, Gladiator Might +60% (stack additively: Organ Shatter + Gladiator Might = +150%). — [Gladiator Might](https://wiki.warframe.com/w/Gladiator_Might), [Module:Mods/data](https://wiki.warframe.com/w/Module:Mods/data)
- **DISPUTED (stale example).** The Maiming Strike page example still uses a 60% Blood Rush value ("(2 - 1) x 60%"), which predates the U30.5 change to 40%. Treat that example's number as outdated. — [Maiming Strike](https://wiki.warframe.com/w/Maiming_Strike) vs [Blood Rush](https://wiki.warframe.com/w/Blood_Rush)
- **DISPUTED.** Blood Rush and Weeping Wounds carry the incompatibility tag POWER_WEAPON in the data module, while the exalted rework notes say "Acolyte, Amalgam and Melee Combo Counter mods can now be equipped on all Exalted weapons". — [Module:Mods/data](https://wiki.warframe.com/w/Module:Mods/data) vs [Exalted Weapon](https://wiki.warframe.com/w/Exalted_Weapon)

### Inferences
- Worked example (crit light-attack build at 12x): 25% base crit, Sacrificial Steel (2.2), Blood Rush (0.4), three Gladiator mods (0.3): 25% x (1 + 2.2 + 0.7 x 11) = 272.5%, i.e. 72.5% red, 27.5% orange. With crit multiplier 2.0 x (1 + 0.9) = 3.8, average crit factor = 1 + 2.725 x 2.8 = 8.63.
- Worked example (Weeping Wounds at 12x): 30% base, Vicious Frost (0.6), Weeping Wounds: 30% x (1 + 0.6 + 4.4) = 180% status chance.
- Break-even: at 12x Blood Rush is worth +440% base crit versus Sacrificial Steel's +220%, so Blood Rush wins whenever average combo tier is 6.5x or higher (0.4 x (tier - 1) > 2.2).

### Gaps
- UNKNOWN: whether status chance above 100% on melee yields guaranteed second procs the same way as guns (general status researcher should confirm).

---

## 5. Condition Overload

### Takeaway
+80% melee damage per unique status type on the struck target, added into the same bucket as Pressure Point; it does not apply to slams, heavy slams or radial explosions, and a newly applied status does not count for the hit that applied it.

### Cited Findings
- **WIKI-CONFIRMED.** Formula: `Base x [1 + Damage Mods + 0.8 x n] x (1 + Elemental Mods)`. No cap on n; table runs to 16 (+1,280%). — [Condition Overload](https://wiki.warframe.com/w/Condition_Overload)
- **WIKI-CONFIRMED.** "This damage does not apply to Slams, Heavy Slams, or Radial Attack explosions (eg. Glaive Heavy Attacks)." — [Condition Overload](https://wiki.warframe.com/w/Condition_Overload)
- **WIKI-CONFIRMED.** The status applied by a hit does not boost that hit or its proc; gunblade pellets hit consecutively so later pellets benefit from earlier ones. Statuses can come from any source (guns, abilities, companions, allies). — [Condition Overload](https://wiki.warframe.com/w/Condition_Overload)
- **WIKI-CONFIRMED.** Counted statuses: Impact, Puncture, Slash, Cold, Electricity, Heat, Toxin, Blast, Corrosive, Gas, Magnetic, Radiation, Viral, Void, Tau, plus hidden ones: Lifted, Knockdown (mutually exclusive), Microwave (Nukor). Practical maximum 16. — [Condition Overload](https://wiki.warframe.com/w/Condition_Overload), [Condition Overload (Mechanic)](https://wiki.warframe.com/w/Condition_Overload_(Mechanic))
- **WIKI-CONFIRMED.** CO raises proc damage (it is part of modded base damage). For radial procs (Blast, Electricity, Gas) the bonus is computed from the initial target. — [Condition Overload](https://wiki.warframe.com/w/Condition_Overload)
- **WIKI-CONFIRMED.** History: before U26 it was a multiplicative x1.6^n; U26 made it additive; U30.5 (2021-07-06) lowered it to 80% "to make it almost as good as Primed Pressure Point"; Hotfix 31.1.3 (2022-02-15) fixed inconsistent bonus across swings. — [Condition Overload](https://wiki.warframe.com/w/Condition_Overload)
- **COMMUNITY-CONSENSUS** (wiki page explicitly marked as unofficial, community-tested, last edited 2026-10-05). CO under-performs or over-performs on multi-hit stance inputs because the additive recalculation omits "some Melee Stance Multipliers, on inputs with multiple hits". Sample effectiveness of the CO bonus by stance combo: Gunblade High Noon and Bullet Dance 100% everywhere; Gnashing Payara neutral 36%; Homing Fang neutral 53%; Vermillion Storm neutral 62%; Tempo Royale neutral 63%; Crossing Snakes neutral 122%; Mountain's Edge heavy 233%. Some weapon projectiles (Syam waves, Tenet Agendus waves, Tenet Grigori disk, Verdilac wave) take CO multiplicatively. Additive CO also ignores Incarnon Genesis base-damage increases. — [Condition Overload (Mechanic)](https://wiki.warframe.com/w/Condition_Overload_(Mechanic))
- **WIKI-CONFIRMED.** Healing Return restores 11 health per status type on the target per hit (the usual sustain partner). — [Module:Mods/data](https://wiki.warframe.com/w/Module:Mods/data)

### Inferences
- Marginal value: with Primed Pressure Point already slotted, CO at n statuses multiplies damage by (2.65 + 0.8n) / 2.65: n=2 gives x1.60, n=4 gives x2.21. Without any base-damage mod, CO at n=3 alone gives x3.4, beating Primed Pressure Point alone (x2.65) from n=3 upward (0.8n > 1.65 means n >= 3).
- Worked example: 200 base, CO only, 5 statuses: 200 x (1 + 4.0) = 1,000. Add Primed Pressure Point: 200 x (1 + 1.65 + 4.0) = 1,330 (only +33%), which is why a status build usually takes one of the two and spends the slot elsewhere.
- A calculator needs an "expected unique statuses on target" input (user-set or estimated from the build's own status types plus priming weapon). It must zero CO for slam, heavy slam and glaive explosion rows.

### Gaps
- The per-stance CO effectiveness table is community-tested and incomplete (blank cells); DE has not confirmed it. Treat as optional refinement.

---

## 6. Attack speed, range, follow-through, sweep

### Takeaway
Attack speed divides animation length and is fully additive across mods and buffs; range is flat metres added to a capsule hitbox; follow-through is a geometric decay per additional enemy and does not apply to slams or projectiles.

### Cited Findings
- **WIKI-CONFIRMED.** `Modified Animation Length = Base Attack Animation Length / [Base Weapon Attack Speed x (1 + Attack Speed Bonuses)]`. True speed depends on class and stance animation, weapon multiplier, and bonuses. Base speeds are fractions of x/60. — [Attack Speed](https://wiki.warframe.com/w/Attack_Speed)
- **WIKI-CONFIRMED.** Mod values: Fury +30%, Primed Fury +55%, Berserker Fury +35% per stack, 2 stacks, on melee kill for 10 s, Quickening +40% (and +20% combo count chance), Gladiator Vice +30%, Magnetic Rush +20% (with +60% Magnetic, U38), Spoiled Strike -20%. — [Module:Mods/data](https://wiki.warframe.com/w/Module:Mods/data)
- **WIKI-CONFIRMED.** Arcane Strike: on hit, 15% chance for +60% attack speed for 18 s, additive. — [Attack Speed](https://wiki.warframe.com/w/Attack_Speed), [Arcane Enhancement](https://wiki.warframe.com/w/Arcane_Enhancement)
- **WIKI-CONFIRMED.** Frame buffs listed: Valkyr Warcry 50% at max rank base (additive to mods, scales with strength), Volt Speed 75% melee attack speed, Wisp Haste Mote 20% base, Gauss Redline 8% to 40% by battery, Harrow. — [Attack Speed](https://wiki.warframe.com/w/Attack_Speed)
- **WIKI-CONFIRMED.** Attack speed affects finishers and the heavy swing animation but not wind-up; glaive throws ignore attack speed and use wind-up speed. — [Attack Speed](https://wiki.warframe.com/w/Attack_Speed)
- **WIKI-CONFIRMED** (citation-needed flag on the wiki). Hitbox is an obround; Range is its length; hidden Sweep Radius is its width, 0.25 m on most melees. Range sources: Reach +1.5 m, Primed Reach +3 m, Spring-Loaded Blade +1 m per stack x2 for 24 s on status, Motus Impact +2 m aerial, Opportunity's Reach +3 m on Tennokai attacks, Riven up to 1.94 m base value. — [Melee](https://wiki.warframe.com/w/Melee), [Module:Mods/data](https://wiki.warframe.com/w/Module:Mods/data), [Riven Mods](https://wiki.warframe.com/w/Riven_Mods)
- **WIKI-CONFIRMED** (section flagged "being worked on"). Follow-through: the n-th enemy struck takes `FT^(n-1)` of the damage; total over n enemies = `(1 - FT^n) / (1 - FT)`. Not applied to slams, heavy slams, or projectile/AoE attacks. Class defaults: 0.4 Hammer, Heavy Scythe; 0.5 Bayonet, Blade and Whip, Dual Swords, Gunblade, Nunchaku, Staff, Whip; 0.6 Dual Nikanas, Heavy Blade, Polearm, Scythe, Sword, Sword and Shield, Tonfa; 0.7 Glaive, Machete, Nikana, Rapier, Two-Handed Nikana, Warfan; 0.8 Claws, Dual Daggers; 0.9 Dagger, Fist, Sparring; 1.0 Assault Saw and Exalted weapons. Exceptions: Ironbride 0.7, Volnus reverts to 0.4 with a stance, Dorrclave 1.0 for 10 attacks after 10 kills. — [Melee](https://wiki.warframe.com/w/Melee)

### Inferences
- Worked example (speed): weapon speed 0.917, Primed Fury + Arcane Strike = +115%: effective 0.917 x 2.15 = 1.97. A 2.6 s combo loop takes 2.6 / 1.97 = 1.32 s.
- Worked example (follow-through): Heavy Blade FT 0.6 hitting 5 enemies deals (1 - 0.6^5) / 0.4 = 2.31x single-target damage in total; a Dagger at 0.9 deals 4.10x.
- Range has no clean DPS formula. It changes enemies-per-swing, which then feeds follow-through and combo gain. Model it as an "expected enemies hit" input, not as a damage multiplier.
- Because Berserker Fury is now on-kill with two stacks (+70% at cap), it out-values Primed Fury (+55%) only while kills keep the stacks up.

### Gaps
- UNKNOWN: whether there is an attack speed cap or animation floor.
- The wiki itself asks whether dual-wield hands share follow-through; unanswered.

---

## 7. Stances

### Takeaway
A stance fixes the animation set: per-swing damage multipliers, hit counts, forced procs, combo length and combo gain. For a calculator the practical handle is the wiki's per-combo totals: total damage multiplier, total forced-Slash multiplier, combo points and base length.

### Cited Findings
- **WIKI-CONFIRMED.** Combo types: Neutral (melee only), Forward (forward + melee, loops while moving), Tactical/Block (block + melee), Forward Tactical (gap closer), and class-shared Heavy, Slide, Aerial, Wall, Ground Finisher. Since U26 players can switch between combos mid-chain. — [Stance](https://wiki.warframe.com/w/Stance)
- **WIKI-CONFIRMED.** Forced procs fire at 100% regardless of status chance or damage types: Impact, Slash, Lifted, Knockdown, Ragdoll; an attack with a forced proc can also roll a normal proc. Heavy, aerial and finisher forced procs are set by weapon class, not stance. — [Stance](https://wiki.warframe.com/w/Stance), [Status Effect](https://wiki.warframe.com/w/Status_Effect)
- **WIKI-CONFIRMED** (table flagged as work in progress and as omitting stance physical bonuses). `Average DPS = Modded Melee Damage x Modded Attack Speed x (Total Damage Multiplier + Total Slash Proc Multiplier) / Base Combo Length`; `Total Slash Proc Multiplier = Damage Multiplier x Number of Hits x 0.35 x 6 ticks`. — [Stance](https://wiki.warframe.com/w/Stance)
- **WIKI-CONFIRMED** (same caveat). Selected rows, format: length at speed 1.0 / combo points / total damage / forced Slash / damage per second — [Stance comparison](https://wiki.warframe.com/w/Stance):

| Stance (class) | Neutral | Forward |
|---|---|---|
| Blind Justice (Nikana) | 2.6 s / +19 / 1900% / 420% / 731%/s | 3.05 s / +13 / 1300% / 0 / 426%/s |
| Decisive Judgement (Nikana) | 2.65 s / +14 / 1400% / 420% / 528%/s | 0.9 s / +3 / 300% / 0 / 333%/s |
| Tranquil Cleave (Nikana) | 3.8 s / +13 / 1300% / 210% / 342%/s | 1.9 s / +7 / 700% / 0 / 368%/s |
| Crimson Dervish (Sword) | 2.0 s / +14 / 1400% / 0 / 700%/s | 2.0 s / +6 / 600% / 0 / 300%/s |
| Swooping Falcon (Sword) | 2.0 s / +12 / 1200% / 210% / 600%/s | 1.95 s / +6 / 600% / 0 / 308%/s |
| Iron Phoenix (Sword) | 1.35 s / +7 / 700% / 630% / 519%/s | 0.65 s / +3 / 300% / 0 / 462%/s |
| Vengeful Revenant (Sword) | 3.15 s / +14 / 1400% / 0 / 444%/s | 1.55 s / +6 / 600% / 210% / 387%/s |
| Cleaving Whirlwind (Heavy Blade) | 2.25 s / +13 / 1200% / 0 / 533%/s | 5.7 s / +15 / 1500% / 0 / 263%/s |
| Tempo Royale (Heavy Blade) | 4.65 s / +21 / 1900% / 0 / 409%/s | 3.4 s / +8 / 800% / 0 / 235%/s |
| Rending Crane (Heavy Blade) | 1.85 s / +11 / 900% / 0 / 486%/s | 2.35 s / +10 / 1000% / 0 / 426%/s |
| Shimmering Blight / Bleeding Willow (Polearm) | 0.95 s / +5 / 500% / 0 / 526%/s | same |
| Twirling Spire (Polearm) | 3.3 s / +14 / 1400% / 420% / 424%/s | 2.5 s / +11 / 1100% / 0 / 440%/s |
| Sovereign Outcast (Tonfa) | 2.85 s / +25 / 2200% / 1680% / 772%/s | 1.75 s / +9 / 900% / 0 / 514%/s |
| Gemini Cross (Tonfa) | 4.6 s / +25 / 2150% / 630% / 467%/s | 1.2 s / +4 / 400% / 0 / 333%/s |
| Final Harbinger (Sword and Shield) | 3.05 s / +21 / 2100% / 630% / 689%/s | 2.65 s / +15 / 1500% / 0 / 566%/s |
| Mountain's Edge (Dual Nikanas) | 2.8 s / +21 / 2100% / 0 / 750%/s | 2.7 s / +11 / 1000% / 0 / 370%/s |
| Votive Onslaught (Warfan) | 2.57 s / +20 / 2000% / 630% / 778%/s | 1.84 s / +10 / 1000% / 0 / 543%/s |
| Slicing Feathers (Warfan) | 3.6 s / +19 / 1900% / 630% / 528%/s | 1.65 s / +10 / 1000% / 0 / 606%/s |
| Vermillion Storm (Claws) | 3.95 s / +26 / 2600% / 420% / 658%/s | 1.9 s / +9 / 900% / 0 / 474%/s |
| Malicious Raptor (Claws) | 3.35 s / +19 / 1900% / 1050% / 567%/s | 1.8 s / +9 / 900% / 0 / 500%/s |
| Four Riders (Claws) | 2.3 s / +13 / 1300% / 420% / 565%/s | 1.7 s / +7 / 700% / 0 / 412%/s |
| Pointed Wind (Dagger) | 1.55 s / +12 / 1200% / 210% / 774%/s | 1.25 s / +7 / 700% / 0 / 560%/s |
| Homing Fang (Dagger) | 2.8 s / +17 / 1700% / 840% / 607%/s | 1.4 s / +4 / 400% / 0 / 286%/s |
| Stinging Thorn (Dagger) | 3.95 s / +22 / 2200% / 1050% / 557%/s | 1.8 s / +8 / 800% / 0 / 444%/s |
| Gnashing Payara (Dual Daggers) | 2.5 s / +14 / 1400% / 840% / 560%/s | 1.15 s / +5 / 500% / 0 / 435%/s |
| Spinning Needle (Dual Daggers) | 1.85 s / +11 / 1100% / 840% / 595%/s | 2.15 s / +13 / 1300% / 0 / 605%/s |
| Crossing Snakes (Dual Swords) | 1.35 s / +9 / 900% / 420% / 667%/s | 1.85 s / +9 / 900% / 0 / 486%/s |
| Swirling Tiger (Dual Swords) | 2.05 s / +11 / 1100% / 210% / 537%/s | 1.6 s / +9 / 900% / 0 / 562%/s |
| Carving Mantis (Dual Swords) | 3.9 s / +19 / 1900% / 1260% / 487%/s | 2.35 s / +11 / 1100% / 0 / 468%/s |
| Clashing Forest (Staff) | 1.95 s / +14 / 1350% / 0 / 692%/s | 2.05 s / +5 / 500% / 0 / 244%/s |
| Flailing Branch (Staff) | 2.35 s / +9 / 900% / 0 / 383%/s | 1.85 s / +10 / 1000% / 0 / 541%/s |
| Seismic Palm (Fist) | 1.55 s / +13 / 1200% / 0 / 774%/s | 1.35 s / +7 / 700% / 0 / 519%/s |
| Fracturing Wind (Fist) | 1.55 s / +9 / 900% / 0 / 581%/s | 1.8 s / +7 / 700% / 0 / 389%/s |
| Grim Fury (Sparring) | 1.9 s / +13 / 1300% / 0 / 684%/s | 1.75 s / +10 / 1000% / 0 / 571%/s |
| Brutal Tide (Sparring) | 2.15 s / +14 / 1400% / 0 / 651%/s | same |
| Crushing Ruin (Hammer) | 3.0 s / +15 / 1400% / 0 / 467%/s | 2.6 s / +8 / 800% / 0 / 308%/s |
| Shattering Storm (Hammer) | 4.9 s / +25 / 2100% / 0 / 429%/s | 2.6 s / +9 / 900% / 0 / 346%/s |
| Reaping Spiral (Scythe) | 2.9 s / +16 / 1600% / 420% / 552%/s | 1.85 s / +6 / 600% / 0 / 324%/s |
| Stalking Fan (Scythe) | 4.9 s / +15 / 1500% / 0 / 306%/s | 1.25 s / +4 / 400% / 0 / 320%/s |
| Galeforce Dawn (Heavy Scythe) | 3.06 s / +9 / 900% / 420% / 294%/s | 2.66 s / +6 / 600% / 0 / 226%/s |
| Wise Razor (Two-Handed Nikana) | 4.4 s / +17 / 1700% / 420% / 386%/s | 2.55 s / +8 / 800% / 0 / 314%/s |
| Sundering Weave (Machete) | 1.7 s / +9 / 900% / 0 / 529%/s | 2.0 s / +5 / 500% / 0 / 250%/s |
| Cyclone Kraken (Machete) | 4.1 s / +17 / 1700% / 0 / 415%/s | 1.95 s / +5 / 500% / 0 / 256%/s |
| Eleventh Storm (Sword and Shield) | 3.5 s / +19 / 1900% / 420% / 543%/s | 1.15 s / +5 / 500% / 0 / 435%/s |
| Vulpine Mask (Rapier) | 3.0 s / +16 / 1600% / 840% / 533%/s | 3.0 s / +9 / 800% / 0 / 267%/s |
| Defiled Snapdragon (Blade and Whip) | 4.25 s / +23 / 2300% / 630% / 541%/s | 4.1 s / +20 / 2000% / 0 / 488%/s |
| Coiling Viper (Whip) | 2.7 s / +10 / 1000% / 0 / 370%/s | same |
| Burning Wasp (Whip) | 1.9 s / +6 / 600% / 0 / 316%/s | 3.0 s / +5 / 500% / 0 / 167%/s |
| Atlantis Vulcan (Nunchaku) | 3.45 s / +16 / 1050% / 0 / 304%/s | 3.25 s / +11 / 750% / 0 / 231%/s |
| High Noon (Gunblade) | 3.25 s / +13 / 1100% / 420% / 338%/s | 2.5 s / +8 / 600% / 0 / 240%/s |
| Bullet Dance (Gunblade) | 4.5 s / +19 / 1500% / 420% / 333%/s | 3.0 s / +10 / 800% / 0 / 267%/s |
| Gleaming Talon (Glaive) | 4.3 s / +21 / 2100% / 0 / 488%/s | 2.0 s / +6 / 600% / 0 / 300%/s |
| Astral Twilight (Glaive) | 4.25 s / +22 / 2200% / 0 / 518%/s | 3.4 s / +6 / 600% / 0 / 176%/s |
| Butcher's Revelry (Assault Saw) | 4.93 s / +11 / 1100% / 1050% / 223%/s | 2.83 s / +4 / 400% / 0 / 141%/s |
| Harrowing Spire (Bayonet) | 2.1 s / +7 / 700% / 0 / 333%/s | 2.27 s / +8 / 800% / 0 / 352%/s |
| Exalted Blade | 3.2 s / +21 / 2100% / 0 / 656%/s | 1.4 s / +8 / 800% / 0 / 571%/s |
| Hysteria (Valkyr Talons) | 2.85 s / +19 / 1900% / 0 / 667%/s | 1.7 s / +8 / 800% / 0 / 471%/s |
| Primal Fury (Iron Staff) | 3.2 s / +16 / 1600% / 0 / 500%/s | 2.8 s / +10 / 600% / 0 / 214%/s |
| Serene Storm (Desert Wind) | 3.5 s / +10 / 1000% / 0 / 286%/s | 2.5 s / +6 / 600% / 0 / 240%/s |

- **WIKI-CONFIRMED.** Stances add mod capacity: 5 at max, 10 on matching polarity. Exalted melee stances are fixed and give +10 capacity since the exalted rework. — [Stance](https://wiki.warframe.com/w/Stance), [Exalted Weapon](https://wiki.warframe.com/w/Exalted_Weapon)

### Inferences
- Why specific stances are preferred, derived from the table rather than from creator testimony: a stance is strong when it has a high damage-per-second row on a combo the player will actually hold (usually Forward, because it does not root the player, or Neutral for bosses), high combo points per second (feeds Blood Rush and Weeping Wounds), forced Slash procs (armor-ignoring damage over time), and no self-displacement. Example: Blind Justice neutral gives 731%/s and 7.3 points/s; Tranquil Cleave neutral gives 342%/s. Shimmering Blight/Bleeding Willow give a short 0.95 s loop at 526%/s on both Neutral and Forward, which matters because the loop is identical while moving.
- How to treat stance choice in a calculator:
  1. Store per stance, per combo type: base length, list of hits (multiplier, hit count, forced procs, stance IPS bonus), from the wiki stance pages.
  2. Default to the best stance for the weapon class and report DPS for Forward and Neutral separately; let the user pick.
  3. Compute `damage/s = modded damage x speed x total multiplier / length` and `combo points/s = speed x total gain / length`.
  4. Add forced-Slash DoT as a separate line using the wiki's 0.35 x 6 ticks factor so it can be combined with the status researcher's Slash model.
  5. Stance has no effect on heavy, slide, aerial, wall or slam rows (class-shared), so heavy and slam builds can ignore stance damage and choose for capacity/polarity.
- The wiki's table omits stance IPS bonuses, so its numbers understate stances with +Slash/+Impact hits.

### Gaps
- No creator source was obtained for "best stance per class" claims. Rankings here are derived from table numbers and are not COMMUNITY-CONSENSUS.
- Per-hit breakdowns (which swing has which multiplier and proc) live on the individual stance pages and were not collected.
- Stanceless rows in the table show "N/A" lengths.

---

## 8. Slams, slides, glaives, gunblades, exalted melee

### Takeaway
Since U35.5 slams are pure radial damage that scales with mods (2x normal attack, 3x for heavy slam) and get their own multiplicative "slam damage" bucket; U39 tied slam radius to drop height. Glaive explosions and slams are radial and therefore lose Condition Overload and follow-through. Exalted melee are separately modded weapons with follow-through 1.0.

### Cited Findings
Slams
- **WIKI-CONFIRMED.** "Slam attacks do 2x the damage of a normal attack (3x for heavy slam), but have Damage Falloff, linearly diminishing with distance from the point of impact to 50% (70% for heavy slam) at the edge of its radius." Normal slam is usually a single damage type (often Impact); heavy slam usually Blast. — [Melee](https://wiki.warframe.com/w/Melee)
- **WIKI-CONFIRMED.** Melee Slam Damage: Seismic Wave +200%, Nira's set +150% per set mod (3 mods, +450%), additive with each other and "multiplicatively with other modifiers to melee damage". — [Melee](https://wiki.warframe.com/w/Melee), [Seismic Wave](https://wiki.warframe.com/w/Seismic_Wave)
- **WIKI-CONFIRMED.** Radius scales with drop height, from a minimum of `2.5 m / listed radius` (as a fraction) up to 150% of listed radius at 15 m or more. Typical listed radii: 5 m Dagger/Glaive/Gunblade/Warfan/Whip, 6 m Claws/Dual Daggers/Nikana/Nunchaku/Rapier/Staff, 7 m Polearm/Sword/Sparring/Two-Handed Nikana, 8 m Dual Swords/Fist/Heavy Blade/Scythe/Tonfa, 9 m Hammer; heavy slam about +1 m. — [Melee](https://wiki.warframe.com/w/Melee)
- **WIKI-CONFIRMED.** U35.5 (2024-03-27): slam direct hits removed, all slam damage radial, radial damage now scales with mods and applies modded status, flat 2x (3x heavy) multiplier for all classes. Applies only to aerial slams: "Slam attacks during combos deal flat damage amounts and do not scale with Mods." — [Melee patch history](https://wiki.warframe.com/w/Melee)
- **WIKI-CONFIRMED.** U39.0 (2025-06-25): "The radius of Melee Slam now scales with how high a Warframe is before initiating the slam"; Nira's set was applying twice and to itself, now applies only to slams at +150% per mod (was +100%). DE's stated reason: slams "could be repeatedly performed with a large radius and no energy cost". — [Melee patch history](https://wiki.warframe.com/w/Melee)
- **DISPUTED (internal to the patch note).** The U39 intro sentence says slam "damage now scales with the Slam's height", but the itemised change and the current mechanics text describe radius scaling only. — [Melee](https://wiki.warframe.com/w/Melee)
- **DISPUTED.** Seismic Wave's page says it and Nira's set "also increase the damage dealt by slam attacks performed via Stance Combos", while the U35.5 note says stance-combo slams are flat and do not scale with mods. Possibly both true (only slam-damage mods apply). — [Seismic Wave](https://wiki.warframe.com/w/Seismic_Wave) vs [Melee](https://wiki.warframe.com/w/Melee)
- **WIKI-CONFIRMED.** Melee Duplicate's second instance on slam AoE does not bypass shield gating. Melee Afflictions adds 6 status stacks when enemies are knocked down, lifted or ragdolled by melee, which slams and heavy slams do. — [Melee Duplicate](https://wiki.warframe.com/w/Melee_Duplicate), [Arcane Enhancement](https://wiki.warframe.com/w/Arcane_Enhancement)
- **WIKI-CONFIRMED.** Forced Electricity on slams (usable for Melee Influence): Prova/Prova Vandal slams 100%, Arca Titron heavy slams 100%. — [Melee Influence](https://wiki.warframe.com/w/Melee_Influence)

Slides
- **WIKI-CONFIRMED.** Slide attack: 360-degree spin; damage raised by Pressure Point and elementals; Maiming Strike gives +150% crit chance for slide attacks, additive with other crit mods (multiplies base). Example from the wiki: Galatine 10% x (1 + 275% + 150%) = 52.5%. History: U26 changed it from flat +90% to stacking +150%. — [Melee](https://wiki.warframe.com/w/Melee), [Maiming Strike](https://wiki.warframe.com/w/Maiming_Strike), [Sacrificial Steel](https://wiki.warframe.com/w/Sacrificial_Steel)
- **WIKI-CONFIRMED.** Follow-through "excludes Slam Attacks and Slide Attacks" per the Normal Attack attribute list. — [Melee](https://wiki.warframe.com/w/Melee)

Glaives
- **WIKI-CONFIRMED.** Hold melee to throw; the glaive bounces up to three times; a heavy attack while it is in flight detonates it (guaranteed proc of a weapon-specific type) and recalls it; the throw has a guaranteed Impact proc and is silent; can be dual-wielded with a one-handed secondary. Glaive-only mods: Power Throw (+2 punch through, +100% throw damage per consecutive throw, 3 stacks), Volatile Rebound (explode on bounce, disables punch through), Volatile Quick Return (-4 bounce, +3 blast radius, explode on bounce), Quick Return, Whirlwind (+180% projectile speed), Combo Fury, Combo Killer, Mark of the Beast. — [Glaive (Weapon Type)](https://wiki.warframe.com/w/Glaive_(Weapon_Type)), [Module:Mods/data](https://wiki.warframe.com/w/Module:Mods/data)
- **WIKI-CONFIRMED.** Each glaive has separate rows for Normal, Throw, Throw Bounce Explosion, Throw Recall Explosion, Charged Throw, Charged Throw Bounce/Recall Explosion, each with its own base damage, crit and status. Example Cerata: normal 183, throw 201, recall explosion 666, charged throw 402, charged recall explosion 1,318. Coda Pathocyst (2025-03-19, MR 17, disposition 0.65): normal 270, charged throw 594, charged recall explosion 1,620 at 24% crit, 2.5x. — [Glaive (Weapon Type)](https://wiki.warframe.com/w/Glaive_(Weapon_Type))
- **WIKI-CONFIRMED.** Killing Blow speeds the throw and raises the mid-air explosion damage "but will not affect the damage of the thrown weapon itself"; it does not affect Volatile Rebound / Volatile Quick Return explosions. — [Killing Blow](https://wiki.warframe.com/w/Killing_Blow)
- **WIKI-CONFIRMED.** Class heavy multiplier for Glaive is 2x / 3x; throws use wind-up speed, not attack speed; thrown attacks scale with combo; CO does not apply to the radial explosion; follow-through does not apply to throws and explosions. — [Melee](https://wiki.warframe.com/w/Melee), [Attack Speed](https://wiki.warframe.com/w/Attack_Speed), [Blood Rush](https://wiki.warframe.com/w/Blood_Rush), [Condition Overload](https://wiki.warframe.com/w/Condition_Overload)
- **WIKI-CONFIRMED.** Tennokai with glaives: wind-up bonus applies to throws; to consume Tennokai you must detonate the glaive in flight; the window pauses while the glaive is in the air (U37.0). Truth's Flame does not work with glaives (listed under Bugs). — [Melee](https://wiki.warframe.com/w/Melee), [Truth's Flame](https://wiki.warframe.com/w/Truth%27s_Flame)
- **WIKI-CONFIRMED.** Xoris and Falcor in-flight detonations force Electricity (100%), which triggers Melee Influence. — [Melee Influence](https://wiki.warframe.com/w/Melee_Influence)

Gunblades
- **WIKI-CONFIRMED.** Shots use no ammo and have damage falloff; each weapon has a separate Ranged Attack row (Redeemer Prime 80 Blast per pellet listing, Stropha 700 Impact); follow-through 0.5; stances High Noon and Bullet Dance. Corufell (Prime) is a Heavy Scythe with gunblade behaviour on heavy attack. — [Gunblade](https://wiki.warframe.com/w/Gunblade)
- **WIKI-CONFIRMED.** Gunblade pellets hit consecutively, so CO from one pellet's status boosts later pellets; gunblades are the exception to "multi-hit attacks count as one hit" for Tennokai; both gunblade stances have 100% CO effectiveness. — [Condition Overload](https://wiki.warframe.com/w/Condition_Overload), [Melee](https://wiki.warframe.com/w/Melee), [Condition Overload (Mechanic)](https://wiki.warframe.com/w/Condition_Overload_(Mechanic))

Exalted and pseudo-exalted melee
- **WIKI-CONFIRMED.** Exalted melee are modded on their own config; Rivens are not generated for them; weapon augments cannot be equipped; all have a fixed stance (Garuda Talons can use any Claw stance); follow-through 1.0. — [Exalted Weapon](https://wiki.warframe.com/w/Exalted_Weapon), [Melee](https://wiki.warframe.com/w/Melee)
- **WIKI-CONFIRMED** (rework notes, "Techrot Encore"; the page text refers to "Pre-Techrot Encore" behaviour). Arcane slots added to all Exalted weapons; Acolyte, Amalgam and melee combo counter mods re-enabled; set bonuses now counted on the active weapon; Blade Storm, Landslide, Shattered Lash and Whipclaw became separately moddable Exalted weapons that can take Condition Overload, Melee Elementalist and faction mods but have no Exilus slot and cannot heavy attack, use Tennokai or block; they use an Ability Combo Counter (recast within 5 s grants 20 points, cap raised from 4x to 12x, damage scales 1:1). Excalibur's Slash Dash now scales from Exalted Blade mods. Exalted Blade and Serene Storm waves build combo and trigger Tennokai (one hit per wave). — [Exalted Weapon](https://wiki.warframe.com/w/Exalted_Weapon)
- **WIKI-CONFIRMED.** The Gladiator set bonus does not apply to Exalted Blade and Valkyr's Talons per a U32.3 note, but does apply to Garuda (Prime) Talons. — [Gladiator Might](https://wiki.warframe.com/w/Gladiator_Might). This predates the rework and may be superseded: **DISPUTED**.

### Inferences
- Slam formula: `Slam = Base x (1 + damage mods) x (1 + elemental mods) x 2 x (1 + 2.0 SeismicWave + 1.5 x NiraMods) x falloff`; heavy slam replaces 2 with `3 x combo multiplier` and falloff floor 0.7. No CO term.
- Worked example: 200 base, Primed Pressure Point: 530. Slam x2 = 1,060. Seismic Wave: x3 = 3,180 at centre, 1,590 at the edge. With Seismic Wave + three Nira mods: x7.5 = 7,950. Heavy slam at 12x with Seismic Wave: 530 x 3 x 12 x 3 = 57,240 at centre.
- Slam radius example: a 7 m class slam started at ground level covers 2.5 m (35.7% of 7 m); from 15 m it covers 10.5 m. A slam calculator therefore needs a drop-height or "radius fraction" input, and its per-enemy damage is an area average between 50% and 100%.
- The "2024 to 2026 slam meta" as far as sources show: U35.5 made slams scale with mods (the cause of the meta), Melee Afflictions (U36) multiplied status stacks on slammed enemies, and U39 cut ground-level spam radius and corrected Nira. Evidence that slam builds are still a recognised archetype in 2026 is limited to build-site listings ("Tennokai Heavy Slam" appears among top community builds in a search result for a low-trust site) and a Reddit thread title "So what's the deal with melee slam builds?". **COMMUNITY-CONSENSUS (weak)**; no creator testimony captured.
- Glaive build logic follows from the rules: damage comes from the charged-throw recall explosion row, scaled by heavy-attack damage (Killing Blow), combo multiplier, crit (the x2 heavy crit mods), and elementals; attack speed and CO are dead stats for the explosion.

### Gaps
- UNKNOWN: which slot and capacity the three Nira mods occupy (data module shows Nira's Hatred and Nira's Anguish as Warframe stat mods; the third was not found). A full Nira slam bonus therefore costs Warframe mod slots, not melee slots.
- UNKNOWN: glaive explosion multiplier relative to class heavy multiplier (2x/3x) and how Power Throw stacks into it.
- UNKNOWN: whether Maiming Strike remains worthwhile; no 2026 source addressed slide builds.
- UNKNOWN: current Gladiator-set behaviour on Exalted Blade / Hysteria after the rework.
- The date of the exalted rework is inferred as Update 38.5 (2025-03-19) from the "Techrot Encore" wording and the Melee Crescendo hotfix 38.5.3 notes; not read directly.

---

## 9. Tennokai

### Takeaway
With any Tennokai mod equipped, each melee hit has a 15% chance to open a 2 s window in which a heavy attack or heavy slam winds up faster and costs no combo. It turns any combo-building light-attack build into a hybrid that fires full-multiplier heavies for free.

### Cited Findings
- **WIKI-CONFIRMED.** 15% chance per melee hit; 2 s window; heavy or heavy slam in the window has increased wind-up speed and "does not consume Combo Counter". Tennokai wind-up speed is not affected by other wind-up bonuses. Requires directly striking an enemy; hitting several enemies with one swing and multi-strike attacks count as one hit, except on gunblades. — [Melee](https://wiki.warframe.com/w/Melee)
- **WIKI-CONFIRMED.** Mods (all "Enables Tennokai"): Mentor's Legacy (nothing else, rank 0, quest reward); Discipline's Merit ("Opportunities occur every 4 melee hits instead of at random"); Master's Edge (+60% Tennokai damage); Dreamer's Wrath (+50% opportunity chance and +32% critical damage on Tennokai attacks); Opportunity's Reach (window 4.0 s, +3 m range on Tennokai attacks); Condition's Perfection (+100% status chance on Tennokai attacks). All introduced U35 (2023-12-13). — [Module:Mods/data](https://wiki.warframe.com/w/Module:Mods/data), [Melee](https://wiki.warframe.com/w/Melee)
- **WIKI-CONFIRMED.** Truth's Flame (U42.0, 2026-03-25; Exilus; rank 3): Tennokai kills grant another 4 s opportunity and +120% Tennokai damage, additive with Pressure Point, active only after the first kill. Failing to kill with a Tennokai attack applies the curse (100 Heat damage/s for 6 s) and resets the combo counter, bypassing Heavy Attack Efficiency. Not using the window, or rolling to cancel, does not trigger the curse. Counts as a Syndicate augment (excludes non-Truth augments). Does not work with glaives. Removed from Auto Install in U44.0 (2026-09-23). — [Truth's Flame](https://wiki.warframe.com/w/Truth%27s_Flame)
- **WIKI-CONFIRMED.** Tennokai activates melee Incarnon forms without spending combo. Pseudo-exalted melee and Diwata cannot equip Tennokai mods. Sentinel weapons cannot (U36). — [Melee](https://wiki.warframe.com/w/Melee), [Exalted Weapon](https://wiki.warframe.com/w/Exalted_Weapon)
- **WIKI-CONFIRMED.** Discipline's Merit counts hits across both exalted and standard melee when equipped on both (fix in U35.5); mismatched Tennokai mods on melee and exalted melee used to prevent procs (fixed). — [Melee](https://wiki.warframe.com/w/Melee), [Exalted Weapon](https://wiki.warframe.com/w/Exalted_Weapon)
- **COMMUNITY-CONSENSUS (weak, title only).** A 2026 creator video is titled "Warframe Melee META just changed FOREVER!" about Truth's Flame; content was not read. — [YouTube](https://www.youtube.com/watch?v=B3E0of_EifQ)
- **COMMUNITY-CONSENSUS (weak).** Reddit thread answer snippet: "Tennokai lets you make heavy attacks without sacrificing your combo counter. Heavy attacks also do a lot of damage." — [r/Warframe](https://www.reddit.com/r/Warframe/comments/1soujpy/how_to_make_a_good_melee_weapon_build/)

### Inferences
- Opportunity rate: base 15% per hit means one window per 6.67 qualifying hits on average; Discipline's Merit gives exactly one per 4 hits (25%), deterministic. Dreamer's Wrath is either 22.5% (if "+50%" is relative) or 65% (if additive); relative is the natural reading.
- Tennokai value model: `extra damage per window = heavy damage at current combo (class multiplier x combo multiplier x heavy modifiers)`, free of combo cost. For a 12x light-attack build with a 6x class this is a 72x-normal-hit burst every 4 hits with Discipline's Merit, which is why Tennokai changes build allocation: the Exilus slot becomes a damage slot, and Killing Blow / heavy crit doubling gain value even in a light-attack build.
- Example: modded normal hit 1,000, Heavy Blade, 12x combo, Discipline's Merit. Four light swings at an average 300% stance multiplier deal 12,000; the Tennokai heavy deals 1,000 x 6 x 12 = 72,000. The heavy dominates the cycle, so calculators that ignore Tennokai understate hybrid builds by a large factor.
- Truth's Flame turns Tennokai into a kill-chain mechanic: its +120% joins the base bucket (diminishing against Primed Pressure Point), and its failure state wipes combo. It suits trash-clearing more than bosses.

### Gaps
- UNKNOWN: Tennokai's wind-up speed number; whether Dreamer's Wrath's +50% is relative or additive; whether Master's Edge is additive with Pressure Point.
- UNKNOWN: whether Tennokai mods other than Truth's Flame are Exilus-only or Exilus-compatible. The wiki calls Truth's Flame an Exilus mod and implies Mentor's Legacy needs an Exilus slot; not confirmed for all.

---

## 10. Melee arcanes

### Takeaway
Thirteen melee arcanes exist as of U44. Melee Influence is regarded as the strongest general pick because it converts single-target elemental status into a 20 m area effect; Duplicate is the crit pick with a specific crit-chance window; the rest are niche or build-specific.

### Cited Findings (all values at rank 5) — [Arcane Enhancement](https://wiki.warframe.com/w/Arcane_Enhancement) unless noted
- **WIKI-CONFIRMED.** Melee Influence (U35): on melee Electricity status, 20% chance for an 18 s buff during which elemental melee statuses apply to enemies within 20 m; cannot refresh while active. Details from [Melee Influence](https://wiki.warframe.com/w/Melee_Influence):
  - Spreads primary and combined elements only. Does not spread Impact, Puncture, Slash, Void, Tau, Knockdown, Lifted, Microwave.
  - Spread targets also take damage equal to that element's portion of the original hit, after crit and Condition Overload (CO count taken from the struck target).
  - Only direct melee strikes trigger it. Radius is centred on the enemy hit.
  - Faction damage applies twice on spread damage and three times on damaging procs from it.
  - Wiki example: Skana 120 base, Pressure Point, three 60% elemental mods: an Electricity proc spreads 120 x 2.2 x 0.6 = 158.4 Electricity damage plus an Electricity proc of 120 x 2.2 x 1.6 / 2 = 211.2 per tick; a Viral proc spreads 316.8 Viral damage plus the Viral status.
  - U35.1 (2024-02-20) removed the Mirage clone interaction.
- **WIKI-CONFIRMED.** Melee Duplicate (U35, Legendary): on base (yellow, tier 1) critical hits, 100% chance to strike a second time. The duplicate is a separate instance that rerolls crit tier and status; forced weapon procs carry over. Optimal crit chance at rank 5: `CC = (3 x CM - 4) / (2 x CM - 2)`. — [Melee Duplicate](https://wiki.warframe.com/w/Melee_Duplicate)
- **WIKI-CONFIRMED.** Melee Crescendo (U35, Legendary): +6 Initial Combo per finisher kill for the rest of the mission; since Hotfix 38.5.3 (2025-03-25) only finishers with the weapon carrying it count (Parazon finishers count for all).
- **WIKI-CONFIRMED.** Melee Exposure (U35): on ability cast, +60% Corrosive damage on melee for 25 s, stacks to 240%.
- **WIKI-CONFIRMED.** Melee Animosity (U35): each melee hit +42% critical chance for heavy attacks, 10 stacks, consumed on heavy.
- **WIKI-CONFIRMED.** Melee Vortex (U35): kill on an enemy with Magnetic status, 45% chance to pull enemies within 18 m.
- **WIKI-CONFIRMED.** Melee Retaliation (U35): +30% melee damage per 200 current shields, up to 420%; halved for overshields.
- **WIKI-CONFIRMED.** Melee Fortification (U35): +210 armor per melee kill, stacks decay individually after 10 s.
- **WIKI-CONFIRMED.** Melee Afflictions (U36.0, 2024-06-18): enemies affected by status gain 6 additional stacks when knocked down, lifted or ragdolled by melee.
- **WIKI-CONFIRMED.** Melee Doughty (U38.0, 2024-12-13): +1.0x critical multiplier per 10% Puncture status chance.
- **WIKI-CONFIRMED.** Melee Careen (U41.0, 2025-12-10): 2.5x damage against Frozen enemies; rolling applies 10 Cold stacks in 5.5 m.
- **WIKI-CONFIRMED.** Melee Assimilation (U43.0, 2026-06-17): on shield break, +150% melee damage on heavy attacks; heavy kills restore 30% max shields for 20 s.
- **WIKI-CONFIRMED.** Melee arcane slots need a Melee Arcane Adapter and the Melee Upgrade Segment (Whispers in the Walls); separate from Zaw Exodia slots.
- **COMMUNITY-CONSENSUS** (one forum thread, May 2026, original post with replies agreeing). Influence is "easily put in a tier above the rest" and "the obvious best melee Arcane by far"; Afflictions has "quite insane scaling on a handful of melee weapons" but depends on specific stance/ability combos; Vortex is niche; Doughty is niche and can be weakened by teammates' elemental buffs; Duplicate's weakness is "the nuance around meeting its critical chance tier requirement"; Crescendo "feels really bad" at 6 per finisher; Retaliation suffers from keying on current shields; Animosity consumes all stacks which fights Tennokai; Careen and Exposure "work fine". — [forums.warframe.com thread 1506886](https://forums.warframe.com/topic/1506886-suggestions-on-buffing-melee-arcanes-to-bring-them-to-the-tier-of-influence-and-afflictions/)

### Inferences
- Duplicate target worked example: crit multiplier 3.8 gives optimal CC = (11.4 - 4) / (7.6 - 2) = 132%; crit multiplier 2.0 gives (6 - 4) / (4 - 2) = 100%. So Duplicate wants total crit between 100% and about 140%, which conflicts with stacking Blood Rush to 270%+. A calculator should compute expected damage per swing as `E = sum over tiers P(tier) x mult(tier) x (1 + [tier == 1] x E_dup)` where E_dup is the average multiplier of a rerolled hit, and compare against Influence/Exposure rather than hard-code a ranking.
- Influence requirement set: an Electricity component (or forced Electricity proc), enough status chance and attack speed that a 20% trigger per Electricity proc keeps high uptime, and elemental damage weighted toward the element you want spread. Since uptime cannot be refreshed, average uptime is roughly `18 / (18 + expected time to re-trigger)`.
- Doughty example: a weapon whose Puncture status share is 60% at 100% status chance has 60% Puncture status chance, giving +6.0x crit multiplier. The exact definition of "Puncture status chance" (status chance x Puncture weight) is my reading.
- Retaliation at cap (+420%) is a base-bucket bonus equal to 2.5 Primed Pressure Points but needs 2,800 current shields.

### Gaps
- UNKNOWN: the bucket for Retaliation, Assimilation and Careen (base-additive vs final multiplier). Careen's "2.5x" wording suggests a final multiplier.
- UNKNOWN: whether Melee Influence works on thrown glaives in general. The Influence page says thrown weapons like Xoris "greatly benefit" and lists Xoris detonations as a trigger, but a nested bullet about projectiles through Electric Shield says "Does not work with Glaive weapons". Reads as scoped to that trick; flag as **DISPUTED** until tested.
- No creator tier list was captured; the ranking rests on one forum thread.

---

## 11. Rivens, Incarnon melee, Kuva / Tenet / Coda melee

### Takeaway
Melee Rivens add melee-only stats (range, initial combo, heavy efficiency, combo duration, slide crit). Melee Incarnons transform on a heavy attack at a combo threshold rather than by charging. Lich-system melee specifics were only partly sourced.

### Cited Findings
- **WIKI-CONFIRMED.** Melee Riven base values: Melee Damage 164.7%, Attack Speed 54.9%, Range 1.94 m, Initial Combo 24.5, Combo Duration 8.1 s, Heavy Attack Efficiency 73.44%, Additional Combo Count Chance 58.77%, Critical Chance for Slide Attack 120%, Finisher Damage 119.7%; positive Initial Combo only; Rivens can roll negative combo duration, and zero or negative duration prevents combo gain. Rivens are not generated for Exalted weapons. — [Riven Mods](https://wiki.warframe.com/w/Riven_Mods), [Melee Combo](https://wiki.warframe.com/w/Melee_Combo), [Exalted Weapon](https://wiki.warframe.com/w/Exalted_Weapon)
- **WIKI-CONFIRMED.** Melee Incarnon activation: perform a heavy attack at 6x combo or higher (5x for Innodem and Praedos, 3x with certain evolutions). Combo need not be consumed, so Tennokai works. Transforming does not reset combo. — [Melee Combo](https://wiki.warframe.com/w/Melee_Combo), [Incarnon](https://wiki.warframe.com/w/Incarnon)
- **WIKI-CONFIRMED.** Incarnon Genesis melee form: +100% Melee Damage, +20% sprint speed, +20% parkour velocity for 180 s. Natural Incarnon melee typically +3 Range and +40 Attack Speed. — [Melee Combo](https://wiki.warframe.com/w/Melee_Combo)
- **DISPUTED.** Duration of natural melee Incarnon forms: Melee Combo page says 90 s for Zariman/Sanctum/Isleweaver melee; the Incarnon page says 180 s with 90 s for Innodem and Ruvox. The threshold exception also differs (Innodem and Praedos at 5x vs Innodem only). — [Melee Combo](https://wiki.warframe.com/w/Melee_Combo) vs [Incarnon](https://wiki.warframe.com/w/Incarnon)
- **WIKI-CONFIRMED.** Incarnon Genesis base-damage increases are not multiplied by the class heavy multiplier (but are by combo), and additive CO ignores them. — [Melee](https://wiki.warframe.com/w/Melee), [Condition Overload (Mechanic)](https://wiki.warframe.com/w/Condition_Overload_(Mechanic))
- **WIKI-CONFIRMED.** Incarnon evolution perks relevant to builds: +20 Initial Combo (Ceramic Dagger, Destreza, Praedos, Ruvox, Thalys), +30 (Magistar; Hate with Dread and Despair), Sibear +15 per stack x4 on kill of enemy with 3+ Cold stacks; combo timer pause while holstered on Anku, Ack & Brunt, Furax, Okina Genesis. — [Melee Combo](https://wiki.warframe.com/w/Melee_Combo)
- **COMMUNITY-CONSENSUS.** Brozime's notes: "Melee Incarnons differ in that they need to reach a combo threshold then heavy attack to transform and those Incarnons all last 3 minutes". — [Brozime's Public Notes, Incarnons](https://publish.obsidian.md/brozime/Public/Guides+%26+Builds/Guides/Other/Incarnons)
- **WIKI-CONFIRMED.** Tenet Livia and Tenet Grigori pause the combo timer while holstered. Tenet Grigori's energy disk does not scale with Pressure Point or Arcane Fury, only universal weapon damage bonuses, and takes CO multiplicatively. Tenet Agendus heavy waves take CO multiplicatively. — [Melee Combo](https://wiki.warframe.com/w/Melee_Combo), [Condition Overload (Mechanic)](https://wiki.warframe.com/w/Condition_Overload_(Mechanic))
- **WIKI-CONFIRMED.** Coda weapons exist in melee (Coda Pathocyst glaive, introduced 2025-03-19, MR 17, Riven disposition 0.65; Coda Motovore referenced in Melee Doughty fixes). — [Glaive (Weapon Type)](https://wiki.warframe.com/w/Glaive_(Weapon_Type)), [Exalted Weapon](https://wiki.warframe.com/w/Exalted_Weapon)

### Inferences
- Riven value on melee is build-dependent: Range and Initial Combo are stats unavailable or scarce elsewhere; Melee Damage shares the Pressure Point/CO bucket and is diluted in CO builds.
- For Genesis melee, the +100% Melee Damage in Incarnon form is presumably a base-bucket bonus; if so it is worth much less on a CO build with 4+ statuses than its headline suggests.

### Gaps
- UNKNOWN (not researched this session): Kuva/Tenet/Coda progenitor bonus element range and how it enters the melee formula, valence fusion, which Kuva/Tenet/Coda melee exist and their unique mechanics. The general-damage or weapon-data researcher should cover it.
- UNKNOWN: bucket of the Incarnon form +100% Melee Damage.
- Riven disposition and the buff/curse scaling formula are on the Riven page but were not extracted.

---

## 12. Melee-specific status behaviour

### Takeaway
Melee status comes from three sources: normal rolls (boosted by Weeping Wounds), forced procs baked into stance and class animations, and arcane-driven spread or stacking (Influence, Afflictions). Status damage inherits the melee base-damage bucket, including Condition Overload.

### Cited Findings
- **WIKI-CONFIRMED.** Forced procs are independent of status chance and damage distribution and can occur alongside a normal proc. Stance pages list them per swing; heavy, aerial and finisher forced procs are per weapon class (for example all Scythe heavies apply Bleed and Knockback). — [Status Effect](https://wiki.warframe.com/w/Status_Effect)
- **WIKI-CONFIRMED.** Heavy attacks force Bleed (Slash) on Claws, Dual Daggers, Nikana, Rapier, Scythe, Tonfa, Two-Handed Nikana, Warfan, Whip, and partly on Dagger, Machete, Assault Saw, Sparring. — [Melee](https://wiki.warframe.com/w/Melee)
- **WIKI-CONFIRMED.** Stance forced-Slash accounting: `0.35 x 6 ticks x damage multiplier x hits`, applied to modded damage excluding physical and elemental bonuses. — [Stance](https://wiki.warframe.com/w/Stance)
- **WIKI-CONFIRMED.** CO boosts proc damage including Slash; radial procs (Blast, Electricity, Gas) carry the bonus computed on the initial target. — [Condition Overload](https://wiki.warframe.com/w/Condition_Overload)
- **WIKI-CONFIRMED.** Electricity proc from melee in the wiki example ticks for `base x (1 + damage mods) x (1 + electricity mod) / 2`. — [Melee Influence](https://wiki.warframe.com/w/Melee_Influence)
- **WIKI-CONFIRMED.** Status damage mods: Melee Elementalist +90% Status Damage (and +60% wind-up, U36), Galvanized Elementalist +80% Status Damage and +30% status chance per stack x4 on melee kill (U37). Status chance mods: Melee Prowess +90%, Drifting Contact +40%, 60/60 elementals +60%, Condition's Perfection +100% on Tennokai attacks. — [Module:Mods/data](https://wiki.warframe.com/w/Module:Mods/data)
- **WIKI-CONFIRMED.** Lifted: applied by heavy slams (almost any weapon) and some heavies/stance hits; counts for CO; duration scales with combo multiplier and is not extended by status duration. — [Melee](https://wiki.warframe.com/w/Melee), [Condition Overload](https://wiki.warframe.com/w/Condition_Overload)
- **WIKI-CONFIRMED.** Relentless Combination: +100% chance to add combo when a Slash status deals damage. Shattering Impact: Impact damage reduces armor by 6 per hit; weapons with very low Impact share may quantize to 0 and not trigger. — [Module:Mods/data](https://wiki.warframe.com/w/Module:Mods/data), [Damage Calculation](https://wiki.warframe.com/w/Damage/Calculation)
- **WIKI-CONFIRMED.** Blast status (current model): stacks expire after 1.5 s for max(1, 0.3 x H) Blast damage each; at the cap of 10 stacks (4 on bosses) or on death they combine into a 5 m radial of 3 x sum of stacks. — [Damage Calculation](https://wiki.warframe.com/w/Damage/Calculation)
- **WIKI-CONFIRMED.** Melee Duplicate's second hit rerolls status and carries weapon forced procs. Melee Influence does not spread Slash. — [Melee Duplicate](https://wiki.warframe.com/w/Melee_Duplicate), [Melee Influence](https://wiki.warframe.com/w/Melee_Influence)

### Inferences
- Viral plus Slash on melee: Viral is an elemental status so Influence spreads it; Slash is physical so it is not spread. An Influence build therefore gets area Viral/Electricity/Heat but single-target Slash, which pushes Influence builds toward elemental DoTs (Electricity, Heat, Gas, Toxin) and away from Slash weighting.
- Expected procs per swing = forced procs + status chance (which can exceed 100% with Weeping Wounds), per enemy hit; proc type weighting follows the modded damage distribution. This mirrors the gun formula without multishot ([Status Effect](https://wiki.warframe.com/w/Status_Effect) gives `Multishot x (Forced Procs + Status Chance)`).
- Heavy-attack Slash builds: a forced Bleed on a heavy inherits the heavy multiplier and combo multiplier through the hit damage it is based on, which is the mechanical reason heavy builds on Bleed classes scale well against armor. The inheritance is my inference from "Total Slash Proc Multiplier = Damage Multiplier x ..." and is not stated for heavies.

### Gaps
- Per-status damage formulas, durations and stack caps belong to the status researcher; only melee-specific hooks are recorded here.
- UNKNOWN: whether heavy forced Bleed scales with the combo multiplier exactly as the hit does.

---

## 13. Standard melee build templates in 2026

### Takeaway
Six archetypes follow directly from the mechanics. Slot lists below are constructed from confirmed mod effects; they are not copied from a creator, because no creator build lists were captured. Treat allocations as starting points for the advisor's optimiser, not as verified meta.

### Cited Findings
- **COMMUNITY-CONSENSUS (weak).** Archetype names visible in 2026 community build listings: "Influence Praedos", "Tennokai + Melee Influence Xoris", "Tennokai Heavy Slam". Source is a low-trust build site surfaced by search; cited only as evidence that these archetypes are in use, not for any rule. — [Overframe melee builds listing](https://overframe.gg/builds/melee-weapons/)
- **COMMUNITY-CONSENSUS.** Melee Influence is the top general arcane, Afflictions second for specific weapons. — [forum thread](https://forums.warframe.com/topic/1506886-suggestions-on-buffing-melee-arcanes-to-bring-them-to-the-tier-of-influence-and-afflictions/)
- **WIKI-CONFIRMED.** Naramon is "highly recommended" for Blood Rush builds; Blood Rush pairs with Body Count, Drifting Contact, Gladiator Rush, Primary/Secondary Dexterity. — [Blood Rush](https://wiki.warframe.com/w/Blood_Rush)
- **WIKI-CONFIRMED.** Killing Blow "combines well with Corrupt Charge" and is "largely essential" for thrown melee. — [Killing Blow](https://wiki.warframe.com/w/Killing_Blow)
- **WIKI-CONFIRMED.** DE's U30.5 rationale: Condition Overload was tuned to be "almost as good as Primed Pressure Point"; Blood Rush was lowered so one mod alone no longer gives consistent red crits. — [Condition Overload](https://wiki.warframe.com/w/Condition_Overload), [Blood Rush](https://wiki.warframe.com/w/Blood_Rush)

### Inferences
Templates (8 mod slots + stance + Exilus + arcane). "Flex" means choose by weapon stats.

1. **Crit light attack (Blood Rush).** For weapons with roughly 20%+ base crit. Blood Rush, Sacrificial Steel or Galvanized Steel, Organ Shatter (or Gladiator Might), Primed Pressure Point or Condition Overload, Primed Fury or Berserker Fury, Primed Reach, two 60/60 elementals or Weeping Wounds + one element. Exilus: a Tennokai mod (Discipline's Merit). Arcane: Duplicate if total crit lands near 100% to 140%, otherwise Influence or Exposure. Used for general star chart through Steel Path mobbing.
2. **Hybrid crit + status (Blood Rush + Weeping Wounds + Condition Overload).** For weapons with both stats near 20%+. Blood Rush, Weeping Wounds, Condition Overload, crit damage mod, attack speed, range, two elementals. The combo counter feeds both chance stats; CO replaces Pressure Point. Used for endurance and armored targets when Viral + Slash or Corrosive is wanted.
3. **Heavy attack.** Killing Blow, Sacrificial/True/Galvanized Steel (doubles on heavies), Organ Shatter or Amalgam Organ Shatter, Corrupt Charge, Galvanized Reflex or Reflex Coil (+ Focus Energy for 90% efficiency cap), Primed Pressure Point, elementals, Primed Reach. Exilus: Tennokai optional. Arcane: Animosity, Assimilation (shield frames) or Crescendo. Used for single high-value targets, Incarnon activation, Bleed-class weapons.
4. **Slam.** Seismic Wave (+ Nira set on the Warframe), Primed Pressure Point, elementals with high status chance, Primed Reach is irrelevant to radius, crit mods if the weapon crits; heavy-slam variant adds combo building, Corrupt Charge / Galvanized Reflex. No Condition Overload. Arcane: Afflictions (stacks on knockdown/lift) or Influence on weapons with forced Electricity slams. Exilus: Tennokai for free heavy slams. Used for area clearing; weaker from ground level since U39.
5. **Influence.** Needs Electricity: Focus Energy or Shocking Touch / Voltaic Strike, plus the elements to spread (Viral, Heat, Gas, Corrosive), Weeping Wounds or Melee Prowess for status chance, attack speed, Condition Overload (its bonus rides the spread damage), Melee Elementalist or Galvanized Elementalist for status damage. Arcane: Melee Influence. Used for room clearing in Steel Path and above; weapons with forced Electricity (Xoris, Falcor, Prova, Arca Titron) trigger it reliably.
6. **Glaive.** Killing Blow, Amalgam Organ Shatter or Melee Elementalist for wind-up, heavy-doubling crit mod, crit damage, Volatile Quick Return or Power Throw, Primed Pressure Point, elementals, Corrupt Charge / Galvanized Reflex for initial combo. No attack speed, no CO for the explosion. Used for ranged area burst and for dual-wield play.

Cross-cutting notes:
- Primed Pressure Point and Condition Overload share a bucket, so templates take one unless the slot has no better use.
- Every template that builds combo should consider one combo-duration source or Naramon, because a 5 s window is short between enemy groups.
- Exilus in 2026 is effectively the Tennokai slot for any weapon that can heavy attack.

### Gaps
- No verified creator build list (Brozime, TheKengineer, Tactical Potato) was obtained for 2026; Brozime's vault page found is "2023 Most Used Weapon Builds" ([link](https://publish.obsidian.md/brozime/Public/Guides+%26+Builds/Weapon+Builds/2023+Most+Used+Weapon+Builds)), which predates Tennokai and melee arcanes and was not read.
- "What content each is used for" is reasoned from mechanics, not from usage data.
- Content-specific rules (Deep/Temporal Archimedea modifiers, damage attenuation on bosses) are handled by other researchers.

---

## 14. Defining a meaningful melee DPS number

### Takeaway
There is no single melee DPS. Report a small set of scenario numbers built from the wiki's per-combo formula: sustained light-attack DPS on a chosen stance combo at a stated combo tier, burst heavy damage, and area throughput scaled by expected enemies hit.

### Cited Findings
- **WIKI-CONFIRMED.** `Average Hit = Avg Combo Damage Multiplier x Total Damage x (1 + CC x (CM - 1))`; `Average DPS = Avg Hit x Modded Attack Speed / Base Combo Length`; first enemy only, no follow-through, no status. — [Damage Calculation](https://wiki.warframe.com/w/Damage/Calculation)
- **WIKI-CONFIRMED.** Stance-table form adding forced Slash: `DPS = Modded Melee Damage x Modded Attack Speed x (Total Dmg Multi + Total Slash Proc Multi) / Base Combo Length`. — [Stance](https://wiki.warframe.com/w/Stance)
- **WIKI-CONFIRMED.** Weapon tables publish "Avg Dmg x Atk Spd" per attack row as a stanceless comparison figure. — [Gunblade](https://wiki.warframe.com/w/Gunblade)

### Inferences
Recommended outputs for the advisor:
1. **Sustained single-target DPS** = `modded hit x crit factor x (total stance multiplier / base length) x weapon speed x (1 + speed bonuses)`, evaluated at a stated combo tier (show both 1x and 12x, or steady-state) and a stated status count for CO. Worked example: modded hit 1,333, crit factor 8.63, Blind Justice neutral (1900% over 2.6 s), speed 0.917 x 1.55 = 1.421: 1,333 x 8.63 x (19 / 2.6) x 1.421 = about 119,500 per second before enemy defences.
2. **Forced-proc DoT per second**, reported separately (Slash column of the stance table).
3. **Heavy burst** = one heavy at the build's steady combo tier, plus **heavies per minute** from wind-up, efficiency and Tennokai rate.
4. **Tennokai-blended DPS** = (light cycle damage for N hits + one free heavy) / cycle time, with N = 4 for Discipline's Merit or 6.67 otherwise.
5. **Area throughput** = single-target DPS x `(1 - FT^n) / (1 - FT)` for a user-set n enemies in reach; slams and explosions use area-averaged falloff instead.
6. **Time to 12x** from combo points per second, since ramp time decides whether Blood Rush numbers are realistic for short fights.

Always state the assumptions next to the number: stance combo, combo tier, status count, enemies hit, buffs up or down.

### Gaps
- Enemy mitigation and attenuation are out of scope here; raw DPS must be passed through the general-formula module.
- Animation cancel timing, hit-stop and travel between targets are not modelled anywhere in the sources.

---

## What a melee build calculator must model (ranked by impact)

1. **Base-damage bucket with correct membership**: Pressure Point family, Condition Overload (x unique statuses, excluded on slams/heavy slams/radial), heavy-only bonuses (Killing Blow), Tennokai bonuses, Arcane Fury, Riven damage. Wrong bucket membership is the largest source of error.
2. **Attack type as a first-class dimension**: normal (stance), heavy, slide, slam, heavy slam, thrown/explosion, ranged (gunblade). Each row has its own multiplier, which mods apply, and whether combo, CO and follow-through apply.
3. **Combo state**: points, tier (1 + floor(points/20), cap 12 with weapon exceptions), initial combo, duration, heavy attack efficiency (cap 90%), regen 40/s. Feeds heavy damage, Blood Rush, Weeping Wounds, Gladiator set.
4. **Crit model with tiers above 100%**, heavy-attack doubling of True/Sacrificial/Galvanized Steel, combo-scaled crit, flat crit, Maiming Strike on slides.
5. **Heavy attack class table** (multipliers, forced Bleed, wind-up) with per-weapon overrides.
6. **Tennokai**: opportunity rate (15% random or every 4 hits), free heavy at current combo, Tennokai-only modifiers, Truth's Flame chain and failure state.
7. **Stance data**: per combo type total multiplier, hit count, combo gain, base length, forced procs, stance IPS bonuses. Default stance per class and a user override.
8. **Attack speed**: additive bonuses into animation length; separate wind-up speed stat; glaive throws use wind-up.
9. **Status layer hooks**: status chance with Weeping Wounds, forced procs, status damage mods, hand-off to the shared status model.
10. **Melee arcanes**: Influence (spread damage and uptime), Duplicate (yellow-crit duplicate with reroll), Exposure, Animosity, Afflictions, Doughty, Retaliation, Careen, Assimilation, Crescendo.
11. **Slam model**: 2x / 3x, slam-damage bucket (Seismic Wave, Nira), falloff 50%/70%, height-scaled radius.
12. **Follow-through and expected enemies hit** (range as an input to enemies hit, not a damage multiplier).
13. **Set bonuses counted on the active weapon** (Gladiator, Sacrificial, Nira, Carnis/Jugulus/Saxum).
14. **Weapon exceptions table**: Xoris infinite combo, Venka Prime 13x, Dex Nikana tiers, Tenet Livia/Grigori holster pause, innate initial combo weapons, Incarnon forms and evolutions, glaive attack rows, gunblade ranged rows, exalted follow-through 1.0 and mod restrictions.
15. **Mod compatibility rules**: Steel-family exclusivity, incompatibility tags (POWER_WEAPON, NO_HEAVY_ATTACK), Exilus slot contents, stance capacity and polarity (5/10), Umbra polarity costs.
16. **Riven stats** specific to melee (range, initial combo, efficiency, combo duration, slide crit, combo count chance).

## Open questions to verify in game

1. Is Master's Edge "+60% Tennokai damage" additive with Pressure Point (as Truth's Flame is) or a separate multiplier?
2. Is Dreamer's Wrath's "+50% opportunity chance" relative (22.5%) or additive (65%)? Does it stack with Discipline's Merit?
3. What is the Tennokai wind-up speed value, and the exact wind-up formula (time / (1 + bonus))?
4. Does the heavy-attack x2 on Sacrificial Steel apply to the set-boosted +275% (giving +550%)?
5. Does Additional Combo Count Chance above 100% grant two extra points? Is combo gain per enemy hit multiplied by the stance multiplier exactly as modelled?
6. Does slam damage scale with drop height since U39, or only radius? (The patch note contradicts itself.)
7. Do stance-combo slams scale with Seismic Wave / Nira but nothing else?
8. Which bucket do Melee Retaliation, Melee Assimilation, Melee Careen and the Incarnon Genesis "+100% Melee Damage" use?
9. Does Melee Influence trigger and spread from ordinary thrown-glaive hits and detonations, or only for specific glaives?
10. Can Blood Rush and Weeping Wounds be equipped on Exalted Blade, Hysteria, Iron Staff, Desert Wind today, and does the Gladiator set bonus apply to them?
11. Natural melee Incarnon form duration and thresholds per weapon (90 s vs 180 s; Praedos 5x or 6x).
12. Does Melee Crescendo's initial combo have a cap?
13. Do heavy-attack forced Bleed procs scale with the combo multiplier the same way the hit does?
14. Is the community CO-per-stance effectiveness table (for example Gnashing Payara neutral at 36%) still accurate in Update 44?
15. How is "Puncture status chance" computed for Melee Doughty (status chance x Puncture weight)?
16. Is there an attack-speed cap or minimum animation time?
17. Class slide-attack multipliers per weapon class (only 2x on sampled weapons was seen).
18. Glaive explosion scaling: which of Killing Blow, Power Throw, combo multiplier and class heavy multiplier apply to bounce versus recall explosions.
19. Kuva / Tenet / Coda melee progenitor bonus and unique mechanics (not researched here).
