# Warframe status effects (procs) for weapon builds — formula-level reference

Research date: 2026-10-05. Live game version at time of research: Update 44 "Iceblade of Narin" (2026-09-23), latest hotfix 44.0.3 (2026-09-30) — [Update 44](https://wiki.warframe.com/w/Update_44).

Labels: **WIKI-CONFIRMED** (stated on wiki.warframe.com, URL given), **COMMUNITY-CONSENSUS**, **DISPUTED**, **UNKNOWN**. "Reflects" = the newest patch-history entry on the cited page, i.e. how fresh the page is known to be.

Source caveats, read first:
- Almost everything below is from wiki.warframe.com pages fetched 2026-10-05. Several key sections carry the wiki's own "actively being worked on / community-derived" banners (Forced Procs, Heat Inherit, Status Duration table, Status Immune Enemies). Those are marked.
- Some pages were read in full (Status Effect, Slash, Heat, Viral, Corrosive, Gas, Electricity, Blast, Toxin, Magnetic, Cold, Puncture, Tau, Condition Overload, Condition Overload (Mechanic), Galvanized Aptitude, Overguard). Others were read through an automated summariser that quotes the page (Damage over Time, Status Chance, Galvanized Shot/Savvy, Rifle Elementalist, Secondary Encumber, Archon Shard, Acolytes, Demolisher, Archon Hunt, Update 41-44). Treat the second group's exact wording as slightly less certain.
- Community sources were thin. Reddit could not be fetched, the DE forum dev workshop returned HTTP 403, and Brozime's Obsidian vault exposed only one relevant note. No TheKengineer or Tactical Potato material was retrieved. Community-labelled items are therefore weakly sourced; see Gaps.
- I found no status-mechanic change in Updates 41, 42, 43 or 44 that alters a formula below (details in the last key question).

## 1. How a status proc is rolled

### Takeaway
Status chance is rolled independently per pellet/projectile per enemy hit; expected procs per second = fire rate x multishot x status chance, and the proc's type is chosen by each damage type's share of total modded damage with no physical/elemental weighting since Update 27.2.

### Cited Findings
- WIKI-CONFIRMED. Arsenal status chance is the per-pellet chance: "the status chance on a listed weapon in the Arsenal is the probability that each pellet will individually proc" (Strun Wraith: 12% on each of 10 pellets). Reflects U42.0 (2026-03-25) — [Status Effect § Multishot](https://wiki.warframe.com/w/Status_Effect#Multishot)
- WIKI-CONFIRMED. `Average procs per shot = Multishot x (Forced procs + Status chance per projectile)`; `Procs per second = that x Fire rate`. Wiki table: multishot 1.9 at 80% = 1.52 procs/shot; multishot 10 at 150% = 15 — [Status Effect § Average Procs](https://wiki.warframe.com/w/Status_Effect#Average_Procs)
- WIKI-CONFIRMED. Above 100%: "each hit may apply additional 'unique' status effects. The type of each proc is independently drawn, so it is possible to apply the same status several times in one hit." A weapon at 200% with only Heat and Impact can roll two Heat. Introduced U27.2 (2020-03-05) — [Status Effect § Status Chance](https://wiki.warframe.com/w/Status_Effect#Status_Chance)
- WIKI-CONFIRMED. Type selection: `Proc type chance = that type's damage / total damage`. Example: 20 Impact, 5 Puncture, 10 Slash, 25 Heat, 50 Corrosive (total 110) gives 18.18% / 4.55% / 9.09% / 22.73% / 45.45% — [Status Effect § Damage Distribution](https://wiki.warframe.com/w/Status_Effect#Damage_Distribution)
- WIKI-CONFIRMED. The old physical weighting is gone: U27.2 "removed 0.25x Multiplier for Elemental Status Effects, meaning all Elemental Status Effects are 4x more likely." Advice that IPS procs are weighted 4x is outdated (pre-March 2020) — [Status Effect § Patch History](https://wiki.warframe.com/w/Status_Effect#Patch_History)
- WIKI-CONFIRMED. U27.2 also made shotgun status per-pellet (base status of all shotguns x3 or more) and stopped the Arsenal folding multishot into displayed status chance. The "100% status shotgun breakpoint" is outdated — [same](https://wiki.warframe.com/w/Status_Effect#Patch_History)
- WIKI-CONFIRMED. Exception, immunity: enemy resistances do not change type weights, but a type the enemy is status-immune to is removed from the pool and the rest renormalise. Same weapon vs a Corrosion-immune enemy: Impact 33.33%, Puncture 8.33%, Slash 16.67%, Heat 41.67% — [Status Effect § Status Immunity Interactions](https://wiki.warframe.com/w/Status_Effect#Status_Immunity_Interactions)
- WIKI-CONFIRMED. Exception, Empyrean space combat: secondary elements have no status effect there and are excluded from the weighting — [Status Effect § Empyrean](https://wiki.warframe.com/w/Status_Effect#Empyrean)
- WIKI-CONFIRMED. Each enemy hit by one attack gets its own roll — [Status Effect § Status Chance](https://wiki.warframe.com/w/Status_Effect#Status_Chance)
- WIKI-CONFIRMED. Beam weapons: multishot still rolls status "as if more than one projectile was visually present" — [Status Effect § Continuous Weapons](https://wiki.warframe.com/w/Status_Effect#Continuous_Weapons)
- WIKI-CONFIRMED (section flagged by the wiki as community-derived and under research). Forced procs are guaranteed regardless of status chance and distribution, are independent of normal procs, and a forced-proc attack can also roll a normal proc. Sources include stance combos, heavy/slide/aerial attacks by weapon type, and some weapons — [Status Effect § Forced Procs](https://wiki.warframe.com/w/Status_Effect#Forced_Procs)
- WIKI-CONFIRMED. Tau status (Status Chance Vulnerability, +10%/stack, max 10 = +100%, 8 s) multiplies status chance received; forced procs gain nothing from it — [Tau Damage](https://wiki.warframe.com/w/Damage/Tau_Damage) (reflects U38.5, 2025-03-19)
- WIKI-CONFIRMED. Status chance mods "affect the base status chance of the weapon" — [Status Effect § Status Mods and Effects](https://wiki.warframe.com/w/Status_Effect#Status_Mods_and_Effects)

### Inferences
- Modded status chance = base x (1 + sum of status chance mod %). The wiki states mods act on base status chance but the fetched page gave no explicit formula, so the additive-sum form is inferred. Example: 30% base with Galvanized Aptitude (+80%) and one +60% dual-stat mod = 0.30 x 2.4 = 72%.
- Procs per pellet at status chance S: floor(S) guaranteed plus one more with probability frac(S). At 150%: one guaranteed, 50% chance of a second.
- Worked example used throughout: base 100 (30 Impact / 30 Puncture / 40 Slash), mods add 180 Viral and 90 Heat (as % of base), fire rate 6, multishot 1.9, status 78%. Procs/s = 6 x 1.9 x 0.78 = 8.89. Weights over 370: Viral 48.65% (4.33/s), Heat 24.32% (2.16/s), Slash 10.81% (0.96/s), Impact+Puncture 16.22% (1.44/s).
- Base damage mods (Serration) scale every type equally and do not change weights. Elemental mods and physical-type mods do change weights. This is why adding elements dilutes Slash procs.
- The wiki's Tau example is internally inconsistent: 5 stacks is said to give 150% of procs, yet "210% status would result in 305%" (210 x 1.5 = 315). Treat the exact Tau arithmetic as unverified.

### Gaps
- No explicit wiki formula for modded status chance, and no confirmation of how multiplicative status chance sources (if any) combine.
- Whether AoE/radial components roll status with the same chance as the direct hit was not confirmed on a current page (only a U27.1 fix: "projectile explosion & embed damage not properly using Status Chance upgrades").
- No per-weapon list of forced procs was collected.

## 2. Every status effect: exact effect, stacks, duration, rework history

### Takeaway
Fifteen damage types carry procs; the build-relevant ones are Viral (up to x4.25 health damage), Corrosive (up to 80% armour strip), Heat (DoT plus 50% armour strip), Slash (armour-ignoring DoT), Magnetic (up to x4.25 shield/Overguard damage), Cold (crit damage) and Puncture (crit chance). Update 36 reworked Blast, Cold and Magnetic; Gas got visuals only.

### Cited Findings
All rows WIKI-CONFIRMED from the [Status Effect table](https://wiki.warframe.com/w/Status_Effect#Status_Effects) (reflects U42.0, 2026-03-25) plus the linked type page.

| Type | Effect on enemy | Stacks | Duration | Last mechanical change |
|---|---|---|---|---|
| Impact | Stagger 1 s; Mercy-kill health threshold +8% per proc | 5 | 6 s | U33.6 (2023-07-27): cap 10 to 5, 4% to 8% |
| Puncture | Enemy deals 40% less damage, +10%/stack to 80%. Weapon hits on it get +5% crit chance/stack to +25%, "additive after mods", not AoE or abilities | 5 | 10 s | U33.6: crit chance added, cap 10 to 5 — [Puncture](https://wiki.warframe.com/w/Damage/Puncture_Damage) |
| Slash | Bleed: 35% of modded base damage per tick, bypasses armour, hits shields first | no limit, separate timers | 6 s, 6 ticks | U27.2: no longer bypasses shields — [Slash](https://wiki.warframe.com/w/Damage/Slash_Damage) |
| Heat | Ignite: 50% of modded base per tick as Heat; panic about 4 s; strips up to 50% armour | no limit, one merged tick, shared refreshing timer | 6 s | U26.0 (2019-10-31) — [Heat](https://wiki.warframe.com/w/Damage/Heat_Damage) |
| Cold | 50% slow, +5%/stack to 90% at 9. Crit multiplier +0.1 at 1 stack, +0.05/stack to +0.5 at 9. 10th stack: Frozen 3 s, +1.0 crit multiplier, then 3 stacks remain | 10 (4 on bosses and Overguard) | 6 s; Frozen 3 s | U36 (2024-06-18): 10th stack freeze. U33.6: crit damage added — [Cold](https://wiki.warframe.com/w/Damage/Cold_Damage) |
| Electricity | Tesla Chain: 50% of modded base per tick to enemies within 3 m; stuns original target 3 s | no limit, separate timers, merged into one tick/s | 6 s | U33.6: merged ticks — [Electricity](https://wiki.warframe.com/w/Damage/Electricity_Damage) |
| Toxin | Poison: 50% of modded base per tick as Toxin; bypasses shields | no limit, separate timers | 6 s | U27.2 — [Toxin](https://wiki.warframe.com/w/Damage/Toxin_Damage) |
| Blast | Detonate: 30% of modded base to the target after 1.5 s per stack. At 10 stacks or on target death all stacks detonate at once and enemies within 5 m take 300% per stack (max 3000%), no falloff; the original target does not take the AoE part | 10 | 1.5 s fuse | U36: full rework (was accuracy debuff) — [Blast](https://wiki.warframe.com/w/Damage/Blast_Damage) |
| Corrosive | Armour -26%, +6%/stack to -80% | 10 (+2/+3 per Emerald shard) | 8 s | U27.2; U35 shard cap — [Corrosive](https://wiki.warframe.com/w/Damage/Corrosive_Damage) |
| Gas | Cloud: 50% of modded base per tick as Gas in 3 m, +0.3 m/stack to 6 m; continues if host dies | 10 | 6 s | U27.2/27.3 mechanics; U36 visuals only — [Gas](https://wiki.warframe.com/w/Damage/Gas_Damage) |
| Magnetic | Damage to shields and Overguard +100%, +25%/stack to +325%; hinders shield regen; on shield/Overguard break, forced Electricity proc for 3% of max shields/Overguard per stack (max 30%) | 10 | 6 s | U36: Overguard bonus, break proc — [Magnetic](https://wiki.warframe.com/w/Damage/Magnetic_Damage) |
| Radiation | Confusion; enemy deals +100% damage to its allies, +50%/stack to +550% | 10 | 12 s | U27.2 |
| Viral | Damage to health +100%, +25%/stack to +325% | 10 | 6 s | U27.2 — [Viral](https://wiki.warframe.com/w/Damage/Viral_Damage) |
| Void | Bullet attractor, 2.5 m, 3 s | n/a | 3 s | — |
| Tau | Status Chance Vulnerability +10%/stack to +100% | 10 | 8 s | New in U37.0 (2024-10-02) — [Tau](https://wiki.warframe.com/w/Damage/Tau_Damage) |

- WIKI-CONFIRMED. For capped independent-timer statuses (Viral, Corrosive, Magnetic, Tau, Puncture) "any stacks applied after the [cap] will replace the oldest stack" — [Viral](https://wiki.warframe.com/w/Damage/Viral_Damage), [Puncture](https://wiki.warframe.com/w/Damage/Puncture_Damage)
- WIKI-CONFIRMED. Blast notes: "significantly weaker for single target damage than any other damaging status effect"; a killing blow that inflicts at least one Blast proc still triggers the full 300% 5 m explosion — [Blast § Notes](https://wiki.warframe.com/w/Damage/Blast_Damage)
- WIKI-CONFIRMED. U36 patch text for all four reworks, including Nullifier bubble damage from Magnetic raised to 300 min / 1200 max per shot — [Status Effect § Patch History](https://wiki.warframe.com/w/Status_Effect#Patch_History)
- DISPUTED (wiki vs itself). Magnetic shield regen: the Status Effect table says "nullifies shield regeneration"; the Magnetic page says "reduces natural shield regeneration"; the U36 note says "Reduced Shield Regeneration by a percentage per Magnetic stack" — [table](https://wiki.warframe.com/w/Status_Effect#Status_Effects) vs [Magnetic](https://wiki.warframe.com/w/Damage/Magnetic_Damage)
- WIKI-CONFIRMED. Hidden statuses that count as a status type: Knockdown, Lifted, Microwave (Nukor/Kuva Nukor, infinite duration) — [Status Effect § Independent from Damage](https://wiki.warframe.com/w/Status_Effect#Independent_from_Damage)
- WIKI-CONFIRMED. Enemy stacks are per-enemy; players can hold only one stack of most statuses (U27.2), except player Cold which since U42.0 (2026-03-25) is 10% slow x up to 4 stacks. That change does not affect enemies — [Cold § Patch History](https://wiki.warframe.com/w/Damage/Cold_Damage)

### Inferences
- Worked examples. Puncture: 30% base crit with +200% from mods = 90%, plus 5 Puncture stacks = 115%. Cold: wiki's own example, Kunai 1.6x with Primed Target Cracker and 9 Cold stacks = 1.6 x 2.1 + 0.5 = 3.86x. Blast: base 100 with Serration (265 modded base), one stack = 0.3 x 265 = 79.5 to the target; a 10-stack detonation deals 10 x 79.5 = 795 to the target and 3 x 265 x 10 = 7,950 to each neighbour.
- Cold and Puncture bonuses are flat additions after mods, so they are worth most on weapons with low crit multiplier or crit chance from mods and least on already crit-stacked weapons; they also do nothing for AoE damage.
- Radiation and Void have no direct DPS value for a single-target model.

### Gaps
- Exact magnitude of Magnetic's shield-regen reduction per stack is not given anywhere I found.
- Radiation and Impact pages were not read individually; values come from the summary table only.

## 3. Damage-over-time formulas (Slash, Heat, Toxin, Gas, Electricity, Blast)

### Takeaway
Every DoT tick is a fraction of modded base damage (base damage mods and faction only, no physical or elemental mods), times the matching single-element bonus, times faction again, times status damage, times the crit and body-part multipliers of the hit that caused it.

### Cited Findings
- WIKI-CONFIRMED. Shared core: `Modded Base Damage = Base Damage x (1 + Base Damage Bonuses) x (1 + Faction Bonuses)`, "ignoring physical and elemental damage bonuses" — [Slash](https://wiki.warframe.com/w/Damage/Slash_Damage), [Heat](https://wiki.warframe.com/w/Damage/Heat_Damage)
- WIKI-CONFIRMED. Tick formulas (Additional Multipliers = modded crit multiplier on a crit, and enemy body-part multiplier, multiplicative with each other):
  - Slash: `0.35 x MBD x (1 + Faction) x (1 + Status Damage) x Additional` — [Slash](https://wiki.warframe.com/w/Damage/Slash_Damage)
  - Heat: `0.5 x MBD x (1 + Heat bonuses) x (1 + Faction) x (1 + Status Damage) x Additional` — [Heat](https://wiki.warframe.com/w/Damage/Heat_Damage)
  - Toxin: `0.5 x MBD x (1 + Toxin bonuses) x (1 + Status Damage) x (1 + Faction)`, with crit/body-part multipliers inside MBD — [Toxin](https://wiki.warframe.com/w/Damage/Toxin_Damage)
  - Electricity: `0.5 x MBD x (1 + Electricity bonuses) x (1 + Faction) x (1 + Status Damage) x Additional` — [Electricity](https://wiki.warframe.com/w/Damage/Electricity_Damage)
  - Gas: `0.5 x MBD x (1 + Gas bonuses) x (1 + Faction) x (1 + Status Damage) x Additional` — [Gas](https://wiki.warframe.com/w/Damage/Gas_Damage)
  - Blast: `0.3 x MBD x (1 + Faction) x (1 + Status Damage) x Additional` on fuse expiry; `3 x MBD x ...` radial on early detonation — [Blast](https://wiki.warframe.com/w/Damage/Blast_Damage)
- WIKI-CONFIRMED. Worked examples from the wiki (base 100, Serration +165%, Bane +30%, Rifle Elementalist +90%):
  - MBD = 100 x 2.65 x 1.3 = 344.5
  - Slash tick = 0.35 x 344.5 x 1.3 x 1.9 = 297.82
  - Heat tick with Hellfire (+90%) = 0.5 x 344.5 x 1.9 x 1.3 x 1.9 = 808.37; Electricity with Stormbringer and Toxin with Infected Clip give the same 808.37
  - Gas, base 180, Hornet Strike +220%, Expel +30%, Pistol Elementalist: MBD 748.8; with Heat+Toxin mods tick = 0.5 x 748.8 x 1.3 x 1.9 = 924.77; with Leaded Gas (+300% Gas) tick = 0.5 x 748.8 x 4 x 1.3 x 1.9 = 3,699.07
- WIKI-CONFIRMED. Faction double dip: effective faction multiplier on DoTs is (1 + F)^2, i.e. +69% for a 30% Bane, +140.25% for a 55% Primed Bane — [Heat](https://wiki.warframe.com/w/Damage/Heat_Damage)
- WIKI-CONFIRMED. Element mods: single-element mods boost only their own proc (Hellfire boosts Heat procs). "DoTs of combined status effects (i.e. Gas, Blast) are not buffed by their component mods"; only literal Gas damage (Leaded Gas, Valence Formation) raises Gas ticks. Blast ticks are not raised even by Valence Formation or Thermal Transfer. The reverse holds: Toxin mods merged into Corrosive still buff a forced Toxin DoT. Physical mods (Sawtooth Clip, Buzz Kill) do not buff Slash procs — [Status Effect § DoT Damage Scaling](https://wiki.warframe.com/w/Status_Effect#DoT_Damage_Scaling), [Blast](https://wiki.warframe.com/w/Damage/Blast_Damage)
- WIKI-CONFIRMED. Crits and headshots carry into the proc; so do stealth bonus, melee/sniper combo counter, additive damage buffs and enemy debuffs. Sonar/Detect Vulnerability weakspots do not — [Status Effect § DoT Damage Scaling](https://wiki.warframe.com/w/Status_Effect#DoT_Damage_Scaling)
- WIKI-CONFIRMED. Gas clouds and Tesla Chains can themselves hit heads but have a 1x headshot bonus — [Gas](https://wiki.warframe.com/w/Damage/Gas_Damage), [Electricity](https://wiki.warframe.com/w/Damage/Electricity_Damage)
- WIKI-CONFIRMED. Timing: 1 tick/s. Slash, Heat, Toxin start after a 1 s delay (ticks at 1-6 s). Electricity and Gas tick immediately (0-5 s). `Total ticks = floor(Tick rate x (Duration - Delay)) + 1`, six ticks at base duration — [Status Effect § Status Damage](https://wiki.warframe.com/w/Status_Effect#Status_Damage), [Damage over Time](https://wiki.warframe.com/w/Damage_over_Time) (reflects U43.0, 2026-06-17)
- WIKI-CONFIRMED. Stacking: Slash and Toxin instances each keep their own timer and are not refreshable; Electricity keeps separate timers but since U33.6 deals one merged tick per second; Gas and Blast cap at 10 — [Damage over Time](https://wiki.warframe.com/w/Damage_over_Time), [Electricity § Notes](https://wiki.warframe.com/w/Damage/Electricity_Damage)
- WIKI-CONFIRMED (section flagged community-derived and incomplete). Heat: a new proc "both adds a stack and refreshes the duration of all currently active heat stacks", merged into one tick per second, so tick damage ramps linearly without limit while refreshed. The longest status duration applied is used on refresh. If the first Heat proc comes from a source without Heat/faction modifiers (an ability, Manifold Bond), those bonuses are lost for later procs; Elementalist-type status damage is exempt — [Heat § Heat Inherit](https://wiki.warframe.com/w/Damage/Heat_Damage)
- WIKI-CONFIRMED. Viral multiplies DoT ticks at tick time, not at application, and is applied once (not double dipped) — [Viral](https://wiki.warframe.com/w/Damage/Viral_Damage)
- WIKI-CONFIRMED. Slash ticks ignore armour entirely, so they deal the same per tick at any enemy level — [Slash](https://wiki.warframe.com/w/Damage/Slash_Damage)
- WIKI-CONFIRMED. Multishot: each pellet rolls its own proc from its own hit, so multishot scales the number of procs, not tick size — [Status Effect § Multishot](https://wiki.warframe.com/w/Status_Effect#Multishot)
- WIKI-CONFIRMED. U43.0 (2026-06-17) added a "Damage Over Time Preview" indicator on health bars for status DoTs; UI only — [Damage over Time](https://wiki.warframe.com/w/Damage_over_Time)

### Inferences
- Total damage of one proc at base duration = 6 x tick for Slash/Heat(unrefreshed)/Toxin/Electricity/Gas. Slash proc total = 2.1 x MBD x further multipliers; the others = 3.0 x MBD x element bonus x further multipliers.
- "Toxin mods boost Gas" and "Heat mods boost Gas" are outdated: before U27.2 Gas forced Toxin procs; since U27.2 it deals its own Gas DoT (patch note cited above), and the wiki's Gas example shows Heat+Toxin mods giving no bonus.
- A 90% Heat mod gives Heat procs x1.9 tick damage and also raises Heat's share of procs, so its value to a Heat build is super-linear. A 90% Toxin mod combined into Viral does not buff any DoT.
- Because crit multiplier is a straight multiplier on ticks, expected tick = tick x average crit multiplier of proccing hits. Crit and status are multiplicative for DoT builds, not alternatives.

### Gaps
- The Heat Inherit section is explicitly marked by the wiki as needing clarification; exactly which modifiers snapshot from the first proc is not settled.
- Whether a status-duration increase beyond 6 s adds whole ticks exactly per the floor formula for every DoT was not tested.
- Hunter Munitions and other on-crit forced Slash sources were not researched.

## 4. Multiplier statuses: Viral, Corrosive, Heat armour strip, Magnetic, Cold

### Takeaway
Viral multiplies all damage that lands on health by 2 + 0.25 x (stacks - 1), up to 4.25 at 10 stacks; Corrosive removes 20% + 6% x stacks of armour up to 80%; Heat removes 50% more multiplicatively; Magnetic does to shields and Overguard what Viral does to health.

### Cited Findings
- WIKI-CONFIRMED. `Damage to Health = Modded Damage x [2 + 0.25 x (Viral stacks - 1)]`. Works through armour, not on shields or Overguard; multiplicative with other bonuses. An attack deals its damage before applying its own Viral proc; multishot pellets of the same shot do not benefit from each other's Viral procs — [Viral](https://wiki.warframe.com/w/Damage/Viral_Damage) (reflects U36.0)
- WIKI-CONFIRMED. Wiki example: 100 damage hit with 1 Viral stack deals 200; its Slash ticks deal 70 while Viral lasts, then 35.
- WIKI-CONFIRMED. `Armour remaining = (1 - 50% if Heat) x [1 - (20% + 6% x Corrosive stacks)] x (1 - 18% x Corrosive Projections)`. 10 Corrosive + Heat = 10% armour left; with four Corrosive Projections 2.8% — [Corrosive](https://wiki.warframe.com/w/Damage/Corrosive_Damage) (reflects U42.0)
- WIKI-CONFIRMED. Against 90% damage reduction (capped armour), 1 Corrosive stack is about x2.3 effective damage and 10 stacks about x6; 14 stacks (two Emerald shards) fully strip and are about x1.67 over 10 stacks; one Tauforged Emerald gives 13 stacks = 98% — [Corrosive](https://wiki.warframe.com/w/Damage/Corrosive_Damage)
- WIKI-CONFIRMED. Heat strip ramps: 15%, 30%, 40%, 50% at 0.5 s steps (2 s to full); against 90% DR that is about x1.7, x2.5, x3, x3.6. It ramps back down over 6 s after the proc ends. Status duration mods slow the ramp (+100% duration means 4 s to full) — [Heat § Armor Stripping](https://wiki.warframe.com/w/Damage/Heat_Damage)
- WIKI-CONFIRMED. `Damage to Shields/Overguard = Modded Damage x [2 + 0.25 x (Magnetic stacks - 1)]`. Break proc: Electricity for 3% of max shields/Overguard per stack; base damage mods do not affect it, status damage mods apply twice (x3.61 for +90%), faction applies twice — [Magnetic](https://wiki.warframe.com/w/Damage/Magnetic_Damage) (reflects U38.5)
- WIKI-CONFIRMED. Overguard is neutral to every damage type except Void (+50%) and ignores armour — [Overguard](https://wiki.warframe.com/w/Overguard) (reflects U42.0)
- WIKI-CONFIRMED. Cold crit bonus: see table in section 2; applies "before critical tier is calculated", not to AoE — [Cold](https://wiki.warframe.com/w/Damage/Cold_Damage)
- WIKI-CONFIRMED. Hydroid's passive makes the first Corrosive proc strip 50%, reaching 100% at 10 stacks — [Corrosive](https://wiki.warframe.com/w/Damage/Corrosive_Damage)

### Inferences
- Worked examples. Viral 4 stacks: 2 + 0.75 = x2.75. Corrosive 5 stacks: 20 + 30 = 50% stripped. Corrosive 5 stacks + Heat: 0.5 x 0.5 = 25% armour left. Magnetic 10 stacks on a hit of 1,000: 4,250 to shields.
- Viral and armour strip multiply each other on armoured health, so Viral+Heat gives roughly x4.25 x 3.6 on capped-armour targets at full stacks, and Corrosive+Heat with a Viral primer is higher still. Converting armour strip to a damage multiplier needs the armour formula (other researcher).
- Viral multiplies Slash, Heat, Toxin, Gas and Electricity ticks on health, which is the mechanical basis of Viral+Slash and Viral+Heat.

### Gaps
- Whether Magnetic's bonus also applies to DoT ticks landing on shields/Overguard was not stated.
- Exact enemy armour cap and scaling after U36 are in another researcher's scope.

## 5. Status duration and status damage mods

### Takeaway
"+% Status Damage" is a final multiplier on status ticks only, additive with other status damage sources and multiplicative with everything else; status duration lengthens every timed effect, which adds ticks and stacks but slows Heat's armour strip and delays Blast.

### Cited Findings
- WIKI-CONFIRMED. Status Damage "is any damage dealt through a Status Effect tick (Slash, Heat, Toxin, Electricity, Gas, and Blast). Sources ... are multiplicative to other damage bonuses and additive to other sources of Status Damage bonuses" — [Status Effect § Status Damage](https://wiki.warframe.com/w/Status_Effect#Status_Damage)
- WIKI-CONFIRMED. Rifle Elementalist: +90% Status Damage, +0.6 punch through; introduced U36.0 (2024-06-18); "final multiplicative — applies AFTER faction damage multipliers"; additive with Emerald shard Toxin bonus — [Rifle Elementalist](https://wiki.warframe.com/w/Rifle_Elementalist)
- WIKI-CONFIRMED. Listed sources: Rifle/Shotgun/Pistol/Melee Elementalist, Galvanized Elementalist (melee), Burning Hate, Empowered Blades, Immunity Resistance, Boreal's Contempt, Emerald Archon Shard (Toxin only), Ash passive (Slash only), Conductive Sphere (Electricity only) — [Status Effect § Sources of Status Damage](https://wiki.warframe.com/w/Status_Effect#Sources_of_Status_Damage)
- WIKI-CONFIRMED. Emerald shard: "Toxin Status Effects deal +30% (+45%) more damage"; "Increase max stacks of Corrosion Status by +2 (+3)" (U35.0). Crimson: "+25% (+37.5%) Primary Status Chance" — [Archon Shard](https://wiki.warframe.com/w/Archon_Shard)
- WIKI-CONFIRMED (table flagged as under work). Status duration effects per type: more ticks for Bleed/Ignite/Poison/Tesla/Gas; longer Corrosion/Virus/Disrupt/Confusion/Weakened/Freeze; Blast fuse is delayed; Electricity stun unaffected; Heat strip ramp lengthened — [Status Effect § Status Duration](https://wiki.warframe.com/w/Status_Effect#Status_Duration)
- WIKI-CONFIRMED. Duration mods listed: Continuous Misery (rifle), Lingering Torment (shotgun), Perpetual Agony (pistol), Lasting Sting (melee), Hunter Track, and others — [same](https://wiki.warframe.com/w/Status_Effect#Status_Duration_2)
- WIKI-CONFIRMED. Status duration at or below -100% (Rivens) nullifies timed effects; Blast still deals damage — [Status Effect § Negative Status Duration](https://wiki.warframe.com/w/Status_Effect#Negative_Status_Duration), [Blast](https://wiki.warframe.com/w/Damage/Blast_Damage)

### Inferences
- Elementalist value = +90% of the DoT share of a build's damage and zero for the rest. Worked example: if DoTs are 40% of total damage, Rifle Elementalist is worth 0.4 x 0.9 = +36% total.
- Status duration raises steady-state stacks of Viral/Corrosive/Magnetic proportionally (mean stacks = proc rate x duration) until the cap, so it matters only for weapons that cannot reach the cap, plus DoT builds through extra ticks.

### Gaps
- Exact values of the status duration mods and of Galvanized Elementalist were not fetched.
- No "Primed"/Archon mod with a weapon status-damage stat was confirmed; Archon mods affect ability-applied statuses and were out of scope.

## 6. Mods and arcanes that scale with statuses on the target

### Takeaway
Condition Overload and the three Galvanized status mods add base-damage-type bonus per unique status type on the target; 16 types can count, the bonus does not apply to the hit that adds a new status, and it does not apply to radial damage.

### Cited Findings
- WIKI-CONFIRMED. Condition Overload: +80% melee damage per status type, no cap on types. `Total = Base x [1 + Damage Mods + 0.8 x n] x (1 + Elemental Mods)`. Does not apply to slams or radial attacks. Was 120% until U30.5 (2021-07-06) — [Condition Overload](https://wiki.warframe.com/w/Condition_Overload) (reflects Hotfix 31.1.3)
- WIKI-CONFIRMED. Galvanized Aptitude (rifle): +80% status chance; on kill +40% direct damage per status type for 20 s, 2 stacks (max +80% per type). Galvanized Savvy (shotgun): +80% status, +40% per type, 20 s, 2 stacks. Galvanized Shot (pistol): +80% status, +40% per type, 14 s, 3 stacks (max +120% per type) — [Galvanized Aptitude](https://wiki.warframe.com/w/Galvanized_Aptitude), [Galvanized Savvy](https://wiki.warframe.com/w/Galvanized_Savvy), [Galvanized Shot](https://wiki.warframe.com/w/Galvanized_Shot)
- WIKI-CONFIRMED. The bonus is "usually additive with other damage mods like Serration, with exceptions where it is multiplicative"; five behaviours are catalogued per attack (most hitscan additive as listed; many projectile weapons multiplicative; charged bows under-perform; explosion radius gets nothing) — [Condition Overload (Mechanic)](https://wiki.warframe.com/w/Condition_Overload_(Mechanic))
- WIKI-CONFIRMED. Not applied to the hit that inflicts a new status, but multishot pellets are sequential so later pellets benefit. Wiki example: 100 base, Serration, 2 stacks, multishot 3: 265, then 345, then 425 = 1,035 instead of 795 — [Galvanized Aptitude](https://wiki.warframe.com/w/Galvanized_Aptitude)
- WIKI-CONFIRMED. What counts as a status type: Impact, Puncture, Slash, Cold, Electricity, Heat, Toxin, Blast, Corrosive, Gas, Magnetic, Radiation, Viral, Void, plus Lifted, Knockdown and Microwave; max 16 at once since Lifted and Knockdown cancel. Statuses from any source count (other weapons, abilities, companions, squadmates). The Condition Overload page also lists Tau; the Galvanized pages do not — [Condition Overload](https://wiki.warframe.com/w/Condition_Overload), [Galvanized Aptitude](https://wiki.warframe.com/w/Galvanized_Aptitude)
- WIKI-CONFIRMED. Because the bonus is part of modded base damage, it raises proc damage, including Blast/Electricity/Gas procs carried to their radius — [Condition Overload](https://wiki.warframe.com/w/Condition_Overload)
- WIKI-CONFIRMED. Only kills by the weapon holding the Galvanized mod build its stacks; proc kills count — [Galvanized Aptitude](https://wiki.warframe.com/w/Galvanized_Aptitude)
- WIKI-CONFIRMED. Secondary Encumber: "On Status Effect: +24% chance to trigger a second random Status Effect" from 13 types (IPS, four primary, six combined); at most one extra proc per instant; works with forced procs and exalted weapons since U38.5 — [Secondary Encumber](https://wiki.warframe.com/w/Secondary_Encumber)
- WIKI-CONFIRMED. Archon shard effects keyed to statuses are ability-damage bonuses (Emerald: +10%/+15% ability damage vs Corrosion; Topaz: vs Radiation; Violet: vs Electricity) plus Topaz "Secondary Critical Chance by 1% (1.5%) every time you kill an enemy affected by Heat Status. Max 50% (75%)" — [Archon Shard](https://wiki.warframe.com/w/Archon_Shard)
- WIKI-CONFIRMED. U41 (2025-12-10) added arcanes Primary Bulwark, Primary Debilitate and Secondary Irradiate; mechanics were not in the patch excerpt — [Update 41](https://wiki.warframe.com/w/Update_41)

### Inferences
- Worked example, additive case: Serration (+165%) and Galvanized Aptitude at 2 stacks with 4 status types on target: 1 + 1.65 + 0.8 x 4 = 5.85 vs 2.65 without, a x2.21 increase. With 8 types: 9.05, x3.42. On multiplicative-behaviour weapons the same 4 types give 2.65 x 4.2 = 11.13.
- The Galvanized bonus is zero until the first kill and decays one stack at a time, so a calculator needs an assumed uptime (0, 1, or max stacks).
- Each distinct status type is worth the same flat increment, so the eighth type is worth far less relative damage than the second. This sets the diminishing return of priming.

### Gaps
- No verified per-weapon table of additive vs multiplicative Galvanized behaviour was extracted (the wiki has an Attack Catalog that I did not read).
- Primary Encumber, Primary Blight, Primary Debilitate, Secondary Irradiate, Melee Influence and similar arcanes were not individually verified. "Primary Encumber" may not exist; only Secondary Encumber was confirmed.

## 7. Priming

### Takeaway
A primer is a weapon or companion used to put many distinct status types (and Viral/Corrosive stacks) on a target so that the damage weapon's per-status-type bonuses and multiplier statuses are already active; this is weakly sourced here and should be treated as community practice, not a measured rule.

### Cited Findings
- WIKI-CONFIRMED. Statuses from any source count for Condition Overload and Galvanized bonuses, which is what makes priming work — [Condition Overload](https://wiki.warframe.com/w/Condition_Overload)
- WIKI-CONFIRMED. Wiki tips for primers: high fire rate or AoE with innate elements (Staticor, Pox); Cedo alt-fire procs Toxin, Cold, Electricity, Heat, Blast plus Slash; Nukor/Kuva Nukor add the unique Microwave status; melee with many damage types (Lesion, Ceti Lacera, Pathocyst, Tatsu, up to 6 types) — [Condition Overload § Tips](https://wiki.warframe.com/w/Condition_Overload)
- WIKI-CONFIRMED. Companion primers named by the wiki: Diriga (Electricity), Sweeper/Sweeper Prime, Artax (guaranteed Cold), Cryotra, Helstrum, Prisma Burst Laser — [Condition Overload § Tips](https://wiki.warframe.com/w/Condition_Overload)
- COMMUNITY-CONSENSUS (low-trust, unauthored site, "current through Update 43.5", updated 2026-09-11). Secondary primers: Kuva Nukor ("still the primer every melee build wants"), Epitaph, Tenet Cycron, Atomos, Ocucor, Catabolyst. Primary: Torid, Cedo, Bubonico, Kuva Kohm, Sporothrix, Ignis Wraith — [warframe.today](https://warframe.today/best-status-weapons/)
- COMMUNITY-CONSENSUS (forum thread snippet only, not read in full). "Kuva Nukor and Epitaph, are great Primers" — [DE forums thread](https://forums.warframe.com/topic/1417907-kuva-nukor-vs-epitaph-prime-as-a-good-secondary-and-which-pet-you-run/)

### Inferences
- Priming value in a model = (per-type bonus x number of extra types the primer adds) on the additive damage bracket, plus bringing Viral/Corrosive/Magnetic/Cold/Puncture stacks to cap before the main weapon fires.
- A weapon with high status chance and many damage types "self-primes" and gains less from an external primer.

### Gaps
- No creator-authored (Brozime, TheKengineer, Tactical Potato) priming guide was retrieved. Typical primer builds and how many types a primer realistically sustains are unverified.

## 8. Status immunity and resistance

### Takeaway
Most enemies can be statused, including Eximus under Overguard (crowd-control parts are ignored and Cold caps at 4), but several bosses are fully immune and some elites cap at 4 stacks, which cuts Viral from x4.25 to x2.75 and Corrosive from 80% to 44%.

### Cited Findings
- WIKI-CONFIRMED. Enemy Overguard: "they can receive Status Effects but while their Overguard is active they will completely ignore the crowd control effects of Stagger, Knockdown, Stun, Mind Control, Confusion (including Radiation procs), Slow, Ragdoll, Blind, and Lifted, and can normally only receive a maximum of 4 Cold procs" — [Overguard § Enemy](https://wiki.warframe.com/w/Overguard) (reflects U42.0)
- WIKI-CONFIRMED. Viral does not amplify damage to Overguard (fixed U31.6, 2022-06-09) — [Viral § Patch History](https://wiki.warframe.com/w/Damage/Viral_Damage)
- WIKI-CONFIRMED (list flagged as under work). Fully status immune: Eidolons and Vomvalysts, Exploiter Orb, Profit-Taker Orb, Ropalolyst, Tusk Thumpers, Arbitration Shield Drone, Regulator, Desert Skate — [Status Effect § Status Immune Enemies](https://wiki.warframe.com/w/Status_Effect#Status_Immune_Enemies)
- WIKI-CONFIRMED. Viral-proc immune: Ambulas, Deimos Carnis/Genetrix/Jugulus/Therid/Saxum/Leaping Thrasher, Demolisher Boiler/Thrasher/Charger/Juggernaut, Tusk Bolkor/Firbolg, Techrot Babau — [Viral](https://wiki.warframe.com/w/Damage/Viral_Damage)
- WIKI-CONFIRMED. Acolytes (Steel Path): "can only receive up to 4 stacks of any Status Effect with the exception of Impact which can stack up to 3 times" (U29.5); neutral to every element since U36; standardised damage attenuation since U40.0 (2025-10-15) — [Acolytes](https://wiki.warframe.com/w/Acolytes)
- WIKI-CONFIRMED. Bosses and Overguard targets take max 4 Cold stacks and cannot be Frozen; VIP enemies with Overguard are meant to take max 3 Puncture stacks — [Cold](https://wiki.warframe.com/w/Damage/Cold_Damage), [Puncture § Patch History](https://wiki.warframe.com/w/Damage/Puncture_Damage)
- WIKI-CONFIRMED. Demolishers: immune to confusion, knockdown, lifted, stagger, stun; do not freeze at 10 Cold but are slowed 90%; Infested Demolishers immune to Viral — [Demolisher](https://wiki.warframe.com/w/Demolisher)
- WIKI-CONFIRMED. Archons: "immune to armor reduction", have per-instance and per-second damage caps, and gain "complete Status Effect immunity" during invulnerability phases — [Archon Hunt](https://wiki.warframe.com/w/Archon_Hunt)
- WIKI-CONFIRMED. Heat panic and Electricity stun do not affect Ospreys, bosses or Overguard enemies; the damage still applies — [Heat](https://wiki.warframe.com/w/Damage/Heat_Damage), [Electricity](https://wiki.warframe.com/w/Damage/Electricity_Damage)
- COMMUNITY-CONSENSUS (old Fandom wiki snippet, outdated source). Necramechs take max 4 stacks of any status — [Fandom](https://warframe.fandom.com/wiki/Necramech_(Enemy))

### Inferences
- Build consequence: against fully immune bosses status chance is worth zero and builds should go crit/raw/faction. Against 4-stack-capped elites Viral is still x2.75, so status keeps most of its value but over-investing in proc rate is wasted. Against Archons Corrosive and Heat strip are worthless.
- Against Overguard only Magnetic amplifies damage; Viral, Corrosive and Heat strip do nothing until Overguard is gone. Slash's armour bypass is irrelevant to Overguard, which has no armour.
- Steel Path itself adds no status immunity that I found; its relevance is higher health/armour and Acolytes.

### Gaps
- No source found for Deep/Temporal Archimedea status-related modifiers or for Thrax, Liches/Sisters, The Fragmented, or Demolisher Necramech status caps. UNKNOWN.
- The wiki's immune-enemy list is flagged incomplete.

## 9. Elemental combination choices: current vs outdated

### Takeaway
Viral+Slash and Viral+Heat remain the default recommendations in 2026 and Corrosive+Heat the armour specialist; the mechanics above support all three, but the community evidence gathered here is thin.

### Cited Findings
- COMMUNITY-CONSENSUS (low-trust, unauthored, current through U43.5). "Viral plus Slash or Viral plus Heat is the default; Corrosive plus Heat against heavy Grineer armor"; Magnetic + Toxin for Corpus and Overguard; Gas for groups — [warframe.today](https://warframe.today/best-status-weapons/)
- COMMUNITY-CONSENSUS (Brozime, undated note). "Magnetic is a safe choice for any gun as it will always help them deal with Eximus more effectively"; weapons wanting Toxin "usually use that to combine into Corrosive/Viral with only 1 elemental mod" — [Brozime: Lich Weapons](https://publish.obsidian.md/brozime/Public/Guides+&+Builds/Guides/Kuva+Lich,+Sisters+of+Parvos,+&+Coda/Lich+Weapons)
- COMMUNITY-CONSENSUS (Reddit search snippet only, thread not readable). "Blast and Magnetic got one heck of a upgrade last year and are generally solid choices" — [r/Warframe: status types in 2026](https://www.reddit.com/r/Warframe/comments/1rf12da/status_types_in_2026/)
- COMMUNITY-CONSENSUS (Steam thread snippet only). "Blast is really only good on rapid-fire status-based weapons because of how the status effect stacks work" — [Steam discussion](https://steamcommunity.com/app/230410/discussions/0/4514379280329122094/)
- WIKI-CONFIRMED. Faction vulnerabilities after U36 simplification: Grineer and Kuva Grineer vulnerable to Corrosive; Corpus to Magnetic and Puncture; Infested to Heat; Deimos Infested to Gas and Blast, resistant to Viral; Murmur vulnerable to Electricity, resistant to Viral; Orokin vulnerable to Viral and Puncture; Narmer vulnerable to Toxin, resistant to Magnetic; Sentient resistant to Corrosive — patch histories of [Corrosive](https://wiki.warframe.com/w/Damage/Corrosive_Damage), [Magnetic](https://wiki.warframe.com/w/Damage/Magnetic_Damage), [Viral](https://wiki.warframe.com/w/Damage/Viral_Damage), [Gas](https://wiki.warframe.com/w/Damage/Gas_Damage), [Electricity](https://wiki.warframe.com/w/Damage/Electricity_Damage), [Toxin](https://wiki.warframe.com/w/Damage/Toxin_Damage)
- WIKI-CONFIRMED. Wiki tip: Corrosive plus Viral "to create a deadly damage combo against enemies with armor" — [Corrosive § Tips](https://wiki.warframe.com/w/Damage/Corrosive_Damage)

### Inferences
Status of common advice, judged against the formulas (my assessment, not a cited ruling):
- Still correct: Viral+Slash (Viral multiplies armour-ignoring bleed); Viral+Heat (x4.25 health, 50% strip, ramping DoT); Corrosive+Heat on armour, ideally with Viral supplied by a primer; Magnetic versus Corpus shields and all Overguard since U36; Radiation mainly for its damage-type modifier, since its proc adds no DPS.
- Changed since U36: Blast is now a damage proc suited to fast, high-status, crit/headshot weapons that kill quickly (300% per stack AoE on kill); weak single-target. Cold is now a crit-damage tool (+0.5, +1.0 frozen) for direct-hit crit weapons. Puncture adds up to +25% crit chance.
- Outdated: "Corrosive fully strips armour permanently" (pre-U27.2); "Viral halves health" (pre-U27.2); "Slash bypasses shields" (pre-U27.2); "IPS procs are weighted 4x" (pre-U27.2); "100% status shotguns" (pre-U27.2); "Blast is an accuracy debuff / useless" (pre-U36); "Toxin or Heat mods scale Gas procs" (pre-U27.2); "Electricity procs each tick separately" (pre-U33.6).
- Gas builds need literal Gas damage (Leaded Gas-type mods, innate Gas) to scale ticks; otherwise Gas is a 0.5x-base AoE DoT with no element multiplier.
- Electricity: same tick formula as Heat with Electricity mods, AoE within 3 m, no refresh, stun wasted on Overguard; good versus Murmur and Amalgam by vulnerability.

### Gaps
- No direct, dated statements from Brozime, TheKengineer or Tactical Potato on 2026 element choices were retrieved. The "still correct" list is inference from formulas plus low-trust consensus.
- The U36 dev workshop post (forums.warframe.com topic 1395463) returned 403; its text was read only as reproduced in wiki patch histories.

## 10. Assigning numeric value to status chance and each proc in a DPS model

### Takeaway
Model each status type as a Poisson arrival stream with rate = fire rate x multishot x status chance x type weight, then convert to expected stack multipliers (capped statuses) and DoT DPS; the value of a status mod is the change in total modelled DPS it causes.

### Cited Findings
- WIKI-CONFIRMED inputs: procs/s formula ([Status Effect § Average Procs](https://wiki.warframe.com/w/Status_Effect#Average_Procs)); type weights ([§ Damage Distribution](https://wiki.warframe.com/w/Status_Effect#Damage_Distribution)); stack caps and durations (section 2); oldest-stack replacement ([Viral](https://wiki.warframe.com/w/Damage/Viral_Damage)); tick formulas (section 3); Heat refresh ([Heat](https://wiki.warframe.com/w/Damage/Heat_Damage)); hit lands before its own proc applies ([Viral](https://wiki.warframe.com/w/Damage/Viral_Damage)).

### Inferences
Everything below is a proposed model, not sourced.
- Rates. `L = FR x MS x SC x V` (V = 1 + 0.1 x Tau stacks), `L_t = L x w_t`, with w_t renormalised after removing immune types.
- Capped independent-timer statuses (Viral, Corrosive, Magnetic, Puncture, Cold, Tau). In steady state the stack count is min(N, cap) with N ~ Poisson(L_t x D). Expected multiplier = sum over k of P(N = k) x f(min(k, cap)). Viral f(0) = 1, f(n) = 1.75 + 0.25n. Computed values for D = 6 s:

  | Viral procs/s | Mean stacks | Expected health multiplier |
  |---|---|---|
  | 0.25 | 1.5 | 1.96 |
  | 0.5 | 3 | 2.46 |
  | 1 | 6 | 3.23 |
  | 2 | 12 | 4.11 |
  | 4 | 24 | 4.25 |

  Corrosive (D = 8 s, strip = 0.20 + 0.06n): 0.25/s gives 29% expected strip, 0.5/s 44%, 1/s 65%, 2/s 80%.
- Ramp-up. Over a kill window T shorter than D, use N ~ Poisson(L_t x t) and average over t in [0, T]; apply an enemy stack cap (4 for Acolytes) by lowering the cap. A simple approximation: average multiplier is about f(min(L_t x T / 2, cap)).
- DoT DPS. Slash/Toxin/Electricity/Gas steady state: `DPS = L_t x ticks x tick`, ticks = 6 at base duration, tick computed with the average crit and headshot multiplier of hits. Heat with refresh: stacks at time t = L_heat x t, so DPS(t) = L_heat x t x tick and average over T is L_heat x T x tick / 2; needs a TTK or window assumption. Blast: per proc 0.3 x MBD to the target; AoE 3 x MBD per stack only if multiple enemies are modelled.
- Then apply Viral's expected multiplier to all health damage (hits and ticks), armour after expected Corrosive and Heat strip to non-Slash damage, Magnetic to shield/Overguard phases, Cold crit-multiplier and Puncture crit-chance additions to direct hits, and the Galvanized/Condition Overload term using the expected number of distinct types present, P(type present) = 1 - exp(-L_t x D_t).
- Worked example (weapon from section 1: 8.89 procs/s; Viral 4.33/s, Heat 2.16/s, Slash 0.96/s; base 100 with Serration, MBD 265, no crits). Viral mean stacks 26, multiplier 4.25. Slash tick 0.35 x 265 = 92.75; steady DPS 0.96 x 6 x 92.75 = 535 before Viral, 2,273 on health with Viral. Heat tick with one 90% Heat mod = 0.5 x 265 x 1.9 = 251.75 per stack; after 10 s about 21.6 stacks = 5,445/s before armour and Viral.
- Value of a status chance mod. Compute model DPS with and without the mod; the gain comes from higher L. Viral saturates: raising Viral procs from 2/s to 4/s moves the multiplier only 4.11 to 4.25 (+3%), while 0.25/s to 0.5/s is +26%. DoT DPS is linear in L and never saturates (Heat is quadratic in time). So status chance is worth most on low-proc-rate weapons and on DoT builds, and near zero for Viral purposes on fast, high-multishot weapons already near cap.
- Compare against crit mods inside the same model, since crit multiplies DoT ticks.

### Gaps
- The Poisson steady-state treatment ignores burst structure (shotgun pellets arriving together, reloads) and the rule that a hit does not benefit from its own proc; for slow, high-multishot weapons a per-shot simulation is more accurate.
- No in-game validation of any expected-stack number was done.

## What changed in 27.2, 36 and since (including 2026)

### Takeaway
The structural rules date from U27.2 (2020) and U36 (2024); nothing in 2025-2026 patches found here changes a status formula.

### Cited Findings
- WIKI-CONFIRMED. U27.2 (2020-03-05): status above 100% gives extra procs; per-pellet shotgun status; elemental proc weighting x4 (0.25x removed); Viral and Magnetic became stacking damage multipliers; Corrosive became 26% + 6% to 80% for 8 s; Slash no longer bypasses shields; Toxin and Gas durations set to 6 s; Gas became its own AoE DoT — [Status Effect § Patch History](https://wiki.warframe.com/w/Status_Effect#Patch_History)
- WIKI-CONFIRMED. U33.6 (2023-07-27): Puncture and Cold gained crit bonuses; Impact/Puncture caps to 5; Electricity ticks merged — [same](https://wiki.warframe.com/w/Status_Effect#Patch_History), [Electricity](https://wiki.warframe.com/w/Damage/Electricity_Damage)
- WIKI-CONFIRMED. U36.0 (2024-06-18): Blast, Cold, Magnetic reworks, Gas visuals, faction resistance simplification, Elementalist mods — [same](https://wiki.warframe.com/w/Status_Effect#Patch_History), [Rifle Elementalist](https://wiki.warframe.com/w/Rifle_Elementalist)
- WIKI-CONFIRMED. U37.0 (2024-10-02): Tau status added. U38.5 (2025-03-19): parrying blocks enemy statuses; tooltips. U40.0 (2025-10-15): Acolyte attenuation. U41 (2025-12-10): new arcanes. U42.0 (2026-03-25): player Cold and Arctic Eximus rework, boss status UI. U43.0 (2026-06-17): DoT preview on health bars. U44 (2026-09-23): Banshee rework applies Puncture/Blast/Impact via abilities; Entropic Eximus "Damage from non-melee sources is reduced by 90%" (44.0.1) — [Status Effect](https://wiki.warframe.com/w/Status_Effect#Patch_History), [Acolytes](https://wiki.warframe.com/w/Acolytes), [Update 41](https://wiki.warframe.com/w/Update_41), [Update 42](https://wiki.warframe.com/w/Update_42), [Update 43](https://wiki.warframe.com/w/Update_43), [Update 44](https://wiki.warframe.com/w/Update_44)

### Inferences
- The Entropic Eximus line in 44.0.1 may matter to gun builds generally; it was a single summarised quote and its context is unverified.

### Gaps
- Update pages for 41-44 were read through a summariser asked for status-related lines; a relevant change phrased differently could have been missed. Update 39 and 40 pages were not read directly.

## What a build calculator must model (ranked by impact)

1. Proc rate per type: fire rate x multishot x status chance x damage-share weight, with status above 100% and immune types removed.
2. Viral expected stacks and the health multiplier 2 + 0.25 x (n - 1), capped at 10 (or 4 on capped elites), applied to hits and DoT ticks.
3. Armour strip: Corrosive 20% + 6% x n (cap 10, up to 14 with Emerald shards) and Heat 50%, multiplicative, fed into the armour formula.
4. DoT damage with the modded-base rule: only base damage mods and faction in the base, faction squared, single-element mod bonus for matching procs, status damage as a final multiplier, crit and headshot carried through.
5. Heat's refresh-and-accumulate behaviour (needs a time window) versus Slash/Toxin independent six-tick instances.
6. Galvanized / Condition Overload bonus per distinct status type, additive with base damage mods by default, with stack uptime and the "not on the applying hit" rule; flag multiplicative-behaviour weapons.
7. Target profile switches: fully status immune, 4-stack cap, Overguard phase (only Magnetic amplifies), shields (Toxin bypasses, Magnetic amplifies), armour-strip immunity (Archons).
8. Dilution: each added element or physical mod changes type weights, reducing other procs.
9. Magnetic multiplier on shields/Overguard and its break proc.
10. Cold flat crit-multiplier and Puncture flat crit-chance bonuses on direct hits only.
11. Combined-element DoTs (Gas, Blast) not scaling with component mods; Blast AoE only when multiple targets are modelled.
12. Status duration effects on stack counts and tick counts.
13. External priming input: a user-set list of statuses already on the target.
14. Tau status chance vulnerability and Secondary Encumber's 24% extra random proc.

## Open questions to verify in game

1. Exact modded status chance formula, and whether any source is multiplicative.
2. Whether AoE/radial hits roll status at the full listed chance per enemy.
3. Heat inherit: precisely which modifiers snapshot from the first proc, and whether crit multiplier is per-proc or inherited.
4. Whether status duration adds DoT ticks exactly per floor(duration - delay) + 1.
5. Magnetic: does it fully stop or only reduce shield regen, and does it amplify DoT ticks on shields/Overguard?
6. Cold and Puncture bonuses on beam, chain and multishot hits; confirm "not AoE" boundaries.
7. Stack caps on Liches/Sisters, Thrax, Necramechs, The Fragmented, Archons outside invulnerability, and any Archimedea modifiers.
8. Per-weapon additive vs multiplicative Galvanized behaviour for the weapons the app supports.
9. Whether Tau counts for Galvanized mods (wiki pages disagree) and the true Tau arithmetic.
10. Whether same-shot pellets benefit from each other's Corrosive/Magnetic procs (wiki states they do not for Viral).
11. Context and scope of the U44.0.1 Entropic Eximus "non-melee damage reduced by 90%" line.
12. Current mechanics of Primary Debilitate, Secondary Irradiate, Primary Blight and Melee Influence.
