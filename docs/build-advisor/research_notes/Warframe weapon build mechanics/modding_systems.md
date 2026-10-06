# Warframe weapon modding systems (guns) - rules reference as of 2026-10-05

Research date: 2026-10-05. Live game version per wiki patch histories: Update 44.0 (2026-09-23) / Hotfix 44.0.3 (2026-09-30). "The Icebind" (Riven Splicing) is scheduled for 2026-10-07 and is NOT live yet.

**Labels:** WIKI-CONFIRMED (official wiki page cited), DATA-CONFIRMED (DE's own Public Export files, the primary source the wiki itself cites; I add this label because it is stronger than the wiki for numbers), COMMUNITY-CONSENSUS, DISPUTED, UNKNOWN.

**Source keys used below**
- [PE] = DE Public Export, `ExportUpgrades_en.json`, `ExportRelicArcane_en.json`, `ExportWeapons_en.json`, downloaded 2026-10-05 from `http://content.warframe.com/PublicExport/Manifest/<file>!<hash>` using the index at [origin.warframe.com/PublicExport/index_en.txt.lzma](https://origin.warframe.com/PublicExport/index_en.txt.lzma). All max-rank mod and arcane numbers below are read from this file unless stated.
- [PE+] = community mirror with extra fields (riven entries, compat tags, omegaAttenuation, maxLevelCap), [calamity-inc/warframe-public-export-plus](https://github.com/calamity-inc/warframe-public-export-plus), last commit 2026-09-29.
- [RP] = [calamity-inc/warframe-riven-info RivenParser.js](https://github.com/calamity-inc/warframe-riven-info/blob/senpai/RivenParser.js) (reverse-engineered riven fingerprint maths; community code, matches the wiki table exactly).
- Wiki pages are linked inline. Wiki was reachable only through a scraper (it blocks plain HTTP clients with a bot challenge).

**Method caveats (read first)**
- I could not retrieve transcripts of Brozime / TheKengineer / Tactical Potato videos. Brozime's Obsidian vault is mostly video embeds; only its tables (lich elements, Incarnon evolution picks) are text. "Experienced player assumptions" below are therefore mostly my inference from the mechanics and are labelled as such.
- The wiki's `Module:Mods/data` (which may hold explicit incompatibility lists) could not be fetched; the exclusivity list is assembled from wiki prose plus variant names in [PE]. Treat any pair marked "inferred" as unverified.
- Overframe was not used as authority. One Overframe build page is quoted only to flag a dispute.

---

## 1. Mod exclusivity: which mods cannot be equipped together

### Takeaway
The real rule is hidden inheritance: two mods conflict if they share a hidden parent type or are parent/child. In practice that means "a mod and every variant of it (Flawed, Primed, Amalgam, Galvanized, Archon, Umbral)", plus a handful of non-obvious pairs (corrupted crit-chance mods vs the plain crit-chance mod, Split Flights vs Split Chamber). Everything else stacks, including two different mods giving the same stat.

### Cited Findings
- WIKI-CONFIRMED: "Players cannot install duplicate mods onto a single piece of equipment. Likewise, different variants of the same mod cannot be equipped together." Variants are Normal, Flawed, Primed, Umbra, Amalgam, Galvanized, Archon. — [Mod](https://wiki.warframe.com/w/Mod)
- WIKI-CONFIRMED (community-article section): "Two mods with the same hidden parent type or has a parent/child relationship cannot both be equipped on an item at the same time." Example: Serration and Amalgam Serration. Name similarity is not the rule (Sinister Reach is not a variant of Reach). — [Mod/Compatibility](https://wiki.warframe.com/w/Mod/Compatibility)
- WIKI-CONFIRMED: Nonstandard mods (Nightmare, Corrupted, Conditional, Augment, Set, Riven) "stack with other mods providing the same type of bonus (certain exceptions exist)". — [Mod](https://wiki.warframe.com/w/Mod)
- WIKI-CONFIRMED exception: "Corrupted mods that provide a bonus to Critical Chance (e.g. Critical Delay) ... can't be stacked with their standard analogues." Critical Deceleration inherits Shotgun `WeaponCritChanceMod` (Blunderbuss). — [Mod](https://wiki.warframe.com/w/Mod), [Mod/Compatibility](https://wiki.warframe.com/w/Mod/Compatibility)
- WIKI-CONFIRMED exception: Split Flights and Split Chamber are mutually exclusive. — [Mod](https://wiki.warframe.com/w/Mod)
- WIKI-CONFIRMED non-exception: Charged Chamber and Primed Chamber DO stack (Primed Chamber is not a Primed variant). — [Mod](https://wiki.warframe.com/w/Mod)
- WIKI-CONFIRMED: Mending Shot inherits Thunderbolt's type (so they conflict). — [Mod/Compatibility](https://wiki.warframe.com/w/Mod/Compatibility)
- WIKI-CONFIRMED: Galvanized mods "cannot be equipped with their other counterparts (e.g. Galvanized Diffusion cannot be equipped with Barrel Diffusion or Amalgam Barrel Diffusion)". The page names Argon Scope and Hydraulic Crosshairs as the counterparts of Galvanized Scope / Crosshairs, and Terminal Velocity / Lethal Momentum as the (non-galvanized) analogues of Galvanized Acceleration. — [Galvanized Mods](https://wiki.warframe.com/w/Galvanized_Mods)
- WIKI-CONFIRMED: Only one Riven per weapon ("Cannot be equipped alongside another Riven mod"). — [Riven Mods](https://wiki.warframe.com/w/Riven_Mods)
- WIKI-CONFIRMED: Augments stack with standard mods; single-weapon Amalgam mods do not, because they are the standard mod in variant form. — [Mod](https://wiki.warframe.com/w/Mod)
- WIKI-CONFIRMED: Exilus mods may go in the exilus slot or any normal slot; only exilus mods may go in the exilus slot. — [Mod/Compatibility](https://wiki.warframe.com/w/Mod/Compatibility)
- DATA-CONFIRMED: item-compatibility restrictions are separate from mod-vs-mod exclusivity: e.g. Semi-Rifle Cannonade has compatibilityTags `SEMI_AUTO` and incompatibilityTags `MODULAR_GUN`; Combustion Beam requires `BEAM`. — [PE+](https://github.com/calamity-inc/warframe-public-export-plus)

**Gun-relevant exclusive groups (one mod per group).** "W" = stated on the wiki, "inferred" = same-name variant present in [PE], follows from the variant rule but not individually verified.

Rifle / primary:
- Serration, Amalgam Serration, (Flawed Serration) — W
- Split Chamber, Galvanized Chamber — W (galvanized rule); Split Flights also conflicts with Split Chamber — W; Split Flights vs Galvanized Chamber — inferred
- Point Strike, Critical Delay — W (corrupted crit rule)
- Argon Scope, Galvanized Scope — W
- Rifle Aptitude, Galvanized Aptitude — W (galvanized rule)
- Shred, Primed Shred; Cryo Rounds, Primed Cryo Rounds; Fast Hands, Primed Fast Hands; Magazine Warp, Primed Magazine Warp, Amalgam Javlok Magazine Warp; Firestorm, Primed Firestorm; Stabilizer, Primed Stabilizer; Rifle Ammo Mutation, Primed Rifle Ammo Mutation; Bane of X, Primed Bane of X (per faction); Charged Chamber, Primed Charged Chamber; Metal Auger, Amalgam Argonak Metal Auger; Target Acquired, Amalgam Daikyu Target Acquired — inferred
- Thunderbolt, Mending Shot — W

Shotgun:
- Hell's Chamber, Galvanized Hell — W (galvanized rule)
- Blunderbuss, Primed Blunderbuss, Critical Deceleration — W
- Shotgun Savvy, Galvanized Savvy — W (galvanized rule)
- Fatal Acceleration, Galvanized Acceleration — W (galvanized rule)
- Point Blank, Primed Point Blank; Ravage, Primed Ravage; Charged Shell, Primed Charged Shell; Chilling Grasp, Primed Chilling Grasp; Ammo Stock, Primed Ammo Stock; Tactical Pump, Primed Tactical Pump; Shotgun Barrage, Amalgam Shotgun Barrage; Counterbalance, Primed Counterbalance; Shotgun Ammo Mutation, Primed version; Cleanse X, Primed Cleanse X — inferred

Pistol:
- Barrel Diffusion, Amalgam Barrel Diffusion, Galvanized Diffusion — W
- Pistol Gambit, Primed Pistol Gambit — inferred; Creeping Bullseye conflicts with them — W by the corrupted-crit rule (pair not named individually)
- Hydraulic Crosshairs, Galvanized Crosshairs — W
- Sure Shot, Galvanized Shot — W (galvanized rule)
- Target Cracker, Primed Target Cracker; Heated Charge, Primed Heated Charge; Convulsion, Primed Convulsion; Quickdraw, Primed Quickdraw; Slip Magazine, Primed Slip Magazine; Fulmination, Primed Fulmination; Steady Hands, Primed Steady Hands; Pistol Ammo Mutation, Primed version; Expel X, Primed Expel X — inferred

Stat locks that are not exclusivity but make other mods worthless:
- DATA-CONFIRMED: Primary Acuity / Pistol Acuity: "+350% Weak Point Damage, +350% Weak Point Critical Chance. Multishot cannot be modified." — [PE]
- DATA-CONFIRMED / WIKI-CONFIRMED: Semi-Rifle / Semi-Shotgun / Semi-Pistol Cannonade: "Only compatible with Semi-Auto Trigger. Fire Rate cannot be modified" (positive or negative). All listed trigger modes must be Semi (Argonak cannot equip it, Latron including Incarnon form can). — [PE], [Cannonade Mods](https://wiki.warframe.com/w/Cannonade_Mods)

### Inferences
- A safe implementation: build an exclusivity key per mod. Start from the base name after stripping "Primed ", "Amalgam ", "Flawed ", "Galvanized ", weapon-specific Amalgam prefixes, then apply an override table for the renamed galvanized/corrupted pairs above (Galvanized Chamber=Split Chamber, Hell=Hell's Chamber, Diffusion=Barrel Diffusion, Aptitude=Rifle Aptitude, Savvy=Shotgun Savvy, Shot=Sure Shot, Scope=Argon Scope, Crosshairs=Hydraulic Crosshairs, Acceleration=Fatal Acceleration, Critical Delay=Point Strike, Critical Deceleration=Blunderbuss, Creeping Bullseye=Pistol Gambit, Split Flights=Split Chamber, Mending Shot=Thunderbolt).
- Known-to-stack pairs the advisor must NOT block: Serration + Heavy Caliber; Hornet Strike + Magnum Force + Augur Pact; Split Chamber/Galvanized Chamber + Vigilante Armaments; Barrel Diffusion family + Lethal Torrent; Speed Trigger + Vile Acceleration + Shred; elemental 90% + 60/60 of same element; Vital Sense + Hammer Shot + Bladed Rounds. (These follow from the wiki's "nonstandard mods stack" rule; individual pairs are COMMUNITY-CONSENSUS, not individually cited.)

### Gaps
- No machine-readable parent-type list was obtained. [PE] and [PE+] do not expose the parent class. The wiki's `Module:Mods/data` may; it could not be fetched.
- Whether Laser Sight (now a shotgun mod in [PE]: "On Weak Point Hit: +120% Critical Chance when Aiming for 9s") conflicts with anything is unknown.
- Whether the Acuity mods conflict with Argon Scope / Galvanized Scope is unknown.

---

## 2. Galvanized and other conditional mods: exact values and uptime assumptions

### Takeaway
Galvanized mods at full stacks are strictly better than their plain versions (multishot 230% vs 165%/120%; status mods add a per-status damage bonus), so an advisor that scores only the unconditional part will always pick wrong. Stacks decay one at a time, so in sustained combat the full-stack value is the normal assumption; the damage-per-status bonus does not apply to radial (AoE) damage.

### Cited Findings

**Galvanized mods at max rank (rank 10)** — DATA-CONFIRMED [PE]; drain = base + 10.

| Mod | Class | Polarity | Max drain | Unconditional | On-kill stack | Stacks | Duration | Full-stack total |
|---|---|---|---|---|---|---|---|---|
| Galvanized Chamber | Rifle | Madurai | 16 | +80% Multishot | +30% Multishot | 5 | 20s | +230% |
| Galvanized Hell | Shotgun | Madurai | 16 | +110% Multishot | +30% Multishot | 4 | 20s | +230% |
| Galvanized Diffusion | Pistol | Madurai | 14 | +110% Multishot | +30% Multishot | 4 | 20s | +230% |
| Galvanized Aptitude | Rifle | Vazarin | 12 | +80% Status Chance | +40% Direct Damage per status type on target | 2 | 20s | +80% dmg per status |
| Galvanized Savvy | Shotgun | Vazarin | 12 | +80% Status Chance | +40% Direct Damage per status type | 2 | 20s | +80% per status |
| Galvanized Shot | Pistol | Vazarin | 12 | +80% Status Chance | +40% Direct Damage per status type | 3 | 14s | +120% per status |
| Galvanized Scope | Rifle | Madurai | 12 | none | On Weak Point Hit: +120% Crit Chance when Aiming 12s; On Weak Point Kill: +40% CC when Aiming | 5 (kill part) | 12s | +320% CC while aiming |
| Galvanized Crosshairs | Pistol | Madurai | 12 | none | same as Scope | 5 | 12s | +320% CC while aiming |
| Galvanized Acceleration | Shotgun (exilus) | Madurai | 12 | +30% Projectile Speed and Beam Range | +30% each | 2 | 10s | +90% |

- Plain counterparts for comparison (DATA-CONFIRMED [PE]): Split Chamber +90% (drain 15), Hell's Chamber +120% (15), Barrel Diffusion +120% (11), Rifle Aptitude / Shotgun Savvy / Sure Shot +90% Status Chance, Argon Scope / Hydraulic Crosshairs "On Weak Point Hit: +135% Critical Chance when Aiming for 9s", Vigilante Armaments +60% Multishot, Lethal Torrent +60% Fire Rate +60% Multishot.
- WIKI-CONFIRMED: "In most Galvanized mods when their buffs time out, only one stack is lost and the buff duration resets." Galvanized Scope and Crosshairs differ: "each stack has its own duration." — [Galvanized Mods](https://wiki.warframe.com/w/Galvanized_Mods)
- WIKI-CONFIRMED: Only kills from the weapon holding the mod grant stacks, and only that weapon benefits. Status-proc kills from that weapon count (including Hunter Munitions). Status-proc kills on the head do not count as headshot kills, except Electricity and Gas. — [Galvanized Mods](https://wiki.warframe.com/w/Galvanized_Mods)
- WIKI-CONFIRMED: Galvanized Aptitude's damage bonus "is usually additive with other damage mods like Serration, with exceptions where it is multiplicative"; it is not applied on the hit that applies a new status, only following hits, but multishot pellets count as sequential hits. Worked wiki example: 100 base, Serration, 2 stacks, 1 status on target = 100 x (1 + 1.65 + 0.8) = 345. — [Galvanized Aptitude](https://wiki.warframe.com/w/Galvanized_Aptitude)
- WIKI-CONFIRMED: status effects from any source count (abilities, companions, allies); up to 16 distinct statuses. — [Galvanized Aptitude](https://wiki.warframe.com/w/Galvanized_Aptitude)
- WIKI-CONFIRMED (Update 30.9, 2021-11-11 patch note): the per-status bonus does not apply to area-of-effect damage by design. — [Galvanized Aptitude](https://wiki.warframe.com/w/Galvanized_Aptitude)
- WIKI-CONFIRMED (community article, "actively being worked on", last edited 2026-10-05): "+X% Direct Damage" bonuses apply to hitscan, projectiles, beams, chains, punch-through and the directly hit target of an explosion; they do NOT apply to projectile explosion radius, hitscan explosion radius or embedded cloud radius. All "Condition Overload-style" sources stack additively with each other: Galvanized Aptitude/Savvy/Shot, Secondary Shiver (+45% per Cold stack), Cedo (+60% per status), and several Incarnon perks (e.g. Latron "Swift Punishment" +30% per status, Soma/Zylok/Angstrum/Despair "Fatal Affliction" +40% per status, Lato/Dual Toxocyst "Carnage Reign"). — [Condition Overload (Mechanic)](https://wiki.warframe.com/w/Condition_Overload_(Mechanic))
- DISPUTED: whether the Galvanized Aptitude bonus is additive or multiplicative with Serration/arcanes on a given weapon. Wiki says usually additive with per-attack exceptions; an Overframe Nataruk build (low trust) claims it is multiplicative on charged/perfect shots. — [Galvanized Aptitude](https://wiki.warframe.com/w/Galvanized_Aptitude); contradicted for specific attacks by [Overframe Nataruk build](https://overframe.gg/build/279107/nataruk/one-shot-steel-path-150k-slash-procs-180-crit-chance-2-forma/)

**Other conditional gun mods at max rank** — DATA-CONFIRMED [PE]

| Mod | Class | Max drain | Effect |
|---|---|---|---|
| Argon Scope / Hydraulic Crosshairs | Rifle / Pistol | 7 | On Weak Point Hit: +135% Crit Chance when Aiming for 9s |
| Laser Sight | Shotgun | 9 | On Weak Point Hit: +120% Crit Chance when Aiming for 9s |
| Bladed Rounds | Rifle | 9 | On Kill: +120% Crit Damage when Aiming for 9s |
| Shrapnel Shot | Shotgun | 9 | On Kill: +99% Crit Damage when Aiming for 9s |
| Sharpened Bullets | Pistol | 7 | On Kill: +75% Crit Damage when Aiming for 9s |
| Spring-Loaded Chamber / Repeater Clip / Pressurized Magazine | Assault rifle / Shotgun / Pistol | 7 / 9 / 9 | On Reload: +75% / +105% / +90% Fire Rate when Aiming for 9s |
| Catalyzer Link / Nano-Applicator / Embedded Catalyzer | Rifle / Shotgun / Pistol | 9 | On Ability Cast: +60% / +90% / +90% Status Chance when Aiming for 9s |
| Hunter Munitions | Primary | 9 | +30% chance to apply Slash on Critical |
| Internal Bleeding / Hemorrhage | Rifle / Pistol | 15 | Impact Status Effects have 35% chance to apply a Slash Status Effect (x2 when Fire Rate is below 2.5) |
| Magnetic Welt | Shotgun | 15 | Impact Status Effects have 35% chance to apply a Magnetic Status Effect (x2 when Fire Rate is below 2.5) |
| Split Flights | Bow | 15 | On Hit: +100% Multishot, -180% Accuracy for 2s, stacks 4x (non-AoE bows) |
| Charged Chamber / Primed Charged Chamber / Primed Chamber | Sniper | 11 / 16 / 7 | +60% / +110% / +100% Damage on first shot in magazine |
| Spectral Serration | Rifle | 16 | +330% Damage while Invisible (introduced 2024-12-13) |
| Proton Jet | Rifle | 7 | During Wall Latch: +120% Status Chance and Crit Chance |
| Motus Setup | Shotgun | 9 | 100% Critical and Status Chance for 4s after landing from Double/Bullet Jump |
| Synth Charge | Pistol | 9 | +200% Bonus Damage on final shot; requires magazine 6+ |
| Target Acquired | Sniper | 11 | +60% to Headshot Multiplier |
| Combustion Beam | Primary beam | 9 | Enemies killed explode for 600 damage |
| Shivering Contagion | Primary | 9 | On Cold Status: 100% chance to spread to enemies within 6m |

**Newer always-on families (2024-2026)** — DATA-CONFIRMED [PE]
- Cannonade (Update 36.0, 2024-06-18): Semi-Rifle Cannonade +240% Damage, +1.5 Punch Through (drain 9, Vazarin); Semi-Shotgun Cannonade +240% Damage, +1.5 PT; Semi-Pistol Cannonade +300% Damage, +1.5 PT. Semi-auto only; fire rate locked. — [Cannonade Mods](https://wiki.warframe.com/w/Cannonade_Mods)
- Elementalist (2024-06-18): Rifle Elementalist +90% Status Damage, +0.6 Punch Through; Shotgun Elementalist +90% Status Damage, +60% Magazine Capacity; Pistol Elementalist +90% Status Damage, +60% Reload Speed (drain 9, Vazarin).
- Acuity (2024-12-13): Primary Acuity / Pistol Acuity +350% Weak Point Damage, +350% Weak Point Critical Chance, multishot cannot be modified (drain 16, Naramon).
- New gun mods introduced 2025-01-01 to 2026-10-05 per [PE+] `introducedAt`: Primed Stabilizer and Primed Counterbalance (2025-04-17, -85% recoil, exilus), Primed Expel/Cleanse The Murmur (2025-07-23), Primed Bane of The Murmur (2025-09-02), and weapon augments Biotic Rounds (AX-52), Leaded Gas (Vesper 77) (2025-02-06), Pain Points (Athodai), Spontaneous Singularity (Simulor) (2025-05-21), Necrophagic Vigor (Hema), Dreadful Killshot (Basmu) (2025-10-23), Velox Conclusion (2026-04-08), Overpressured Rounds (EFV-5 Jupiter), Prototype Shock Coils (EFV-8 Mars) (2026-08-12). No new general-purpose gun damage family appeared in 2025-2026.
- Faction mods (DATA-CONFIRMED): plain x1.3, Primed x1.55, shown as a multiplier, for Corpus/Grineer/Infested/Orokin/The Murmur. Rivens can also roll faction damage (x0.45 base).

**Uptime assumptions**
- WIKI-CONFIRMED mechanics that drive uptime: Galvanized multishot/status stacks last 20s (14s Shot, 10s Acceleration) and drop one stack per timeout, so a full 5-stack Galvanized Chamber takes 100s without a kill to fully expire. — [Galvanized Mods](https://wiki.warframe.com/w/Galvanized_Mods)
- COMMUNITY-CONSENSUS (weak source): "Once you're at max stacks, these mods are roughly 2-3x more powerful than their standard counterparts." — [TheGamer guide](https://www.thegamer.com/warframe-galvanized-mods-weapon-arcane-guide/)

### Inferences
- Recommended modelling defaults (my inference; no creator source retrieved): on-kill stacking mods (Galvanized multishot/status, Merciless-type arcanes) = full stacks for general mission play; an optional "single target / boss / first shot" scenario = zero stacks. "When Aiming" mods = active only if the player marks the weapon as aimed (snipers, semi-autos); Galvanized Scope's full +320% needs sustained weak-point kills, so +120% (hit part only) is the conservative figure. "On Reload"/"On Ability Cast" 9s buffs = roughly 50% uptime unless the user opts in.
- Per-status "Direct Damage" bonuses should be scored with a user-set status count (2 to 4 is typical for a weapon that applies Viral + Heat plus its physical types; more with a primer or ability support) and zero for the radial part of AoE weapons.
- The Internal Bleeding / Hemorrhage x2 below 2.5 fire rate uses the weapon's fire rate; whether it reads modded or base fire rate is not stated in [PE].

### Gaps
- No retrievable creator statement of an explicit uptime convention. The defaults above are mine.
- Whether "fire rate below 2.5" for Internal Bleeding is evaluated after mods: UNKNOWN.
- Exact list of attacks where the per-status bonus is multiplicative: the wiki's catalog exists but was not extracted.

---

## 3. Mod capacity, drain, polarities, Forma, exilus and arcane slots

### Takeaway
Capacity = weapon rank (30, or 40 for Kuva/Tenet/Coda and a few others), doubled by an Orokin Catalyst. Drain = base drain + rank; a matching polarity halves it (round up), a wrong polarity adds 25% (round to nearest). Guns have 8 normal slots + 1 exilus slot (needs an adapter) + 1 arcane slot (needs an adapter); nothing on a gun adds capacity.

### Cited Findings
- WIKI-CONFIRMED: Primary and secondary weapons have 8 general slots and an Exilus slot; melee has 8 + Exilus + Stance; archguns have 8. — [Mod](https://wiki.warframe.com/w/Mod)
- WIKI-CONFIRMED: "Items have a limited Mod Capacity, that correlates to their Rank. The maximum rank is normally 30, but for some items it is 40." A Catalyst (weapons) / Reactor "doubles the available Mod capacity". Mod drain ranges 0 to 20. — [Mod](https://wiki.warframe.com/w/Mod)
- DATA-CONFIRMED: drain at rank r = `baseDrain + r` (e.g. Serration baseDrain 4, fusionLimit 10 = 14 at max; Galvanized Aptitude 2 + 10 = 12; wiki rank table for Galvanized Aptitude shows cost 2 at rank 0 rising by 1 per rank to 12). Rivens: baseDrain 10, fusionLimit 8 = 18 at max. — [PE], [Galvanized Aptitude](https://wiki.warframe.com/w/Galvanized_Aptitude)
- WIKI-CONFIRMED: "Matching polarity reduces drain by half, rounded up (e.g. Serration costs 14, but dropped into a Madurai polarized slot costs only 7)." — [Mod](https://wiki.warframe.com/w/Mod)
- DISPUTED (two wiki pages disagree on rounding of the penalty): Mod page: "Non-matching polarity increases drain by a quarter, rounded mathematically: drain of 0-1 will increase by 0, drain of 2-5 by 1, drain of 6-9 by 2, drain of 10-13 by 3, drain 14-16 by 4". Polarity page: "increase its cost by 25%, rounded up". The Mod page's explicit table is only consistent with round-half-up (5 x 1.25 = 6.25 = 6, not 7), so use `floor(1.25 x drain + 0.5)`. — [Mod](https://wiki.warframe.com/w/Mod); contradicted by [Polarity](https://wiki.warframe.com/w/Polarity)
- WIKI-CONFIRMED: Polarity symbols: Madurai (V), Vazarin (D), Naramon (dash), Zenurik, Unairu, Penjaga, Umbra, and Any/Universal. Umbra polarity only via Umbra Forma. Universal ("Any polarity except Umbra") only via Omni Forma (or Stance Forma on the stance slot). — [Polarity](https://wiki.warframe.com/w/Polarity)
- WIKI-CONFIRMED: Polarizing requires max rank, resets rank to 0, can change or remove existing polarities, has no known limit on count, and does not remove the Catalyst. Swap Polarity rearranges existing polarities without resetting rank (only on items polarized at least once). Locked exilus slots cannot be polarized. — [Polarity](https://wiki.warframe.com/w/Polarity)
- WIKI-CONFIRMED: Aura / Stance mods add capacity (matching polarity doubles it); guns have neither. Exalted melee stances give capacity since Techrot Encore (Hotfix 38.5.2, 2025-03-20). — [Mod](https://wiki.warframe.com/w/Mod), [Polarity](https://wiki.warframe.com/w/Polarity)
- DISPUTED (wiki internal conflict, low impact): minimum capacity below max rank. Mod page: "minimum mod capacity is 15, plus 1 per 2 Mastery Ranks" (yet its example says MR 6 = 18); Polarity page: "minimum capacity is equal to the player's Mastery Rank (up to 30)". — [Mod](https://wiki.warframe.com/w/Mod); [Polarity](https://wiki.warframe.com/w/Polarity)
- WIKI-CONFIRMED: Exilus Weapon Adapter "can be fused with a Primary, Secondary or Melee weapon to unlock an Exilus Mod Slot ... any eligible mods used on the slot will consume mod capacity, like normal mods. An Exilus slot can be polarized using Forma." Melee requires Whispers in the Walls. Introduced Update 26.0 (2019-10-31). — [Exilus Weapon Adapter](https://wiki.warframe.com/w/Exilus_Weapon_Adapter)
- DATA-CONFIRMED: exilus-compatible gun mods are those flagged `isUtility` in [PE]. Rifle/primary: Ammo Drum, Rifle Ammo Mutation (+Primed), Arrow Mutation, Vigilante Supplies, Eagle Eye, Hush, Stabilizer (+Primed), Vile Precision, Terminal Velocity, Sinister Reach, Guided Ordnance, Cautious Shot, Aerial Ace, Aero Periphery, Mending Shot, plus weapon-specific Fomorian Accelerant, Kinetic Ricochet, Tether Grenades, Adhesive Blast, Bhisaj-Bal. Shotgun: Shell Compression, Shotgun Ammo Mutation (+Primed), Counterbalance (+Primed), Silent Battery, Fatal Acceleration, Galvanized Acceleration, Narrow Barrel. Pistol: Trick Mag, Pistol Ammo Mutation (+Primed), Steady Hands (+Primed), Suppress, Hawk Eye, Lethal Momentum, Ruinous Extension, Targeting Subsystem, Energizing Shot; Tome canticles. No exilus gun mod adds damage directly. — [PE]
- WIKI-CONFIRMED: A maximum of one Arcane per weapon; the Primary/Secondary arcane slot must be unlocked with a Primary/Secondary Arcane Adapter (20 Platinum, 15 Steel Essence from Teshin, or 25 Pathos Clamps from Acrithis). The slot is separate from a Kitgun's Pax arcane slot. Arch-guns can equip two arcanes (one Primary, one Secondary) via an Archgun Arcane Adapter. Arcanes use no mod capacity (they are not in the mod grid). Weapon arcanes max at rank 5 (21 copies). — [Arcane Enhancement](https://wiki.warframe.com/w/Arcane_Enhancement)
- WIKI-CONFIRMED: Kuva (and by the same page family Tenet/Coda) weapons gain +2 max rank per polarization up to rank 40 after 5 Forma. — [Kuva (Variant)](https://wiki.warframe.com/w/Kuva_(Variant))

**Formula**
```
capacity      = rank x (2 if catalyst else 1)            # rank 30 -> 30 / 60 ; rank 40 -> 40 / 80
drain(mod)    = baseDrain + modRank
slotCost      = ceil(drain / 2)                 if slot polarity == mod polarity
              = floor(drain * 1.25 + 0.5)       if slot has a different polarity   (DISPUTED rounding, see above)
              = drain                           if slot is unpolarized
              = ceil(drain / 2)                 if slot is Universal (Omni Forma) and mod is not Umbra
build is legal iff sum(slotCost over 8 slots + exilus) <= capacity
```
Universal-slot halving is implied by "Any polarity" wording on the Polarity page; treat as WIKI-CONFIRMED in wording, not tested.

**Worked example** (rank 30 rifle with Catalyst = 60 capacity)

| Slot | Mod | Polarity | Max drain | Unpolarized | Matching slot |
|---|---|---|---|---|---|
| 1 | Galvanized Chamber | Madurai | 16 | 16 | 8 |
| 2 | Galvanized Aptitude | Vazarin | 12 | 12 | 6 |
| 3 | Critical Delay | Naramon | 9 | 9 | 5 |
| 4 | Vital Sense | Madurai | 9 | 9 | 5 |
| 5 | Primed Cryo Rounds | Vazarin | 16 | 16 | 8 |
| 6 | Infected Clip | Naramon | 11 | 11 | 6 |
| 7 | Primed Shred | Madurai | 16 | 16 | 8 |
| 8 | Hunter Munitions | Madurai | 9 | 9 | 5 |
| Exilus | Primed Stabilizer | Naramon | 12 | 12 | 6 |
| Total | | | | 110 | 57 |

Zero Forma: 110 > 60, illegal. Fully matched (9 polarities): 57 <= 60, legal. If slot 5 were Madurai instead (mismatch for the Vazarin Primed Cryo Rounds): floor(16 x 1.25 + 0.5) = 20, total 69, illegal. Swapping in a max Riven (18, cost 9 when matched) for Hunter Munitions gives 61, illegal by 1; this is why rank-40 weapons (80 capacity) are far easier to fit.

### Inferences
- The advisor needs each weapon's current slot polarities, rank, Catalyst flag, and exilus/arcane adapter flags from inventory; otherwise it can only report "Forma needed" as a count: number of slots whose polarity must change for the cheapest legal assignment.
- Optimal slot assignment is a small assignment problem (9 mods x 9 slots, exilus restricted): put the highest-drain mods on matching polarities first.
- Under-ranked mods are a legitimate capacity lever (e.g. a rank 8 Primed mod), worth offering when a build misses by 1 to 2 points.

### Gaps
- Mismatch rounding should be confirmed in game with a 5-drain mod in a wrong-polarity slot (expect 6).
- Whether the MR-based minimum capacity is doubled by a Catalyst: not found.
- Umbra Forma is irrelevant for guns (no Umbra-polarity gun mods exist in [PE]); not otherwise researched.

---

## 4. Weapon arcanes

### Takeaway
One arcane per gun. The three Acolyte arcanes (Merciless, Deadhead, Dexterity) each give up to +360% damage that is additive with Serration-type mods, which is the single biggest reason experienced players drop or downgrade the base damage mod. Newer arcanes trade that for multishot/crit damage (Blight, Frostbite), crit chance (Enervate, Cascadia Overcharge) or utility.

### Cited Findings
All max-rank (rank 5) text is DATA-CONFIRMED from [PE] `ExportRelicArcane`; trigger/stack/decay details are WIKI-CONFIRMED from [Arcane Enhancement](https://wiki.warframe.com/w/Arcane_Enhancement).

**Primary**

| Arcane | Trigger | Max-rank effect | Stacks / duration | Passive at rank 5 |
|---|---|---|---|---|
| Primary Merciless | On Kill | +30% Damage per stack (max +360%) | 12 stacks, 4s, decay one at a time (48s to fully expire) | +30% Reload Speed |
| Primary Deadhead | On Weak Point (headshot) Kill | +120% Damage per stack (max +360%) | 3 stacks, 24s, decay one at a time (72s) | +30% Headshot Multiplier, -50% Recoil |
| Primary Dexterity | On Melee Kill | +60% Damage per stack (max +360%) | 6 stacks, 20s, decay one at a time | +7.5s Combo Duration |
| Primary Frostbite | On Cold Status Effect | +3% Crit Damage and +2.25% Multishot per stack (max +120% CD, +90% MS) | 40 stacks, 12s, removed all at once | none |
| Primary Blight | On (weapon) Toxin Status Effect | +3.6% Crit Damage and +1.8% Multishot per stack (max +144% CD, +72% MS) | 40 stacks, 12s, removed all at once | none |
| Primary Plated Round | On Reload | "Deal increased damage per round loaded based on max magazine size", 10s | n/a | none |
| Primary Crux (U38.0, 2024-12-13) | On Weak Point Hit | +30% Status Chance and +6% Ammo Efficiency per stack | 10 stacks, 10s, all at once | none |
| Primary Exhilarate | On weapon Impact status | +1.2 Energy/s per stack | 3 stacks, 10s | none |
| Primary Obstruct | On weapon Magnetic status | Jam enemy weapons within 15m, 10s cooldown | n/a | none |
| Primary Bulwark (U41.0, 2025-12-10) | Armor over 1,000 | +1% damage per armor point past 1,000, max +500% | n/a | none |
| Primary Overcharge (U41.0) | At or above 90% Energy | Gain 35% of Max Energy as Multishot, capped at 350% | n/a | none |
| Primary Debilitate (U41.0) | Target has 10 stacks of a combined status | 100% chance to also inflict one of its base statuses | n/a | none |
| Primary Compression (U43.0, 2026-06-17) | On aim | x0.2 explosion radius, +100% damage and +5.5% ammo efficiency per 1m radius lost | n/a | none |
| Fractalized Reset | On Ability Cast | +240% Reload Speed 5s | | |
| Longbow Sharpshot (bows) | On Weak Point Hit | +300% damage on next shot | | |
| Shotgun Vendetta (shotguns, Corvas, Mandonel) | On shotgun kill within 5m | +180% Multishot, +75% Reload Speed, 15s | | |

**Secondary**

| Arcane | Trigger | Max-rank effect | Stacks / duration |
|---|---|---|---|
| Secondary Merciless / Deadhead / Dexterity | same as primary versions | same numbers, for secondaries | same |
| Secondary Encumber | On Status Effect | +24% chance to trigger a second random Status Effect | n/a |
| Secondary Kinship | While buffing ally Warframes | +20% Critical Chance per buff | n/a |
| Secondary Shiver | Passive | "Enemies take +45% damage per Cold Status" (stacks with Galvanized Shot in the per-status bucket) | n/a |
| Secondary Outburst | On swapping to secondary | consume Combo: +20% Crit Chance and Crit Damage per combo multiplier consumed | 30s per [PE]; wiki table says 20s (DISPUTED) |
| Secondary Fortifier (U36.0) | On Hit | x8 damage to Overguard; gain 1 Overguard per 100 damage dealt to Overguard | n/a |
| Secondary Surge (U36.0) | On Ability Cast | next shot gains a Damage Multiplier per 200 current Energy, up to x8 | next shot |
| Secondary Enervate (U38.0) | On Hit | +10% (flat) Critical Chance per hit, stacking until 6 "Big Critical Hits" (orange crits) reset it | until reset |
| Secondary Irradiate (U41.0, 2025-12-10) | Hit on enemy with 10 Radiation stacks | deal 180% of the hit's damage to enemies within 7m | n/a |
| Secondary Cryogenic (U43.0, 2026-06-17) | On Puncture status | apply 3 Cold stacks to targets within 15m | n/a |
| Cascadia Flare | On Heat Status Effect | +12% Damage per stack, up to +480% | 40 stacks, 10s |
| Cascadia Overcharge | While Overshields active | +300% Critical Chance | n/a |
| Cascadia Accuracy | On Roll | +300% Critical Chance on Weak Point Hits | 4s |
| Cascadia Empowered | On Status Effect | +750 damage matching the status's damage type | n/a |
| Conjunction Voltage | On Electricity Status Effect | +1.5% Reload Speed and +3% Multishot per stack (max +120% MS) | 40 stacks, 12s, all at once |
| Akimbo Slip Shot (dual pistols) | Sliding / aim gliding | 65% Ammo Efficiency | n/a |

- WIKI-CONFIRMED: Primary Merciless "damage bonus stacks additively with other damage mods like Serration"; only kills by the weapon holding the arcane count; status kills count if the status came from that weapon; stacks are per-weapon. — [Primary Merciless](https://wiki.warframe.com/w/Primary_Merciless)
- WIKI-CONFIRMED: Merciless vs Deadhead trade-off: identical +360% cap; Deadhead needs headshot kills but only 3 of them and lasts up to 72s vs 48s. Wiki tip: Merciless is "useful on weapons that can already kill groups of enemies quickly ... less useful on slow firing weapons that rely on status effects". — [Primary Merciless](https://wiki.warframe.com/w/Primary_Merciless)
- WIKI-CONFIRMED: "Primary passives do not apply to Secondary weapons" and vice versa. — [Arcane Enhancement](https://wiki.warframe.com/w/Arcane_Enhancement)
- WIKI-CONFIRMED: Secondary Shiver is in the Condition-Overload-style bucket (additive with Galvanized Shot's per-status bonus). — [Condition Overload (Mechanic)](https://wiki.warframe.com/w/Condition_Overload_(Mechanic))
- COMMUNITY-CONSENSUS (low-trust source): Deadhead's +360% is "additive to Serration"; its +30% headshot multiplier is a separate multiplier. — [Overframe Nataruk build](https://overframe.gg/build/279107/nataruk/one-shot-steel-path-150k-slash-procs-180-crit-chance-2-forma/)
- "Cascadia arcanes for Incarnon": the Cascadia set is a Zariman-sourced secondary arcane family (Update 31.5, 2022-04-27), released alongside Incarnons; they work on any secondary, not only Incarnons. — [Arcane Enhancement](https://wiki.warframe.com/w/Arcane_Enhancement)

### Inferences
- Additivity (only Merciless is explicitly wiki-confirmed): Deadhead, Dexterity and Cascadia Flare use the same "+X% Damage" wording and are almost certainly in the same additive base-damage bucket as Serration/Hornet Strike/Rivens. Primary Bulwark's and Compression's "+% damage" bucket is UNKNOWN. Secondary Surge and Fortifier are worded as multipliers ("x8").
- Marginal value consequence: with +360% from an arcane, Serration (+165%) raises the base-damage factor from 4.6 to 6.25 (+36%), and Hornet Strike (+220%) from 4.6 to 6.8 (+48%), versus +165% / +220% without the arcane. A crit-damage, elemental or faction mod (x1.55 Primed Bane) will usually beat that, which is the basis of "drop Serration".
- "Best in slot" is opinion, not rule. My reading of the mechanics: Merciless = default for anything that kills often; Deadhead = precision weapons and the best stack retention; Dexterity = melee-centric loadouts (stat stick guns); Frostbite/Blight = crit weapons that proc Cold/Toxin constantly (Blight needs the weapon's own Toxin procs, so it conflicts with combining Toxin into Viral/Corrosive unless Toxin is left uncombined); Cascadia Flare = heat secondaries and status-driven builds (stacks without kills, so it works on single targets); Enervate = low-crit secondaries with high hit rate; Cascadia Overcharge = frames with permanent overshields. Counter-argument to Merciless/Deadhead as universal picks: they give nothing on the first target and on bosses, whereas status-triggered arcanes ramp on a single enemy.

### Gaps
- No creator-sourced tier list was retrievable; best-in-slot statements above are inference.
- Primary Plated Round's formula is not in [PE] text.
- Secondary Outburst duration: [PE] says 30s, wiki table says 20s. Verify in game.
- Whether Enervate's "+10%" is flat (absolute) crit chance: the wiki table says "Flat Critical Chance"; [PE] text says "Increase Critical Chance by 10%".

---

## 5. Rivens

### Takeaway
A Riven is a per-weapon mod with 2 to 3 positive stats and 0 to 1 negative; every value is `base x disposition x count-multiplier x roll(0.9 to 1.1) x (rank+1)/9`. Its stats use the same internal tags as ordinary mods, so they add to the matching mod bucket. Trait Locking went live in Update 44.0 (2026-09-23); Splicing (new stat types such as Weak Point Damage, Status Damage, combined elements) arrives 2026-10-07.

### Cited Findings
- WIKI-CONFIRMED: 2 or 3 bonuses, optional penalty; random polarity among Madurai, Naramon, Vazarin; MR requirement 8 to 16; assigned to one weapon and its variants; rerollable with Kuva; one Riven per weapon; not generated for Exalted weapons. — [Riven Mods](https://wiki.warframe.com/w/Riven_Mods)
- WIKI-CONFIRMED formula: values are "randomly chosen between 90% and 110% of the base value, multiplied by the weapon's Riven Disposition" and by:

| Layout | Bonus multiplier | Curse multiplier |
|---|---|---|
| 2 bonus, 0 curse | 0.99 | n/a |
| 2 bonus, 1 curse | 1.2375 | -0.495 |
| 3 bonus, 0 curse | 0.75 | n/a |
| 3 bonus, 1 curse | 0.9375 | -0.75 |
— [Riven Mods](https://wiki.warframe.com/w/Riven_Mods)
- COMMUNITY (code, reproduces the wiki table exactly): `value = tagValue x 1.5 x disposition x 10 x lerp(0.9, 1.1, Value / 0x3FFFFFFF) x numBuffsAtten[buffCount] x 1.25^curseCount x (lvl + 1)` with `numBuffsAtten = [0, 1, 0.66, 0.5, 0.4, 0.35]`; curses use `-tagValue x 15 x disposition x roll x numBuffsCurseAtten[buffCount] x numBuffsAtten[curseCount] x (lvl + 1)` with `numBuffsCurseAtten = [0, 1, 0.33, 0.5, 1.25, 1.5]`. Rank scaling is linear in (lvl + 1); max lvl is 8. — [RP](https://github.com/calamity-inc/warframe-riven-info/blob/senpai/RivenParser.js)
- DATA-CONFIRMED: Riven mod items have baseDrain 10, fusionLimit 8 (drain 18 at max). Disposition is `omegaAttenuation` on each weapon in `ExportWeapons` (e.g. Kuva Karak 1.05, Laetum 0.5). — [PE+](https://github.com/calamity-inc/warframe-public-export-plus)
- WIKI-CONFIRMED: Disposition ranges 0.5 to 1.55; 5 dots = 1.31-1.55, 4 = 1.11-1.3, 3 = 0.9-1.1, 2 = 0.7-0.89, 1 = 0.5-0.69. New weapons start at the lowest. Variants may differ (Boltor 1.30 vs Telos Boltor/Boltor Prime 1.20). Changes every three months with Prime Access; existing Rivens are re-scaled automatically. Kitgun disposition comes from the Chamber. — [Riven Mods](https://wiki.warframe.com/w/Riven_Mods)

**Gun stat base values at max rank, disposition 1.0, before the layout multiplier** — WIKI-CONFIRMED ([Riven Mods](https://wiki.warframe.com/w/Riven_Mods)) and DATA-CONFIRMED ([PE+] `upgradeEntries` value x 90); internal tag in the last column.

| Stat | Rifle | Shotgun | Pistol / Kitgun | Archgun | Can be negative | Tag |
|---|---|---|---|---|---|---|
| Damage | 165% | 164.7% | 219.6% | 99.9% | yes | WeaponDamageAmountMod |
| Multishot | 90% | 119.7% | 119.7% | 60.3% | yes | WeaponFireIterationsMod |
| Critical Chance | 149.99% | 90% | 149.99% | 99.9% | yes | WeaponCritChanceMod |
| Critical Damage | 120% | 90% | 90% | 80.1% | yes | WeaponCritDamageMod |
| Heat / Cold / Electricity / Toxin | 90% | 90% | 90% | 119.7% | no | WeaponFireDamageMod / WeaponFreezeDamageMod / WeaponElectricityDamageMod / WeaponToxinDamageMod |
| Impact / Puncture / Slash | 119.97% | 119.97% | 119.97% | 90% | yes | WeaponImpactDamageMod / WeaponArmorPiercingDamageMod / WeaponSlashDamageMod |
| Status Chance | 90% | 90% | 90% | 60.3% | yes | WeaponStunChanceMod |
| Status Duration | 99.99% | 99.99% | 99.99% | 99.99% | yes | WeaponProcTimeMod |
| Fire Rate (x2 for bows) | 60.03% | 90% | 74.7% | 60.03% | yes | WeaponFireRateMod |
| Magazine Capacity | 50% | 50% | 50% | 60.3% | yes | WeaponClipMaxMod |
| Ammo Maximum | 49.95% | 90% | 90% | 99.9% | yes | WeaponAmmoMaxMod |
| Reload Speed | 50% | 50% | 50% | 99.9% | yes | WeaponReloadSpeedMod |
| Projectile Speed | 90% | 90% | 90% | n/a | yes | WeaponProjectileSpeedMod |
| Punch Through | 2.7m | 2.7m | 2.7m | 2.7m | no | WeaponPunctureDepthMod |
| Weapon Recoil | -90% | -90% | -90% | -90% | yes | WeaponRecoilReductionMod |
| Zoom | 59.99% | 41.994% (shotguns can roll Zoom since Hotfix 44.0.2, 2026-09-28) | 80.1% | 59.99% | yes | WeaponZoomFovMod |
| Damage vs Corpus / Grineer / Infested | x0.45 | x0.45 | x0.45 | x0.45 | yes | WeaponFactionDamageCorpus / Grineer / Infested |

- WIKI-CONFIRMED: physical-type stats usually cannot roll on weapons with 25% or less of that physical type. — [Riven Mods](https://wiki.warframe.com/w/Riven_Mods)
- WIKI-CONFIRMED element ordering: "If a Riven mod includes multiple elemental damage bonuses, the elements listed are applied in bottom-up order." An elemental mod placed before the Riven combines with the last element listed; one placed after only interacts if the Riven has 1 or 3 elements and combines with the first listed. "This applies to the Valence bonus from an Adversary Weapon as well." — [Riven Mods](https://wiki.warframe.com/w/Riven_Mods)
- WIKI-CONFIRMED (Update 44.0, 2026-09-23): Trait Locking: one trait can be locked while cycling; cycle Kuva cost doubles (900 to 3,500 becomes 1,800 to 7,000); the positive/negative layout is frozen while locked. — [Riven Mods](https://wiki.warframe.com/w/Riven_Mods)
- WIKI-CONFIRMED (future, "scheduled to release on October 7, 2026 with The Icebind"; wiki flags the values as partially placeholder): Riven Splicing fuses two traits into one spliced trait (one per Riven). Gun splices: Damage + Zoom or Damage + Multishot = Weak Point Damage (base 225%); Crit Chance + Zoom or + Multishot = Weak Point Critical Chance (247.5%); Damage + Status Chance = Status Damage (90%); two base elements = the combined element (90%: Toxin+Cold = Viral, Toxin+Electricity = Corrosive, Toxin+Heat = Gas, Heat+Electricity = Radiation, Heat+Cold = Blast, Electricity+Cold = Magnetic); faction pairs = Orokin / Techrot / Scaldra (x0.45); Magazine + Reload or Recoil + Ammo Max = Ammo Efficiency (45%); Ammo Max + Reload or + Magazine = Reload While Holstered (90%). — [Riven Mods](https://wiki.warframe.com/w/Riven_Mods)
- COMMUNITY (code): inventory fingerprint fields used to compute stats are `buffs: [{Tag, Value}]`, `curses: [{Tag, Value}]` and `lvl`; `Value` is an integer in 0..0x3FFFFFFF (1073741823) mapped linearly onto the 0.9 to 1.1 roll; the Riven's item type is the path after `/Lotus/Upgrades/Mods/Randomized/` (e.g. `LotusRifleRandomModRare`, `LotusShotgunRandomModRare`, `LotusPistolRandomModRare`, `LotusModularPistolRandomModRare` (Kitgun), `LotusArchgunRandomModRare`, `PlayerMeleeWeaponRandomModRare`, `LotusModularMeleeRandomModRare`); veiled Rivens use `Raw...RandomMod` types. The Riven name is derived from the tags sorted by `Value`. — [RP](https://github.com/calamity-inc/warframe-riven-info/blob/senpai/RivenParser.js), [PE+](https://github.com/calamity-inc/warframe-public-export-plus)

**Worked examples**
1. Rifle, disposition 1.0, 2 positives + 1 negative, max rank, Critical Chance: 149.99% x 1.0 x 1.2375 = 185.6% at a mid roll; range 167.0% (x0.9) to 204.2% (x1.1).
2. Same Riven's Multishot: 90% x 1.2375 = 111.4% (100.2% to 122.5%).
3. Pistol, disposition 1.3, 3 positives + 1 negative, Damage: 219.6% x 1.3 x 0.9375 = 267.6% (240.9% to 294.4%). Its negative, e.g. Zoom: -80.1% x 1.3 x 0.75 = -78.1% (-70.3% to -85.9%).
4. Rank scaling: the example-1 Riven at rank 4 gives 185.6% x 5/9 = 103.1%, drain 14.
5. From a fingerprint: `{Tag: "WeaponCritChanceMod", Value: 536870911}` = roll 0.5 = x1.0; tagValue 0.016666 x 1.5 x 1.0 x 10 x 1.0 x 0.66 x 1.25 x 9 = 1.856 = 185.6%.

### Inferences
- Stacking with normal mods: Riven tags are the same internal upgrade names as the plain mods' paths (`/Rifle/WeaponDamageAmountMod` is Serration, `WeaponCritChanceMod` is Point Strike, `WeaponFireIterationsMod` is Split Chamber), and the wiki says Riven bonuses "tend to be based around standard mods". So each Riven stat should be added into the same additive bucket as the matching mod stat (Damage with Serration and Merciless; Multishot with Galvanized Chamber; Crit Chance with Point Strike/Critical Delay; elements participate in combination by slot position). COMMUNITY-CONSENSUS; not individually cited.
- A Riven does not occupy an exclusivity group other than "Riven": a Riven with Damage stacks with Serration.
- For the advisor, a Riven is just a 9th-candidate mod whose stat vector is computed from the fingerprint plus the weapon's current `omegaAttenuation` (do not store displayed values; disposition changes quarterly).

### Gaps
- The full fingerprint key set (`compat`, `pol`, `lvlReq`, `rerolls`, `lim`, challenge fields) is from my recollection of the inventory format, not from a retrieved source; only `buffs`, `curses`, `lvl` and the Tag/Value encoding are confirmed by [RP]. Verify against a real inventory dump (expected: `ItemType` = the Randomized path, `UpgradeFingerprint` = JSON string containing `compat` = weapon path, `pol` = "AP_ATTACK"/"AP_TACTIC"/"AP_DEFENSE").
- Spliced-trait tags and final values are not in [PE] yet (feature unreleased).
- How locked/spliced traits are represented in the fingerprint: UNKNOWN.

---

## 6. Incarnon weapons and Incarnon Genesis adapters

### Takeaway
Incarnon guns charge a gauge with weak-point hits (direct hits for Torid and Angstrum), then Alt Fire swaps to a stronger form with its own ammo pool and its own base stats. Evolution perks permanently change base stats (flat base damage, flat base crit/status chance, per-status damage), which changes what mods are worth; builds must be scored against the Incarnon-form stat line with the chosen perks applied.

### Cited Findings
- WIKI-CONFIRMED: natural Incarnons (Zariman: Laetum, Phenmor, Felarx, Praedos, Innodem; Sanctum Anatomica: Onos, Ruvox; Isleweaver: Thalys) have 5 evolutions; Genesis-adapted weapons have 4, installing the adapter being evolution I. "All weapon sub-types such as Prime, Wraith, and Vandal are eligible"; Akimbo/Dual versions are separate weapons. Challenges need clearing once per weapon family. — [Incarnon](https://wiki.warframe.com/w/Incarnon)
- WIKI-CONFIRMED: "For primary and secondary weapons ... the Incarnon Transmutation gauge ... must be charged by landing weakpoint hits. Angstrum Incarnon Genesis and Torid Incarnon Genesis are instead charged through direct hits. While active, the Incarnon Form uses its own separate ammunition ... Activating the Incarnon Form can be done at any level of charge ... Manually deactivating ... will deplete the entire gauge. When Incarnon Form ends, the weapon's magazine will be refilled." — [Incarnon](https://wiki.warframe.com/w/Incarnon)
- WIKI-CONFIRMED: melee Incarnon: reach 6x combo (5x Innodem) then Heavy Attack; lasts 180s (90s Innodem, Ruvox); does not consume combo. — [Incarnon](https://wiki.warframe.com/w/Incarnon)
- WIKI-CONFIRMED: after evolution I, each evolution offers "2 or 3 different selectable perks ... Only one perk can be selected per Evolution, which can be changed freely with Cavalero or in the Arsenal." — [Incarnon](https://wiki.warframe.com/w/Incarnon)
- WIKI-CONFIRMED worked example, Torid Incarnon Genesis: 5 direct hits fill the gauge; each charge gives 34 rounds up to 170; Incarnon magazine is not affected by mods or Ammo Efficiency; form persists through holstering but is lost on death. Form = continuous beam, 37m range, chains to 5 enemies at 75% per chain, with higher base damage, crit chance, crit multiplier and status chance. Punch Through has no effect on the beam; beam-only mods (Sinister Reach, Combustion Beam) cannot be equipped because the base weapon is not a beam. Evolution II: "Final Fusillade" +51 base damage (and +3 multishot on last shot) or "Plentiful Mayhem" +31 base damage (multishot consumes ammo, +60% damage, multiplicative to Serration-type bonuses). Evolution III: +50% projectile speed / lingering field / +9 magazine (not Incarnon magazine). Evolution IV: "Commodore's Fortune" +20% base crit chance / "Survivor's Edge" +15% base crit and +15% base status / "Elemental Balance" +34% base status. — [Torid](https://wiki.warframe.com/w/Torid)
- WIKI-CONFIRMED: several Genesis perks are per-status "Direct Damage" bonuses that share the Galvanized Aptitude bucket (Latron +30%, Lato/Angstrum/Despair/Zylok/Soma +40%, Dual Toxocyst +33% per status); Kunai and Dread have +100% vs enemies under 50% health. — [Condition Overload (Mechanic)](https://wiki.warframe.com/w/Condition_Overload_(Mechanic))
- WIKI-CONFIRMED (recent changes): Update 43.0 (2026-06-17) added Vectis, Stug, Ballistica, Destreza, Obex Genesis adapters (Circuit week 9). Hotfix 43.0.4 (2026-06-23) raised Vectis "Lone Enforcer" to +75 base damage (+150 Prime) and 25% multishot. Update 43.5 (2026-08-12) fixed Vectis Incarnon benefitting from Primed Chamber on every shot. — [Incarnon](https://wiki.warframe.com/w/Incarnon)
- WIKI-CONFIRMED: Cannonade compatibility is judged across all trigger modes, Incarnon included (Latron qualifies). — [Cannonade Mods](https://wiki.warframe.com/w/Cannonade_Mods)
- COMMUNITY (Brozime's opinion, vault text; date of page not shown): recommended evolution picks in "0xxx" notation (digit = perk chosen per evolution, first always 0), e.g. Torid 0112 (S), Latron 0133 (S), Furis 0223 (S), Miter 0112 (S), Dual Toxocyst 0131 (S), Strun 0211 (S-), Braton 0121 (A), Boar 0133 (A), Lex 0123 (A), Boltor 0212 (A), Laetum 02131 (S), Felarx 03231 (S), Phenmor 01131 (A). — [Brozime vault, Incarnons](https://publish.obsidian.md/brozime/Public/Guides+%26+Builds/Guides/Other/Incarnons)

### Inferences
- "Increase Base Damage by +N" is a flat add to the weapon's base damage before all percentage mods, so it multiplies with everything, and it is proportionally larger on low-base variants (which is why base/Prime variants are compared after the perk). Flat base crit/status perks likewise change which archetype (crit, hybrid, status) the weapon belongs to.
- Build differences for Incarnon form: (1) score against the form's own damage/crit/status/fire-rate/multishot; (2) magazine, ammo-max and ammo-efficiency mods have no value in form; (3) fire rate still matters; (4) the normal form only needs to land weak-point hits to charge, so players build entirely for the form; (5) Primary/Secondary Deadhead pairs naturally with headshot-charged Incarnons; (6) AoE or chaining forms (Torid) only get per-status bonuses on directly hit targets.
- The advisor needs a per-weapon table of Incarnon-form stats and per-perk stat deltas plus the player's selected perks; without it, Incarnon recommendations will be wrong.

### Gaps
- Per-weapon Incarnon-form stat lines and all perk tables were not collected (only Torid). They are on each weapon's wiki page ("Evolutions" table) and the wiki's weapon data module.
- How selected evolutions are stored in inventory data: UNKNOWN (not researched).
- [PE+] `ExportWeapons` lists multiple `behaviours` per weapon (Laetum shows two fire modes with separate damage tables); whether Genesis-adapted forms appear there was not checked.

---

## 7. Kuva, Tenet and Coda weapons

### Takeaway
Each lich-type weapon carries a 25% to 60% bonus of its base damage as an extra damage type fixed by the progenitor Warframe; it counts as base damage, so damage mods and elemental mods scale off it. Fusing two copies multiplies the higher bonus by 1.1 (cap 60%). These weapons reach rank 40 (80 capacity with a Catalyst) after 5 Forma.

### Cited Findings
- WIKI-CONFIRMED: bonus is "ranging from 25-60% of the weapon's base damage determined randomly"; "This additional bonus damage applies as weapon base damage, meaning elemental mods and status that scale from base / modified base damage will be affected." The type is set by the Progenitor Warframe. — [Kuva (Variant)](https://wiki.warframe.com/w/Kuva_(Variant))
- WIKI-CONFIRMED progenitor elements (7 options): Impact, Heat, Cold, Electricity, Toxin, Magnetic, Radiation; e.g. Heat = Chroma, Ember, Inaros, Jade, Kullervo, Nezha, Protea, Temple, Uriel, Vauban, Wisp; Toxin = Atlas, Dagath, Ivara, Khora, Nekros, Nidus, Nokko, Oberon, Oraxia, Saryn; Magnetic = Citrine, Cyte-09, Harrow, Hydroid, Lavos, Mag, Mesa, Xaku, Yareli (full table on the page). — [Kuva Lich](https://wiki.warframe.com/w/Kuva_Lich)
- WIKI-CONFIRMED Valence Fusion: applies to Kuva, Tenet and Coda weapons. "Final Bonus = min(1.1 x max(Bonus1, Bonus2), 60)", "rounding the result down to the first decimal place"; "If the post-Fusion bonus is greater than or equal to 58%, the value is rounded up to 60%." The player chooses which element to keep. Catalyst, Forma, Exilus Adapter, Lens and Elemental Vice on the sacrificed copy do not transfer. — [Valence Fusion](https://wiki.warframe.com/w/Valence_Fusion)
- WIKI-CONFIRMED: each polarization raises max rank by 2, to rank 40 after 5; ranks above 30 give mastery (4,000 total). — [Kuva (Variant)](https://wiki.warframe.com/w/Kuva_(Variant))
- DATA-CONFIRMED: `maxLevelCap: 40` is present on 52 weapons in [PE+] (35 flagged `VT_KUVA`, 17 others including Tenet "Crp..." weapons, Coda "1999Inf..."/"InfLich..." weapons, Kuva Grattler/Stubba and a few non-lich weapons such as Paracesis `BallasSwordWeapon`). The advisor should read `maxLevelCap` rather than infer from the name. — [PE+](https://github.com/calamity-inc/warframe-public-export-plus)
- DATA-CONFIRMED (schema): lich weapons carry a default upgrade `/Lotus/Weapons/Grineer/KuvaLich/Upgrades/InnateDamageRandomMod` in `Slot: -1`; its upgrade entries are tagged `InnateElectricityDamage`, `InnateFreezeDamage`, `InnateHeatDamage`, `InnateImpactDamage`, `InnateMagDamage`, `InnateRadDamage`, `InnateToxinDamage`. — [PE+](https://github.com/calamity-inc/warframe-public-export-plus)
- WIKI-CONFIRMED (ordering hint): the Riven page's rule for a mod placed after a multi-element Riven "applies to the Valence bonus from an Adversary Weapon as well", i.e. the valence element behaves like an element positioned after the mod slots. — [Riven Mods](https://wiki.warframe.com/w/Riven_Mods)
- WIKI-CONFIRMED (historic fixes showing intended behaviour): Updates 31.1.7 to 31.5 (2022) fixed the innate lich bonus not being included in Galvanized Aptitude's bonus; i.e. the valence bonus is meant to be part of the base that per-status bonuses scale. — [Galvanized Aptitude](https://wiki.warframe.com/w/Galvanized_Aptitude)
- COMMUNITY (Brozime's opinion): recommended progenitor element is Heat for most Kuva/Tenet guns, Magnetic as "a safe choice for any gun as it will always help them deal with Eximus", Toxin for weapons that want to combine into Viral/Corrosive with one mod (Kuva Bramma, Zarr, Chakkhurr), Electricity for Kuva Sobek. Some Tenet weapons (Agendus, Exec, Ferrox, Grigori, Livia) come from Ergo Glast's shop, not Sisters. Coda weapons rotate in Eleanor's shop in two groups on a 4-day timer. — [Brozime vault, Lich Weapons](https://publish.obsidian.md/brozime/Public/Guides+%26+Builds/Guides/Kuva+Lich%2C+Sisters+of+Parvos%2C+%26+Coda/Lich+Weapons)

### Inferences
- Modelling: add `bonus% x total base damage` as an extra base-damage component of the progenitor type before applying Serration-type and elemental percentage mods. Elemental mods' added damage is a percentage of total base damage, so it grows by the same factor (a 60% weapon has 1.6x the base for those purposes).
- Combination order (standard community rule, consistent with the Riven-page sentence but not quoted from a dedicated source): mod elements combine first in slot order (top-left to bottom-right); the weapon's innate elements and then the valence element are appended last, so the valence element combines with a leftover single element if one exists, otherwise stays separate. A Heat progenitor on a weapon modded Cold + Toxin gives Viral + Heat. An Impact progenitor just adds physical damage. Label: COMMUNITY-CONSENSUS; the damage-formula researcher should confirm.
- Inventory representation is probably an `UpgradeFingerprint` on the weapon with `buffs: [{Tag: "InnateHeatDamage", Value: ...}]` by analogy with Rivens and the `upgradeEntries` schema, with `Value` mapping onto 25% to 60%. This is a guess; see Gaps.

### Gaps
- Exact inventory encoding of the valence bonus (field names and how `Value` maps to 25-60%): UNKNOWN; not found in any retrieved source. Verify against a real inventory dump of a Kuva weapon whose percentage is known.
- Coda-specific rules (element source, whether the bonus range is also 25-60%, purchase vs drop) were not on the Technocyte Coda page; the Valence Fusion page confirms only that Coda weapons fuse the same way.
- "Extra polarities": no source found that lich weapons get additional innate polarities beyond their listed ones; treat innate polarities as per-weapon data.
- Elemental Vice (named as non-transferable in Valence Fusion) was not researched; it appears to be a newer item affecting the weapon's element. UNKNOWN; verify.

---

## 8. Set mods and set bonuses relevant to guns

### Takeaway
Only Vigilante matters for gun damage: each Vigilante mod equipped anywhere in the loadout adds 5% chance to raise a primary weapon's crit tier by one. Other sets with gun pieces (Hunter, Augur, Synth, Motus, Proton, Aero, Carnis/Jugulus/Saxum) are picked for the individual mod, not the set bonus.

### Cited Findings
- WIKI-CONFIRMED: set bonuses scale with the number of the set's mods "equipped together in a current loadout" (across Warframe, weapons, companion). — [Mod](https://wiki.warframe.com/w/Mod)
- DATA-CONFIRMED: Vigilante (6 mods): "5% / 10% / 15% / 20% / 25% / 30% chance to enhance Critical Hits from Primary Weapons." Members: Vigilante Armaments (+60% Multishot), Vigilante Fervor (+45% Fire Rate), Vigilante Offense (+1.5 Punch Through), Vigilante Supplies (ammo mutation, exilus) on primaries; Vigilante Vigor, Vigilante Pursuit on the Warframe. — [PE]
- DATA-CONFIRMED: Hunter set (6): "+25% to +150% Companion Damage on enemies affected by Slash"; gun members Hunter Munitions and Hunter Track (+90% Status Duration). — [PE]
- DATA-CONFIRMED: Augur set (6): 40% per mod of energy spent converted to shields; pistol members Augur Pact (+90% Damage, drain 7, Naramon) and Augur Seeker (+90% Status Duration). — [PE]
- DATA-CONFIRMED: Synth set (4): holstered weapons reload 5% of magazine per second per mod (20% at 4); Synth Charge (pistol). Motus (3): knockdown immunity airborne; Motus Setup (shotgun). Proton (3): damage reduction on wall latch; Proton Jet (rifle). Aero (3): Aero Periphery (primary exilus), Aero Agility (sniper). Carnis/Jugulus/Saxum (3 each): Carnis Stinger (+90% Slash, +60% Status Chance), Jugulus Spines (+90% Puncture, +60% SC), Saxum Spittle (+90% Impact, +60% SC) for pistols. — [PE]

### Inferences
- Vigilante bonus value: a "tier up" on a crit adds one crit multiplier step, so expected damage rises by roughly `p x (CD - 1) / (1 + CC x (CD - 1))`-style terms on the crit portion; at 5-10% (1-2 mods) it is small. Armaments is taken for the +60% multishot, which stacks with Galvanized Chamber.
- Augur Pact is a second additive base-damage mod for pistols (stacks with Hornet Strike), cheap at 7 drain; it loses most value once an arcane supplies +360%.

### Gaps
- Exact mechanics of the Vigilante tier enhancement (applies to non-crits? to secondaries on dual-wield?) not retrieved.
- Umbral/Sacrificial sets are Warframe/melee only.

---

## 9. Weapon-specific augments and syndicate mods with damage effects

### Takeaway
Augments stack with standard mods and several are large enough to define the weapon's build (Scattered Justice, Deadly Sequence, Hata-Satya, Critical Precision, Higasa Serration, Eximus Advantage). They must be in the candidate pool whenever the weapon matches `compatName`.

### Cited Findings
- WIKI-CONFIRMED: "Augments stack with standard mods"; weapon-specific Amalgam mods do not. — [Mod](https://wiki.warframe.com/w/Mod)
- DATA-CONFIRMED max-rank effects ([PE]; `compatName` gives the weapon family, some are variant-only):
  - Syndicate (rank 3, drain 7, carry a syndicate proc "+1 Justice/Truth/Purity/Sequence/Entropy/Blight"): Scattered Justice (Hek) +200% Multishot; Deadly Sequence (Grinlok) +200% Crit Chance; Soaring Truth (Ballistica) +200% Crit Chance; Gilded Truth (Burston Prime) +80% Fire Rate; Lasting Purity (Vulkar) +60% Damage when Aiming; Shattering Justice (Sobek) +90% Status Chance; Entropy Burst (Supra) +20 Final Status Chance; Toxic Sequence (Acrid) +200% Status Duration; Winds of Purity (Furis) +20% Life Steal; Eroding Blight (Embolist) and Stockpiled Blight (Kunai) +200% Magazine; Stinging Truth (Viper) +40 Magazine; Sequence Burn (Spectra) +20m Beam Range; Entropy Spike (Bolto) +20% chance to explode.
  - Conditional crit/damage augments: Hata-Satya (Soma Prime) +1.2% Crit Chance per hit until reload; Critical Precision (Tiberon, burst mode) +10% CC per headshot up to 500%; Critical Mutation (Catabolyst) +30% CC and CD per kill up to 300%; Exposing Harpoon (Harpak) +300% CC for 15s; Deadly Maneuvers (Magnus) 400% headshot CC for 2 shots after dodge; Unseen Dread (Dread) +175% Crit Damage while invisible; Necrophagic Vigor (Hema) and Dreadful Killshot (Basmu) scale to 360%; Sentient Surge (Ocucor) +60% SC and CC per tendril; Eximus Advantage (Zylok) +600% Secondary Damage for 10s on Eximus headshot; Range Advantage (Akjagara) +300% damage if no enemy within 10m; Pain Points (Athodai) +60% Weak Point Damage x10; Meticulous Aim (Vulkar) +105% headshot / -45% bodyshot damage.
  - Flat stat augments: Higasa Serration (Higasa) +450% Damage; Damzav-Vati (Akbronco Prime) +240% Viral; Biotic Rounds (AX-52) +150% Viral and Magnetic damage and Status Chance for 15s on weak point kill; Leaded Gas (Vesper 77) +300% Gas damage and Status Chance 6s; Prototype Shock Coils (EFV-8 Mars) +90% Electricity; Flux Overdrive (Flux Rifle) +150% to +250% Status Chance; Efficient Beams (Convectrix) +150% Status Chance; Dizzying Rounds (Bronco) +200% Status Chance; Napalm Grenades (Penta) +30 Final Status Chance; Photon Overcharge (Glaxion) +90% Crit Damage; Clip Delegation (Sobek) +15% SC and Multishot per shot landed, 15 stacks.
  - On-death explosion augments: Acid Shells (Sobek) 450 Corrosive + 45% enemy max health in 15m; Thermagnetic Shells (Detron) 80 Magnetic + 40% max health in 6m; Nightwatch Napalm (Ogris).
  - Amalgam weapon-specific: Amalgam Argonak Metal Auger +3 Punch Through; Amalgam Daikyu Target Acquired +75% headshot multiplier; Amalgam Javlok Magazine Warp +45% magazine.

### Inferences
- Whether an augment's "+450% Damage" (Higasa Serration) or "+60% Damage when Aiming" sits in the Serration bucket is not stated; by wording it is the same additive base-damage stat. "x Final Status Chance" augments add flat status chance after multipliers.
- Many augments apply only to the named variant (`compatName` "Soma Prime", "Burston Prime", "Akbronco Prime", "Paris Prime"); the advisor must match on the mod's `compat` path in [PE+], not on the base name.

### Gaps
- Bucket placement (additive vs separate multiplier) of each augment damage bonus was not verified per mod.

---

## 10. Archon Shards, Helminth invigorations and focus passives that add weapon damage

### Takeaway
Shards give small, mod-additive gun bonuses: Crimson (+25% primary status chance or +25% secondary crit chance), Violet (+30% primary Electricity that combines with mods), Topaz (secondary crit chance ramping to +50% on Heat kills), Emerald (+30% Toxin status damage, +2 max Corrosive stacks). Tauforged values are 1.5x. They are loadout context, not build slots.

### Cited Findings
- WIKI-CONFIRMED (values in parentheses are Tauforged): — [Archon Shard](https://wiki.warframe.com/w/Archon_Shard)
  - Crimson: +25% (+37.5%) Primary Status Chance, "additive with similar buffs such as Rifle Aptitude"; +25% (+37.5%) Secondary Critical Chance, "additive with similar buffs such as Pistol Gambit". Both affect Exalted weapons of the class.
  - Violet: "+30% (+45%) Primary Electricity Damage. Gain an additional +10% (+15%) per Crimson, Azure, or Violet Archon Shard equipped. Electricity will combine with Mods." Additive with Stormbringer.
  - Topaz: "Increase Secondary Critical Chance by 1% (1.5%) every time you kill an enemy affected by Heat Status. Max 50% (75%)", additive with Pistol Gambit, stacks per shard, resets on revive.
  - Emerald: "Toxin Status Effects deal +30% (+45%) more damage", additive with the Elementalist mods' Status Damage; "Increase max stacks of Corrosion Status by +2 (+3)."
  - Ability Damage bonuses (Emerald/Topaz/Violet) do not apply to Exalted weapons.

### Inferences
- A Violet Electricity shard changes elemental combinations on primaries (its position in the combine order is not stated); the advisor should at least warn when one is present and the build depends on a specific combination.

### Gaps
- Helminth invigorations (weekly weapon-damage buffs) and focus-school weapon passives were NOT researched; no claims made. The only related datum seen: Madurai "Void Fuel" focus node gives up to 40% weapon (ammo) efficiency while Void Strike is active ([PE] `ExportFocusUpgrades`).
- Position of the Violet shard's Electricity in the elemental combine order: UNKNOWN.

---

## 11. Standard build templates and slot allocation

### Takeaway
Experienced builds follow a small set of templates defined by the weapon's crit and status stats, then adjust for the arcane (drop the base damage mod when the arcane already supplies +360%) and for capacity. The templates below are my synthesis from the mechanics above; no creator text describing them was retrievable, so treat them as COMMUNITY-CONSENSUS at best and inference otherwise.

### Cited Findings
- WIKI-CONFIRMED basis for dropping base damage: arcane damage is additive with Serration. — [Primary Merciless](https://wiki.warframe.com/w/Primary_Merciless)
- COMMUNITY-CONSENSUS (forum-level): "Primary Merciless and Serration are additive, so you go with one or the other." (Steam discussion and Overframe build text surfaced in search; low trust, consistent with the wiki rule.) — [Overframe Nataruk build](https://overframe.gg/build/279107/nataruk/one-shot-steel-path-150k-slash-procs-180-crit-chance-2-forma/)
- WIKI-CONFIRMED basis for Galvanized status mods: +80% damage per status type (rifle/shotgun) or +120% (pistol), additive with Serration, not applied to AoE. — [Galvanized Aptitude](https://wiki.warframe.com/w/Galvanized_Aptitude)
- COMMUNITY (Brozime): elemental defaults: one Toxin mod combining into Viral/Corrosive, Heat left as the separate element, Magnetic for Eximus/Overguard. — [Brozime vault, Lich Weapons](https://publish.obsidian.md/brozime/Public/Guides+%26+Builds/Guides/Kuva+Lich%2C+Sisters+of+Parvos%2C+%26+Coda/Lich+Weapons)
- COMMUNITY (Brozime): his modding guidance is video-only ("I won't be putting the information in the video into text here"). — [Brozime vault, Basic Modding Overview](https://publish.obsidian.md/brozime/Public/Guides+%26+Builds/Modding/Basic+Modding+Overview)

### Inferences
Slot templates (8 slots; names give the rifle / shotgun / pistol mod):

1. Crit build (base crit chance roughly 25%+ and crit multiplier 2x+):
   - Multishot: Galvanized Chamber / Hell / Diffusion
   - Crit chance: Critical Delay / Critical Deceleration / Creeping Bullseye (+200%, -20% fire rate) or Point Strike / Primed Blunderbuss / Primed Pistol Gambit; Galvanized Scope / Crosshairs or Argon Scope if the weapon is aimed and lands headshots
   - Crit damage: Vital Sense / Primed Ravage / Primed Target Cracker
   - Two elementals (usually Cold + Toxin = Viral, with a Primed or 60/60 version), plus Heat via progenitor or a third slot
   - Base damage: Serration / Primed Point Blank / Hornet Strike. Dropped first when the arcane is Merciless/Deadhead/Dexterity/Cascadia Flare.
   - Flex: fire rate (Primed Shred, Vile Acceleration, Lethal Torrent), Hunter Munitions (primaries with high crit chance and no Slash weighting), faction mod (Primed Bane x1.55), Riven, Bladed Rounds-type crit damage if aimed.
2. Hybrid (decent crit and status chance, around 20%+ each): as crit build but replace the base damage slot with Galvanized Aptitude / Savvy / Shot (status chance plus per-status damage), and use 60/60 elementals where status chance is short.
3. Status / primer (low crit, high status or beam/high fire rate): Galvanized status mod, multishot, 3 to 4 elementals to spread distinct status types (60/60 mods preferred), fire rate, status duration optional; Elementalist mod (+90% Status Damage) when damage comes from Heat/Toxin/Slash/Electricity/Gas ticks; no crit mods. A pure primer wants as many distinct statuses as possible and ignores damage.
4. Incarnon build: pick evolutions first, then apply template 1 or 2 against the Incarnon-form stats; skip magazine/ammo mods; Deadhead or Merciless arcane; Cannonade (+240%/+300% damage, fire rate locked) on all-semi weapons instead of Serration/Hornet Strike when the fire-rate lock is acceptable.
5. Weak-point build (Acuity): Primary/Pistol Acuity (+350% weak point damage and weak point crit chance) replaces multishot entirely (multishot is locked), for single-projectile precision weapons.
6. AoE launcher: no Galvanized status mod for damage (per-status bonus does not reach the radial), Firestorm/Primed Fulmination optional, base damage or arcane, multishot, crit or status per stats.

Drop rules:
- Base damage mod: drop or keep last when an additive +360% arcane is assumed at full stacks, or when the Riven already has Damage. Keep it for arcane-less builds, for "zero stacks" scenarios, and when the per-status bonus is not available (AoE).
- Multishot is never dropped except with Acuity.
- Crit mods are dropped below roughly 15-20% base crit chance unless a perk/arcane (Enervate, Cascadia Overcharge, Hata-Satya-type augment, Incarnon +base crit) lifts it.
- Fire-rate mods are dropped on Cannonade builds (locked) and are low value on charge/bow weapons unless doubled ("x2 for Bows").
- Faction mods (x1.3 / x1.55) are a true separate multiplier and out-value another additive damage mod when the target faction is known; they also multiply status damage a second time (damage researcher to confirm).
- Hunter Munitions (30% Slash on crit) vs Internal Bleeding (35% Slash on Impact proc, 70% below 2.5 fire rate): crit weapons take the former; slow, Impact-heavy status weapons the latter.

### Gaps
- No direct creator sources for these templates or for thresholds (the 15-25% crit cut-offs are my heuristics). The report writer should present them as heuristics the app can tune, not as rules.
- Thresholds depend on the damage formula (other researcher).

---

## What a build advisor must model (ranked by impact on recommendation quality)

1. Conditional stacks with a scenario setting (full stacks default, zero stacks alternative): Galvanized multishot (+230% at full) and Galvanized status mods (+80%/+120% damage per status type, additive with base damage, zero on AoE radial damage).
2. The arcane slot: +360% additive base damage from Merciless/Deadhead/Dexterity (and Cascadia Flare +480%), which changes the marginal value of every base-damage mod; Frostbite/Blight/Voltage multishot and crit damage; Enervate/Overcharge crit chance.
3. Mod exclusivity groups (section 1 table), including the renamed Galvanized and corrupted-crit pairs, Riven limit of one, and stat locks (Acuity locks multishot, Cannonade locks fire rate and needs all-semi triggers).
4. Capacity legality: rank x (2 with Catalyst), drain = baseDrain + rank, ceil(drain/2) on match, round-to-nearest 1.25x on mismatch, exilus slot counts toward capacity, rank 40 from `maxLevelCap`; plus a "Forma required" count and slot assignment.
5. Additive buckets by internal stat: base damage (Serration, Heavy Caliber, Augur Pact, Cannonade, Riven Damage, arcane damage), multishot, crit chance, crit damage, each element; and separate multipliers (faction mods, per-status "Direct Damage" bucket, headshot/weak-point multipliers).
6. Kuva/Tenet/Coda valence bonus (25-60% of base as an extra element counted as base damage) and its position in elemental combination.
7. Rivens computed from fingerprint: tag list, `Value / 0x3FFFFFFF` roll, layout multipliers, `(lvl + 1)`, current `omegaAttenuation`; element order bottom-up; drain 10 + rank.
8. Incarnon form: per-weapon form stats, chosen evolution perks (flat base damage, flat base crit/status, per-status bonuses), ignore magazine/ammo mods in form.
9. Aim / weak-point conditions as user toggles: Argon Scope / Galvanized Scope / Crosshairs (+135% or up to +320% crit chance when aiming), Bladed Rounds family, Deadhead, Acuity.
10. Weapon augments matched by exact `compat` path (variant-specific), stacking with standard mods.
11. Exilus slot candidates (from `isUtility`), none of which add direct damage; choose by utility (recoil, ammo, projectile speed, punch-through is NOT exilus).
12. Set bonuses: Vigilante crit-tier chance per equipped set mod across the loadout.
13. Loadout context modifiers: Archon Shards (primary status chance, secondary crit chance, primary Electricity), and later Helminth invigorations / focus.
14. Internal Bleeding / Hemorrhage fire-rate threshold (x2 below 2.5), Hunter Munitions 30% Slash on crit.
15. Upcoming (2026-10-07): spliced Riven traits (Weak Point Damage 225%, Weak Point Crit Chance 247.5%, Status Damage 90%, combined elements 90%, new faction targets).

## Open questions to verify in game

1. Polarity mismatch rounding: put a 5-drain mod in a wrong-polarity slot. Expect 6 (round to nearest) per the Mod page; 7 would mean round up per the Polarity page.
2. Does an Omni Forma (Universal) slot halve every non-Umbra mod, exactly like a matching polarity?
3. Is Galvanized Aptitude / Savvy / Shot additive with Serration and with Merciless/Deadhead on the specific weapon (wiki: usually additive, some attacks multiplicative)? Test in Simulacrum with a known status count.
4. Are Deadhead, Dexterity, Cascadia Flare, Primary Bulwark and Primary Compression "+% Damage" all in the Serration bucket? Only Merciless is wiki-confirmed.
5. Secondary Outburst duration: 30s (game data) or 20s (wiki)?
6. Secondary Enervate: is +10% per hit absolute crit chance (flat) and does it apply before or after mod multipliers?
7. Internal Bleeding / Hemorrhage: is the 2.5 fire-rate threshold checked against modded or base fire rate, and how does it treat charge and burst weapons?
8. Exact exclusivity of: Split Flights vs Galvanized Chamber; Creeping Bullseye vs Primed Pistol Gambit; Laser Sight (shotgun) vs anything; Acuity vs Argon/Galvanized Scope.
9. Valence bonus in inventory data: field names and the mapping of the stored value to 25-60%; and whether `Innate...Damage` tags appear in the weapon's `UpgradeFingerprint`.
10. Where the valence element and a Violet-shard Electricity bonus sit in the elemental combination order relative to mods and innate weapon elements.
11. Riven fingerprint full key set (`compat`, `pol`, `lvlReq`, `rerolls`) and how locked or spliced traits are stored after Update 44.0 / The Icebind.
12. How selected Incarnon evolutions are stored in inventory, and whether Incarnon-form stats can be derived from Public Export `behaviours`.
13. Whether the MR-based minimum mod capacity is doubled by a Catalyst (matters only for unranked weapons after Forma).
14. Coda weapons: bonus range, how the element is chosen, and whether any Coda/Tenet weapons have rules differing from Kuva.
15. Vigilante set bonus: exact effect on non-crit hits and whether it applies to primary Exalted weapons.
16. Primary Plated Round: actual damage formula per round loaded.
