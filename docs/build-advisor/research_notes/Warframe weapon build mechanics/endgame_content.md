# Warframe hard-mode content in 2026 and what it demands from weapon builds

Research date: 2026-10-05. Live game version at time of research: Update 44.0 "Iceblade of Narin" (2026-09-23), latest hotfix seen 44.0.3 (2026-09-30).

**Labels used:** WIKI-CONFIRMED (official wiki, URL cited), COMMUNITY-CONSENSUS (creator or thread cited), DISPUTED, UNKNOWN.

**Source reliability note for the report writer (read this first):**
- Four wiki pages were read in full, raw text, by me: The Steel Path, Deep Archimedea, Temporal Archimedea, Damage Reduction (the "Damage Attenuation" redirect). Numbers from these are the most reliable in this file. They are tagged **[full read]**.
- All other wiki pages (Netracells, Archon Hunt, Eximus, Void Cascade, The Circuit, Arbitrations, The Descendia, The Fragmented, H-09 Efervon Tank, Overguard, Profit-Taker Orb, Eidolon Teralyst, Kuva Lich) were read through a fetch tool that summarises the page with a small model. Quoted strings are what that tool returned as verbatim; I could not see the raw page. They are tagged **[summarised fetch]**. Treat those numbers as probably right but re-check before hard-coding.
- The web scraper hit a rate limit part-way through and the wiki blocks plain HTTP clients, so several planned pages were not retrieved (see Gaps in each section).
- No material from Brozime, TheKengineer or Tactical Potato specifically about Archimedea builds was retrieved. Brozime's vault was located but only one page (Incarnon grades) was read. The "what creators say" sections are therefore thin and are labelled accordingly.

Wiki page short names used below:
- SP = https://wiki.warframe.com/w/The_Steel_Path
- DA = https://wiki.warframe.com/w/Deep_Archimedea
- TA = https://wiki.warframe.com/w/Temporal_Archimedea
- DR = https://wiki.warframe.com/w/Damage_Reduction

---

## 1. The Steel Path: rules, multipliers, Acolytes, and the levels players actually fight

### Takeaway
Steel Path is a flat +100 enemy levels and 2.5x health and shields (armour is not multiplied directly; it only rises through the level increase). Regular nodes start at roughly level 101 to 200, but Circuit and endurance modes scale to level 9999, so "Steel Path" covers a huge range and the advisor needs an explicit level input rather than a single "Steel Path" switch.

