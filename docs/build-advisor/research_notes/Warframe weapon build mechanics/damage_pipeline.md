# Warframe gun damage pipeline (primaries and secondaries), as of 2026-10-05

**Scope.** Player-side damage-per-hit maths after the arsenal number. Enemy armour, health types and status effects in depth are another researcher's job.

**Game version.** The latest mainline update found is Update 44 "Iceblade of Narin" (2026-09-23), hotfix 44.0.3 ([forum notes](https://forums.warframe.com/topic/1523956-update-44-iceblade-of-narin/)).

**Labels.** Every rule carries one of:
- WIKI-CONFIRMED: stated on wiki.warframe.com (page cited).
- COMMUNITY-CONSENSUS: stated by a named community source.
- DISPUTED: sources disagree.
- UNKNOWN: no reliable source found.

**Reliability caveats.**
- I read these wiki pages directly: Damage/Calculation, Critical Hit, Multishot, Faction Damage Bonus, Calculating Bonuses, Condition Overload (Mechanic), Damage Falloff, Area of Effect, Damage over Time, Stealth.
- The other wiki pages were read by sub-researchers. Because of rate limits, many of their quotes came through a summarising fetcher, so they are near-verbatim, not guaranteed exact. Spot-check any value before hard-coding it.
- The wiki marks Damage/Calculation as "actively being worked on and may not be completely correct", and Condition Overload (Mechanic) as UpdateMe/CleanUp.
- Brozime's Obsidian vault has no formula text (details under Gaps in the first section). No written material from TheKengineer or Tactical Potato was found. Nothing here is attributed to them.
- Reddit could not be scraped, so Reddit items are search snippets only.

**Version timeline of rules that changed** (all from official patch notes mirrored on the wiki's Update pages):

| Update | Date | Change |
| --- | --- | --- |
| 13.5 | 2014-05-28 | Crit chance over 100% gives a guaranteed crit plus a chance of the next tier |
| 21.0 | 2017-06-29 | Orange crits added (visual only) |
| 22 | 2017 | Hitscan range limit 300 m, snipers 1000 m |
| 27.2 | 2020-03-05 | Status chance is per pellet; shotgun status x3 or more; status over 100% gives two procs; physical proc x4 weighting removed; multishot becomes its own stat; self-damage replaced by stagger; 90% radial falloff |
| 27.2.2 | 2020 | Per-weapon radial falloff (20-80%); arsenal shows radial data |
| 29.10 | 2021-03-19 | "Fixed the Bane Mods applying the increased Damage twice" (DoT double dip survived) |
| 30.5 | 2021-07 | Galvanized mods and Primary/Secondary arcanes introduced |
| 32 | 2022-09-07 | Headshot multiplier 2x to 3x; radial damage cannot headshot; ammo pickup rework; Merciless lost +100% ammo max |
| 36 | 2024-06-18 | Faction-based resistances; enemy armour cap 2700 (90% DR); Blast/Cold/Magnetic/Gas reworks; new Status Damage stat (Elementalist mods); Cannonade mods |
| 38 | 2024-12-13 | Acuity mods (+350% weak point damage and crit chance, multishot locked) |
| 40 | 2025-10-15 | Damage attenuation reworked (bosses only after 40.0.2) |
| 41 | 2025-12-10 | Focus-school passive weapon bonuses; Elemental Ammo instance change |
| 43 | 2026-06-17 | Primary Compression arcane; DoT preview bar |
| 44 | 2026-09-23 | Many "On Headshot" triggers became "On Weakpoint" (Deadhead, Argon/Galvanized Scope, Hydraulic/Galvanized Crosshairs, Arcane Precision, Longbow Sharpshot); Sonar spots count as weak points |

Sources for the table: [Update 27](https://wiki.warframe.com/w/Update_27), [Update 29](https://wiki.warframe.com/w/Update_29), [Update 32](https://wiki.warframe.com/w/Update_32), [Update 36](https://wiki.warframe.com/w/Update_36), [Update 38](https://wiki.warframe.com/w/Update_38), [Update 40](https://forums.warframe.com/topic/1470920-update-40-the-vallis-undermind/), [Update 41](https://wiki.warframe.com/w/Update_41), [Update 43](https://forums.warframe.com/topic/1509589-update-43-jade-shadows-constellations/), [Update 44](https://forums.warframe.com/topic/1523956-update-44-iceblade-of-narin/), [Critical Hit patch history](https://wiki.warframe.com/w/Critical_Hit), [Damage Falloff](https://wiki.warframe.com/w/Damage_Falloff), [Area of Effect](https://wiki.warframe.com/w/Area_of_Effect).

---

## 1. Full order of operations for one hit

### Takeaway
A gun hit is a product of independent buckets. Bonuses inside a bucket add; buckets multiply. The arsenal number covers only base damage, elemental/physical mods and multishot; faction, crit, weak point, "final" multipliers, falloff and beam ramp-up all come after it.

### Complete formula (per projectile, direct hit, before enemy defences)

```
ModdedBase   = (Base + flat base adds) x (1 + SUM base-damage bonuses)          [bucket A]
share_i      = quantize32( type_i's proportion of ModdedBase )                  [bucket B, section 6]
               physical type: (base share of that type) x (1 + SUM that type's mods)
               element:       innate share + SUM of that element's mod %
D_i          = share_i x ModdedBase
PreCrit      = SUM_i D_i x (1 + enemy type modifier_i)                          [enemy side]
Hit          = PreCrit
               x (1 + SUM "multiplying" GunCO)        [bucket C; projectile weapons only, section 4]
               x (1 + SUM faction bonuses)            [bucket D]
               x CritMult(tier, weak point)           [bucket E]
               x WeakPointMult                        [bucket F]
               x PRODUCT of final multipliers         [bucket G: Eclipse, Primed Chamber, sniper combo, ...]
               x RangeFalloff x BeamRampUp            [bucket H]
               x enemy vulnerability x armour DR      [enemy side]

Expected damage per trigger pull = Hit x Multishot (if every projectile hits)
```

For hitscan weapons, GunCO sits in bucket A instead, with one twist: the additive form skips bucket G and range falloff (section 4).

### Cited Findings
- WIKI-CONFIRMED. Arsenal total = Base x [1 + elemental bonuses + per-type IPS share x IPS bonus] x (1 + damage bonuses) x [base multishot x (1 + multishot bonus)]. "This arsenal damage is the average non-crit damage per shot, without Faction Damage Bonus." — [Damage/Calculation](https://wiki.warframe.com/w/Damage/Calculation)
- WIKI-CONFIRMED. Order: (1) base damage bonuses are summed and applied; (2) elemental and physical bonuses are calculated on the modified base; (3) faction bonuses apply to all damage types and are not shown in the arsenal; then crit and enemy armour. — [Calculating Bonuses](https://wiki.warframe.com/w/Calculating_Bonuses)
- WIKI-CONFIRMED. General stacking form: Stat = [Base x PRODUCT(1 + SUM additive bonuses per bucket)] + SUM flat bonuses. Internal operation types are ADD, STACKING_MULTIPLY (additive percent), MULTIPLY and SET. — [Calculating Bonuses](https://wiki.warframe.com/w/Calculating_Bonuses)
- WIKI-CONFIRMED. Buckets the wiki lists as multiplying each other: Serration, elemental mods, Viral procs, Bane mods, aim-conditional damage (Lasting Purity), Primed Chamber, Eclipse, headshots, armour DR. — [Calculating Bonuses](https://wiki.warframe.com/w/Calculating_Bonuses)
- WIKI-CONFIRMED. Final (bucket G) multipliers identified by name: Extinguished Dragon Key, Longbow Sharpshot, Primary Compression on projectile weapons, Duality, Furious Javelin, Garuda's passive, Eclipse, Hall of Mirrors, Parasitic Link, Vauban's Overdriver. — [Condition Overload (Mechanic)](https://wiki.warframe.com/w/Condition_Overload_(Mechanic))
- WIKI-CONFIRMED. Primed Chamber: +100% on the first shot of a magazine, "applied multiplicatively after all other modifiers from mods and abilities"; additive with Charged Chamber (140% total). — [Primed Chamber](https://wiki.warframe.com/w/Primed_Chamber)
- WIKI-CONFIRMED. Eclipse (Solar, 200% at max rank) is "an unique multiplier": 250 x (1 + 1.65) x (1 + 2 x [1 + 0.3]). It is applied once to status damage, not twice like faction damage. Subsumed value is 30%. — [Eclipse](https://wiki.warframe.com/w/Eclipse)
- WIKI-CONFIRMED. Sniper combo is a separate total-damage multiplier: 1.5x at the first tier, +0.5x per tier, each tier needing 3x the previous shot count. — [Sniper Rifle](https://wiki.warframe.com/w/Sniper_Rifle), [Enemy Body Parts](https://wiki.warframe.com/w/Enemy_Body_Parts)
- WIKI-CONFIRMED. Enemy damage vulnerability (Viral, Magnetic, ability debuffs) multiplies everything, mostly multiplicatively between sources, and does not double dip on DoT. — [Damage Vulnerability](https://wiki.warframe.com/w/Damage_Vulnerability)
- WIKI-CONFIRMED. Stealth damage bonus (+700% at weapon rank 30, formula 1 + 0.2 x rank) is described only for "standard melee attacks". It adds to the crit term: Damage x (1 + Stealth + Tier x (CD - 1)). — [Stealth](https://wiki.warframe.com/w/Stealth)
- WIKI-CONFIRMED. Exceptions to normal ordering: Ballistic Battery applies after base damage bonuses but before other multipliers; Volt's passive applies after base and elemental bonuses but before crit and sniper combo. — [Calculating Bonuses](https://wiki.warframe.com/w/Calculating_Bonuses)
- WIKI-CONFIRMED. Extra-hit effects (Xata's Whisper 26% of total weapon damage as a separate Void instance; Toxic Lash 30% on guns as a separate Toxin instance) are their own damage instances and do not dilute weapon elements. — [Xata's Whisper](https://wiki.warframe.com/w/Xata%27s_Whisper), [Toxic Lash](https://wiki.warframe.com/w/Toxic_Lash)

### Worked example
Hitscan rifle, 100 base damage of one physical type, hitting a Grineer head.
- Mods: Serration (+165%), Primary Merciless at 12 stacks (+360%), two 90% Heat mods, Primed Bane of Grineer (+55%).
- Crit: 200% crit chance (guaranteed orange), crit multiplier 4.4.

1. ModdedBase = 100 x (1 + 1.65 + 3.60) = 625.
2. Heat share = 1.80; quantized: round(1.8 x 32) / 32 = 58/32 = 1.8125. The physical share stays 1.0.
3. Total = 625 x 2.8125 = 1757.81. The arsenal's smooth figure would be 1750.
4. Faction: x 1.55 = 2724.61.
5. Body-shot orange crit: x [1 + 2 x (4.4 - 1)] = x 7.8 = 21,252.
6. Headshot orange crit: x 3 x [1 + 2 x (2 x 4.4 - 1)] = x 49.8 = 135,686.

### Inferences
- Because mods like Serration cancel out of the type proportions, quantization can be done on proportions and ModdedBase applied afterwards. This reconciles the two statements the wiki itself flags as "conflicting info".
- No source describes a stealth multiplier for ordinary gun hits. Treat it as melee-only unless a Simulacrum test shows otherwise.

### Gaps
- UNKNOWN. Which bucket Semi-Rifle/Pistol/Shotgun Cannonade (+240% / +300% / +240% damage, Update 36), Spectral Serration (+330% while invisible, Update 38) and the Update 41 Madurai "+25% Primary and Secondary Damage" bonus fall into. The patch notes give values only.
- UNKNOWN. Exact position of the sniper combo relative to crit; the wiki only calls it "a bonus to their total damage".
- NOT FOUND. Brozime's Obsidian vault ([link](https://publish.obsidian.md/brozime/Public/Welcome+to+Brozime's+Public+Notes)) was searched across all 200 notes. Its modding page is a video embed; Brozime writes he "won't be putting the information in the video into text". No transcript was obtained.

---

## 2. Critical hits

### Takeaway
Crit tier is floor(crit chance), plus one with probability equal to the fractional part. Tier multiplier = 1 + tier x (CD - 1). Crits on eligible heads double the crit multiplier inside that formula. The average multiplier is linear in crit chance, so 1 + CC x (CD - 1) holds at any crit chance.

### Cited Findings
- WIKI-CONFIRMED. Crit chance = Base x (1 + SUM relative) + SUM absolute. Example: Braton, 12% x (1 + 1.5 + 1.35) = 46.2%; with Arcane Avenger, 12% x 2.5 + 45% = 75%. — [Critical Hit](https://wiki.warframe.com/w/Critical_Hit)
- WIKI-CONFIRMED. Crit damage = Base x (1 + SUM relative) + SUM absolute. Example: Braton, 1.6 x (1 + 1.2 + 1.2) = 5.44. Absolute sources: Arcane Crepuscular, Cold "Freeze", Shroud of Dynar, Tenacious Bond. — [Critical Hit](https://wiki.warframe.com/w/Critical_Hit)
- WIKI-CONFIRMED. Tiers: 0-100% yellow (tier 1), 100-200% orange (tier 2), 200-300% red (tier 3), and tiers continue above that with up to three "!" marks. Each pellet rolls its own crit. — [Critical Hit](https://wiki.warframe.com/w/Critical_Hit)
- WIKI-CONFIRMED. Tier multiplier = 1 + Tier x (CD - 1). Example: Lenz with Point Strike has 125% crit chance, so 75% yellow and 25% orange; orange with Vital Sense = 1 + 2 x (4.4 - 1) = 7.8x. — [Critical Hit](https://wiki.warframe.com/w/Critical_Hit)
- COMMUNITY-CONSENSUS. Same tier formula: "Yellow: 1 (crit multiplier-1)+1 Orange: 2 (Crit multiplier-1)+1 Red: 3 (crit multiplier-1)+1". Source is an undated Facebook group snippet (low weight).
- WIKI-CONFIRMED. Average multiplier = 1 + CC x (CD - 1). Example: Paris with Point Strike and Vital Sense, 1 + 0.75 x 3.4 = 3.55x. — [Critical Hit](https://wiki.warframe.com/w/Critical_Hit)
- WIKI-CONFIRMED. Headshot crit: Headshot Multi x (1 + Tier x (2 x CD - 1)). Example: Lanka orange, 3.0 x (1 + 2 x (2 x 4.4 - 1)) = 49.8x. — [Critical Hit](https://wiki.warframe.com/w/Critical_Hit)
- WIKI-CONFIRMED. Which heads get the crit doubling:
  - Yes: Grineer (including Corrupted, Narmer and Anarch Grineer), Dax Anarchs, Scaldra, most Infested and Sentients.
  - No: all Corpus humanoids and ground units, most of The Murmur, much of Techrot.
  - It is specific to heads, not to all weak points.
  - A weapon with a default 1x headshot multiplier never gets it. — [Enemy Body Parts](https://wiki.warframe.com/w/Enemy_Body_Parts), [Critical Hit](https://wiki.warframe.com/w/Critical_Hit)
- DISPUTED (wording). Critical Hit doubles the *total* crit multiplier. Enemy Body Parts says the bonus "Applies a 2x multiplier to the weapon's *base* critical mult". The two agree with relative mods only, and differ when a flat crit damage bonus is active (Cold freeze, Tenacious Bond, Arcane Crepuscular).
- WIKI-CONFIRMED. Base crit multiplier is quantized to a 12-bit code before mods: Code = floor(clamp(x, 0, 32) x 4095/32 + 0.5); decoded = Code x 32/4095. Example: base 2.0 gives code 256, decoded 2.000488, times 2.2 = 4.4011x instead of 4.4. — [Critical Hit](https://wiki.warframe.com/w/Critical_Hit)
- WIKI-CONFIRMED. Vigilante set: each mod gives a 5% chance (30% with all six) to raise a *primary* weapon's crit by one tier: "if the weapon deals a 'yellow' critical, there is a 30% chance that it will deal an 'orange' critical instead". — [Vigilante Set](https://wiki.warframe.com/w/Vigilante_Set), [Critical Hit](https://wiki.warframe.com/w/Critical_Hit)
- WIKI-CONFIRMED. Galvanized Scope / Crosshairs: relative crit chance (+120% while aiming after a weak point hit, +40% x 5 stacks on weak point kill, max +320%). The triggering hit does not benefit. — [Galvanized Scope](https://wiki.warframe.com/w/Galvanized_Scope)
- WIKI-CONFIRMED. Acuity weak point crit chance (+350%) is relative and additive with Point Strike. Hotfix 38.5 "Fixed Acuity mods causing unexpectedly high Critical Chance multipliers on certain weapons." — [Primary Acuity](https://wiki.warframe.com/w/Primary_Acuity), [Update 38](https://wiki.warframe.com/w/Update_38)
- WIKI-CONFIRMED. Flat (absolute) crit chance sources: Arcane Avenger +45%, Cat's Eye, Covenant, Puncture status, Secondary Enervate (+10% per hit), Shadow Haze. — [Critical Hit](https://wiki.warframe.com/w/Critical_Hit)
- WIKI-CONFIRMED. Multishot does not affect crit stats (Update 27.2: "We don't have Multishot affect any Critical Stats"). — [Update 27](https://wiki.warframe.com/w/Update_27)

### Worked examples
- **Vigilante.** Crit chance 50%, CD 4.4, six Vigilante mods (p = 0.30). Average = 1 + 0.5 x (1 + 0.3) x 3.4 = 3.21, against 2.70 without. At 100% crit chance or more, every hit crits, so the set is worth exactly +30 percentage points of crit chance.
- **Average headshot crit.** Crit chance 75%, CD 4.4, eligible head: 3 x [1 + 0.75 x (8.8 - 1)] = 20.55x, against 3 x 3.55 = 10.65x if the head does not allow crit doubling (for example Corpus).

### Inferences
- The Vigilante expected-value formula above is my derivation from the wiki's wording that only crits are enhanced. The wiki does not state the sub-100% behaviour explicitly.
- A calculator needs a per-faction flag for "head crits double", otherwise Corpus and Murmur headshot crits are overstated by roughly 2x.

### Gaps
- UNKNOWN. Whether the head-crit 2x applies to the base or the total crit multiplier when flat crit damage is present.
- NOT FOUND. No community-expert source corroborating the head-crit 2x or the Vigilante mechanics.

---

## 3. Faction damage and DoT double dipping

### Takeaway
Faction damage is its own multiplier, (1 + Bane + Roar + other faction sources). It is applied once to the hit and a second time to damage-over-time ticks, so DoTs scale with its square.

### Cited Findings
- WIKI-CONFIRMED. "Calculated as a total damage multiplier." Bane mods are +30% and Primed +55%. They do not affect Corrupted or Narmer variants; they do affect Kuva Grineer, Amalgam and Deimos Infested. No faction mods exist for Anarchs, Narmer, Scaldra, Techrot, Stalker or Wild. — [Faction Damage Bonus](https://wiki.warframe.com/w/Faction_Damage_Bonus)
- WIKI-CONFIRMED. Roar counts as faction damage, "additive with other sources of Faction Damage, and multiplicative with other types". Examples: 100 x (1 + 1.65) x (1 + 0.5) = 397.5; with Bane, 100 x 2.65 x (1 + 0.5 + 0.3) = 477. Subsumed Roar is 30% at base strength. — [Faction Damage Bonus](https://wiki.warframe.com/w/Faction_Damage_Bonus)
- WIKI-CONFIRMED. Double dip: Slash tick = 0.35 x 100 x (1 + 0.5) x (1 + 0.5) = 78.75 with Roar. General form: Bleed tick = Base x (1 + Serration) x 0.35 x (1 + Faction)^2 x (1 + Status Damage). — [Faction Damage Bonus](https://wiki.warframe.com/w/Faction_Damage_Bonus), [Damage over Time](https://wiki.warframe.com/w/Damage_over_Time)
- WIKI-CONFIRMED. Exact tick formula: Tick = (SUM seeds + 1) x C x M. C is 0.5 for Heat, Electricity, Toxin and Gas, and 0.35 for Slash. Example: Toxin, 40 seed, +225% Toxin mods, Primed Bane: (40 x 1.55 + 1) x 0.5 x 3.25 x 1.55 = 158.68. — [Damage/Calculation](https://wiki.warframe.com/w/Damage/Calculation)
- WIKI-CONFIRMED. DoT seeds come from modded base damage, not from the quantized type sum. Elemental mods of the same element scale their own DoT; IPS mods do not scale Slash DoT; component mods do not scale Gas or Blast DoT. Crit, body part and stealth multipliers carry into the DoT. — [Damage over Time](https://wiki.warframe.com/w/Damage_over_Time), [Damage/Calculation](https://wiki.warframe.com/w/Damage/Calculation)
- WIKI-CONFIRMED. Status Damage (Elementalist mods, +90%, Update 36) is a separate bucket: multiplicative with faction, additive among status damage sources. — [Status Effect](https://wiki.warframe.com/w/Status_Effect), [Update 36](https://wiki.warframe.com/w/Update_36)
- COMMUNITY-CONSENSUS. Kaomos (forums, 2025-04-16): "bane mods double dip on damaging statuses, 1.55x damage on the initial hit, 2.4025x status damage". Another poster (2025-04-17): "Double dipping on DoTs, at least, is not a bug… DE has long since acknowledged it". — [forum thread](https://forums.warframe.com/topic/1451329-universal-bane-mod-and-the-issues-surrounding-faction-damage-multipliers/)
- COMMUNITY-CONSENSUS (single source, treat as unverified). Kaomos also claims triple dipping through extra-hit effects (Xata's Whisper, Toxic Lash, Resupply), "7.075x on a triple dip". The wiki only says Xata's Whisper "double dips on faction damage, and body part weaknesses". — [same thread](https://forums.warframe.com/topic/1451329-universal-bane-mod-and-the-issues-surrounding-faction-damage-multipliers/), [Xata's Whisper](https://wiki.warframe.com/w/Xata%27s_Whisper)
- WIKI-CONFIRMED. Other faction-bucket sources: Damage Blessing (25%), Paracesis (melee), Summoner's Wrath. — [Faction Damage Bonus](https://wiki.warframe.com/w/Faction_Damage_Bonus)
- WIKI-CONFIRMED. Cautious Shot is not a damage or faction mod. It only nullifies or reduces self-stagger. — [Cautious Shot](https://wiki.warframe.com/w/Cautious_Shot)
- OFFICIAL. Update 29.10 (2021-03-19): "Fixed the Bane Mods applying the increased Damage twice." It is a bare line with no detail. — [Update 29](https://wiki.warframe.com/w/Update_29)

### Worked example
Primed Bane (+55%) plus full-strength Roar (+50%) against Grineer:
- Direct hit: x 2.05.
- Slash tick: x 2.05^2 = 4.2025.
- With Rifle Elementalist (+90% status damage): tick x 4.2025 x 1.9 = 7.98.
- Slash tick from a 1,000 modded-base hit, non-crit: (1000 x 2.05 + 1) x 0.35 x 2.05 x 1.9 = 2,796.

### Inferences
- Faction damage is worth far more on DoT builds (Slash, Heat, Toxin, Gas, Electricity) than its face value. A calculator that reports only direct damage will undervalue Bane and Roar.
- The 2021 "applying twice" fix did not remove DoT double dipping, since the current wiki and 2025 community posts both still describe it.

### Gaps
- UNKNOWN. What exactly Update 29.10 fixed.
- UNKNOWN. Whether Bane + Roar additivity has changed in 2026. No patch note from Update 38 to 44 mentions a change.

---

## 4. Which bonuses share the base damage bucket with Serration / Hornet Strike

### Takeaway
Almost all "+% damage" weapon arcanes and warframe arcanes add to Serration, which is why Serration is weak next to a 360% arcane. Galvanized "direct damage per status" (GunCO) also adds to Serration on hitscan weapons, but multiplies on most projectile weapons. In its additive form it skips final multipliers, range falloff and Incarnon flat base damage.

### Bucket table

| Source | Value (max) | Bucket | Label |
| --- | --- | --- | --- |
| Primary / Secondary Merciless | +30% x 12 = 360%, 4 s, one stack lost per timeout | Additive with Serration | WIKI-CONFIRMED |
| Primary / Secondary Deadhead | +120% x 3 = 360%, 24 s; +30% headshot multiplier | Damage additive with Serration; headshot part is the "headshot multiplier" bracket (section 2 / below) | WIKI-CONFIRMED |
| Primary / Secondary Dexterity | +60% x 6 = 360%, 20 s, on melee kill | Additive | WIKI-CONFIRMED |
| Arcane Rage / Arcane Precision | +180% primary, 24 s / +300% secondary, 18 s | Additive | WIKI-CONFIRMED |
| Arcane Primary Charger | +300%, 12 s | Additive | WIKI-CONFIRMED |
| Primary Bulwark | 1% per armour over 1000, cap 500% | Additive | WIKI-CONFIRMED |
| Primary Plated Round | 15 x sqrt(5 x magazine) % | Additive | WIKI-CONFIRMED |
| Cascadia Flare | 12% x 40 = 480%, 10 s | Additive | WIKI-CONFIRMED |
| Vex Armor (Fury) | 275% x (1 + strength) | Additive | WIKI-CONFIRMED |
| Galvanized Aptitude / Savvy | +40% per status type per stack, 2 stacks (80% per status), 20 s | Additive on hitscan; multiplicative on most projectiles; none on radial | WIKI-CONFIRMED and COMMUNITY-CONSENSUS for the base case; per-weapon behaviour is community-documented |
| Galvanized Shot | +40% x 3 stacks (120% per status), 14 s | Same as above | Same |
| Secondary Shiver | +45% per Cold stack (max 450%) | GunCO family; additive with Galvanized Shot; multiplicative on Cyanex, Catchmoon, Epitaph, Seer, Sepulcrum, Tenet Spirex | WIKI-CONFIRMED |
| Cedo, several Incarnon "per status" perks | +30% to +60% per status | GunCO family | WIKI-CONFIRMED |
| Secondary Surge | up to +700% on next shot | Separate multiplier | WIKI-CONFIRMED |
| Longbow Sharpshot | +300% | Separate multiplier | WIKI-CONFIRMED |
| Primary Compression | +100% per metre of radius lost | Separate on projectile weapons; "Adds" or "Doesn't work" on some weapons | WIKI-CONFIRMED (varies by weapon) |
| Eclipse, Primed Chamber, sniper combo | see section 1 | Separate (final) multipliers | WIKI-CONFIRMED |
| Roar, Bane | see section 3 | Faction bucket | WIKI-CONFIRMED |
| Kuva / Tenet / Coda progenitor bonus | 25-60% of base damage as an element | Counts as weapon base damage | WIKI-CONFIRMED (no worked formula) |
| Incarnon "Increase Base Damage by +N" | flat N | Flat add to base | Wording WIKI-CONFIRMED; exact maths UNKNOWN |

Sources: [Primary Merciless](https://wiki.warframe.com/w/Primary_Merciless), [Primary Deadhead](https://wiki.warframe.com/w/Primary_Deadhead), [Primary Dexterity](https://wiki.warframe.com/w/Primary_Dexterity), [Arcane Rage](https://wiki.warframe.com/w/Arcane_Rage), [Arcane Precision](https://wiki.warframe.com/w/Arcane_Precision), [Arcane Primary Charger](https://wiki.warframe.com/w/Arcane_Primary_Charger), [Primary Bulwark](https://wiki.warframe.com/w/Primary_Bulwark), [Primary Plated Round](https://wiki.warframe.com/w/Primary_Plated_Round), [Cascadia Flare](https://wiki.warframe.com/w/Cascadia_Flare), [Vex Armor](https://wiki.warframe.com/w/Vex_Armor), [Galvanized Aptitude](https://wiki.warframe.com/w/Galvanized_Aptitude), [Galvanized Shot](https://wiki.warframe.com/w/Galvanized_Shot), [Secondary Shiver](https://wiki.warframe.com/w/Secondary_Shiver), [Secondary Surge](https://wiki.warframe.com/w/Secondary_Surge), [Longbow Sharpshot](https://wiki.warframe.com/w/Longbow_Sharpshot), [Primary Compression](https://wiki.warframe.com/w/Primary_Compression), [Kuva Weapons](https://wiki.warframe.com/w/Kuva_Weapons), [Braton Incarnon Genesis](https://wiki.warframe.com/w/Braton_Incarnon_Genesis), [Condition Overload (Mechanic)](https://wiki.warframe.com/w/Condition_Overload_(Mechanic)).

### Cited Findings
- WIKI-CONFIRMED. Merciless, Deadhead and Dexterity: "The damage bonus stacks additively with other damage mods like Serration." — [Primary Merciless](https://wiki.warframe.com/w/Primary_Merciless)
- COMMUNITY-CONSENSUS. "With a maxed merciless in the picture (360% damage), serration is a 36% damage boost because their numbers are additive to each other." Source is an r/Warframe search snippet, undated. No dissenting source was found.
- WIKI-CONFIRMED. GunCO has two stacking behaviours:
  - "Adding" (most hitscan): Base x [(1 + Serration etc.) x other multipliers + CO].
  - "Multiplying" (most projectile weapons): Base x (1 + Serration) x (1 + CO).
  — [Condition Overload (Mechanic)](https://wiki.warframe.com/w/Condition_Overload_(Mechanic))
- WIKI-CONFIRMED. In the adding form, the CO part ignores: final multipliers (Eclipse, Sharpshot, Compression and the rest of the bucket G list), range-based falloff (but not beam ramp-up), Incarnon Genesis flat base damage, and bow charge multipliers. — [Condition Overload (Mechanic)](https://wiki.warframe.com/w/Condition_Overload_(Mechanic)), [Damage Falloff](https://wiki.warframe.com/w/Damage_Falloff)
- WIKI-CONFIRMED. GunCO does not apply to explosion radius damage (only to the directly hit target). It is "not applied on the hit that procs a new status effect". Up to 16 statuses can count, including Void, Tau, Lifted/Knockdown and Microwave. — [Condition Overload (Mechanic)](https://wiki.warframe.com/w/Condition_Overload_(Mechanic)), [Galvanized Aptitude](https://wiki.warframe.com/w/Galvanized_Aptitude)
- WIKI-CONFIRMED (community-sourced tables). Per-weapon exceptions:
  - Multiplying: Arca Plasmor, Aeolak, Alternox, Basmu, Battacor, Bubonico, Buzlok, Exergis, Felarx, Fulmin semi mode, Hema, Javlok, Cinta, Dread Incarnon, Latron Incarnon.
  - Charged bows (Cernos, Dread, Daikyu, Paris): only 50% of the listed bonus, because CO uses uncharged damage.
  - Acceltra: 74.3%.
  - Lists: Prof_Blocks_007, Rainy, Arbitrary Mary (2022, outdated), WFCD. — [Condition Overload (Mechanic)](https://wiki.warframe.com/w/Condition_Overload_(Mechanic))
- COMMUNITY-CONSENSUS. PublikDomain (forums, 2021-07-09): "Additive, it combines with your other +Damage mods… 165% + (40% × 2) × 5 = 565% Damage." [DE]Momaw (2021-07-08) on the projectile oddity: "We're aware of some oddness with these mods, investigations are underway." — [forum thread](https://forums.warframe.com/topic/1270893-galvanized-aptitude-additive-or-multiplicative-damage/)
- COMMUNITY-CONSENSUS. April 2025 forum post: "Incarnon evos base damage still don't properly apply to gun CO despite coming out 2 years ago… many projectile based weapons have Multiplicitive CO". — [forum thread](https://forums.warframe.com/topic/1451329-universal-bane-mod-and-the-issues-surrounding-faction-damage-multipliers/)
- DISPUTED (minor). An undated Steam snippet says flatly "Aptitude is a multiplicative damage" with no hitscan/projectile distinction. It contradicts the wiki and PublikDomain and should be treated as imprecise.
- WIKI-CONFIRMED. Progenitor bonus: "ranging from 25-60% of the weapon's base damage"; "This additional bonus damage applies as weapon base damage, meaning elemental mods and status that scale from base / modified base damage will be affected." Valence Fusion: min(1.1 x max(a, b), 60). — [Kuva Weapons](https://wiki.warframe.com/w/Kuva_Weapons), [Valence Fusion](https://wiki.warframe.com/w/Valence_Fusion)
- COMMUNITY-CONSENSUS. "a progenitor adds 60% of total weapon base damage before mods". Source is a forum snippet (topic 1421745).
- WIKI-CONFIRMED. Element combine order: mod slots left to right, top row then bottom, "with any inherent elemental damage (from the weapon) added last". — [Calculating Bonuses](https://wiki.warframe.com/w/Calculating_Bonuses)
- WIKI-CONFIRMED. Incarnon perks vary per perk and must be read individually. Example from Laetum: Devouring Attrition is "multiplicative to base damage bonuses such as Hornet Strike", while Overwhelming Attrition (+400% x 3) is "additive". Wiki-flagged bugs: Incarnon base damage evolutions ignore damage falloff, and GunCO does not apply to them. — [Laetum](https://wiki.warframe.com/w/Laetum), [Damage Falloff](https://wiki.warframe.com/w/Damage_Falloff), [Braton Incarnon Genesis](https://wiki.warframe.com/w/Braton_Incarnon_Genesis)
- WIKI-CONFIRMED. Ability-added elements (Nourish +75% Viral, Smite Infusion +100% Radiation) behave like an extra elemental mod: additive with elemental and IPS mods, bucket B. — [Nourish](https://wiki.warframe.com/w/Nourish), [Smite Infusion](https://wiki.warframe.com/w/Smite_Infusion)
- WIKI-CONFIRMED. Crit, multishot and status arcanes:
  - Primary Blight: 144% crit damage + 72% multishot at 40 stacks.
  - Primary Frostbite: 120% + 90%.
  - Primary Crux: +30% status chance x 10.
  - Cascadia Overcharge: +300% relative crit chance.
  - Secondary Outburst: additive with Pistol Gambit and Target Cracker.
  - Secondary Enervate: flat crit chance. — [Primary Blight](https://wiki.warframe.com/w/Primary_Blight), [Primary Frostbite](https://wiki.warframe.com/w/Primary_Frostbite), [Primary Crux](https://wiki.warframe.com/w/Primary_Crux), [Cascadia Overcharge](https://wiki.warframe.com/w/Cascadia_Overcharge), [Secondary Outburst](https://wiki.warframe.com/w/Secondary_Outburst), [Secondary Enervate](https://wiki.warframe.com/w/Secondary_Enervate)

### Worked examples
100-base weapon, Serration, Galvanized Aptitude at 2 stacks, enemy has 2 status types (CO = +160%):
- Hitscan (adding): 100 x (1 + 1.65 + 1.60) = 425.
- Projectile (multiplying): 100 x 2.65 x 2.60 = 689.
- Hitscan with 12-stack Merciless as well: 100 x (1 + 1.65 + 3.60 + 1.60) = 785. Serration now adds only 165/620 = 26.6%.
- Hitscan (adding) under full-strength Eclipse (x3), no Merciless: 100 x (2.65 x 3 + 1.60) = 955. It is not 425 x 3 = 1,275, because the CO part skips Eclipse.

Progenitor: 100 base + 60% Toxin gives 160 base. With Serration, 424. A 90% Heat mod adds 0.9 x 424 = 381.6 Heat.

### Inferences
- A calculator needs a per-attack flag {GunCO adding, GunCO multiplying, GunCO none, GunCO percentage} taken from the community spreadsheets. Guessing from "hitscan vs projectile" alone gets the bows, Acceltra and several others wrong.
- The progenitor element probably follows the "innate element added last" rule, but the wiki does not say so for progenitor bonuses specifically.
- Primary Blight and Frostbite are very likely additive with mods of the same stat (Frostbite is described as "same stat bonus as Vital Sense and Split Chamber combined"), but the wiki does not state it.

### Gaps
- UNKNOWN. Whether Incarnon flat base damage is distributed across damage types in proportion, and whether it changes the quantization scale.
- UNKNOWN. The wiki's CO page says it has "not been modified for a year". Per-weapon behaviours may have changed in 2026 patches; I found no patch note from Update 38 to 44 touching them.
- DISPUTED within the wiki. Secondary Outburst duration is 20 s on the Arcane Enhancement table and 30 s on its own page.

---

## 5. Multishot

### Takeaway
Multishot = base x (1 + bonus). The integer part is guaranteed projectiles and the fraction is the chance of one more. Each projectile rolls crit and status separately and costs no extra ammo. Beams are the exception: the extra beams merge into one tick with summed damage and summed status chance.

### Cited Findings
- WIKI-CONFIRMED. Total Projectiles = Weapon Projectile Count x (1 + Multishot Modifier); "the fractional part will be a chance to fire one more projectile". Examples: Lex with +180% = 2.8 (2 projectiles, 80% chance of a third); Hek (7) with Hell's Chamber = 15.4. — [Multishot](https://wiki.warframe.com/w/Multishot)
- WIKI-CONFIRMED. Multishot is "additional projectiles per round of ammunition" (no extra ammo). The arsenal shows the average sum of all projectiles, so wide-spread weapons deal less in practice. — [Multishot](https://wiki.warframe.com/w/Multishot), [Calculating Bonuses](https://wiki.warframe.com/w/Calculating_Bonuses)
- WIKI-CONFIRMED. Arsenal status chance is per pellet: Strun Wraith "displays a 12% status chance, so each of its ten pellets has a 12% chance". — [Status Effect](https://wiki.warframe.com/w/Status_Effect)
- OFFICIAL. Update 27.2 (2020-03-05): "we have buffed the Status Chance of all Shotguns by x3 or greater. The UI now behaves to show the reality that you are determining Status Chance per pellet." — [Update 27](https://wiki.warframe.com/w/Update_27)
- WIKI-CONFIRMED. Average procs per shot = Multishot x (forced procs + status chance per projectile). Above 100% status chance a single instance can create two status effects. — [Status Effect](https://wiki.warframe.com/w/Status_Effect)
- WIKI-CONFIRMED. Proc type chance = that type's damage / total damage. The pre-27.2 x4 physical weighting is gone, and types the enemy is immune to are excluded. — [Status Effect](https://wiki.warframe.com/w/Status_Effect)
- COMMUNITY-CONSENSUS. The proc weighting uses the *quantized* distribution, so a type that quantizes to 0 never procs. PublikDomain, 2024, observed on Galatine Prime. — [forum thread](https://forums.warframe.com/topic/1403973-when-does-damage-quantization-and-rounding-apply-and-what-parts-are-quantized-and-rounded/)
- WIKI-CONFIRMED. Beams: "additional beams that hit the same target instead merge into a singular damage tick. This combined tick has damage and Status Chance equal to the sum of the individual beams, but the Critical Chance is still equal to that of a single beam." As a result DoT output "is affected twice by multishot". — [Multishot](https://wiki.warframe.com/w/Multishot)
- WIKI-CONFIRMED. On beams, forced procs (Hunter Munitions) apply after merging: one proc per tick at most, not doubled by multishot. — [Multishot](https://wiki.warframe.com/w/Multishot)
- WIKI-CONFIRMED. Multishot does not affect the spherical radius of Ignis, Glaxion Vandal, Gaze, Embolist, Catabolyst or Cortege, nor the thrown part of spearguns. — [Multishot](https://wiki.warframe.com/w/Multishot)
- WIKI-CONFIRMED. Beam ramp-up: damage "ramps up to 100% of its damage over 0.6 seconds of hitting a target", starting at 20% for most weapons (Convectrix 60%/80%, Phage 70%, Embolist 30%). Decay starts 0.8 s after the beam stops hitting and takes 2 s. — [Continuous Weapon](https://wiki.warframe.com/w/Continuous_Weapon)
- DISPUTED (age). The Hitscan page's patch note for 22.13.3 says "ramping up from 10% to 100% over 0.8 seconds". That is old patch text; the Continuous Weapon page body gives the current numbers. — [Hitscan](https://wiki.warframe.com/w/Hitscan)
- WIKI-CONFIRMED. Beam ticks: "Each tick is equal to 1/MODDED_FIRE_RATE"; "Consumes 0.5 ammo per tick of damage (although not true for some continuous weapons)". Chain beams deal less damage (no numbers given) and use no ammo. — [Continuous Weapon](https://wiki.warframe.com/w/Continuous_Weapon)
- WIKI-CONFIRMED. Galvanized multishot: Chamber +80% base, +30% x 5 stacks (max +230%); Diffusion and Hell +110%, +30% x 4 (max +230%); 20 s. — [Galvanized Chamber](https://wiki.warframe.com/w/Galvanized_Chamber), [Galvanized Diffusion](https://wiki.warframe.com/w/Galvanized_Diffusion)
- WIKI-CONFIRMED. Acuity mods SET multishot to the weapon's base value, so even Riven penalties are ignored. — [Multishot](https://wiki.warframe.com/w/Multishot), [Calculating Bonuses](https://wiki.warframe.com/w/Calculating_Bonuses)
- WIKI-CONFIRMED. Hunter Munitions: 30% chance of a forced Slash proc on crit, independent of status chance. Its bleed depends only on modded base damage and scales with crit tier and headshot multipliers. — [Hunter Munitions](https://wiki.warframe.com/w/Hunter_Munitions)
- WIKI-CONFIRMED. Internal Bleeding: 35% chance per Impact proc, doubled when fire rate is below 2.5. — [Internal Bleeding](https://wiki.warframe.com/w/Internal_Bleeding)

### Worked examples
- **Shotgun.** 10 pellets x (1 + 1.1) = 21 pellets at 12% status each: 21 x 0.12 = 2.52 procs per shot. Chance of at least one proc = 1 - 0.88^21 = 93.2%.
- **Beam.** Status chance 40%, multishot 2.5. Half of ticks merge 2 beams (damage x2, status 80%) and half merge 3 (damage x3, status 120%, so one guaranteed proc plus 20% for a second). Expected DoT output scales with E[n^2] = (4 + 9) / 2 = 6.5, against 2.5 for a non-beam weapon with the same multishot.

### Inferences
- For non-beam weapons, expected direct damage and expected proc count are both linear in multishot. For beams, direct damage is linear but status DoT is roughly quadratic.
- Average ramp-up multiplier over the first 0.6 s on a new target is about 0.6 if the ramp is linear from 20% to 100%. The wiki does not state the curve shape.

### Gaps
- UNKNOWN. Any multishot cap; the wiki states none.
- UNKNOWN. Exact damage reduction per chain beam.
- NOT FOUND. No community-expert source corroborating beam merging.

---

## 6. Damage quantization

### Takeaway
Each damage type is rounded to a fixed fraction of modded base damage before other multipliers. The current wiki says the fraction is 1/32. A 2024 community test, and the wiki as it read then, used 1/16. Either way the effect is small for single-element builds and can reach a few percent, or delete a tiny damage type, on mixed-type weapons.

### Cited Findings
- WIKI-CONFIRMED. x = type value / modded base damage; Quantized(x) = sign(x) x floor(|x| x 32 + 0.5) / 32; quantized type value = Quantized(x) x modded base damage. Popups are then rounded to whole numbers for display only. — [Damage/Calculation](https://wiki.warframe.com/w/Damage/Calculation)
- WIKI-CONFIRMED. Example: 30 Impact / 30 Puncture / 40 Slash becomes 31.25 / 31.25 / 40.625 = 103.125 (+3.1%). — [Damage/Calculation](https://wiki.warframe.com/w/Damage/Calculation)
- WIKI-CONFIRMED. Elemental mods quantize on their summed percentage of full base damage; combined elements quantize the sum (90% Cold + 60% Toxin = 150% Viral, 48/32 exactly). Nagantaka Prime example: 1.73 Impact rounds to 0, and total 951.5. — [Damage/Calculation](https://wiki.warframe.com/w/Damage/Calculation)
- WIKI-CONFIRMED. Damage, faction and other multipliers scale the quantized total and do not change the composition. — [Damage/Calculation](https://wiki.warframe.com/w/Damage/Calculation)
- WIKI-CONFIRMED. DoT ticks are not subject to the 1/32 quantization (they use unquantized modded base damage). Hitscan weapons do not quantize against Object health (Nullifier bubbles). — [Damage/Calculation](https://wiki.warframe.com/w/Damage/Calculation)
- DISPUTED. PublikDomain (forums, 2024-06-30 to 07-05) quoted the wiki of that date as "100 / 16 = 6.25" and matched in-game numbers using a 1/16 quantum (Hate: 230/16 = 14.375; in-game 1,294 matched). A Reddit snippet also says "Modded Base Damage divided by 16". The wiki now says 1/32 with an explicit formula. I found no source explaining the change. — [forum thread](https://forums.warframe.com/topic/1403973-when-does-damage-quantization-and-rounding-apply-and-what-parts-are-quantized-and-rounded/)
- COMMUNITY-CONSENSUS. PublikDomain's tested rule: "IPS Damage = round(Base IPS Damage * (1 + IPS Damage Mods) / Quantum) * Quantum" and "DoT proc damage is not based on quantized total damage, but instead on the unquantized base damage". This agrees with the current wiki in everything except the quantum size. — [same thread](https://forums.warframe.com/topic/1403973-when-does-damage-quantization-and-rounding-apply-and-what-parts-are-quantized-and-rounded/)
- DISPUTED (minority). RLanzinger in the same thread claims the quantum is a flat "16 pts of damage". PublikDomain's in-game numbers contradict it.

### How much it changes real damage (derived from the wiki rule at 1/32)
- Maximum error per damage type is half a step, 1/64 of modded base = 1.5625% of base damage.
- A physical type under 1.5625% of base damage rounds to zero. It deals no damage and can never proc.
- Common mod values:

| Mod value | x 32 | Rounds to | Effective value | Change |
| --- | --- | --- | --- | --- |
| +60% | 19.2 | 19 | 59.375% | -1.04% of that element |
| +90% | 28.8 | 29 | 90.625% | +0.69% |
| +120% | 38.4 | 38 | 118.75% | -1.04% |
| +165% | 52.8 | 53 | 165.625% | +0.38% |
| 90% + 90% | 57.6 | 58 | 181.25% | +0.69% |
| 90% + 60% | 48.0 | 48 | 150% | exact |

- If the quantum is really 1/16, every error above doubles (half-step 3.125% of base).

### Inferences
- For a build advisor, quantization is a third-order effect (typically under 1% of total, up to about 3% on three-way IPS splits). It matters mainly when reproducing Simulacrum numbers exactly.
- The 1/32 against 1/16 question is the single most testable discrepancy in this document.

### Gaps
- UNKNOWN. Whether the game changed from 1/16 to 1/32 or one source was wrong. The wiki's own citations for quantization are 2018 posts by Theroxenes.

---

## 7. Fire rate, trigger types, reload and effective DPS

### Takeaway
Burst DPS = average shot x effective fire rate, where effective fire rate depends on trigger type. Sustained DPS multiplies that by shots / (shots + effective fire rate x reload time).

### Cited Findings
- WIKI-CONFIRMED. Modded stat = Base x (1 + bonuses); time stats (reload, charge) = Base / (1 + speed bonus). — [Damage/Calculation](https://wiki.warframe.com/w/Damage/Calculation)
- WIKI-CONFIRMED. Effective fire rate by trigger:
  - Auto, Auto-Spool (once spooled), Semi, Duplex, Held: modded fire rate.
  - Charge: 1 / (modded charge time + 1 / modded fire rate).
  - Burst: Burst Count / (1 / modded fire rate + (Burst Count - 1) x Burst Delay). For magazine-burst attacks use the magazine size as the count.
  — [Damage/Calculation](https://wiki.warframe.com/w/Damage/Calculation)
- WIKI-CONFIRMED. Bows: 1 / (modded charge time + modded reload time). Lanka: 1 / modded charge time. — [Fire Rate](https://wiki.warframe.com/w/Fire_Rate)
- WIKI-CONFIRMED. Limits: "Semi-Auto weapons are capped at 10 rounds per second"; "Fire Rate cannot drop below 0.05 rounds per second"; charge time cannot exceed 10x base; "Burst Delay is not affected by net negative Fire Rate bonuses". — [Fire Rate](https://wiki.warframe.com/w/Fire_Rate)
- WIKI-CONFIRMED. Auto-spool weapons fire their first shots slower. Spool-up shot counts: Gorgon 9, Soma Prime 4, Supra Vandal 4, Tenora Prime 9. Fire rate also shortens spool-up. — [Fire Rate](https://wiki.warframe.com/w/Fire_Rate)
- WIKI-CONFIRMED. "Effective Fire Rate is the true rate at which attacks happen per second" (arsenal fire rate is not the actual rate). The section is flagged UpdateMe. — [Fire Rate](https://wiki.warframe.com/w/Fire_Rate)
- WIKI-CONFIRMED. Shots per magazine = modded magazine / ammo cost per shot. In Incarnon form, use max Incarnon charge at 1 ammo per shot. — [Damage/Calculation](https://wiki.warframe.com/w/Damage/Calculation)
- WIKI-CONFIRMED. Sustained DPS = Burst DPS x Shots / (Effective Fire Rate x Reload Time + Shots). Vectis: subtract 1 from the denominator. Epitaph: ignore reload. — [Damage/Calculation](https://wiki.warframe.com/w/Damage/Calculation)
- WIKI-CONFIRMED. Reload variants:
  - Standard: Reload = Base / (1 + bonus).
  - Per-shell: start/end delay plus per-shell time x magazine capacity, each divided by (1 + bonus).
  - Battery weapons: Recharge Delay / (1 + bonus) + Magazine / Recharge Rate. Only the delay scales; minimum delay is 0.5 s.
  — [Reload](https://wiki.warframe.com/w/Reload)
- WIKI-CONFIRMED. Ammo efficiency: shots per ammo = 1 / (1 - efficiency). Bonuses are additive, except Energized Munitions, which is multiplicative. — [Ammo](https://wiki.warframe.com/w/Ammo)
- WIKI-CONFIRMED. Lifetime damage = Average Shot x Shots per Magazine x (1 + Max Ammo / Magazine). — [Damage/Calculation](https://wiki.warframe.com/w/Damage/Calculation)
- WIKI-CONFIRMED. Incarnon charge is per weapon. Braton: 20 weak point hits fill the gauge, 10 rounds each, max 200. Latron: 8 hits, max 40. Laetum: 12 hits, max 216. — [Braton Incarnon Genesis](https://wiki.warframe.com/w/Braton_Incarnon_Genesis), [Latron Incarnon Genesis](https://wiki.warframe.com/w/Latron_Incarnon_Genesis), [Laetum](https://wiki.warframe.com/w/Laetum)
- WIKI-CONFIRMED. Duplex (Tigris family, Zylok): fire rate "increases the cap on how quickly each two-shot sequence can be initiated". — [Fire Rate](https://wiki.warframe.com/w/Fire_Rate)

### Worked examples
- **Auto.** Average shot 1,000; fire rate 10; magazine 60; reload 2 s. Burst = 10,000 DPS. Uptime = 60 / (10 x 2 + 60) = 0.75. Sustained = 7,500 DPS.
- **Charge.** Charge time 0.5 s, fire rate 2: effective rate = 1 / (0.5 + 0.5) = 1.0 shots/s.
- **Burst.** 3-round burst, fire rate 2.5, burst delay 0.05 s: 3 / (0.4 + 2 x 0.05) = 6.0 shots/s.
- **Beam.** Fire rate 12, magazine 100 at 0.5 ammo per tick = 200 ticks, reload 2 s: uptime = 200 / (12 x 2 + 200) = 0.893.
- **Ammo efficiency.** 50% efficiency doubles shots per magazine, so the first example's uptime becomes 120 / 140 = 0.857.

### Inferences
- Using the arsenal fire rate directly is right for auto, semi and held triggers, and wrong for charge, burst and bow weapons.
- The semi-auto cap of 10/s means fire rate mods past that point are wasted, and human click speed is usually the tighter limit.

### Gaps
- UNKNOWN. Exact per-shot timing during spool-up.
- UNKNOWN. How fractional magazine sizes round.
- DISPUTED within the wiki. The Bow page says bows "lack a Reload delay", but the Fire Rate bow formula uses reload time.
- NOT STATED. Bow charge damage multiplier is not on the Bow page. The CO page says "bows have innate 2x damage multiplier when fully charged". — [Condition Overload (Mechanic)](https://wiki.warframe.com/w/Condition_Overload_(Mechanic))

---

## 8. Radial / AoE attacks

### Takeaway
An explosion is a separate damage instance from the projectile, with its own stats, linear falloff from the centre, a fixed 1x headshot multiplier, no GunCO, and per-enemy status rolls. A direct hit deals projectile damage plus explosion damage.

### Cited Findings
- WIKI-CONFIRMED. "you can treat any direct hits as having two separate instances of damage: direct hit and the AoE hit"; average direct-plus-AoE shot = direct average + AoE average, each with its own stats. — [Damage/Calculation](https://wiki.warframe.com/w/Damage/Calculation)
- WIKI-CONFIRMED. "The explosion has a 1x headshot multiplier and cannot trigger headshot conditions. This does not apply to the projectile itself." (Update 32.) — [Area of Effect](https://wiki.warframe.com/w/Area_of_Effect)
- WIKI-CONFIRMED. Explosions have linear falloff from the centre; the falloff percentage is per weapon. Update 27.2 set it to 90% and 27.2.2 reduced most to 20-80% (for example Acceltra 50%, Kuva Ogris 80%, Kuva Tonkor 70%, Lenz 70%, Zarr 50%). Radius mods (Firestorm, Fulmination; Primed versions +44%) stretch the falloff distance. — [Area of Effect](https://wiki.warframe.com/w/Area_of_Effect), [Damage Falloff](https://wiki.warframe.com/w/Damage_Falloff)
- WIKI-CONFIRMED. Explosions ignore line of sight, hitting enemies behind cover. Each enemy gets its own status roll. — [Area of Effect](https://wiki.warframe.com/w/Area_of_Effect)
- WIKI-CONFIRMED. Crits can occur on radial explosions (Update 14.10). — [Critical Hit](https://wiki.warframe.com/w/Critical_Hit)
- WIKI-CONFIRMED. Self-damage was removed in Update 27.2 and replaced by self-stagger (flinch to knockdown, by distance). Negated or reduced by Cautious Shot, Sure Footed, Primed Sure Footed, Negate, Fortitude, Power Drift and the Motus set. — [Area of Effect](https://wiki.warframe.com/w/Area_of_Effect), [Stagger](https://wiki.warframe.com/w/Stagger)
- WIKI-CONFIRMED. "Arsenal Stats now show Radial data and fall off when viewing a Weapon" (27.2.2), so radial attacks are listed separately. — [Area of Effect](https://wiki.warframe.com/w/Area_of_Effect)
- WIKI-CONFIRMED. GunCO does not apply to explosion radius hits. For some hitscan-AoE weapons (Ambassador alt, Ferrox, Glaxion Vandal, Braton/Burston Incarnon radial) the AoE "does not scale off multishot". — [Condition Overload (Mechanic)](https://wiki.warframe.com/w/Condition_Overload_(Mechanic))
- WIKI-CONFIRMED. Electricity and Gas procs use a 1x headshot multiplier. — [Enemy Body Parts](https://wiki.warframe.com/w/Enemy_Body_Parts)

### Worked example
Launcher: direct 100, radial 800 with 70% falloff over 6 m. Enemy A is hit directly, enemy B is 3 m away, enemy C is at the edge.
- A: 100 x (body part and crit multipliers) + 800.
- B: 800 x (1 - 0.7 x 3/6) = 520.
- C: 800 x 0.30 = 240.
- A headshot triples only the 100, not the 800.

### Inferences
- For launchers nearly all damage is radial, so weak point mods (Acuity, Deadhead's headshot part) and GunCO are close to worthless on them. A calculator should score those mods against the direct portion only.

### Gaps
- UNKNOWN. A general rule for whether the radial instance is multiplied by multishot. The wiki only lists specific weapons where it is not.

---

## 9. Range falloff, punch through, projectile vs hitscan, weak points

### Takeaway
Range falloff is linear between two distances down to a per-weapon minimum. Punch through carries no stated damage penalty. Hitscan against projectile mostly matters through GunCO behaviour and quantization against objects. The weak point multiplier has two additive brackets that multiply each other.

### Cited Findings
- WIKI-CONFIRMED. Falloff: 100% inside the first distance, linear down to the minimum at the second distance, then constant. Example: 200 damage, 10-30 m, 80% max falloff gives 160 at 15 m, 120 at 20 m and 40 at 30 m or beyond. Minimums range from 75% (Bronco) to 6.25% (Redeemer). Snipers: 50% minimum between 400 and 600 m. — [Damage Falloff](https://wiki.warframe.com/w/Damage_Falloff)
- WIKI-CONFIRMED. Hitscan shots do not register beyond 300 m (snipers 1000 m). Projectile speed bonuses extend the falloff ranges of weapons that have falloff; hitscan weapons without falloff are unaffected by projectile speed. — [Damage Falloff](https://wiki.warframe.com/w/Damage_Falloff)
- WIKI-CONFIRMED (flagged as bugs). Additive GunCO and Incarnon Genesis base damage evolutions ignore damage falloff. — [Damage Falloff](https://wiki.warframe.com/w/Damage_Falloff)
- WIKI-CONFIRMED. Punch through: depth "is gradually diminished as the projectile passes through objects or enemies"; 1.2 m passes through most enemies at least once. Some weapons have infinite body punch through (Ignis, Lanka, Phantasma). AoE projectiles explode on first contact. No damage reduction after penetration is stated. — [Punch Through](https://wiki.warframe.com/w/Punch_Through)
- WIKI-CONFIRMED. Weak point multiplier:

```
WeakPointMult = (BodyPartMult + k x SUM weak point damage bonuses) x (1 + SUM headshot multiplier bonuses)
k = 1.5 if the weak point is a head, otherwise 1
```

  - Weak point damage bonuses: Acuity +350%, Seek.
  - Headshot multiplier bonuses: Deadhead +30%, Target Acquired +60%, sniper zoom, Prowl.
  - Example: Acuity + Deadhead on a 3x head = (3 + 1.5 x 3.5) x 1.3 = 10.725x.
  — [Enemy Body Parts](https://wiki.warframe.com/w/Enemy_Body_Parts), [Primary Acuity](https://wiki.warframe.com/w/Primary_Acuity)
- WIKI-CONFIRMED. Default head multiplier is 3.0x for Grineer, Corpus, Infested, Sentient, Anarchs, Narmer and Corrupted. "For The Murmur and Techrot, the usual multiplier is closer to 1.5x." — [Enemy Body Parts](https://wiki.warframe.com/w/Enemy_Body_Parts)
- WIKI-CONFIRMED. Weapons with a forced 1x headshot multiplier are "unaffected by acuity-like bonuses but affected by deadhead-like bonuses" (a 1.0x weapon becomes 1.3x with Deadhead). The list includes Arca Plasmor, Catchmoon, Fulmin semi, Ignis, Nataruk charged shots, and Dread/Lex/Paris Incarnon forms. — [Enemy Body Parts](https://wiki.warframe.com/w/Enemy_Body_Parts), [Primary Deadhead](https://wiki.warframe.com/w/Primary_Deadhead)
- DISPUTED within the wiki. Damage/Calculation gives "Average Shot x (Weak Point Multiplier + Weak Point Damage Bonus)" in one row and "Weak Point Multiplier x (1 + Weak Point Damage Bonus)" in another. Calculating Bonuses still uses a 2x headshot in its examples (pre-Update 32). Enemy Body Parts has the detailed, current rule, so prefer it.
- WIKI-CONFIRMED. Some weak points (Rogue Culverin canisters, Scaldra backpacks) raise the crit tier of incoming hits instead of multiplying damage. — [Enemy Body Parts](https://wiki.warframe.com/w/Enemy_Body_Parts)
- OFFICIAL. Update 44 (2026-09-23): "Sonar's Weak Spots are now considered Weak Points", and many "On Headshot" triggers became "On Weakpoint". — [forum notes](https://forums.warframe.com/topic/1523956-update-44-iceblade-of-narin/)

### Worked example
Shotgun with 20-40 m falloff and 60% max reduction, target at 30 m: 1 - 0.6 x (30 - 20) / (40 - 20) = 0.70x.

### Inferences
- Any source describing Deadhead or Galvanized Scope as "on headshot" predates September 2026 and is slightly out of date on triggers (the values are unchanged).
- Murmur and Techrot heads (about 1.5x, no crit doubling) make headshot-focused builds roughly a quarter as effective there as against Grineer.

### Gaps
- UNKNOWN. Whether projectile travel distance or target distance at impact is used for falloff.
- UNKNOWN. Per-enemy body part tables for Duviri and Perita enemies; the wiki flags them as missing.

---

## 10. Hard caps and diminishing returns on the player side

### Takeaway
There are few true caps. "Diminishing returns" in Warframe is almost always opportunity cost inside an additive bucket: each extra percent in a bucket that is already large is worth relatively less.

### Cited Findings
- WIKI-CONFIRMED. Additive stacking is linear; the relative gain of adding X% to a bucket already at S is X / (1 + S). — [Calculating Bonuses](https://wiki.warframe.com/w/Calculating_Bonuses)
- WIKI-CONFIRMED. Fire rate: semi-auto cap 10/s; floor 0.05/s; charge time at most 10x base. — [Fire Rate](https://wiki.warframe.com/w/Fire_Rate)
- WIKI-CONFIRMED. Base crit multiplier is clamped to 0-32 before mods. If the crit tier multiplier passes about 255, the displayed number becomes roughly negative 2.1 billion (display bug). — [Critical Hit](https://wiki.warframe.com/w/Critical_Hit)
- WIKI-CONFIRMED. Damage popups overflow above 2,147,483,647 (display only). — [Damage Numbers](https://wiki.warframe.com/w/Damage_Numbers)
- WIKI-CONFIRMED. Status stack caps: Impact 5, Puncture 5; Cold, Corrosive, Gas, Magnetic, Radiation, Viral and Blast 10. No cap is stated for Slash, Heat, Toxin or Electricity. — [Status Effect](https://wiki.warframe.com/w/Status_Effect)
- WIKI-CONFIRMED. Stack and value caps on sources:
  - Merciless 12 stacks, Deadhead 3, Dexterity 6.
  - Galvanized multishot max +230%; Galvanized Scope max +320%.
  - Primary Bulwark 500%; Primary Overcharge 350% multishot; Secondary Surge +700%.
  - Progenitor bonus 60%.
  — pages cited in section 4
- OFFICIAL. Enemy-side limit that caps effective player damage: Update 40 made damage attenuation proportional to max health and (40.0.2) "solely reserved for true Bosses and enemies with the HUD health bars". — [forum notes](https://forums.warframe.com/topic/1470920-update-40-the-vallis-undermind/)

### Worked example
With Merciless at 360%, adding Serration takes the bucket from 4.60 to 6.25: +35.9%. Adding a +90% elemental mod as the only element gives +90%. Adding Primed Bane gives +55% direct and +140% on DoT.

### Inferences
- The build advisor's main job is bucket balancing. The marginal value of a mod is (new bucket value / old bucket value), and conditional arcanes change which bucket is "full".

### Gaps
- UNKNOWN. Multishot cap and maximum crit tier (none stated).
- UNKNOWN. Whether the ammo efficiency sum is capped at 100% outside "no ammo consumption" buffs.

---

## What a build calculator must model (ranked by impact on real damage)

1. **Bucket structure.** Base-damage bucket (Serration + arcanes + Vex Armor + additive GunCO), elemental/physical bucket, faction bucket, crit, weak point, final multipliers. A wrong bucket assignment produces errors of 2x or more.
2. **Conditional arcane uptime.** Merciless, Deadhead, Dexterity, Cascadia Flare, Arcane Rage: 180-480% in the Serration bucket. Assume a stated uptime (zero, full, or user-set).
3. **Critical hits with tiers.** Average multiplier 1 + CC x (CD - 1), with flat and relative sources kept separate.
4. **Weak point formula.** (Body + k x weak point damage) x (1 + headshot bonuses), with per-faction head multiplier (3x or about 1.5x) and the per-faction head-crit doubling flag.
5. **GunCO.** Per-attack behaviour flag (adding, multiplying, none, partial percentage), number of status types on target, and the rule that additive CO skips final multipliers, falloff and Incarnon flat damage.
6. **Faction damage.** Linear on hits, squared on DoT ticks; Roar adds to Bane.
7. **DoT ticks.** (seed + 1) x 0.5 or 0.35 x element mods x faction x status damage, from unquantized modded base, inheriting crit and body part multipliers. Often the majority of real damage on Slash, Heat and Toxin builds.
8. **Multishot.** Expected projectile count; per-projectile crit and status; beam merging (summed status chance, quadratic DoT); Acuity lock.
9. **Direct against radial split.** Separate instances; radial gets 1x headshot, no GunCO, linear falloff. Essential for launchers.
10. **Final multipliers.** Eclipse, Primed Chamber, sniper combo, Secondary Surge, Longbow Sharpshot, Primary Compression.
11. **Effective fire rate by trigger type and sustained DPS.** Charge, burst, bow, beam ticks at 0.5 ammo, reload variants, battery recharge, Incarnon charge counts.
12. **Progenitor bonus and Incarnon flat base damage** as base-damage inputs, plus ability-added elements (Nourish, Smite Infusion) as extra elemental mods.
13. **Range falloff and beam ramp-up** (20% to 100% over 0.6 s).
14. **Vigilante set** crit-tier enhance (primaries only).
15. **Quantization.** Damage types to 1/32 (or 1/16) of modded base; crit multiplier to 32/4095. Usually under 1-3%, needed only for exact Simulacrum matching.
16. **Caps.** Semi-auto 10/s, status stack caps, stack limits on arcanes and Galvanized mods.

## Open questions to verify in game (Simulacrum)

1. **Quantum size.** Is it 1/32 or 1/16 of modded base? Use a weapon with a three-way IPS split and no mods; compare popups against both predictions. Hitscan against a Nullifier bubble should show unquantized values as a control.
2. **Head-crit doubling with flat crit damage.** Does the 2x apply to base or total crit multiplier? Test with Tenacious Bond or a Cold-frozen target, body against head, on a Grineer.
3. **Vigilante set below 100% crit chance.** Confirm only actual crits get the tier bump, and measure the rate with 6 mods (expected 30%).
4. **GunCO behaviour for the weapons you care about.** One hitscan and one projectile weapon, Serration on and off, with 1 and 2 status types on target. Confirm adding against multiplying, and confirm additive CO ignores Eclipse and range falloff.
5. **Bucket for Cannonade mods, Spectral Serration and the Madurai +25% weapon damage.** Equip with and without Serration and compare ratios.
6. **Progenitor element combine order** against mod elements (does it combine last, as "innate" elements do?).
7. **Incarnon flat base damage.** Is it added before Serration, split across types proportionally, and included in the quantization scale?
8. **Faction double dip and "triple dip".** Slash tick with Primed Bane against without (expected 1.55^2 = 2.4025). Then Xata's Whisper or Toxic Lash procs to test the claimed third application.
9. **Weak point bracket maths.** Acuity + Deadhead on a Grineer head (expected 10.725x non-crit) and on a Murmur head (expected about (1.5 + 1.5 x 3.5) x 1.3 = 8.775x if the 1.5x head value is right).
10. **Beam ramp-up and merging.** Starting percentage and time to full on a common beam weapon; confirm one damage number per tick with multishot and status chance summing above 100%.
11. **Radial damage and multishot.** For a launcher, does the explosion count scale with multishot, and does the radial instance crit independently of the projectile?
12. **Primed Chamber, sniper combo and Eclipse** as separate multipliers on DoT (Eclipse should apply once, faction twice).
13. **Sub-100% uptime mechanics.** Merciless decay (one stack per 4 s timeout) and Galvanized stack timers, for realistic uptime assumptions.
14. **Bow charge multiplier** (2x on full charge?) and whether GunCO gives only half value on charged shots.
