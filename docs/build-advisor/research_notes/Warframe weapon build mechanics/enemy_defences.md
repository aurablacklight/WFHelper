# Enemy defences in Warframe (state as of 2026-10-05, Update 44.0.3)

Research date 2026-10-05. Latest patch seen: Update 44 "Iceblade of Narin" (2026-09-23), Hotfix 44.0.3 (2026-09-30).

**How to read the labels**

- **WIKI-CONFIRMED**: text read directly from wiki.warframe.com (rendered page or raw wikitext). Formulas marked "(raw)" were read from the LaTeX source.
- **WIKI-VIA-SUMMARY**: the wiki page was fetched through a summarising fetch tool, not read verbatim. Numbers are probably right but should be spot-checked against the page before being hard-coded.
- **COMMUNITY-CONSENSUS**, **DISPUTED**, **UNKNOWN**: as named.
- **COMPUTED**: my own arithmetic from wiki formulas (float64, not the game's binary32, so the last digits can differ slightly).

**Source access limits (important for the report writer)**: Reddit, the official forums (403) and the Brozime vault could not be read in this session. Nothing below is sourced from Brozime, TheKengineer, Tactical Potato or Overframe. Community-only claims are therefore thin, and the exact standardised damage-attenuation formula could not be retrieved.

**Timeline of changes that matter**

| Update | Date | Change |
| --- | --- | --- |
| 27.2 | 2020-03-05 | S-curve scaling; Slash procs bypass armour but not shields; Toxin bypasses shields but not armour |
| 31.5 | 2022 | Eximus rework, Overguard introduced |
| 36.0 Jade Shadows | 2024-06-18 | "Damage 3.0": 13 health types collapsed to Health/Armor/Shield/Overguard; resistances per faction; x1.5 / x0.5; armour cap 2700 and new square-root formula; Steel Path no longer multiplies armour; SP shields 2.5x (was 6.25x); Magnetic works on Overguard |
| 36.1 | 2024-08-21 | Grineer/Corpus enemy damage curve changed at low level |
| 38.0 / 38.5 | 2024-12 / 2025-03-19 | Scaldra and Techrot added; Ancient Healer/Protector aura changes |
| 40.0 The Vallis Undermind | 2025-10-15 | Damage attenuation standardised: caps proportional to max health, per player; boss base health raised |
| 40.0.2 / 40.0.3 | 2025-10-16 / 2025-10-21 | Attenuation removed again from Demolishers, Necramechs, Amalgams, Thumpers, Treasurer etc.; Lich/Sister/Eidolon per-instance cap raised |
| 41.0 The Old Peace | 2025-12-10 | Anarchs faction added |
| 44.0 | 2026-09-23 | Entropic Eximus (90% DR vs guns); MOA/Bursa rear weak points no longer count as headshots |

---

## 1. Damage-type vulnerability and resistance by faction

### Takeaway
Since Update 36 a damage type is worth exactly x1.5 (vulnerable), x1.0 (neutral) or x0.5 (resistant) depending only on the enemy's faction, regardless of whether you are hitting health, shields or an armoured target. Overguard ignores the faction table (neutral to everything except Void +50%).

### Cited Findings

- **WIKI-CONFIRMED (U36, 2024-06-18; table current as of page read 2026-10-05)**: "Vulnerable + = x1.5 and Resistant - = x0.5 incoming damage multiplier." Health types were collapsed to Health, Armor, Shield, Overguard, and "Vulnerabilities and resistances ... are now solely based on the enemy Faction (e.g. all Grineer are now exclusively vulnerable to Impact and Corrosive at all times, regardless of the presence of armor or shields, and no longer have any resistances)." — [Damage](https://wiki.warframe.com/w/Damage)

Full table (parsed programmatically from the wiki overview table; blank = neutral x1.0):

| Faction | Vulnerable (x1.5) | Resistant (x0.5) | Notes |
| --- | --- | --- | --- |
| Grineer | Impact, Corrosive | none | |
| Kuva Grineer | Impact, Corrosive | Heat | sub-faction |
| Corpus | Puncture, Magnetic | none | |
| Corpus Amalgam | Electricity, Magnetic | Blast | sub-faction |
| Infested | Slash, Heat | none | |
| Infested Deimos | Blast, Gas | Viral | sub-faction; note Viral *damage* is halved, the Viral status still works |
| Orokin / Corrupted | Puncture, Viral | Radiation | |
| Sentient | Cold, Radiation | Corrosive | plus adaptation, see section 6 |
| Narmer | Slash, Toxin | Magnetic | |
| The Murmur | Electricity, Radiation | Viral | Rogue Necramechs use this row |
| Zariman (Void Angels, Thrax) | Void | none | |
| Scaldra | Impact, Corrosive | Gas | added U38 |
| Techrot | Gas, Magnetic | Cold | added U38 |
| Anarchs | Impact, Electricity | Radiation | added U41 (2025-12-10) |
| Tenno | none | none | |

Source for every row: [Damage, Overview Table](https://wiki.warframe.com/w/Damage) (transcluded from Damage/Overview Table). The U36 patch notes quoted on the same page confirm the original eight factions and three sub-factions.

- **WIKI-VIA-SUMMARY**: Anarchs "take increased damage from Impact and Electricity damage, but resist Radiation damage"; faction from The Perita Rebellion / The Old Peace; "Unlike their Duviri counterparts, Dax Anarchs possess armor." — [Anarchs](https://wiki.warframe.com/w/Anarchs)
- **WIKI-CONFIRMED**: Modifiers "can change these modifiers down to a minimum of -100% (0x)"; "Sources of damage type resistance stack multiplicatively"; they are independent of Damage Reduction and Damage Vulnerability. — [Damage Type Modifier](https://wiki.warframe.com/w/Damage_Type_Modifier)
- **WIKI-CONFIRMED**: Overguard is neutral to all types except Void +50%. — [Overguard](https://wiki.warframe.com/w/Overguard)
- **WIKI-CONFIRMED**: True damage "Has no faction modifiers"; Slash procs deal "Cinematic" damage. — [Damage](https://wiki.warframe.com/w/Damage)
- **WIKI-CONFIRMED (per-enemy exceptions that override the faction row)**: Hyekkas/Hyekka Masters resist 80% of Heat; Toxic Ancient -80% Toxin; Grineer Prosecutor aura sets physical and primary elements to -100% and combined elements to -85%, with +100% to its own element; Infested Demolishers are immune to Viral status, and Demolisher Juggernaut/Charger are immune to Viral and Toxin *damage*. — [Damage Reduction](https://wiki.warframe.com/w/Damage_Reduction), [Damage Type Modifier](https://wiki.warframe.com/w/Damage_Type_Modifier), [Demolisher](https://wiki.warframe.com/w/Demolisher)
- **WIKI-VIA-SUMMARY**: Kuva Liches have individual modifiers: "weakness (+25% damage), resistance (-50% damage) or immunity (-100% damage) to a particular damage type." — [Kuva Lich/Gameplay](https://wiki.warframe.com/w/Kuva_Lich/Gameplay). Treat as possibly stale: +25% does not match the U36 x1.5 convention.

**Formula** (WIKI-CONFIRMED, [Damage/Calculation](https://wiki.warframe.com/w/Damage/Calculation)):

`Inflicted = sum over types of ( TypeDamage_i x (1 + FactionMod_i) ) x (1 - ArmourDR)`  with FactionMod in {+0.5, 0, -0.5}.

**Worked example**: a hit carrying 100 Impact + 300 Corrosive + 200 Viral.
- vs Grineer: 100x1.5 + 300x1.5 + 200x1.0 = **800** (x1.33 of the 600 listed)
- vs Corpus: 600 (all neutral)
- vs Sentient: 100 + 300x0.5 + 200 = **450**
- vs Infested Deimos: 100 + 300 + 200x0.5 = **500**

### Inferences
- A weapon's "value per point" swings by at most 3x between worst and best element (0.5 vs 1.5). After U36 this is a much smaller lever than armour (10x) or Viral status (up to 4.25x), so element choice should be ranked mainly by its status effect, with the faction modifier as a secondary multiplier.
- Because modifiers apply "at all times", Magnetic gets x1.5 on Corpus health too, not just shields.
- Duviri has no column in the table. Inference: Duviri enemies (Dax, Thrax in Duviri) are neutral to everything.

### Gaps
- No Duviri row; Stalker, Wild, Stalker's Acolytes and "Unaffiliated" enemies are not in the table. Assumed neutral, not confirmed.
- Whether the Lich +25% figure is current.
- Whether faction modifiers apply to damage dealt to shields of every faction was stated generally ("regardless of the presence of armor or shields") but not tested per faction.

---

## 2. Armour

### Takeaway
Enemy armour is capped at 2,700 (90% reduction) and every armoured enemy in Steel Path-level content sits at that cap, so unstripped armour is a flat 10x effective-health multiplier on the health bar. The post-U36 square-root formula makes partial strip valuable: 80% strip (10 Corrosive stacks) gives about 6x damage, full strip 10x.

### Cited Findings

- **WIKI-CONFIRMED (raw LaTeX, U36)**: for Net Armor <= 2700, `Enemy DR = 0.9 x sqrt(NetArmor / 2700)`. If Net Armor exceeds 2,700 "under an exceptional condition", `DR = NetArmor / (NetArmor + 300)`. — [Armor](https://wiki.warframe.com/w/Armor)
- **WIKI-CONFIRMED**: "Enemy armor produced by level scaling is hard capped at 2,700, granting 90% Damage Reduction." Minimum initial armour is 200, but it "can still be decreased below 200 through all normal means of armor removal." — [Armor](https://wiki.warframe.com/w/Armor)
- **WIKI-CONFIRMED (U36 patch notes)**: "Armor has a maximum cap of 2700 Armor (90% Damage Reduction). Armor has a minimum cap of 200 Armor. Steel Path no longer increases Armor values. Grineer enemies have increased Health scaling. Altered the formula for Armor Reduction to increase the effectiveness of Partial Armor Stripping." — [Armor](https://wiki.warframe.com/w/Armor)
- **WIKI-CONFIRMED**: Armour scaling by level: `f1 = 1 + 0.005 x (L - Base)^1.75`, `f2 = 1 + 0.4 x (L - Base)^0.75`, smoothstep blend between level difference 70 and 80. — [Enemy Level Scaling](https://wiki.warframe.com/w/Enemy_Level_Scaling)
- **WIKI-CONFIRMED**: Armour reduces damage to health only, "but not to shields or overguard." — [Damage Reduction](https://wiki.warframe.com/w/Damage_Reduction)
- **WIKI-CONFIRMED**: "each damage type has a minimum damage of 1" against armour. — [Armor](https://wiki.warframe.com/w/Armor)
- **WIKI-CONFIRMED**: who has armour: "all Grineer", "some Murmur, most bosses"; "normal Corpus and Infested enemies do not have any"; exceptions are Bursas, Oxium Osprey, Juggernaut. — [Damage Reduction](https://wiki.warframe.com/w/Damage_Reduction), [Armor](https://wiki.warframe.com/w/Armor)

**Armour strip rules (all WIKI-CONFIRMED, [Armor](https://wiki.warframe.com/w/Armor) and [Damage](https://wiki.warframe.com/w/Damage))**

| Source | Amount | Basis | Notes |
| --- | --- | --- | --- |
| Corrosive status | 26% first stack, +6% each, max 10 stacks = 80% | current armour | 8 s per stack |
| Corrosive with Hydroid passive | first stack 50%, 10 stacks = 100% | current | any source of Corrosive once Hydroid has damaged the target |
| Heat status | 50%, ramps over 2 s | current | lasts while the Heat proc lasts |
| Corrosive Projection aura | 18% each, 72% with four | total (max) | |
| Warframe abilities | varies, e.g. Banshee Sonic Boom 70% scaling to 100% (U44) | total (max) | two 50% casts = full strip |
| Unairu Caustic Strike | 40/60/80/100% | total | |
| Shattering Impact | 6 base armour per Impact hit | flat from base | |

- **WIKI-CONFIRMED**: "Most armor strip effects removes a percentage of the maximum value. For Heat and Corrosive, it is based on the *current* value, and thus has diminishing returns." — [Armor](https://wiki.warframe.com/w/Armor)
- **WIKI-VIA-SUMMARY**: Kuva Lich armour "cannot be stripped" (shields can). — [Kuva Lich/Gameplay](https://wiki.warframe.com/w/Kuva_Lich/Gameplay). Hunhullus is also immune to armour strip (Hotfix 41.0.2). — [Update 41](https://wiki.warframe.com/w/Update_41:_The_Old_Peace)

**What bypasses armour (WIKI-CONFIRMED, [Damage](https://wiki.warframe.com/w/Damage))**

| Damage | Armour | Shields | Overguard | Faction modifiers |
| --- | --- | --- | --- | --- |
| Slash proc ("Cinematic", `DT_CINEMATIC`) | bypasses | does NOT bypass | hits it | not stated |
| Toxin (direct and proc) | reduced normally | bypasses | does not bypass (inferred) | yes |
| True (`DT_HEALTH_DRAIN`) | bypasses | bypasses | hits it | none |
| Finisher | bypasses | hits them | hits it | not stated |
| Everything else | reduced | hits them | hits it | yes |

So "true damage still bypasses": yes for Slash procs versus armour, yes for Toxin versus shields. Slash procs have not bypassed shields since U27.2.

**Worked example: armour value.** Heavy Gunner, base armour 500, base level 8, at level 175: multiplier = 1 + 0.4 x 167^0.75 = 19.58, raw armour 9,791, capped to **2,700**, DR = 0.9 x sqrt(2700/2700) = **90%**. (COMPUTED)

**Worked example: partial strip from the 2,700 cap** (COMPUTED from the wiki formula)

| State | Net armour | DR | Damage taken | Gain vs unstripped |
| --- | --- | --- | --- | --- |
| No strip | 2,700 | 90.0% | 0.100 | 1.00x |
| 1 Corrosive Projection (18%) | 2,214 | 81.5% | 0.185 | 1.85x |
| 1 Corrosive stack (26%) | 1,998 | 77.4% | 0.226 | 2.26x |
| Heat proc (50%) | 1,350 | 63.6% | 0.364 | 3.64x |
| 4 Corrosive Projection (72%) | 756 | 47.6% | 0.524 | 5.24x |
| 10 Corrosive stacks (80%) | 540 | 40.2% | 0.598 | 5.98x |
| 10 Corrosive + Heat (assumed multiplicative) | 270 | 28.5% | 0.715 | 7.15x |
| Full strip | 0 | 0% | 1.000 | 10.00x |

### Inferences
- At Steel Path levels even a 100-base-armour unit reaches about 1,960 to 2,700 armour, so "armoured = 90% DR" is a safe calculator default for level 150+.
- Because DR follows a square root, the first 50% of strip is worth 3.6x and the last 20% (80% to 100%) is worth only 1.67x. Full strip is no longer mandatory; 80% strip captures 60% of the benefit.
- Slash procs are the one common damage source that is completely indifferent to armour. Against a capped target a Slash tick is worth 10x a same-sized armour-reduced tick (Heat, Toxin, Electricity, Gas procs are all reduced by armour).
- Corrosive gets a double benefit against Grineer and Scaldra: x1.5 faction modifier and its status strips armour.

### Gaps
- Whether Heat's 50% and Corrosive's 80% combine multiplicatively on current armour (270 remaining) is my reading of "based on the current value"; not explicitly stated.
- The "exceptional condition" where armour exceeds 2,700 is not explained. UNKNOWN which enemies or modifiers trigger it.
- Whether percentage-of-total strips are computed from the capped 2,700 or the uncapped scaled value. The wiki wording (armour "is hard capped") implies capped.
- Which Murmur units carry armour and their base values (data module not found).

---

## 3. Shields

### Takeaway
Enemy shields take full damage from everything (no armour, no innate shield DR), are bypassed entirely by Toxin and True damage, and have a short gate that blocks 95% of overflow for 0.1 s unless you hit a weak point. Magnetic status multiplies damage to shields by 2x to 4.25x and stops regeneration.

### Cited Findings

- **WIKI-CONFIRMED**: "Toxin damage completely ignores normal shields, dealing damage directly to the health points underneath." Exceptions: "Some special enemies like Treasurer or Hounds cannot have their shields bypassed with Toxin damage." — [Shield](https://wiki.warframe.com/w/Shield), [Damage/Calculation](https://wiki.warframe.com/w/Damage/Calculation)
- **WIKI-CONFIRMED**: "Enemies have a shield gate that lasts 0.1 seconds, during which only 5% of the damage dealt will damage their health. However, targeting weakspots will completely bypass their shield gate. Some area of effect attacks (like slam attacks) do not benefit from the damage bypass and instead will have the damage instance completely blocked. Additional damage instance associated with the attack such as status effects or Xata's Whisper can still damage the enemy." — [Shield](https://wiki.warframe.com/w/Shield)
- **WIKI-CONFIRMED**: Magnetic status: "+100% additional damage" to Shields and Overguard for 6 s, +25% per extra stack, 10 stacks = +325% (x4.25); blocks natural shield regeneration; "When Shields/Overguard break, the target receives Electricity damage and status equal to 3% of the target's maximum Shields/Overguard per Magnetic stack up to 30%." — [Damage](https://wiki.warframe.com/w/Damage)
- **WIKI-CONFIRMED (U36)**: Shields scale faster from level 80; recharge delay unified, at most 3 s, longer the more damage was dealt; "Steel Path Shields are now multiplied by 2.5x, in place of the previous 6.25x." — [Shield](https://wiki.warframe.com/w/Shield)
- **WIKI-CONFIRMED**: Shield strip effects remove a percentage of the *current* value (diminishing). Shield Disruption aura 18% each, hard cap 80%. — [Shield](https://wiki.warframe.com/w/Shield)
- **WIKI-CONFIRMED**: armour does not protect shields: "damage to shields is not mitigated by armor." — [Damage/Calculation](https://wiki.warframe.com/w/Damage/Calculation)
- **WIKI-CONFIRMED**: shield scaling curves (blend between level difference 70 and 80). — [Enemy Level Scaling](https://wiki.warframe.com/w/Enemy_Level_Scaling)

| Faction | f1 (low) | f2 (high) |
| --- | --- | --- |
| Corpus | 1 + 0.02 x d^1.76 | 1 + 2 x d^0.76 |
| Corrupted, Anarchs | 1 + 0.02 x d^1.75 | 1 + 2 x d^0.75 |
| Grineer, Sentient | 1 + 0.02 x d^1.75 | 1 + 1.6 x d^0.75 |
| Techrot | 1 + 0.02 x d^1.76 | 1 + 3.5 x d^0.76 |

(d = current level minus base level)

**Worked example (COMPUTED)**: Corpus Tech (700 health, 250 shields, base level 15) at Steel Path level 175: health multiplier 219.7, shield multiplier 95.7, so health = 700 x 219.7 x 2.5 = **384,525** and shields = 250 x 95.7 x 2.5 = **59,787**. Shields are only 13% of the total pool.
- A 500,000-damage body shot with no Toxin: 59,787 breaks shields, the remaining 440,213 is gated to 5% = 22,011 to health. The Tech survives with 94% health.
- The same shot to the head bypasses the gate and kills.
- A pure Toxin hit ignores the 59,787 shields and the gate.
- With 10 Magnetic stacks plus the Corpus x1.5 Magnetic modifier, shield damage is multiplied by 4.25 (and 1.5 for the Magnetic portion); breaking shields then deals 30% of 59,787 = 17,936 Electricity.

### Inferences
- For ordinary shielded units at Steel Path levels the shield pool is small relative to health (10 to 40% of the total), so shields matter mainly through the **gate**, not their size. The gate punishes single big body-shot hits and slam attacks, and is irrelevant to headshot builds, rapid fire, Toxin and DoT procs.
- A calculator should treat a shielded target as "hits to kill >= 2 for body shots without Toxin", rather than adding shields to effective health and dividing.
- Above about level 2,000 Corpus shields overtake health (the wiki notes shield scaling surpasses health above level 2025), so Toxin/Magnetic value rises steeply at level cap.

### Gaps
- Whether the 5% leak is applied to the whole hit or only the overflow is not spelled out; I assumed overflow.
- Whether Slash/Heat procs ticking during the 0.1 s gate are reduced.
- Shield recharge rate numbers at high level are not given.

---

## 4. Overguard

### Takeaway
Overguard is a separate bar on top of shields and health that ignores armour, ignores faction weaknesses and is identical for every Eximus at a given level (about 324,000 at level 175). While it is up the enemy is immune to most crowd control, but still takes status effects and can still be armour or shield stripped underneath.

### Cited Findings

- **WIKI-CONFIRMED**: "All Eximus units have a base Overguard of 12." Scaling uses `q = level - 1` (not base level): `f1 = 1 + 0.0015 x q^4`, `f2 = 1 + 260 x q^0.9`, smoothstep blend between q = 45 and 50. "Overguard will scale by level but will be the same amount across all Eximus enemy types." — [Overguard](https://wiki.warframe.com/w/Overguard), [Enemy Level Scaling](https://wiki.warframe.com/w/Enemy_Level_Scaling)
- **WIKI-CONFIRMED**: Neutral to every damage type; Void +50%. "Overguard is not affected by Damage Reduction from armor or abilities." "Damage Vulnerability applies normally to Overguard." "Enemies can still have their shields and armor stripped while their Overguard is active." "Enemies do not have any invulnerability gating when their Overguard is depleted." — [Overguard](https://wiki.warframe.com/w/Overguard)
- **WIKI-CONFIRMED**: Good against Overguard: Magnetic status (x2 to x4.25, and 3% per stack of max Overguard as Electricity on break, U36); Secondary Fortifier (up to 8x for secondaries and Arch-guns); Vauban Photon Strike +200%; Oberon Smite removes it; Hound Null Audit removes 50%; companion Assassin Posture +300%. — [Overguard](https://wiki.warframe.com/w/Overguard)
- **WIKI-CONFIRMED**: Blocks on enemies: "Stagger, Knockdown, Stun, Mind Control, Confusion (including Radiation procs), Slow, Ragdoll, Blind, and Lifted, and can normally only receive a maximum of 4 Cold procs." Enemies "can receive Status Effects." — [Overguard](https://wiki.warframe.com/w/Overguard)
- **WIKI-CONFIRMED**: Slash procs and True damage damage Overguard (they do not skip it). — [Damage](https://wiki.warframe.com/w/Damage)
- **WIKI-CONFIRMED**: Non-Eximus Overguard: Nox and Scaldra Dedicant (removed instantly by breaking the helmet/ampule), Thrax Centurion/Legatus, Kuva Trokarian, Dax Malleus in the Circuit, Ancient Protector / Corrupted Ancient (grants allies 9x its health as Overguard, 15 s, since U38.5), The Severed Warden, and the Archimedea "Bolstered Belligerents" variable ("All enemies have Overguard equal to 50% of their max health"). — [Overguard](https://wiki.warframe.com/w/Overguard)
- **WIKI-CONFIRMED (U36 fix)**: VIP enemies with Overguard take at most 3 Puncture stacks. Blast stacks cap at 4 on "bosses and eximus-type enemies". — [Overguard](https://wiki.warframe.com/w/Overguard), [Damage/Calculation](https://wiki.warframe.com/w/Damage/Calculation)

**Worked example (COMPUTED)**: level 175: q = 174, f2 = 1 + 260 x 174^0.9 = 27,007; Overguard = 12 x 27,007 = **324,090**.

| Level | 30 | 50 | 100 | 150 | 175 | 200 | 275 | 400 | 500 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Eximus Overguard | 12,743 | 103,623 | 195,098 | 281,865 | 324,090 | 365,710 | 487,687 | 683,971 | 836,472 |

### Inferences
- Overguard is "unarmoured, weakness-free health". For a Steel Path Heavy Gunner Eximus the Overguard (324k) is small next to the armoured health behind it (1.93M health, 19.3M effective), so Overguard matters less than armour on Grineer Eximus. On Corpus or Infested Eximus it is a meaningful share.
- Viral does nothing to Overguard (it amplifies Health damage only); Magnetic is the status that helps. Corrosive strip can be pre-applied through Overguard.
- Since no faction modifier applies, per-point damage on Overguard is the raw sum of all types: a good neutral benchmark bar for a calculator.

### Gaps
- UNKNOWN whether the Steel Path 2.5x multiplier applies to Overguard. The Steel Path page lists only health and shields.
- Whether weak-point and crit multipliers apply normally to Overguard (assumed yes; not stated).
- Whether Toxin is blocked by Overguard is implied (only True/Cinematic/Finisher are listed as damaging it specially) but not stated outright.

---

## 5. Level scaling and Steel Path

### Takeaway
Health follows a two-part curve per faction with a switch between 70 and 80 levels above base level; above that it grows roughly with level^0.5 to level^0.72. Steel Path adds +100 levels and multiplies health and shields by 2.5 (armour unchanged since U36). Past level 150 enemy toughness grows slowly: level 500 is only about 2x level 175.

### Cited Findings

- **WIKI-CONFIRMED**: General form `Multiplier = f1 + (f2 - f1) x s`, `s = smoothstep((d - 70)/10)`, `d = level - base level`; `Current = Base x Multiplier` (binary32 arithmetic in game). — [Enemy Level Scaling](https://wiki.warframe.com/w/Enemy_Level_Scaling)

Health curves (WIKI-CONFIRMED, same page):

| Faction group | f1 (d < 70) | f2 (d > 80) |
| --- | --- | --- |
| Grineer, Scaldra | 1 + 0.015 x d^2.12 | 1 + 10.7332 x d^0.72 |
| Corpus | 1 + 0.015 x d^2.12 | 1 + 13.4165 x d^0.55 |
| Infested | 1 + 0.0225 x d^2.12 | 1 + 16.0998 x d^0.72 |
| Corrupted | 1 + 0.015 x d^2.1 | 1 + 10.7332 x d^0.685 |
| Murmur, Sentient, Anarchs, Unaffiliated | 1 + 0.015 x d^2 | 1 + 10.7332 x d^0.5 |
| Techrot | 1 + 0.02 x d^2.12 | 1 + 15.0998 x d^0.7 |

(The wiki's tab list puts Anarchs with Corrupted, but the formula caption puts Anarchs with Murmur/Sentient. DISPUTED within the page.)

- **WIKI-CONFIRMED**: Eximus base health is replaced before scaling. For level > 100: `max(1.1 x Base, 0.25 x (Base + 900) x 6)` if the unit has shields or armour, `0.375` instead of `0.25` if it has neither. Eximus shields above level 100: `Base x 6`. — [Enemy Level Scaling](https://wiki.warframe.com/w/Enemy_Level_Scaling)
- **WIKI-CONFIRMED**: Enemy damage: `1 + 0.015 x d^1.55`; Grineer/Corpus/Techrot use a blend of `1 + 0.015 x d^1.75` and `1 + 0.0075 x d^1.55` (levels 1 to 25) and an extra 2x; Infested 3x. — [Enemy Level Scaling](https://wiki.warframe.com/w/Enemy_Level_Scaling)
- **WIKI-CONFIRMED**: "stats of regular enemies don't scale with squad size. Known exceptions are Demolishers, Acolytes and Archons." Level cap 9,999. — [Enemy Level Scaling](https://wiki.warframe.com/w/Enemy_Level_Scaling)
- **WIKI-VIA-SUMMARY**: Steel Path: "Level +100 (Only +50 On Archwing / Railjack)", "Health 250%", "Shield 250%"; U36: "Steel Path no longer increases Armor values." Duviri: +20 levels and no health/shield change. Eidolons on SP are level 110/120/130. — [The Steel Path](https://wiki.warframe.com/w/The_Steel_Path)
- **WIKI-VIA-SUMMARY**: Deep Archimedea levels 250-275, Elite 375-400. Temporal Archimedea 350-375, Elite 475-500. — [Deep Archimedea](https://wiki.warframe.com/w/Deep_Archimedea), [Temporal Archimedea](https://wiki.warframe.com/w/Temporal_Archimedea)

**Multiplier table, base level 1 (COMPUTED)**

| Level | Grineer/Scaldra HP | Corpus HP | Infested HP | Corrupted HP | Murmur/Sentient HP | Techrot HP | Corpus shield | Grineer shield | Techrot shield | Armour (uncapped) | Enemy damage |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 50 | 58.5 | 58.5 | 87.2 | 54.1 | 37.0 | 77.6 | 19.9 | 19.1 | 19.9 | 5.5 | 7.3 |
| 100 | 294.5 | 169.0 | 441.2 | 250.9 | 107.8 | 377.6 | 66.7 | 51.2 | 116.0 | 13.6 | 19.6 |
| 150 | 394.9 | 211.3 | 591.9 | 331.6 | 132.0 | 502.4 | 90.7 | 69.2 | 157.9 | 18.1 | 36.0 |
| 175 | 441.5 | 230.1 | 661.7 | 368.7 | 142.6 | 559.9 | 101.9 | 77.7 | 177.6 | 20.2 | 45.6 |
| 200 | 486.2 | 247.6 | 728.8 | 404.1 | 152.4 | 615.0 | 112.7 | 85.8 | 196.5 | 22.2 | 55.9 |
| 275 | 611.8 | 295.0 | 917.2 | 502.9 | 178.7 | 769.1 | 143.5 | 108.8 | 250.3 | 27.9 | 91.1 |
| 400 | 801.6 | 362.6 | 1,201.9 | 650.2 | 215.4 | 1,000.2 | 190.6 | 143.8 | 332.7 | 36.7 | 162.3 |
| 500 | 941.5 | 409.9 | 1,411.8 | 757.7 | 240.8 | 1,169.5 | 225.7 | 169.9 | 394.2 | 43.2 | 229.1 |
| 1,000 | 1,551 | 600 | 2,327 | 1,218 | 340 | 1,901 | 382 | 285 | 667 | 72.1 | 670 |
| 9,999 | 8,142 | 2,127 | 12,212 | 5,899 | 1,074 | 9,527 | 2,194 | 1,601 | 3,838 | 401 | 23,767 |

**Worked example**: Heavy Gunner (300 health, base level 8) at Steel Path level 175: d = 167, f2 = 1 + 10.7332 x 167^0.72 = 428.6; health = 300 x 428.6 x 2.5 = **321,485**. Armour capped 2,700, so effective health against armour-affected damage = 321,485 / 0.1 = **3.21 million**.

**Reference heavy units, Steel Path level 150 / 175 / 200 (COMPUTED; base stats WIKI-VIA-SUMMARY from the wiki enemy data modules [grineer](https://wiki.warframe.com/w/Module:Enemies/data/grineer), [corpus](https://wiki.warframe.com/w/Module:Enemies/data/corpus), [orokin](https://wiki.warframe.com/w/Module:Enemies/data/orokin), [scaldra](https://wiki.warframe.com/w/Module:Enemies/data/scaldra), [techrot](https://wiki.warframe.com/w/Module:Enemies/data/techrot))**

| Unit (base health / armour or shield, base level) | Health L150 / L175 / L200 | Shields L175 | Armour, DR | Effective health L175, unstripped | Fully stripped |
| --- | --- | --- | --- | --- | --- |
| Grineer Heavy Gunner (300 / 500 armour, lvl 8) | 286k / 321k / 355k | none | 2,700, 90% | 3.21M | 321k |
| Heavy Gunner Eximus (1,800 after Eximus rule) | 1.72M / 1.93M / 2.13M | none | 2,700, 90% | 19.3M + 324k Overguard | 1.93M + 324k |
| Grineer Elite Lancer (150 / 200, lvl 1) | 148k / 166k / 182k | none | 2,700, 90% | 1.66M | 166k |
| Corrupted Heavy Gunner (700 / 500, lvl 8) | 562k / 627k / 690k | none | 2,700, 90% | 6.27M | 627k |
| Corpus Tech (700 / 250 shield, lvl 15) | 350k / 385k / 416k | 59.8k | none | 444k | 444k |
| Corpus Elite Crewman (110 / 150 shield, lvl 1) | 58k / 63k / 68k | 38.2k | none | 101k | 101k |
| Infested, per 100 base health | 148k / 165k / 182k | none | none | 165k | 165k |
| Murmur, per 100 base health | 33k / 36k / 38k | none | varies | 36k (unarmoured) | 36k |
| Scaldra Eradicator (325 / 500, lvl 1) | 321k / 359k / 395k | none | 2,700, 90% | 3.59M | 359k |
| Techrot Scaart (1,200 / 300 armour, lvl 1) | 1.51M / 1.68M / 1.85M | none | 2,700, 90% | 16.8M | 1.68M |

Caveat: the grineer module summary gave Heavy Gunner base level 1; I used the long-standing base level 8 (the Corrupted variant was reported as 8). The difference at level 175 is under 3%.

**Elite Archimedea reference, level 400 (EDA) and 500 (ETA)** (COMPUTED). Two columns because the health modifier is not confirmed (see Gaps):

| Unit | L400 health, no multiplier | L400 with x2.5 | L500 health, no multiplier | L500 with x2.5 | Armour |
| --- | --- | --- | --- | --- | --- |
| Grineer Heavy Gunner | 237k | 594k | 280k | 699k | 2,700 (90%) |
| Corrupted Heavy Gunner | 450k | 1.12M | 525k | 1.31M | 2,700 (90%) |
| Corpus Tech (shields in brackets) | 249k (+46k) | 622k (+116k) | 282k (+55k) | 706k (+138k) | none |
| Infested per 100 base | 120k | 300k | 141k | 353k | none |
| Murmur per 100 base | 21.5k | 53.8k | 24.1k | 60.2k | varies |
| Scaldra Eradicator | 261k | 651k | 306k | 765k | 2,700 (90%) |
| Scaldra Dedicant (2,000 / 500) | 1.60M | 4.01M | 1.88M | 4.71M | 2,700 (90%) + Overguard |
| Techrot Scaart | 1.20M | 3.00M | 1.40M | 3.51M | 2,700 (90%) |
| Techrot Babau (10,000 / 500 shield) | 10.0M (+166k) | 25.0M (+416k) | 11.7M (+197k) | 29.2M (+493k) | none |
| Eximus Overguard | 684k | unknown | 836k | unknown | n/a |

### Inferences
- Above level 150, a Steel Path level 175 Grineer heavy (3.2M effective) and an Elite Temporal Archimedea level 500 one (2.8M with no multiplier, 7.0M with x2.5) are in the same order of magnitude. A build that comfortably kills SP heavies is within about 2x of EDA/ETA raw toughness; the Archimedea modifiers (section 8) are what change the picture.
- Infested have the steepest health curve but no armour; Murmur have by far the lowest health multiplier.
- Techrot Babau (10,000 base health since Hotfix 40.0.3) is the standout "ordinary" bullet sponge: 10M+ at level 400.

### Gaps
- UNKNOWN / needs verification: the health and shield multiplier in Deep and Temporal Archimedea. The summariser reported "Steel Path multipliers do not apply" and separately "Enemy Health and Shields increased by 100% and an additional 50% for each squad member, stacking to a maximum of 300%" for Deep Archimedea. I could not read that text verbatim; it may belong to a specific modifier. Both columns are given above.
- Base stats for Infested Ancients, Nox, Bombard-class Kuva units, Murmur and Thrax units were not retrieved (data module names not found or truncated).
- Exact level range the game uses for "Steel Path level 150-200" depends on node and mission time; not sourced here.

---

## 6. Damage attenuation and special-enemy damage reduction

### Takeaway
Since Update 40 (2025-10-15) nearly all true bosses share one Archon-style attenuation model with two caps, Max Damage Per Instance and Max Damage Per Second, both proportional to the enemy's max health and tracked per player. Official numbers for those percentages are not published, so a calculator can model the shape (diminishing returns on both hit size and sustained DPS) but not exact values. Demolishers, Necramechs and Thumpers have had no attenuation since Hotfix 40.0.2.

### Cited Findings

**The current system (WIKI-CONFIRMED, official patch notes quoted on [Damage Reduction](https://wiki.warframe.com/w/Damage_Reduction); also [official Update 40 notes](https://www.warframe.com/en/patch-notes/xbox/40-0-0))**

- U40 definitions: "Max Damage Per Second (MDPS): a target cap of the amount of damage an enemy can receive per second. Sustained damage over time is reduced to avoid exceeding that target cap." "Max Damage Per Instance (MDPI): a cap applied to the amount of damage applied in one damage instance. (ex, a sniper bullet or melee hit)."
- "Firstly, Damage Attenuation values are now proportional to Max Health. Secondly, Damage Attenuation's MDPS now applies independently between players." "Max Health for this calculation only uses the Health value. Overguard, Shield, and Armor values are not considered."
- "For those familiar with Archon Hunts, our new standard model is based around the Damage Attenuation in those missions." Stated goal: "reward players with powerful builds but still avoid one-shotting Archons."
- Hotfix 40.0.2 (2025-10-16): "Damage Attenuation is now solely reserved for true Bosses and enemies with the HUD health bars." Removed from: Scaldra Dedicants, **Demolishers (including Necramechs)**, Deimos Jugulus/Saxum, **Rogue Necramechs**, **Amalgams**, Corpus Proxima Empyrean units, Errant Specters, Gruzzling, Necramite, Sister Hounds, Techrot Babau, Treasurer, **Tusk Thumpers**. "Boss Enemies with Damage Attenuation that can be One-Shot: Acolytes, Infested Oni."
- Hotfix 40.0.3 (2025-10-21): "Increased the MDPI ... on Kuva Lich, Sisters of Parvos and Technocyte Coda, so that weapons like Snipers are more effective." "Greatly increased the MDPI ... for Eidolons." Skittergirl: attenuation replaced by flat 90% DR.

**Per-enemy status after U40.0.3**

| Enemy | Attenuation now? | Other defences | Source |
| --- | --- | --- | --- |
| Archons (Amar, Nira, Boreal) | Yes, standard model | flat 20% DR to all damage, 50% DR to status damage; tiny Overguard phases | [Archon](https://wiki.warframe.com/w/Archon) |
| Acolytes | Yes, tuned so one-shots are possible | base health 5,500 (was 550), shields 2,500; max 4 stacks of any status (Impact 3); health scales with squad | [Acolytes](https://wiki.warframe.com/w/Acolytes) (via summary), [Damage Reduction](https://wiki.warframe.com/w/Damage_Reduction) |
| Kuva Lich / Sister / Technocyte Coda | Yes, MDPI raised in 40.0.3 | max 4 status stacks (Impact 6); armour cannot be stripped; personal weakness/resistance/immunity element | [Kuva Lich/Gameplay](https://wiki.warframe.com/w/Kuva_Lich/Gameplay) (via summary) |
| Kuva Thralls | Yes | "innate 25% damage reduction on top of their armor" | [Damage Reduction](https://wiki.warframe.com/w/Damage_Reduction) |
| Eidolons | Yes, MDPI "greatly increased" | base health raised about 5x; body 2x multiplier, head 3x, crits x2; AoE gets no head bonus | [Damage Reduction](https://wiki.warframe.com/w/Damage_Reduction) |
| Void Angel (and Archimedea revival variant) | Yes | 2 or 3 health bars with an Operator phase; max 4 status stacks (Impact 6); Zariman x1.5 Void | [Void Angel](https://wiki.warframe.com/w/Void_Angel) (via summary) |
| The Fragmented One / Suzerain / Tide | Yes | weak point teal spheres 2x and +1 crit tier; +150,000 base health in SP/Deep Archimedea | [The Fragmented](https://wiki.warframe.com/w/The_Fragmented) (via summary) |
| Legacyte, H-09 tank (Temporal Archimedea) | Yes | Legacyte +7,500 base health in SP/TA | [Damage Reduction](https://wiki.warframe.com/w/Damage_Reduction), [Temporal Archimedea](https://wiki.warframe.com/w/Temporal_Archimedea) (via summary) |
| Lephantis / Hemocyte | Yes | crits x2; chest weak point x2 | [Damage Reduction](https://wiki.warframe.com/w/Damage_Reduction) |
| Juggernaut | Yes (all variants listed in U40, not in the 40.0.2 removal list) | 90% DR except weak points (10x, crit x4); extra 50% DR vs AoE and melee; no status except on weak points | [Damage Reduction](https://wiki.warframe.com/w/Damage_Reduction) |
| Demolishers / Demolysts | **No** (removed 40.0.2) | nullifier pulse every 5 s, 6.5 m; health +50/+100/+200% for squad of 2/3/4; immune to most CC; Demolisher Heavy Gunner and Demolisher Juggernaut have 20% DR; Cold slows up to 90% but never freezes | [Demolisher](https://wiki.warframe.com/w/Demolisher), [Heavy Gunner](https://wiki.warframe.com/w/Heavy_Gunner) |
| Necramechs (Rogue and Demolisher) | **No** (removed 40.0.2) | base health 7,500 (was 3,800); Murmur weaknesses; Voidrig weak point on the back | [Damage Reduction](https://wiki.warframe.com/w/Damage_Reduction) |
| Thrax Centurion / Legatus | Not in the attenuation list | Overguard; spectral phase | [Overguard](https://wiki.warframe.com/w/Overguard) |
| Stalker variants | No ("do not use the new Damage Attenuation") | Shadow Stalker has Sentient-style adaptation | [Damage Reduction](https://wiki.warframe.com/w/Damage_Reduction) |
| Sentients | No attenuation; **adaptation** | see below | [Sentient](https://wiki.warframe.com/w/Sentient) (via summary) |
| Orphix / Condrix | Own formula (crits excluded from the DPS measure) | see below | [Damage Reduction](https://wiki.warframe.com/w/Damage_Reduction) |
| Treasurer | No attenuation | shield has 99% DR and cannot be Toxin-bypassed; health 98% DR | [Damage Reduction](https://wiki.warframe.com/w/Damage_Reduction) |

**Formulas that are actually published**

1. Per-instance soft cap (Lephantis/Hemocyte, WIKI-CONFIRMED, [Damage Reduction](https://wiki.warframe.com/w/Damage_Reduction)):

   `Incoming = Damage x BodyPart x CritMult x other multipliers`
   `MaxPerHit = k x MaxHealth` (k = 0.05 for Lephantis/Hemocyte)
   `Attenuated = Incoming x MaxPerHit / (Incoming x Multishot + MaxPerHit)`

   Wiki example: 1,000 damage, 3x crit (doubled to 6x on this boss), 2x weak point, multishot 2, Hemocyte with 2,472,207 health: Incoming = 12,000; MaxPerHit = 123,610; Attenuated = 12,000 x 123,610 / (24,000 + 123,610) = **10,049** per projectile.
   Limit behaviour: as Incoming grows, total per trigger pull approaches MaxPerHit. A 1,000,000 hit with multishot 1 lands as 110,014 (11%). The Hemocyte also has a DPS cap "based on 20% of the Hemocyte's maximum health."

2. Archon parameters (WIKI-CONFIRMED but **probably stale**, [Archon](https://wiki.warframe.com/w/Archon)): "Max Damage Per Trigger = 460000, Max Damage Per Second = 935000, Exponential Decay Constant lambda = 2/3, ShotgunCompensation = 0.7 if base multishot > 0, 1 otherwise." The Fragmented: MDPT 175,000, MDPS 300,000. The page still says Archons "limit damage per second to 935,000". These are flat pre-U40 values and conflict with U40's "proportional to Max Health". DISPUTED / needs in-game check. The wiki gives the parameters but not the equation that combines them.

3. Burst DPS as the game measures it (WIKI-CONFIRMED): `damage x crit multiplier (if the instance crits) x fire rate x multishot x body-part multipliers`, after mods and buffs. Attenuation "stacks multiplicatively with DR provided by the enemy's armor." — [Damage Reduction](https://wiki.warframe.com/w/Damage_Reduction)

4. Orphix (WIKI-CONFIRMED): DPS measured **without crits** ("Critical Hits are applied after DR is calculated"):

   | Average DPS | Damage modifier |
   | --- | --- |
   | <= 1,000 | 1 |
   | 1,000 to 2,500 | 0.7 + 300/DPS |
   | 2,500 to 5,000 | 0.5 + 800/DPS |
   | 5,000 to 10,000 | 0.2 + 2300/DPS |
   | > 10,000 | 0.02 + 4100/DPS |

   Example: 50,000 non-crit DPS gives modifier 0.02 + 0.082 = 0.102, so 5,100 effective DPS before crits; crit multiplier then applies in full.

5. Sentient adaptation (WIKI-VIA-SUMMARY, [Sentient](https://wiki.warframe.com/w/Sentient)): at 25%, 45%, 65% and 80% health lost the Sentient gains resistance to the damage type it has taken most; up to 4 types; resistance 90% for the first type, then 80%, 75%, 70%. Void damage resets all adaptations. Brachiolysts and Tyro Conculysts do not adapt.

**What each mechanic rewards**

| Mechanic | Rewards | Punishes |
| --- | --- | --- |
| MDPI (per-instance cap) | many moderate hits, multishot spread, DoT ticks | one huge hit (snipers, heavy attacks, nukes) |
| MDPS (sustained cap, decaying average) | short bursts with pauses, front-loaded damage, each squad member contributing separately (per-player since U40) | holding the trigger with very high sustained DPS |
| Caps proportional to max health (U40) | nothing in particular: time-to-kill is roughly fixed as a fraction of health per second once you exceed the cap | over-investment in damage beyond the cap |
| Archon extras | raw hits over DoT (status damage halved) | status-DoT builds |
| Orphix/Condrix | critical multiplier (applied after DR) | base damage, fire rate, multishot |
| Sentient adaptation | 3+ damage types spread evenly, Void resets, killing inside one health gate | mono-element builds |
| Flat DR (Juggernaut 90%, Guardian aura 90%, Entropic 90%) | weak-point accuracy, melee (Entropic) | AoE, body shots |

### Inferences
- With caps proportional to max health, the meaningful output against a boss is "is this build above the cap?" (yes/no), not its raw DPS. For attenuated bosses a calculator should report time-to-kill as bounded below by `MaxHealth / MDPS`, and flag builds whose single hit greatly exceeds MDPI as wasting damage.
- The Hemocyte-style formula `D x M / (D x multishot + M)` is the only published closed form; the pre-U40 Archon "MDPT" plus "ShotgunCompensation" parameters suggest the standard model has the same hyperbolic shape with a multishot term. This is my inference, not a sourced statement.
- Level-cap discussions: at level 9,999 ordinary enemies have about 8,100x (Grineer) base health and still only 2,700 armour, and no attenuation at all. The "level-cap attenuation" debate applies only to bosses/Acolytes; for ordinary level-cap enemies the calculator needs nothing beyond sections 2 to 5.

### Gaps
- UNKNOWN: the MDPS and MDPI percentages of max health for any enemy post-U40, and the exact equation. DE's notes deliberately give none. The Reddit analysis "How Damage Attenuation Works, Pt. 2 - Archons" (r/Warframe, 2022) and the Dev Workshop thread on forums.warframe.com exist but could not be opened.
- Whether the Archon flat 20% DR and 50% status-damage DR survived U40 (the wiki text may predate it).
- Whether crits, weak points and faction bonuses are counted before the MDPI cap in the standard model (they are for Hemocyte; they are excluded for Orphix).
- Deep/Temporal Archimedea boss values specifically.
- Thrax, Demolyst-specific and Kuva Lich base stats.

---

## 7. Weak points, headshots and crits

### Takeaway
A head on most factions is a 3x multiplier, and on enemies that support "headcrit" a critical headshot doubles the crit multiplier on top, so crit builds gain far more from headshots than non-crit builds. Corpus humanoids, most Murmur and much of Techrot do not get the headcrit doubling, and Murmur/Techrot weak points are only about 1.5x.

### Cited Findings (all WIKI-CONFIRMED, raw wikitext of [Enemy Body Parts](https://wiki.warframe.com/w/Enemy_Body_Parts) unless noted)

- "Typical multiplier for headshots against Grineer, Corpus, Infested, Sentient, Anarchs, Narmer, and Corrupted variants is 3.0x. For The Murmur and Techrot, the usual multiplier is closer to 1.5x."
- Weak-point damage bonuses add to the multiplier, at 1.5x rate if the weak point is a head: `(3 + 1.5 x (3.5 + 0.75)) = 9.375x` (Seek plus max Primary Acuity); on a 1x non-head weak point `(1 + 3.5 + 0.75) = 5.25x`.
- Headshot-multiplier bonuses (Deadhead, Prowl, sniper zoom) multiply after that: `9.375 x (1 + 0.3 + 0.4) = 15.9375x`.
- Headcrit: "Applies a 2x multiplier to the weapon's base critical mult." It "activates reliably on the heads of Grineer (along with Corrupted/Narmer/Anarchs variants of Grineer), Dax Anarchs, Scaldra and most Infested and Sentient foes, it excludes the heads of all Corpus humanoids and ground units, most of the The Murmur, and much of Techrot." Exceptions: Juggernaut maw and belly 4x, Ropalolyst head 0.2x.
- Formula ([Critical Hit](https://wiki.warframe.com/w/Critical_Hit)): `Headshot Crit Tier Multi = Headshot Multi x (1 + Crit Tier x (2 x Total Crit Multiplier - 1))`.
- Crit promotion: some weak points (Rogue Culverin canisters, Scaldra backpacks, Fragmented teal spheres) raise the crit tier by one.
- Weak-point hits "completely bypass" enemy shield gating.
- U44 (2026-09-23): Bursa and most MOA rear hitboxes, and Lumbering Fragment's weak point, became non-headshot weak points (weak-point bonuses apply at 1x rate, no headshot-multiplier bonuses, no headcrit).
- AoE cannot headshot; some weapons (Arca Plasmor) get no headshot bonus. — [Damage/Calculation](https://wiki.warframe.com/w/Damage/Calculation)
- DoT inherits the body-part multiplier of the hit that caused it (but not Sonar/Detect Vulnerability spots). — [Damage](https://wiki.warframe.com/w/Damage)

Sample body-part multipliers (WIKI-VIA-SUMMARY, enemy data modules): Bailiff padded areas 0.5x; Corrupted Ancient back crown 0.5x; Techrot Skuzzi CRT screen 4.5x; Techrot Babau head 1.5x; Scaldra Dedicant/Screamer Efervon mat 2x, damaged backpack 1.5x; Amalgam Alkonost head 1.0x.

**Worked example**: weapon with 5.0x crit multiplier, tier-1 (yellow) crit.
- Body crit: 5.0x.
- Grineer head, crit: 3 x (1 + 1 x (2 x 5 - 1)) = **30x** (6x a body crit).
- Corpus Crewman head, crit (no headcrit): 3 x 5 = **15x**.
- Murmur 1.5x weak point, crit, no headcrit: **7.5x**.
- Non-crit Grineer headshot: 3x.

### Inferences
- Headshot value is faction-dependent by a factor of 4 (30x Grineer vs 7.5x Murmur in the example). A build advisor that assumes "headshots = 3x" will overrate precision crit weapons against Murmur, Techrot and Corpus.
- Since U44, anti-MOA/Bursa builds lose headshot arcanes (Deadhead) and headcrit on the rear weak point.

### Gaps
- Full per-enemy body-part table was fetched but only sampled.
- Whether Thrax, Void Angels and Necramech weak points allow headcrit.

---

## 8. Enemy abilities and auras a build must account for

### Takeaway
The big build-shaping effects are per-hit damage caps on Nullifier bubbles (fire rate beats damage), 90% reduction auras and orbs (Guardian vs AoE and nearby allies, Entropic vs all guns), invulnerability tethers from Arbitration drones, and Archimedea modifiers that gate damage behind weak points or weapon class.

### Cited Findings

| Effect | Rule | Build implication | Source and label |
| --- | --- | --- | --- |
| Nullifier bubble | Each hit counts as min 100, max 400 damage (300 to 1,200 for Magnetic, U36); bubble shrinks 6% of current size per hit, scaled by damage/100; about 7,200 health; projector drone is a crit-vulnerable weak spot; dispels abilities | fire rate and multishot, not damage; Magnetic triples it; or shoot the drone | [Nullifier Crewman](https://wiki.warframe.com/w/Nullifier_Crewman) WIKI-VIA-SUMMARY |
| Guardian Eximus | "90% Damage Reduction to Area of Effect attacks" via 3 rotating shields immune to punch-through; allies in range get 90% DR to all attacks (wiki also describes it as a 90% damage type resistance aura) | kill the Guardian first with single-target fire; AoE builds lose 90% | [Eximus](https://wiki.warframe.com/w/Eximus) WIKI-VIA-SUMMARY; [Damage Reduction](https://wiki.warframe.com/w/Damage_Reduction) WIKI-CONFIRMED |
| Arctic Eximus | globe with 10,000 object health, 20 s; blocks ranged and AoE from outside (reworked U42, 2026-03-25) | enter the globe or use melee | [Eximus](https://wiki.warframe.com/w/Eximus) WIKI-VIA-SUMMARY |
| Entropic Eximus (Zariman, U44) | orb blocks projectiles and abilities; 90% DR vs primary/secondary, 75% vs Amp, 90% vs ranged melee; 44.0.2 fixed the DR applying twice | melee | [Eximus](https://wiki.warframe.com/w/Eximus), [Update 44](https://wiki.warframe.com/w/Update_44:_Iceblade_of_Narin) WIKI-VIA-SUMMARY |
| Arbitration Shield Drone | tethered enemies within 10 m have "complete Invulnerability" and are cleansed of most status; drone immune to most abilities and status; drone health +50/+100/+200% by squad size; punch-through can hit the drone | AoE, punch-through or wide projectiles to clear drones | [Arbitration Shield Drone](https://wiki.warframe.com/w/Arbitration_Shield_Drone) WIKI-VIA-SUMMARY |
| Ancient Healer | since U38: heals allies in 20 m for 20% max health per second for 4 s and clears status; no longer grants DR or Overguard | burst the Healer; DoT builds get cleansed | [Ancient Healer](https://wiki.warframe.com/w/Ancient_Healer) WIKI-VIA-SUMMARY |
| Ancient Protector / Corrupted Ancient | Overguard to allies = 9x its health, 15 s (U38.5) | Magnetic or kill the Ancient | [Overguard](https://wiki.warframe.com/w/Overguard) WIKI-CONFIRMED |
| Demolisher pulse | every 5 s, 6.5 m, dispels abilities and debuffs on itself | weapon damage, not ability debuffs; Viral/Corrosive status from weapons still works except on Infested Demolishers (Viral immune) | [Demolisher](https://wiki.warframe.com/w/Demolisher) WIKI-CONFIRMED |
| Grineer Prosecutor aura | allies immune to physical and primary elements, -85% to combined, +100% to the Prosecutor's element | bring the matching element | [Damage Reduction](https://wiki.warframe.com/w/Damage_Reduction) WIKI-CONFIRMED |
| Raknoids | Aurax Atloc 80% DR, Scyto 50%, Kyta 25% on shields | | [Damage Reduction](https://wiki.warframe.com/w/Damage_Reduction) WIKI-CONFIRMED |
| Status caps on bosses | Acolytes max 4 stacks (Impact 3); Liches and Void Angels max 4 (Impact 6); Blast capped at 4 stacks on bosses/Eximus; Overguard caps Cold at 4 | Viral tops out at 4 stacks = +175% (x2.75) instead of x4.25; Corrosive at 4 stacks = 44% strip | [Acolytes](https://wiki.warframe.com/w/Acolytes), [Kuva Lich/Gameplay](https://wiki.warframe.com/w/Kuva_Lich/Gameplay), [Void Angel](https://wiki.warframe.com/w/Void_Angel) WIKI-VIA-SUMMARY |
| Archimedea "Bolstered Belligerents" | all enemies gain Overguard = 50% of max health | Magnetic, Void, Secondary Fortifier | [Overguard](https://wiki.warframe.com/w/Overguard) WIKI-CONFIRMED |
| Archimedea "Sealed Armor" | 90% less damage from non-weak-point hits | precision weapons only; AoE collapses | [Deep Archimedea](https://wiki.warframe.com/w/Deep_Archimedea) WIKI-VIA-SUMMARY |
| Archimedea "Elemental Potency" | enemies +85% resistance to elemental damage | physical (IPS) and Slash procs | same, WIKI-VIA-SUMMARY |
| Archimedea "Radioactive Breakdown" | enemies invulnerable unless Radiation-procced | Radiation status source required | same, WIKI-VIA-SUMMARY |
| Temporal "Hostile Regeneration" | enemies regenerate 10% max health per second | burst, not sustained | [Temporal Archimedea](https://wiki.warframe.com/w/Temporal_Archimedea) WIKI-VIA-SUMMARY |
| Temporal "Heavy Warfare" | x1.25 from heavy weapons, 95% less from other sources | Arch-guns | same, WIKI-VIA-SUMMARY |

(The Steel Path / Archimedea researcher owns these modifiers; they are listed here only because they act as enemy defences.)

### Inferences
- Status caps of 4 on bosses cut Viral from x4.25 to x2.75 and Corrosive strip from 80% to 44% (26 + 3 x 6). Against a 2,700-armour boss, 44% strip gives DR 0.9 x sqrt(0.56) = 67.3%, i.e. 3.27x damage instead of 5.98x.
- Nullifier bubble example: a 2,000-damage-per-shot sniper and a 400-damage-per-shot rifle do identical work per hit (both count 400). Hits needed scale with fire rate only.

### Gaps
- Exact Nullifier bubble maths (the 6% shrink compounding) was read via summary; treat hit-count estimates as approximate.
- Sanguine/Leech, Parasitic, Jade Light, Surge (U43.5) Eximus are offensive and not modelled here.
- Whether the Guardian ally aura is a damage reduction or a damage type modifier (the wiki uses both phrasings).

---

## 9. Practical effective-health reference targets for a calculator

### Takeaway
Use a small fixed panel of targets at Steel Path level 175 plus an Eximus and one armoured elite at level 400 to 500; report time-to-kill per target with armour state (unstripped, 80% strip, full strip) and hit location as explicit toggles.

### Cited Findings
All values are COMPUTED in section 5 from [Enemy Level Scaling](https://wiki.warframe.com/w/Enemy_Level_Scaling), [Armor](https://wiki.warframe.com/w/Armor), [Overguard](https://wiki.warframe.com/w/Overguard) and [The Steel Path](https://wiki.warframe.com/w/The_Steel_Path), with base stats from the wiki enemy data modules.

Recommended panel (Steel Path, level 175):

| Target | Why | Health | Shields | Overguard | Armour | Faction modifiers | Head |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Grineer Heavy Gunner | armoured baseline | 321,485 | 0 | 0 | 2,700 (90%) | +Impact, +Corrosive | 3x, headcrit |
| Corrupted Heavy Gunner | Void fissures, toughest common armoured unit | 627,395 | 0 | 0 | 2,700 (90%) | +Puncture, +Viral, -Radiation | 3x, headcrit |
| Corpus Tech | shield gate test | 384,525 | 59,787 | 0 | 0 | +Puncture, +Magnetic | 3x, no headcrit |
| Infested heavy (400 base assumed, illustrative) | unarmoured health sponge | about 662,000 | 0 | 0 | 0 | +Slash, +Heat | 3x, headcrit |
| Heavy Gunner Eximus | Overguard plus armour | 1,928,910 | 0 | 324,090 | 2,700 (90%) | as Grineer | 3x |
| Scaldra Eradicator | 1999 content | 358,701 | 0 | 0 | 2,700 (90%) | +Impact, +Corrosive, -Gas | 3x, headcrit |
| Techrot Scaart | high-health armoured | 1,679,783 | 0 | 0 | 2,700 (90%) | +Gas, +Magnetic, -Cold | none listed |
| Murmur unit (per 100 base) | weak points only 1.5x | 35,645 per 100 | 0 | 0 | varies | +Electricity, +Radiation, -Viral | about 1.5x, mostly no headcrit |

Effective health to feed a damage-per-point model, Heavy Gunner SP 175 as the example (COMPUTED):

| Damage source | Multiplier on health bar | Effective health |
| --- | --- | --- |
| Neutral element, no strip | x0.10 | 3,214,850 |
| Corrosive or Impact direct damage, no strip | x0.15 | 2,143,233 |
| Neutral, 10 Corrosive stacks | x0.598 | 537,600 |
| Neutral, 10 Corrosive + 10 Viral stacks | x0.598 x 4.25 | 126,500 |
| Slash proc, no strip | x1.0 | 321,485 |
| Slash proc + 10 Viral stacks | x4.25 | 75,643 |
| Neutral headcrit (5x crit), no strip | x0.10 x 30 | 107,162 of listed damage |

### Inferences
- The spread between the worst case (3.2M) and best case (76k) for the same enemy is about 42x, entirely from armour handling and Viral. This dwarfs any raw-DPS difference between sensible builds and is the main reason a raw burst-DPS ranking misorders builds for hard content.
- A single "armoured 90% DR, 300k to 700k health" target and a single "unarmoured 400k health with 60k gated shields" target capture most of the ranking signal; the Eximus target adds the Overguard/Magnetic dimension; a boss target adds attenuation as a yes/no cap.

### Gaps
- Infested and Murmur heavy base stats are placeholders.
- No verified boss health values post-U40 (Archon, Lich, Fragmented One scaled health), so no numeric boss target is offered.

---

## What a build calculator must model (ranked by impact)

1. **Armour as a 0.9 x sqrt(armour/2700) reduction with a 2,700 cap**, and treat every armoured enemy at level 150+ as capped. Include strip state: Corrosive stacks (26% + 6% per stack, current armour), Heat (50%), aura/ability strip (percent of total). Up to 10x swing.
2. **Which damage ignores armour**: Slash procs (and True/Finisher) bypass it; Heat, Toxin, Electricity and Gas procs do not. Up to 10x swing on DoT value.
3. **Viral status on health** (x2 at one stack to x4.25 at ten; capped at 4 stacks = x2.75 on bosses) and **Magnetic on shields and Overguard** (same numbers).
4. **Health/shield scaling by faction and level** with the Steel Path x2.5 on health and shields, and no SP armour multiplier. Eximus base-health replacement and level-only Overguard (12 x multiplier).
5. **Weak-point and headcrit rules by faction**: 3x head and 2x crit-multiplier doubling on Grineer/Corrupted/Scaldra/Infested/Sentient; 3x without headcrit on Corpus; about 1.5x on Murmur and Techrot. Weak-point bonuses at 1.5x rate on heads. Up to 6x swing for crit builds.
6. **Faction damage-type table** (x1.5 / x1.0 / x0.5), not applied to Overguard. Up to 3x between worst and best element, typically 1.1 to 1.5x on a mixed build.
7. **Shield gate**: 0.1 s, 95% of overflow blocked for non-weak-point hits; Toxin and True bypass shields entirely. Affects one-shot calculations on Corpus/Corrupted.
8. **Boss attenuation as a cap, not a multiplier**: for enemies on the U40 list, bound time-to-kill by per-instance and per-second caps proportional to max health; penalise single huge hits; do not apply to Demolishers, Necramechs, Thumpers or ordinary enemies.
9. **Status stack caps on bosses and Overguard targets** (4 stacks; Impact 3 or 6; Blast 4; Cold 4).
10. **Per-hit damage clamps and flat DR auras**: Nullifier bubble (100 to 400 per hit, x3 with Magnetic), Guardian 90% vs AoE, Entropic 90% vs guns, Sealed Armor 90% off weak points, Juggernaut 90%.
11. **Sentient adaptation** (four gates, 90/80/75/70% resistance to the dominant type) if Sentient content is in scope.
12. **Minimum 1 damage per damage type per hit against armour** and 1/32 damage quantisation (changed from 1/16 in U40, undocumented): only matters for very low-damage, many-element hits.

## Open questions to verify in game

1. Post-U40 attenuation numbers: MDPS and MDPI as a percentage of max health for Archons, Liches/Sisters, Acolytes, Void Angels, The Fragmented One and Archimedea bosses, and the exact equation (hyperbolic like Hemocyte?). Are the wiki's Archon values (MDPT 460,000, MDPS 935,000, lambda 2/3, shotgun compensation 0.7) still live or pre-U40 leftovers?
2. Do Archons still have flat 20% DR and 50% status-damage DR after U40?
3. Does the Steel Path x2.5 apply to Eximus Overguard?
4. What is the health/shield multiplier in Deep and Temporal Archimedea (none, or +100% plus 50% per squad member as one summary suggested)?
5. Do Heat (50%) and Corrosive (up to 80%) armour reductions multiply (leaving 10%) or interact differently? Is the percent-of-total strip computed from the capped 2,700?
6. Under what "exceptional condition" does enemy armour exceed 2,700 and switch to armour/(armour+300)?
7. Is the 5% shield-gate leak applied to the overflow only, and do DoT ticks get gated?
8. Do weak-point multipliers, headcrit and faction bonuses count before or after the per-instance attenuation cap in the standard model?
9. Kuva Lich personal weakness: is it still +25% or now +50% (x1.5) after U36? Can Lich armour really not be stripped by any source?
10. Duviri, Stalker, Wild and other unlisted factions: neutral to all types?
11. Anarchs health scaling curve: Corrupted-style or Murmur-style (the wiki page contradicts itself)?
12. Verify base stats used here in the Codex: Heavy Gunner base level (1 vs 8), Ancient Healer/Disruptor, Nox, Thrax Centurion, Murmur units and Rogue Necramech armour.
13. Nullifier bubble: confirm the 100/400 clamp and 6% shrink rule, and whether crits or multishot pellets count as separate hits.
14. Does Toxin bypass Overguard? (Assumed no.)
15. Guardian Eximus ally aura: all damage or only non-AoE; does it apply to Overguard on the protected allies?