### Cited Findings
- WIKI-CONFIRMED [full read]. Modifiers: "Enemy Level +100 (Only +50 On Archwing / Railjack)", "Enemy Health 250%", "Enemy Shield 250%", +100% resource drop chance, +100% mod drop chance (not Railjack). Introduced Update 28.1 (2020-07-08); page current through Hotfix 43.0.6 (2026-06-30) — [SP](https://wiki.warframe.com/w/The_Steel_Path)
- WIKI-CONFIRMED [full read]. Rule text: "All enemies have their level increased by 100, and gain an additional +150% (to a total of 250%, or 2.5x) bonus to health and shields." No armour multiplier is listed anywhere on the page — [SP](https://wiki.warframe.com/w/The_Steel_Path)
- WIKI-CONFIRMED [full read]. Exceptions: Archwing and Empyrean +50 levels (Grineer Sealab underwater Archwing still +100); Duviri open world +20 levels with no health or shield change; Undercroft, The Circuit and Isleweaver use the default Steel Path modifiers; Steel Path bounties start at level 100 — [SP](https://wiki.warframe.com/w/The_Steel_Path)
- WIKI-CONFIRMED [full read]. "Enemy spawn rates during Endless missions are scaled to match the spawn rate for a full squad, even when solo." Team Bonus Consumables have a one-minute cooldown — [SP](https://wiki.warframe.com/w/The_Steel_Path)
- WIKI-CONFIRMED [full read]. Highest starting level on the Steel Path star chart: "Circulus, Lua's level 180-200" — [SP](https://wiki.warframe.com/w/The_Steel_Path)
- WIKI-CONFIRMED [full read]. Acolytes: spawn in any Steel Path mission except Archwing, Assassination, Ascension, Duviri and Empyrean; "roughly 3-7 minute intervals depending on the kill rate of enemies, with an average of 4 1/2 minutes in Survival"; maximum 3 in non-endless missions; not triggered by Specter or On Call Crew kills; summon and companion kills do count (fixed Update 39.1, 2025-08-26). They drop 2 Steel Essence and one of Primary/Secondary Deadhead, Dexterity or Merciless — [SP](https://wiki.warframe.com/w/The_Steel_Path)
- WIKI-CONFIRMED [full read]. Acolytes use the standardised damage attenuation system since Update 40.0 (2025-10-15): base health 5,500 (was 550), base shields 2,500 (was 1,000). Hotfix 40.0.2 (2025-10-16) lists Acolytes under "Boss Enemies with Damage Attenuation that can be One-Shot" — [DR](https://wiki.warframe.com/w/Damage_Reduction)
- WIKI-CONFIRMED [full read]. Steel Path Eidolons: Teralyst level 110, Gantulyst 120, Hydrolyst 130 — [SP](https://wiki.warframe.com/w/The_Steel_Path)
- WIKI-CONFIRMED [full read]. Steel Path Railjack added in Update 43.0 (2026-06-17): +50 levels, no mod drop bonus, more Fighters and Crewships, Eximus added to Steel Path Railjack only — [SP](https://wiki.warframe.com/w/The_Steel_Path)
- WIKI-CONFIRMED [full read]. Wiki tip: "Due to drastically increased enemy shields, it is advisable to bring abilities that can remove enemy defenses ... Alternatively, bring weapons or abilities which can bypass enemy defenses." — [SP](https://wiki.warframe.com/w/The_Steel_Path)
- WIKI-CONFIRMED [summarised fetch]. The Circuit enemy levels: starts level 30 normal and level 130 Steel Path; stage 5 is 75 normal / 220 Steel Path; stage 10 is 450 / 1392; stage 18 is 2449 / 9999, with Steel Path capped at 9999 — [The Circuit](https://wiki.warframe.com/w/The_Circuit)
- WIKI-CONFIRMED [summarised fetch]. Eximus pacing: "Eximus will normally start appearing only after 60 seconds have elapsed in the mission and only up to 5 Eximus units can be present simultaneously." All Eximus have base Overguard of 12, scaling with level by a two-part curve (1 + 0.0015(x-1)^4 below the level 45-50 transition, 1 + 260(x-1)^0.9 above) — [Eximus](https://wiki.warframe.com/w/Eximus)
- WIKI-CONFIRMED [summarised fetch]. Void Cascade starts at level 50-55 on the normal path; the page's tips mention "fast enemy level(and damage) scaling" — [Void Cascade](https://wiki.warframe.com/w/Void_Cascade)

### Inferences
- Steel Path starting level for any node is the normal-path level plus 100, so Steel Path Void Cascade should start around level 150-155 (derived from the +100 rule, not read directly).
- Practical level bands an advisor should offer: about 100-200 (ordinary Steel Path nodes, fissures, incursions), about 200-400 (20-40 minute endless runs, early Steel Path Circuit, Deep Archimedea), about 400-500 (Elite Archimedea), 1000+ and 9999 (Steel Path Circuit past stage 10, level-cap Cascade and endurance runs).
- Because only health and shields get the 2.5x multiplier, a Steel Path enemy is not just "a level+100 enemy": effective health is 2.5x that of a normal-path enemy of the same displayed level. The advisor must apply the multiplier separately from level scaling.
- Acolytes being attenuated but one-shottable means very high single-hit builds still work on them; the cap scales with their health.

### Gaps
- Steel Path Eximus spawn rate: the Steel Path page does not state one and the Eximus page summary gave no percentage. UNKNOWN.
- Exact Steel Path starting levels for Void Cascade and Void Armageddon, and their level gain per minute or per Exolizer: not retrieved (Void Armageddon page not fetched). UNKNOWN.
- Acolyte MDPS/MDPI values: not published on the pages read. UNKNOWN.
- Circuit level table was read through a summariser; the intermediate stages were not captured.

---

## 2. Deep Archimedea and Elite Deep Archimedea (EDA)

### Takeaway
EDA is three back-to-back Murmur missions at level 375-400 with one locked loadout, 3x to 4x extra enemy health and shields depending on squad size, two Risk Variables per mission, one Deviation per mission, and up to four self-imposed Personal Modifiers. The system changed materially on 2026-09-23 (Update 44.0) and partly reverted on 2026-09-30 (Hotfix 44.0.3), so anything written before late September 2026 is partly out of date.

### Cited Findings

**Structure and levels**
- WIKI-CONFIRMED [full read]. Faction: The Murmur. Tile set: Albrecht's Laboratories. Level range 250-275 normal, 375-400 Elite. Introduced Hotfix 35.5.3 (2024-04-04). Requires Whispers in the Walls, one Netracell completion, and Cavia rank 5 — [DA](https://wiki.warframe.com/w/Deep_Archimedea)
- WIKI-CONFIRMED [full read]. Three missions in a row "with no opportunity to switch Loadouts". Weekly reset Monday 00:00 UTC. Unlocking for the week costs 2 of 5 weekly Search Pulses, shared with Netracells and Temporal Archimedea — [DA](https://wiki.warframe.com/w/Deep_Archimedea)
- WIKI-CONFIRMED [full read]. Mission types that can appear (from the Deviation compatibility table and patch notes): Survival, Alchemy, Mirror Defense, Assassination (The Fragmented), Disruption, Exterminate — [DA](https://wiki.warframe.com/w/Deep_Archimedea)
- WIKI-CONFIRMED [full read]. Elite: "increasing enemy levels to 375 - 400 and applying two Risk Variables"; +10 Research Points. Unlocked permanently by a normal run at 25 points — [DA](https://wiki.warframe.com/w/Deep_Archimedea)

**Always-on restrictions**
- WIKI-CONFIRMED [full read]. "Enemy Health and Shields increased by 100% and an additional 50% for each squad member, stacking to a maximum of 300%." Increased Eximus chance (no number given) — [DA](https://wiki.warframe.com/w/Deep_Archimedea)
- WIKI-CONFIRMED [full read]. No self-revive: 30 seconds after a player dies a Void Angel spawns that must be killed to revive them, stronger each time. Archimedea revival Angel base health is 25,000 (was 12,000) since Update 40.0 and it uses standardised attenuation. Bleedout shortens to a 5 second minimum. Three Mortis Strikes (3 minutes dead each, cumulative) remove reward eligibility. Restores have a 3 minute cooldown. Stalker cannot spawn. Specters are allowed, unlike Archon Hunts and Netracells — [DA](https://wiki.warframe.com/w/Deep_Archimedea)

**Loadout restriction system (Individual Parameters)**
- WIKI-CONFIRMED [full read]. Each week the player is shown 3 Warframes, 3 Primaries, 3 Secondaries and 3 Melee. Equipping one from a row gives 1 Research Point per mission for that row. "The available Loadout restrictions differ between players, and can consist of equipment that the player doesn't own. The first column of Loadout parameters will always attempt to be a Warframe or weapon the player currently owns." Variants (Prime, Syndicate and similar) count. Kitguns and Zaws can appear; any component combination counts — [DA](https://wiki.warframe.com/w/Deep_Archimedea)
- WIKI-CONFIRMED [full read]. Unowned items are marked "!" with a "NOT OWNED" tag (Hotfix 35.5.7, 2024-04-17). Owned Prime weapons are accounted for in generation (Hotfix 38.5.11, 2025-04-17). Loadout can be changed from the Archimedea screen (Update 38.6, 2025-05-21). A bug that gave nearly every player the same loadouts was fixed in Hotfix 40.0.4 (2025-10-23). The offered loadout can change mid-week when the player builds or removes gear — [DA](https://wiki.warframe.com/w/Deep_Archimedea), [TA](https://wiki.warframe.com/w/Temporal_Archimedea)
- WIKI-CONFIRMED [full read]. **New in Update 44.0 (2026-09-23), still live:** "Warframes and Weapons alike will be granted an Arsenal Boost for matching their respective Individual Parameters! The buff received will be the same for each parameter, meaning regardless which Primary Weapon you choose, the boost is the same!" Hotfix 44.0.2 (2026-09-28) "Fixed the Archimedea bonus for Ability Strength applying Ability Duration instead", which confirms one of the boosts is Ability Strength — [DA](https://wiki.warframe.com/w/Deep_Archimedea)
- WIKI-CONFIRMED [full read]. Update 44.0 also raised the Warframe row to 3 points per mission and moved the top rewards to 37 and 40 points. **Hotfix 44.0.3 (2026-09-30) reverted that**: Warframe row is 1 point again, Legendary pool at 34 points, Vosfor (DA) or Pix Chips (TA) at 37. "The other changes to Archimedea missions introduced with Iceblade of Narin remain untouched" (Arsenal Boosts, six new Personal Modifiers, the four buckets) — [DA](https://wiki.warframe.com/w/Deep_Archimedea)

**Research Points and rewards (state as of Hotfix 44.0.3)**
- WIKI-CONFIRMED [full read]. Points: 3 for clearing all missions; 1 per Individual Parameter per mission (8 parameters x 3 missions = 24); +10 for Elite. Maximum 37. Points do not accumulate across attempts — [DA](https://wiki.warframe.com/w/Deep_Archimedea)
- WIKI-CONFIRMED [full read]. Tiers: 5 and 10 points Uncommon pool; 15 points 3 Entrati Lanthorn; 20 Rare pool; 25 Elite unlock; 28 (Elite) 20 Vosfor; 31 Rare pool; 34 Legendary pool; 37 50 Vosfor. Legendary pool: Melee Crescendo 25%, Melee Duplicate 25%, each Tauforged Amber/Azure/Crimson shard 16.67%. 15,000 Cavia standing on completing mission three — [DA](https://wiki.warframe.com/w/Deep_Archimedea)

**Personal Modifiers (shared with Temporal Archimedea; one is drawn from each of four groups per week since the 2026-09-28 reset; the week's set is the same for all players)**

Group 1:
| Modifier | Exact effect (WIKI-CONFIRMED [full read], [DA](https://wiki.warframe.com/w/Deep_Archimedea)) |
| --- | --- |
| Ability Overload | Using an ability opens a void rift nearby |
| Dropped Guard | Warframe and ally Overguard gain reduced by 75% |
| Dull Blades | -50% melee combo chance |
| Framecurse Syndrome | Activating an ability inflicts 50 damage (direct to health, ignores shields) and 150 shield damage (shield part added Update 44.0) |
| Hypersensitive | Duration of negative status effects is tripled |
| Knifestep Syndrome | Lose 2 health when moving; jumping pauses it |
| Low Yield (new 44.0) | Blast radius of weapons with radial attacks set to 3m |
| Secondary Wounds | Gain 1 Puncture status every time you take damage |
| Undersupplied | Max ammo on all weapons reduced by 75%; no effect on Exalted weapons |

Group 2 (ability effectiveness):
| Modifier | Exact effect |
| --- | --- |
| Abbreviated Abilities | Ability duration -50%, multiplicative (was 75% before Update 36.0, 2024-06-18) |
| Channeled Greed (new 44.0) | While a channeled ability is active, max shields and overshields fall each second, reaching 0 after 100 seconds; 10s to recover |
| Constricted | Max energy -75%, multiplicative |
| Energy Exhaustion | Lose 2 energy per second per enemy within 10m |
| Powerless | All abilities disabled until the squad kills 50 enemies (also Operator, Necramech and Atomicycle abilities) |
| Shortened Reach (new 44.0) | Ability range -50%, multiplicative |

Group 3 (disables part of the loadout):
| Modifier | Exact effect |
| --- | --- |
| Ammo Deficit | Ammo restored by drops and gear reduced 75%; no effect on battery or Exalted weapons |
| Gear Embargo | All gear restricted except Archguns, Atomicycles and Necramechs (heavy weapons allowed since Hotfix 42.0.11, 2026-05-14) |
| No Pets Allowed (new 44.0) | Companions disabled (Venari excepted); innate vacuum range increased (44.0.3) |
| Transference Distortion | Operator/Drifter blocked; also blocks Last Gasp and Necramech piloting |

Group 4 (survivability):
| Modifier | Exact effect |
| --- | --- |
| Anemic Shields (new 44.0) | Max shield and overshield cannot exceed 500 |
| Fractured Armor | Casting an ability reduces armour by 10% for 10s |
| Infected Wounds (new 44.0) | Gain a Toxin status every time you take damage |
| Lethargic Shields | Shield recharge delay +500% (6s default, 24s when fully depleted) |
| Permanent Injury | Max health x0.985 each time health damage is taken; regain 3% after 12s without damage |
| Untreatable | Pickups do not heal; health orbs cannot be picked up (energy from Equilibrium and Lavos orbs still works) |

"Other" (listed by the wiki as known but possibly not in rotation): Ammo Scarcity (ammo reserves drain about 5% per second, battery weapons recharge slowly), Conductive, Concussive Drain (5% max energy per health hit), Sanguine Syndrome, Terminal Velocity ("You do 0 damage while not moving"), Vampyric Syndrome — [DA](https://wiki.warframe.com/w/Deep_Archimedea)

**Deep Archimedea Deviations (one per mission)** — WIKI-CONFIRMED [full read], [DA](https://wiki.warframe.com/w/Deep_Archimedea)
| Deviation | Mission | Effect |
| --- | --- | --- |
| Necramech Influx | All | Necramechs appear more often, without needing Rogue Culverins |
| Fissure Cascade | All | Enemy level +1 every 10s until fissures are destroyed |
| Damage Link | All | Enemies within 10m share damage evenly across the linked group |
| Sealed Armor | All | Enemies take 90% less damage from non-weak-point hits (Anatomizers exempt) |
| Parasitic Towers | Survival | Life support towers need 20 kills within 15m |
| Hostile Support | Survival | No tower drops; a Necramech every 90s drops 6 life support modules |
| Hazardous Areas | Survival | Activate towers to clear hazard zones |
| Hazardous Goods | Alchemy | Carried Amphors damage the carrier with their element |
| Alchemical Invulnerability | Alchemy | 10% of enemies have a barrier only breakable by the matching Amphor |
| Eximus Amphors | Alchemy | Only Eximus drop Amphors (two each); Eximus caps appear raised |
| Eroding Senses / Glyph Inflation / Glyph Trap / Barbed Glyphs | Mirror Defense | Objective decay, double glyph cost, teleport traps, 200 Heat damage per glyph |
| Radioactive Breakdown | Mirror Defense | "All enemies are invulnerable and can only take damage when they are inflicted with Radiation Status"; pillars apply Radiation |
| Coordinated Front / Relentless Tide / Angelic Cohort / The Fragmented Two | Assassination | Eximus support the boss; Tide never stops; Void Angels join; two final forms |
| Engorged Gruzzlings | Disruption | All Gruzzlings are Eximus |
| Unified Purpose | Disruption | Enemies can attack and destroy Conduits |
| Double Demolishers | Disruption | Two Necramech Demolishers per Conduit at reduced health |

**Deep Archimedea Risk Variables (one per mission normal, two per mission Elite)** — WIKI-CONFIRMED [full read], [DA](https://wiki.warframe.com/w/Deep_Archimedea)
| Risk Variable | Effect |
| --- | --- |
| Hostile Regeneration | Enemies regenerate 10% max health per second after 5s without taking damage |
| Vampyric Liminus | Immortal Liminus drain 150 health and 25 energy per second within 5m; 5x damage to Overguard |
| Adaptive Aberrations | Enemies gain resistance to elemental damage inflicted on them; lost after 5s without that element |
| Bolstered Belligerents | All enemies have Overguard equal to 50% of their max health |
| Ranged Engagements / Close Quarters | Only ranged, or only melee, enemies |
| Fortified Foes | Guardian Eximus appear, including Guardian Eximus Necramechs |
| Myopic Munitions | Enemies only take damage if a player is within 15m of them |
| Postmortal Surges | Slain enemies burst with Void energy |
| Elemental Potency | Enemies deal +100% elemental damage and have +85% resistance to elemental damage |
| Eximus Reinforcements | Additional Eximus |
| Bold Venture | Enemies deal -15% and take +15% damage; +15% move, attack speed and fire rate |
| Devil's Bargain | Allies within 4m of slain enemies get +25% fire rate and -50% ammo efficiency |
| Entanglement | Slow zones (0.75x move, 0.5x parkour, 0.25x jump) for 6s around kills |
| Commanding Culverins | Culverins fire rockets dealing 5x to Overguard and Necramechs |
| Explosive Potential | Rupturing Fragments replace Shuffling Fragments |
| Alluring Arcocanids | Arcocanid charge attacks pull Warframes in |

**Faction and special enemies**
- WIKI-CONFIRMED [full read]. "The Murmur are vulnerable to Electricity and Radiation damage but resist Viral damage." — [DA](https://wiki.warframe.com/w/Deep_Archimedea)
- WIKI-CONFIRMED [summarised fetch]. The Fragmented: base health 50,000, Steel Path bonus 150,000, Archimedea bonus 150,000; weak to Radiation and Electricity, resists Viral; "Proc Immunity: Cold, Viral"; teal sphere weak points (head 2x, "+1 Crit Tier"); "All attacks inflict Magnetic procs that dispel buff-based abilities and disable all abilities for 3 seconds." — [The Fragmented](https://wiki.warframe.com/w/The_Fragmented)
- WIKI-CONFIRMED [full read]. Fragmented Tide takes damage based on the health of Murmur killed in the fight (Update 39.1, 2025-08-26). A double-application of Archimedea health modifiers to the Fragmented bosses was fixed in Hotfix 39.0.4 (2025-07-03) — [DA](https://wiki.warframe.com/w/Deep_Archimedea)
- DISPUTED. The Damage Reduction page lists flat caps for The Fragmented One and Suzerain (MDPT 175,000, MDPS 300,000), but the same page carries a banner "Unclear if new or old Damage Attenuation stats ... The whole page needs a check and rewrite", and Update 40.0 made attenuation proportional to max health — [DR](https://wiki.warframe.com/w/Damage_Reduction)
- WIKI-CONFIRMED [full read]. Since Hotfix 40.0.2 (2025-10-16) these Archimedea-relevant enemies have **no** damage attenuation and can be one-shot: Demolishers (including Necramech Demolishers), Rogue Necramechs (Voidrig and Bonewidow), Gruzzling, Necramite, Techrot Babau, Scaldra Dedicants. Rogue Necramech base health is 7,500 (was 3,800), limb 600 — [DR](https://wiki.warframe.com/w/Damage_Reduction)

### Inferences
- Effective enemy health in EDA is (level 375-400 scaling) x 2.0 solo up to x 4.0 in a four-player squad ("increased by 100% ... maximum of 300%"). Squad size is therefore a first-order input to any time-to-kill estimate.
- Modifiers that change the **weapon** build directly (my ranking): Sealed Armor (weak-point-only: precision single target, punch-through and weak-point mods gain value, body-shot AoE is cut to 10%); Radioactive Breakdown (weapon must proc Radiation itself, otherwise it depends on pillars); Elemental Potency (85% elemental resistance pushes builds toward physical damage, Slash procs and base-damage scaling); Adaptive Aberrations (penalises single-element sustained fire; mixed or physical damage holds up better); Bolstered Belligerents (Overguard equal to 50% of health on everything: Magnetic and Void gain value and crowd-control primers lose it); Myopic Munitions (15m rule removes sniping and long-range AoE); Damage Link (favours AoE and chaining; single target damage is diluted); Hostile Regeneration (favours burst or continuous damage over slow DoT ramp with gaps).
- Personal Modifiers that change the weapon build: Undersupplied (-75% max ammo), Ammo Deficit (-75% pickups), Devil's Bargain (-50% ammo efficiency, a Risk Variable) and the possibly-retired Ammo Scarcity all attack ammo economy; battery weapons, melee and Exalted weapons are explicitly exempt from some of them. Low Yield (3m blast radius) guts radial weapons. Dull Blades (-50% combo chance) hurts combo-dependent melee and makes initial-combo or heavy-attack builds relatively better. No Pets Allowed removes companion priming and companion-based ammo or vacuum utility. Powerless, Abbreviated Abilities, Shortened Reach, Constricted and Energy Exhaustion all weaken ability-based armour strip and ability-based weapon buffs, so the weapon has to stand more on its own.
- Viral, the default Steel Path choice, is explicitly resisted by the Murmur and The Fragmented is immune to Viral and Cold procs. A build tuned for general Steel Path is mis-tuned for EDA.
- A player can skip any parameter and still get most rewards: without all four loadout rows a clean Elite run is 3 + 10 + 12 (personal modifiers) = 25, and each matched row adds 3. The Legendary pool at 34 needs at most one row or modifier dropped (37 - 3 = 34). This sets how much pressure there is to use an off-meta or unbuilt weapon.

### Gaps
- **Arsenal Boost values are UNKNOWN.** Neither the wiki pages nor the official Update 44.0 notes (as returned by the fetch tool) list what each matched row grants. Only "Ability Strength" is confirmed by a hotfix note. This matters: if the Primary boost is, say, a damage or ammo bonus it changes build choice. Must be read in game.
- "Increased chance of Eximus" has no published number. UNKNOWN.
- Exact attenuation caps for The Fragmented One at Elite levels are UNKNOWN (wiki values are flagged as possibly stale).
- Murmur per-enemy armour and health classes were left to the other researcher.
- Vampyric Liminus crowd-control interactions are on a wiki talk page that was not read.

---

## 3. Temporal Archimedea and Elite Temporal Archimedea (ETA)

### Takeaway
ETA is the same framework in 1999 Höllvania against Scaldra and Techrot at level 475-500, 100 levels above EDA. It shares the Personal Modifier pool and research point structure, replaces the Void Angel revive with Resurgence Tokens, adds Peely Pix (per-mission buff stickers, some of which replace a weapon slot), and has its own Deviation and Risk Variable lists including one (Heavy Warfare) that makes normal weapons nearly useless.

### Cited Findings

**Structure and levels**
- WIKI-CONFIRMED [full read]. Factions: Scaldra, Techrot. Level range 350-375 normal, 475-500 Elite. Introduced Update 38.5 (2025-03-19). Requires The Hex quest and Hex rank 5. Costs 2 Search Pulses per week from the shared pool of 5 — [TA](https://wiki.warframe.com/w/Temporal_Archimedea)
- WIKI-CONFIRMED [full read]. Mission types (from the Deviation table): Exterminate, Hell-Scrub (survival variant), Legacyte Harvest, Assassination (H-09 tank), Defense (Flare). Velimir assists in mission one, Minerva in mission two, both in mission three — [TA](https://wiki.warframe.com/w/Temporal_Archimedea)
- WIKI-CONFIRMED [full read]. Same always-on restrictions as Deep Archimedea (+100% health and shields, +50% per squad member to +300%; more Eximus; bleedout shortening; Mortis Strikes; 3 minute restore cooldown). Revive differs: a squadmate collects 5 Resurgence Tokens from enemies and hacks a terminal; tokens reduce max health and drain energy while carried; the hack cannot be bypassed with Ciphers — [TA](https://wiki.warframe.com/w/Temporal_Archimedea)
- WIKI-CONFIRMED [full read]. Elite gives +3, +3 and +4 points for missions one to three (+10 total) and applies two Risk Variables. Loadout rows, Personal Modifiers, the Update 44.0 Arsenal Boost and the 44.0.3 revert are identical to Deep Archimedea (the Personal Modifier section is transcluded from a shared page) — [TA](https://wiki.warframe.com/w/Temporal_Archimedea)
- WIKI-CONFIRMED [full read]. Rewards: 15 points gives a Peely Pak (5 Pix); 28 gives 6 Pix Chips; 34 Legendary pool; 37 gives 9 Pix Chips. Legendary pool includes Arcane Escapist, Arcane Hot Shot, Arcane Universal Fallout (13.66% each), Omni Forma 11.2%, and all six Tauforged shard colours. 15,000 Hex standing — [TA](https://wiki.warframe.com/w/Temporal_Archimedea)

**Peely Pix** — WIKI-CONFIRMED [full read], [TA](https://wiki.warframe.com/w/Temporal_Archimedea)
- Stickers applied per mission; not consumed, but one sticker cannot be used on more than one mission in a run. Three ranks (base / Sparkly / Chromatic); 10 duplicates to max.
- Weapon-replacing Pix, each "+150% / +300% / +450% damage", multiplicative with other damage sources: Doktor's Orders (EFV-8 Mars as secondary, pre-modded, Secondary Deadhead), Resolutions (Purgator 1 as primary, Primary Merciless), Through My Heart (EFV-5 Jupiter as primary, Primary Crux), Only Knives (Scaldra Dual Viciss as melee; wiki notes "Bug: Damage bonus does not apply").
- Weapon-affecting Pix: XL Frosty (+10/20/30% Cold damage on primary and secondary), Super Scavenger (Eximus kills have 25/35/45% chance to drop an Elemental Ammo Pack, which gives a 50% damage bonus since Update 40.0), Argon Combo #2 (weak-point kills raise orb and ammo drop chance by 10/15/20%), Catscratch Fever (periodic Saryn Spores on an enemy within 30m), Wakeup Call (deployable Thermian RPG, 180/120/60s cooldown), Vintage Tech (summon a Necramech).
- Survivability Pix: Spinnin' Around (weak-point kills build Null Stars for up to 60/75/90% damage reduction), Slippery Customer, Panic Call, Hi-Score (bonus revives), Breathless (100% Gas and Toxin resistance for 30s, extended by health orbs), Going Steady (knockdown resistance), Too Hot, Burgerfest.
- Three Pix are self-imposed handicaps that pay 1 Pix Chip: It Sees You, Old Pizza, Optimism.

**Temporal Archimedea Deviations** — WIKI-CONFIRMED [full read], [TA](https://wiki.warframe.com/w/Temporal_Archimedea)
| Deviation | Mission | Effect |
| --- | --- | --- |
| Cache Crash | Exterminate | Supply cache consequences active from the start; failing to open it in 3 minutes doubles the kill count |
| Sealed Armor | Exterminate | Enemies take 90% less damage from non-weak-point hits |
| Hold Your Breath | Hell-Scrub | Region deals growing Toxin damage except near Hell-Scrubbers (20m) or filters (5m, about 10s) |
| Pile-On | Hell-Scrub | Techrot melee the scrubbers, +25% contamination each |
| Sporogenesis | Hell-Scrub | Tumors near scrubbers speed life support decay |
| Mitosis | Legacyte Harvest | Two Legacytes per round, 6 captures needed |
| Growth Hormones / Parallel Evolution | Legacyte Harvest | Legacytes strengthen each generation; other enemies gain abilities as it evolves |
| Reinforcements | Assassination | Scaldra then Techrot reinforcements during the tank fight |
| Toxic Tank | Assassination | Tank has a Toxin aura, trails and attacks |
| Thermian Plating | Assassination | "Only Thermian RPGs can damage the tank" |
| Noise Suppression / Miasmite Mash | Defense | Drones gas Flare; enemies drop Miasmites that rush Flare |
| Vamp Rock | Defense | 10m field around Flare disables and blocks abilities (including Operator and Transference) and drains energy; Flare loses health with no players in range |

**Temporal Archimedea Risk Variables** — WIKI-CONFIRMED [full read], [TA](https://wiki.warframe.com/w/Temporal_Archimedea)
- Shared with Deep Archimedea: Hostile Regeneration (does not affect the H-09 tank since Update 40.0), Vampyric Liminus, Bolstered Belligerents (Overguard = 50% max health), Fortified Foes, Myopic Munitions (15m), Postmortal Surges, Bold Venture, Entanglement, Devil's Bargain.
- Not in the Temporal list: Adaptive Aberrations, Elemental Potency, Ranged Engagements, Close Quarters, Eximus Reinforcements, Commanding Culverins, Explosive Potential, Alluring Arcocanids.
- Temporal-only: Balloonfest (more and faster Scaldra Harbinger balloons; forces a surface mission), Artillery Beacons, Corrupted Flesh (all killed enemies leave a 50 Corrosive, level-scaled, 0.25s-tick area), Competitive Streak (random Faceoff penalties about every 25s), Miasmite Swarm, Dense Fog (Toxin damage every second outside filter bubbles), It's Alive (underground tendrils attack players who stop moving), Techrot Speed Run and Scaldra Speed Run (single faction, much faster), **Heavy Warfare** ("Enemies take x1.25 damage from Heavy Weapons and Thermian RPGs, 95% less from other sources. Enemies will drop heavy ammo packs and heavy weapon recall time reduced to 5s", wording updated Hotfix 42.0.9, 2026-05-04), Arcade Automata (enemy guns fire slow orbs; biases spawns to Scaldra), Beyond The Wall (Murmur join Scaldra and Techrot).
- Seasonal: Thick Ice (winter; Arctic Eximus bubbles 10x durability), Jade Spirits (spring), Excessive Explosives (summer), Foggy Fall (autumn).

**Special enemies**
- WIKI-CONFIRMED [summarised fetch]. H-09 Efervon Tank: Scaldra form 18,000 base health, 100 armour, phase 1 has "innate 85% Damage Reduction in addition to its armor" and is invulnerable until 6 of 8 green weak points are destroyed; weak to Corrosive, Impact, Void, resists Gas. Techrot form 30,000 base health, 100 armour, weak to Gas, Magnetic, Void, resists Cold, and is "immune to Status Effects" (with exceptions for some armour-removal abilities). Destroying a Techrot Proboscis deals 5% of its max health — [H-09 Efervon Tank](https://wiki.warframe.com/w/H-09_Efervon_Tank)
- WIKI-CONFIRMED [full read]. Techrot Babau: no damage attenuation since Hotfix 40.0.2; base health raised from 1,500 to 10,000 and Temporal Archimedea base health bonus from 1,000 to 9,000 in Hotfix 40.0.3 (2025-10-21). In Hell-Scrub, killing a Babau cuts 30 seconds off the mission timer — [DR](https://wiki.warframe.com/w/Damage_Reduction), [TA](https://wiki.warframe.com/w/Temporal_Archimedea)
- WIKI-CONFIRMED [full read]. Legacyte keeps standardised attenuation (it has a HUD health bar); Steel Path / Temporal Archimedea base health bonus 7,500. Scaldra Dedicants lost attenuation in 40.0.2 — [DR](https://wiki.warframe.com/w/Damage_Reduction)

**How it differs from Deep Archimedea (summary of the above)**
- 100 levels higher at both tiers; two factions (three with Beyond The Wall) instead of one; token-and-hack revive instead of Void Angel; Peely Pix; NPC allies; seasonal variables; a boss with status immunity and a scripted weak-point phase; a variable (Heavy Warfare) and a deviation (Thermian Plating) that take the player's own weapons out of the fight.

### Inferences
- Heavy Warfare makes the Archgun (heavy weapon) the real primary for that mission: non-heavy sources deal 5%. An advisor that ignores Archgun builds will be wrong for that week. Gear Embargo explicitly still allows Archguns, so the two can coexist.
- Thermian Plating makes the player's weapon build irrelevant to the boss; only add-clear matters in that mission.
- Vamp Rock (abilities off near the Defense target) and Powerless shift damage responsibility from abilities to weapons; a weapon that relies on a Warframe buff or ability strip is weaker there.
- The tank's two forms want different elements (Corrosive/Impact then Gas/Magnetic), with Void good in both, and the Techrot form ignores status. A single-element status build is poorly matched; raw damage with weak-point accuracy is safer.
- Weapon-replacing Pix mean the player may not be using their own primary, secondary or melee at all in a mission. The +150% to +450% multiplier is large enough that these can out-perform an unbuilt forced weapon.
- Dense Fog, Hold Your Breath, Toxic Tank and Infected Wounds all apply Toxin, which bypasses shields; this is a survivability issue, not a weapon one, but it interacts with shield-gating builds.

### Gaps
- Scaldra and Techrot per-unit health, armour and resistance tables were not retrieved (the Scaldra, Techrot and Techrot Babau pages were blocked). The H-09 weaknesses above are the only faction-specific numbers found. UNKNOWN for trash enemies.
- H-09 attenuation caps and whether "H-09 Apex" differs: not found.
- Whether the Only Knives damage-bonus bug is still present after Update 44.0: UNKNOWN.
- Arsenal Boost values: UNKNOWN (same as section 2).
- The in-game Loadout description still says "1 Research Point per mission"; consistent with the 44.0.3 revert, but worth confirming in game.

---

## 4. Damage attenuation, status immunity and crowd-control immunity across Archimedea and bosses

### Takeaway
Update 40.0 (2025-10-15) rebuilt damage attenuation: caps are now a proportion of the enemy's max health and the per-second cap is per player; Hotfix 40.0.2 then restricted attenuation to "true Bosses and enemies with the HUD health bars". Most "tanky special" enemies in Archimedea (Necramechs, Demolishers, Babau, Dedicants, Gruzzlings) are now plain health pools that a strong enough hit can one-shot, while the mission bosses, Legacytes, Void Angels, Archons, Eidolons, Acolytes and Liches are still capped.

### Cited Findings
- WIKI-CONFIRMED [full read]. Official definitions (Update 40.0): MDPS, "a target cap of the amount of damage an enemy can receive per second. Sustained damage over time is reduced to avoid exceeding that target cap"; MDPI, "a cap applied to the amount of damage applied in one damage instance". "Damage Attenuation values are now proportional to Max Health"; "the MDPS in Damage Attenuation will now be applied on a per-player basis"; max health for this "only uses the Health value. Overguard, Shield, and Armor values are not considered." — [DR](https://wiki.warframe.com/w/Damage_Reduction)
- WIKI-CONFIRMED [full read]. Hotfix 40.0.2 (2025-10-16): "Damage Attenuation is now solely reserved for true Bosses and enemies with the HUD health bars." Removed from: Scaldra Dedicants, Demolishers (including Necramechs), Deimos Jugulus, Deimos Saxum, Rogue Necramechs, Amalgams, several Corpus Proxima units, Errant Specters, Gruzzling, Necramite, Sister Hounds, Techrot Babau, Treasurer, Tusk Thumpers. Acolytes and Infested Oni keep attenuation but can be one-shot — [DR](https://wiki.warframe.com/w/Damage_Reduction)
- WIKI-CONFIRMED [full read]. Hotfix 40.0.3 (2025-10-21): increased MDPI on Kuva Lich, Sisters and Technocyte Coda "so that weapons like Snipers are more effective"; "greatly increased the MDPI" for Eidolons; removed attenuation from Skittergirl (now 90% damage reduction, base health 600) — [DR](https://wiki.warframe.com/w/Damage_Reduction)
- WIKI-CONFIRMED [full read]. Enemies still on standardised attenuation after 40.0.2 (the 40.0 list minus the 40.0.2 removals): Acolytes, Adversaries (Lich, Sister, Coda), Archons, Eidolons, Infested Oni, Juggernauts, Kuva Lich Thralls, Legacyte, Lephantis and Hemocyte, Mocking Whispers, Oraxia, Void Angels including the Archimedea revival Angel. Whether Juggernauts, Thralls and Mocking Whispers kept it under the "HUD health bar" rule is not stated explicitly — [DR](https://wiki.warframe.com/w/Damage_Reduction)
- DISPUTED. Legacy flat figures still printed on the wiki: Archons "limit damage per second to 935,000", MDPT 460,000, plus "a flat 20% reduction to all damage and a 50% reduction to status effect damage"; decay constant 2/3; shotgun compensation 0.7 for base multishot weapons. The page itself warns these may predate Update 40.0 — [DR](https://wiki.warframe.com/w/Damage_Reduction)
- WIKI-CONFIRMED [full read]. Eidolons: "Max Damage Per Hit attenuation based on 200% of their maximum health, and a Max Damage Per Second attenuation based on 100% of their maximum health." Body part multiplier 2x, critical damage bonus 2x, head 3x; AoE gets neither the 3x head multiplier nor the 2x crit bonus on the head — [DR](https://wiki.warframe.com/w/Damage_Reduction)
- WIKI-CONFIRMED [full read]. Lephantis and Hemocyte: per-hit cap based on 5% of max health; Hemocyte DPS cap based on 20% of max health; both take 2x from critical hits. Formula given: Attenuated = Incoming x Cap / (Incoming x Multishot + Cap) — [DR](https://wiki.warframe.com/w/Damage_Reduction)
- WIKI-CONFIRMED [full read]. The attenuation model uses burst DPS: damage x crit multiplier x fire rate x multishot x body part multipliers, after mods and buffs. "Weapons with the auto-spool trigger type, like the Gorgon or Kohm, will noticeably deal less damage per damage instance as their fire rate ramps up" — [DR](https://wiki.warframe.com/w/Damage_Reduction)
- WIKI-CONFIRMED [full read]. Guardian Eximus aura (relevant to the Fortified Foes Risk Variable): "increased damage type resistance to all damage types by 90% for themselves and their allies" — [DR](https://wiki.warframe.com/w/Damage_Reduction)
- WIKI-CONFIRMED [summarised fetch]. Enemy Overguard: enemies "completely ignore the crowd control effects" of stagger, knockdown, stun, mind control, confusion (Radiation), slow, ragdoll, blind, lifted; they "can normally only receive a maximum of 4 Cold procs". Void damage +50% versus Overguard. Magnetic status amplifies damage to Overguard: "100% damage on the first stack, 25% on subsequent stacks up to a maximum of 325% after 10 stacks"; on break the target takes Electricity damage equal to 3% of total Overguard per stack, up to 30%. "Overguard is not affected by Damage Reduction from armor or abilities." — [Overguard](https://wiki.warframe.com/w/Overguard)
- WIKI-CONFIRMED [summarised fetch]. Update 44.0 added Entropic Eximus (Zariman): a "nearly impenetrable shield bubble"; the counter is to get inside the bubble — [Warframe 44.0 patch notes](https://www.warframe.com/en/patch-notes/pc/44-0-0), [Eximus](https://wiki.warframe.com/w/Eximus)

### Inferences
- For attenuated bosses the advisor cannot rank builds by raw DPS. Above the cap extra damage is wasted, so what matters is reaching the cap reliably. Since the caps scale with enemy max health and their ratios are unpublished for most bosses, the safest model is a "boss" profile that soft-caps both per-hit and per-second damage and reports "cap reached / not reached" rather than a time-to-kill number.
- The wiki's burst-DPS formula implies multishot and fire rate both feed the per-second cap, and the Hemocyte formula penalises multishot inside the per-hit cap. High-multishot, high-fire-rate builds are attenuated hardest; slow, heavy single hits (boosted further by the 40.0.3 MDPI increases for Liches and Eidolons) are attenuated least.
- With Bolstered Belligerents every enemy is crowd-control immune until its Overguard (50% of max health) is gone, and Radiation's confusion effect is blocked. Status types that only provide control lose value; Magnetic becomes a strong damage multiplier (up to 3.25x on the Overguard portion); armour does not protect Overguard so armour strip does nothing for that half of the bar.
- Because non-boss heavies lost attenuation in 40.0.2, advice written between 2025-10-15 and 2025-10-16, or before October 2025, about Necramechs and Demolishers being damage-capped is obsolete.

### Gaps
- Proportional MDPS/MDPI ratios for Archons, The Fragmented One, H-09, Legacyte, Void Angels, Acolytes, Liches: UNKNOWN. Only Eidolons (200% / 100%) and Lephantis/Hemocyte (5% / 20%) have published ratios.
- Whether Overguard takes critical hits, weak-point multipliers and faction-mod bonuses normally: the summariser said the page gives no special rule. Not confirmed either way.
- How status damage-over-time ticks interact with the per-second cap (Archon "50% reduction to status effect damage" may be stale): UNKNOWN.
- Entropic Eximus exact damage reduction: not retrieved.

---

## 5. Other endgame content and its build demands

### Takeaway
The weekly "Sortie-style" modes (Archon Hunt, Netracells, both Archimedeas) all share the same +100% to +300% health and shield rule and no-self-revive rule; they differ in level, faction and boss mechanics. Several bosses ignore the player's normal weapon build entirely (Profit-Taker needs four specific elements plus an Archgun; Eidolon shields need Operator Void damage).

### Cited Findings
- WIKI-CONFIRMED [summarised fetch]. **Netracells**: faction The Murmur; "Health/Shields increased by 100% and an additional 50% for each squad member, stacking to a maximum of 300%"; no self-revive; summons disabled for the whole mission; 3 minute restore cooldown; 1 Search Pulse each; 5,000 Cavia standing. Keyglyph debuffs (one carried per player): Sanguine (Bleed on taking damage), Framecurse (50 damage per ability cast), Knifestep (lose 2 health when moving), Exhaustion (lose 2 energy per second per enemy within 10m), Vanquisher (extra Eximus), Wampyri (lose health each second; kills restore), Conductive (periodic electricity), Voidburst (slain enemies explode). Page current to Update 44.0 — [Netracells](https://wiki.warframe.com/w/Netracells)
- WIKI-CONFIRMED [summarised fetch]. **Archon Hunt**: mission 1 level 130-135, mission 2 level 135-140, mission 3 (Archon Boreal, Amar or Nira) level 145-150; same +100% to +300% health and shield rule; no self-revive; 3 minute restore cooldown; Specters and On Call Crew disabled, Air Support allowed; Archons are status-immune during invulnerability phases; attenuation proportional to max health and per player since Update 40.0 — [Archon Hunt](https://wiki.warframe.com/w/Archon_Hunt)
- WIKI-CONFIRMED [summarised fetch]. **Eidolons**: "The Teralyst possesses a Sentient shield which is invulnerable to all sources of damage, it can only be harmed with Tenno Operator sourced Void damage"; "immune to all Status Effects, except for Void and Tau damage"; Radiation and Cold are effective on its health, Corrosive least; normal spawn level 50 (Steel Path 110/120/130 per the Steel Path page). Post-40.0 base health 50,000 and base shields 50,000 for the Teralyst — [Eidolon Teralyst](https://wiki.warframe.com/w/Eidolon_Teralyst), [SP](https://wiki.warframe.com/w/The_Steel_Path)
- WIKI-CONFIRMED [summarised fetch]. **Profit-Taker Orb**: shield is vulnerable to one displayed element at a time and cycles after 25 seconds or after taking up to 20% of total shield in the matching type; Void Beam or a rank 40 Paracesis forces a cycle (5 second lockout); needs Radiation, Cold, Electricity and Toxin among others; body requires a Gravimag Archgun; "immune to the effects of Shield Disruption, and any armor-reducing effect"; level 60 base; page current to Update 41.0 (2025-12-10) — [Profit-Taker Orb](https://wiki.warframe.com/w/Profit-Taker_Orb)
- WIKI-CONFIRMED [summarised fetch]. **Arbitrations**: "the enemy level range will start at 60-80"; Arbitration Shield Drones are "immune to most Abilities, Exalted Weapons, and Status Effects" and make tethered enemies invulnerable; players die instantly with no bleedout and are revived via 5 Resurgence Tokens; a random Warframe and three weapons get "+300% Ability Strength bonus, +500 Health bonus, and a +300% Damage bonus" each alert; page current to Hotfix 42.0.9 (2026-05-04) — [Arbitrations](https://wiki.warframe.com/w/Arbitrations)
- WIKI-CONFIRMED [summarised fetch]. **The Circuit**: random selection of Warframes and weapons offered in Teshin's Cave; "Gear items and Companions cannot be used"; Decrees stack through the run; Steel Path levels 130 at start to 9999 by stage 18; Steel Path track awards Incarnon Genesis adapters at tiers 5 and 10 — [The Circuit](https://wiki.warframe.com/w/The_Circuit)
- WIKI-CONFIRMED [summarised fetch]. **Void Cascade**: Grineer or Corpus with Thrax; Thrax Centurions have Overguard and after physical defeat enter a spectral form that "must be finished off with Operator/Drifter damage, or it will regain its physical form" — [Void Cascade](https://wiki.warframe.com/w/Void_Cascade)
- WIKI-CONFIRMED [summarised fetch]. **Kuva Lich**: territory levels by Lich rank 1-5 are 55-75, 50-60, 55-70, 75-90, 90-110; "Kuva Liches may gain additional resistances and immunities upon leveling up"; Thralls take 25% less damage; MDPI raised in Hotfix 40.0.3 — [Kuva Lich](https://wiki.warframe.com/w/Kuva_Lich), [DR](https://wiki.warframe.com/w/Damage_Reduction)
- WIKI-CONFIRMED [summarised fetch]. **New in 2025-2026, The Descendia** (Update 41.0, 2025-12-10; part of "Dark Refractory" with The Perita Rebellion and The Guilty): 21 floors ("Infernums") with checkpoints at 7, 14 and 21; level 65-85 normal, 165-185 Steel Path; "all known enemy Factions"; self-revive disabled and dead players stay down until the next floor; no Specters, On Call Crew or Air Support; boss Roathe on floor 21 — [The Descendia](https://wiki.warframe.com/w/The_Descendia)
- WIKI-CONFIRMED [full read]. Other 2025-2026 additions visible in patch history: The Perita Rebellion bosses Hunhullus, Dactolyst and Vanguard with "Commandeered" Prime Warframe enemies (Steel Path scaling fixed Hotfix 41.0.2, 2025-12-12); Deepmines bounties (Update 40.0, "The Vallis Undermind"); Steel Path Railjack (Update 43.0); "Super Bosses" that award a Sumdali and a glyph for solo kills with a boss-specific Warframe; Isleweaver (Duviri) — [SP](https://wiki.warframe.com/w/The_Steel_Path)
- WIKI-CONFIRMED [summarised fetch]. "Glacial Defiance" is mentioned in the Update 44.0 notes as "coming soon"; no rules published — [Warframe 44.0 patch notes](https://www.warframe.com/en/patch-notes/pc/44-0-0)

### Inferences
- Mixed-faction modes (The Descendia, Circuit, Void Cascade's Grineer-or-Corpus split) reward faction-agnostic builds; single-faction modes (EDA Murmur, Netracells Murmur, Archon Hunts by Archon) reward faction-tuned elements. The advisor should let the player pick "faction known" versus "mixed".
- Profit-Taker and Eidolon shields are content where the correct answer is a specific utility loadout (element coverage, Archgun, amp), not the highest-damage weapon. They should be modelled as special cases or excluded from generic "best build" ranking.
- Arbitration drones being immune to abilities and status means weapon direct damage must kill them; a status-only or ability-only setup stalls.
- Circuit and Archimedea both hand the player a restricted weapon list, but differently: Circuit restricts the whole loadout and removes companions, Archimedea only rewards matching. Both make "best build for a weapon I did not choose" a core use case.

### Gaps
- Netracell enemy level range: not returned by the fetch. UNKNOWN from this research.
- Archon exact post-40.0 caps: UNKNOWN. Archon elemental immunities by Archon were not retrieved.
- Exploiter Orb, Sorties, Sisters of Parvos, Technocyte Coda, Void Armageddon, The Perita Rebellion, The Guilty, Deepmines, Sanctuary Onslaught: pages not retrieved. No findings.
- Circuit: how many Warframes and weapons are offered and whether offered weapons use the player's own mods or a default config: not captured by the summariser.
- Level-cap runs: no source was read on enemy behaviour at level 9999.
- Sentient damage adaptation numbers: the wiki section only links out; not retrieved.

---

## 6. What separates a star-chart build from a Steel Path and Elite Archimedea build

### Takeaway
The hard evidence from the rules is stronger than the creator commentary I could retrieve: hard modes multiply health and shields (not armour), add Overguard and crowd-control immunity, attack ammo and abilities through modifiers, and lock the loadout for three missions. No material from Brozime, TheKengineer or Tactical Potato on this specific question was retrieved, so the community claims below come from lower-trust guide sites and are labelled accordingly.

### Cited Findings
- WIKI-CONFIRMED [full read]. The Steel Path page's own advice is to remove or bypass defences because of "drastically increased enemy shields" — [SP](https://wiki.warframe.com/w/The_Steel_Path)
- WIKI-CONFIRMED [full read]. The wiki's Archimedea advice is entirely about survivability and squad roles (healer, high survivability, crowd control; Adaptation, Quick Thinking, Rolling Guard), not weapons — [DA](https://wiki.warframe.com/w/Deep_Archimedea)
- COMMUNITY-CONSENSUS (low-trust guide site, dated "September 11, 2026, verified through Update 43.5", so it predates Update 44.0). Claims: "Armor strip is not optional past level 300; raw damage falls off the cliff"; a common mistake is "Treating it like Steel Path and skipping armor strip"; "The matching loadout is up to 12 free points. Equip it even if the weapon is bad and let the frame carry." — [warframe.today Deep Archimedea guide](https://warframe.today/deep-archimedea-guide/)
- COMMUNITY-CONSENSUS (search-result summaries of low-trust guide sites; not read in full). Recurring Steel Path claims: Galvanized mods are "the real damage gate"; Viral plus Slash, or Viral plus Heat, or Hunter Munitions on crit weapons, is the default; "Eximus ignore crowd control until their Overguard breaks; bring burst" — [warframe.today Steel Path guide](https://warframe.today/steel-path-guide/), [nerdburglars Steel Path guide](https://nerdburglars.net/gameguides/warframe-steel-path-best-frames-builds-and-strategies/)
- COMMUNITY-CONSENSUS (search-result summary). Melee is favoured for Archimedea "since you won't have to worry about ammo or other restrictions" — [nerdburglars EDA weapons page](https://nerdburglars.net/question/best-weapons-for-elite-deep-archimedea/)
- COMMUNITY-CONSENSUS. Brozime's public vault grades Incarnon weapons on a scale where S is "Raising the bar for weapon power in Warframe significantly" and C is "Weapons that can do high level content meaningfully better"; the page gives grades without per-weapon reasoning and shows no date — [Brozime's Public Notes, Incarnons](https://publish.obsidian.md/brozime/Public/Guides+&+Builds/Guides/Other/Incarnons)

### Inferences
- DISPUTED: "armor strip is not optional past level 300". The rules read here do not support treating armour as the dominant problem in EDA specifically: the hard-mode multipliers apply to health and shields, Bolstered Belligerents adds Overguard that armour does not protect, and the Murmur's listed weaknesses are Electricity and Radiation. The other researcher's armour formulas (including any armour cap) should decide this; do not hard-code the guide site's claim.
- The same guide's generic "Viral" Steel Path advice conflicts with the wiki's statement that the Murmur resist Viral. Generic Steel Path element advice should not be carried into EDA.
- Rule-derived differences an advisor can state with confidence:
  - Sustained versus burst: three consecutive missions with no loadout change, plus Hostile Regeneration (10% health per second after 5 seconds untouched), reward damage that can be kept up; attenuated bosses reward hitting the cap, not exceeding it.
  - Ammo economy: at least four modifiers cut ammo (Undersupplied -75% max, Ammo Deficit -75% pickups, Devil's Bargain -50% efficiency, Ammo Scarcity drain). Battery weapons, melee and Exalted weapons are exempt from some. A weapon that is fine on the star chart can run dry here.
  - Ability dependence: Powerless, Abbreviated Abilities, Shortened Reach, Constricted, Energy Exhaustion, Framecurse, Fractured Armor, Vamp Rock and The Fragmented One's ability-disabling Magnetic procs all weaken builds whose weapon damage depends on an ability (strip, buff or grouping).
  - Overguard: crowd control and Radiation confusion are blocked; Magnetic and Void gain value.
  - AoE versus single target: Low Yield (3m radius), Sealed Armor (weak points only) and Myopic Munitions (15m) punish wide AoE; Damage Link rewards it. Neither is universally right, which argues for per-week selection.
  - Survivability trade-offs: no self-revive and Mortis Strikes make deaths expensive, so glass-cannon weapon choices that rely on shield-gating are riskier under Anemic Shields, Lethargic Shields and Toxin-on-hit modifiers. This is frame-side but constrains weapon arcane and mod choices that trade defence for damage.
  - Companions: No Pets Allowed removes companion priming, so a weapon build that assumes a primed target loses its multiplier.

### Gaps
- No transcript or written material from Brozime, TheKengineer or Tactical Potato on Archimedea or Steel Path build philosophy was retrieved. Brozime's vault exists at publish.obsidian.md/brozime and should be searched for Archimedea, Steel Path and weapon-build notes in a follow-up.
- The Warframe forums thread "Help me clear archimedea..." returned HTTP 403 and was not read.
- No Reddit threads were retrieved.

---

## 7. Weapons and weapon categories considered strong for EDA and ETA in 2026

### Takeaway
I found only one low-trust, pre-Update-44 source naming specific weapons with reasons, and no creator tier list covering Archimedea. Treat specific weapon names as weak evidence; the category-level reasoning that follows from the rules is more defensible.

### Cited Findings
- COMMUNITY-CONSENSUS (single low-trust guide, last updated 2026-09-11, Update 43.5; the same four names were repeated verbatim by a search engine for ETA, which suggests one source being echoed rather than independent agreement):
  - Torid: "The Incarnon beam keeps stacking status into level 400 health pools."
  - Kuva Sobek: "With its augment it strips armor while it fires; armor is the whole problem here."
  - Kuva Nukor: "Chains status onto the pack so the melee and Galvanized guns scale."
  - Kronen Prime: "The melee that cashes in the primer, with reach for the crowds."
  — [warframe.today Deep Archimedea guide](https://warframe.today/deep-archimedea-guide/)
- COMMUNITY-CONSENSUS (search-result summary, not read in full): Reaper Prime with a heavy attack build "able to one-shot most foes thanks to guaranteed status effects"; melee favoured because ammo restrictions do not apply — [nerdburglars EDA weapons page](https://nerdburglars.net/question/best-weapons-for-elite-deep-archimedea/)
- COMMUNITY-CONSENSUS. Brozime grades Laetum, Felarx and Praedos S tier, Innodem A+, Phenmor A among Incarnons (as returned by search summary; undated, not Archimedea-specific) — [Brozime's Public Notes, Incarnons](https://publish.obsidian.md/brozime/Public/Guides+&+Builds/Guides/Other/Incarnons)
- WIKI-CONFIRMED [full read]. New Incarnon Genesis adapters added in Update 43.0 (2026-06-17): Vectis, Stug, Ballistica, Destreza, Obex, as week 9 of the Steel Path Circuit rotation. Full 9-week rotation list is on the Steel Path page — [SP](https://wiki.warframe.com/w/The_Steel_Path)
- WIKI-CONFIRMED [full read]. Exemptions written into the modifiers: Undersupplied "Has no effect on Exalted Weapons"; Ammo Deficit "Has no effect on Battery Weapons or Exalted Weapons" — [DA](https://wiki.warframe.com/w/Deep_Archimedea)

### Inferences
- Category reasoning from the rules (mine, not a cited tier list):
  - Melee: immune to every ammo modifier; hurt by Dull Blades (-50% combo chance) and by Myopic Munitions less than guns are. Strong default, weaker on Sealed Armor unless it can hit weak points.
  - Battery and Exalted weapons: explicitly exempt from one or two ammo modifiers.
  - Beam and high-status weapons: the guide's Torid and Nukor reasoning rests on status stacking; this weakens under Elemental Potency (+85% elemental resistance), Adaptive Aberrations and against the status-immune Techrot tank form.
  - Radial weapons: lose most value under Low Yield and Sealed Armor.
  - High single-hit weapons (snipers, heavy attacks): favoured by the post-40.0.3 MDPI increases and by the removal of attenuation from Necramechs, Demolishers and Babau.
  - Archguns: mandatory under Heavy Warfare, useful under Gear Embargo (still allowed).
  - Radiation- and Electricity-leaning builds for EDA (Murmur weaknesses), Magnetic or Void for Overguard weeks.
- The Kuva Sobek claim depends on armour being "the whole problem", which is disputed in section 6.
- Because the player is nudged onto one of three random weapons per slot, a "best weapons" list has limited practical value for Archimedea; the question that matters each week is "which of my three offered weapons is best, and with which of my mods".

### Gaps
- No dated, creator-authored EDA/ETA weapon tier list was retrieved. No post-Update-44 source was found at all, so the effect of Arsenal Boosts on weapon choice is UNKNOWN.
- Overframe was deliberately not consulted.
- The reasoning for Brozime's individual grades was not on the page read.

---

## 8. How randomised loadout restrictions change the value of an inventory-aware advisor

### Takeaway
Archimedea's loadout rows are generated per player from (mostly) the player's own inventory, can include unowned gear, can change mid-week when inventory changes, and since Update 44.0 carry a slot-wide Arsenal Boost. That makes "given these three weapons and the mods I own, which one and how do I build it for this week's modifiers" the central weekly question, which a generic build site cannot answer.

### Cited Findings
- WIKI-CONFIRMED [full read]. Rows differ between players, may contain unowned equipment, and "The first column of Loadout parameters will always attempt to be a Warframe or weapon the player currently owns." — [DA](https://wiki.warframe.com/w/Deep_Archimedea)
- WIKI-CONFIRMED [full read]. "When changing owned weapons and Warframes, either by building new ones or removing owned ones, the Loadout window may change during the week, even when Archimedea is unlocked with pulses." — [TA](https://wiki.warframe.com/w/Temporal_Archimedea)
- WIKI-CONFIRMED [full read]. Variants count ("Variants of equipment such as Primes or Syndicate Weapons are eligible"); for Kitguns and Zaws "Any combination of components will apply as long as one is equipped." — [DA](https://wiki.warframe.com/w/Deep_Archimedea)
- WIKI-CONFIRMED [full read]. Each matched row is worth 1 point per mission (3 per run); the reward thresholds are 28, 31, 34 and 37 on Elite with a maximum of 37 — [DA](https://wiki.warframe.com/w/Deep_Archimedea)
- WIKI-CONFIRMED [full read]. Update 44.0 Arsenal Boost: the buff "will be the same for each parameter ... Pick the Weapon or Warframe that works best with each boost for maximum efficiency!" DE reverted the bigger Warframe points "so players didn't feel 'forced' to match their Warframe" — [DA](https://wiki.warframe.com/w/Deep_Archimedea)
- WIKI-CONFIRMED [full read]. A script error was fixed for "accounts with a small number of weapons" when generating Archimedea conditions (Update 40.0), confirming generation reads the account's inventory — [DA](https://wiki.warframe.com/w/Deep_Archimedea)
- COMMUNITY-CONSENSUS (low-trust guide). "Equip it even if the weapon is bad and let the frame carry." — [warframe.today Deep Archimedea guide](https://warframe.today/deep-archimedea-guide/)
- WIKI-CONFIRMED [summarised fetch]. Arbitrations and The Circuit also impose or reward random weapon picks (Arbitration: a random Warframe and three weapons get +300% damage; Circuit: a random offered selection) — [Arbitrations](https://wiki.warframe.com/w/Arbitrations), [The Circuit](https://wiki.warframe.com/w/The_Circuit)

### Inferences
- The advisor's highest-value Archimedea workflow: the player enters the three offered weapons per slot plus the week's Deviations, Risk Variables and Personal Modifiers; the advisor ranks the nine weapons using only owned mods and arcanes, states the expected shortfall against a free choice, and says whether dropping that row (losing 3 points) is the better trade. The point thresholds make this a concrete calculation: a full Elite run is 37, the Legendary pool is at 34, so exactly one row or one Personal Modifier can be skipped without losing the Legendary roll.
- Because variants count, the advisor should map an offered base weapon to the best variant the player owns (Prime, Kuva, Tenet, Prisma, Incarnon-capable) before building.
- Offered weapons will often be unranked or have no Forma or Catalyst. The advisor needs to build under a real mod-capacity limit for the weapon's actual state, not assume a fully invested weapon.
- "Let the frame carry" fails in weeks where Personal Modifiers hit abilities (Powerless, Abbreviated Abilities, Shortened Reach, Constricted) or Vamp Rock is active; those are exactly the weeks where the forced weapon's build quality matters most.
- The unknown Arsenal Boost could change which of the three offered weapons is best (for example a flat damage boost favours whichever has the best base; a status or crit boost would not be neutral). The advisor needs a slot for it.

### Gaps
- Arsenal Boost values and whether they differ per slot or per week: UNKNOWN.
- The exact generation rule for columns two and three (owned versus unowned odds, whether mastered-and-sold weapons appear): not documented on the pages read.
- Whether there is an in-game or API-visible way to read the weekly rows automatically (so the advisor would not need manual entry): not researched.

---

## What a build advisor must model or let the player select (ranked by impact)

Derived from sections 1-8; sources are cited there.

1. **Enemy level, as a free input with presets.** Presets: Steel Path node (about 100-200), Deep Archimedea 250-275, Temporal 350-375, EDA 375-400, ETA 475-500, Archon Hunt 130-150, Steel Path Circuit (130 up to 9999), level cap 9999.
2. **Mode health and shield multiplier, separate from level.** Steel Path x2.5 health and shields. Archon Hunt, Netracells and both Archimedeas x2.0 solo, x2.5, x3.0, x3.5 by squad size up to x4.0 at four players. Squad size is an input.
3. **Faction, including "mixed".** EDA and Netracells: Murmur (weak Electricity and Radiation, resist Viral). ETA: Scaldra, Techrot, or both, plus Murmur with Beyond The Wall. Descendia and Circuit: mixed.
4. **Weekly Archimedea modifier selection** (Deviation and up to two Risk Variables per mission, four Personal Modifiers). The ones that must change the damage maths: Sealed Armor (x0.1 off weak points), Heavy Warfare (x0.05 non-heavy, x1.25 heavy), Elemental Potency (+85% elemental resistance), Adaptive Aberrations, Bolstered Belligerents (Overguard = 50% max health), Myopic Munitions (15m), Damage Link, Hostile Regeneration (10%/s after 5s), Bold Venture (+15% damage taken), Fissure Cascade (+1 level per 10s), Radioactive Breakdown (Radiation proc required), Low Yield (3m radius), Dull Blades (-50% combo chance), Terminal Velocity if it returns.
5. **Ammo economy as a scored constraint.** Undersupplied (-75% max ammo), Ammo Deficit (-75% pickups), Devil's Bargain (-50% ammo efficiency, +25% fire rate), Ammo Scarcity; with the stated exemptions for battery, Exalted and melee weapons. Output should include "time until dry" not just DPS.
6. **Offered-loadout mode.** Input: three weapons per slot. Output: best pick and build from owned mods at the weapon's real capacity, the gap versus a free choice, and whether skipping the row (minus 3 points; thresholds 28/31/34/37) is better. Map base weapons to owned variants.
7. **Boss and attenuation profile.** Flag targets with attenuation (Archons, The Fragmented One, H-09, Legacyte, Void Angels, Eidolons, Acolytes, Liches/Sisters/Coda) and model per-hit and per-second caps proportional to max health; report "reaches cap" rather than raw DPS. Flag targets that lost attenuation in Hotfix 40.0.2 (Necramechs, Demolishers, Babau, Dedicants, Gruzzlings) as plain health pools.
8. **Overguard handling.** Void +50%; Magnetic stacks up to 3.25x on Overguard; armour does not apply; crowd control and confusion blocked while it is up.
9. **Status immunity and proc immunity flags per target.** The Fragmented (Cold and Viral proc-immune), H-09 Techrot form (status-immune), Eidolons (all status except Void and Tau), Arbitration drones (status and ability immune), Profit-Taker (strip immune).
10. **Ability-dependence flag on a build.** Mark builds that need an ability strip, buff or grouper, and warn when Powerless, Abbreviated Abilities, Shortened Reach, Constricted, Energy Exhaustion, Framecurse, Fractured Armor or Vamp Rock is selected.
11. **Companion-dependence flag** (primer companions) for No Pets Allowed and for The Circuit.
12. **Arsenal Boost slot** (Update 44.0) per matched row, values to be filled once known.
13. **Peely Pix selection for ETA**, at least the weapon-replacing ones (+150/300/450% on EFV-8 Mars, Purgator 1, EFV-5 Jupiter, Dual Viciss), XL Frosty (+10/20/30% Cold) and Super Scavenger (+50% damage pack).
14. **Archgun builds** as a first-class weapon category (Heavy Warfare, Gear Embargo, Profit-Taker).
15. **Special-case content** kept out of generic ranking or given its own profile: Profit-Taker (four-element coverage), Eidolon shields (Operator Void only), Thrax spectral form (Operator/Drifter damage), Thermian Plating (only Thermian RPGs).
16. **Patch date stamp on every rule**, because Archimedea rules changed on 2025-10-15, 2025-10-16, 2025-10-21, 2026-05-14, 2026-09-23 and 2026-09-30.

## Open questions to verify in game

1. What exactly does the Arsenal Boost give for each matched row (Warframe, Primary, Secondary, Melee), with numbers, and does it change weekly? Only "Ability Strength" is confirmed.
2. Current Research Point values on the Archimedea screen after Hotfix 44.0.3: is every row 1 point per mission and the maximum 37?
3. Is one Personal Modifier now drawn from each of the four groups each week, and are any of the "Other" modifiers (Ammo Scarcity, Terminal Velocity, Vampyric Syndrome, Conductive, Concussive Drain, Sanguine Syndrome) still appearing?
4. Per-hit and per-second damage caps, as a fraction of max health, for The Fragmented One, the H-09 tank, Legacytes, Archons, Acolytes and the Archimedea revival Void Angel. The wiki's flat Archon figures (935,000 per second, 460,000 per trigger, 20% flat reduction, 50% status damage reduction) may be pre-Update-40.
5. Does armour strip measurably matter against Murmur, Scaldra and Techrot at level 375-500, or do health, shields and Overguard dominate? (Guide sites say strip is mandatory; the mode's own multipliers do not touch armour.)
6. Eximus spawn rate on Steel Path and the size of "increased chance of Eximus" in Archon Hunts, Netracells and Archimedea.
7. Netracell enemy level range.
8. Steel Path starting level and level growth rate for Void Cascade and Void Armageddon, and how many Exolizers or minutes reach levels 500, 1000 and 9999.
9. Do critical hits, weak-point multipliers and faction mods apply normally to Overguard?
10. Under Sealed Armor, which Murmur, Scaldra and Techrot units have reachable weak points, and do radial hits ever count as weak-point hits?
11. Under Heavy Warfare, do melee, abilities and status damage-over-time also take the 95% reduction?
12. Does Low Yield's 3m radius apply to Incarnon forms, beam chain range, melee slam radius and Exalted weapons?
13. Is the Only Knives Peely Pix damage bonus still bugged (not applied)?
14. How are Archimedea loadout columns two and three generated (odds of unowned gear, treatment of sold or mastered weapons), and how often does the list reshuffle when inventory changes?
15. In The Circuit, how many weapons are offered per slot, and do offered weapons the player owns use the player's own mod configuration?
16. Scaldra and Techrot trash-enemy health classes, armour values and elemental weaknesses (only the H-09 tank's were found).
17. Entropic Eximus (Update 44.0) damage reduction value and whether punch-through or AoE bypasses the bubble.
18. Rules for "Glacial Defiance", announced as coming soon in the Update 44.0 notes.
