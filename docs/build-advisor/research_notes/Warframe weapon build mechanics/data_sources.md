# Machine-readable data sources for the weapon build advisor (researched 2026-10-05)

Labels: **VERIFIED-ON-DISK** (file opened, path given), **DOCUMENTED** (URL given; where marked "live" I fetched the
endpoint on 2026-10-05 and read the response), **UNVERIFIED** (from memory or not checked).

Paths are relative to `C:\Users\derek\Documents\code_projects\WFHelper` unless absolute. `PEP` =
`node_modules/warframe-public-export-plus`, `WFCD` = `node_modules/@wfcd/items/data/json`.

Versions and dates:

| Thing | Installed | Latest | Source |
| --- | --- | --- | --- |
| warframe-public-export-plus | 0.6.8 (published 2026-07-29) | 0.6.11 (2026-09-26); GitHub default branch `senpai` pushed 2026-10-06 UTC | VERIFIED-ON-DISK `PEP/package.json`; DOCUMENTED [npm](https://www.npmjs.com/package/warframe-public-export-plus), [GitHub](https://github.com/calamity-inc/warframe-public-export-plus) |
| @wfcd/items | 1.1276.6 (published 2026-09-25) | 1.1276.17 (2026-10-03) | VERIFIED-ON-DISK `node_modules/@wfcd/items/package.json`; DOCUMENTED [npm](https://www.npmjs.com/package/@wfcd/items) |
| DE Public Export index | n/a | `Last-Modified: 2026-09-30` | DOCUMENTED live, `https://content.warframe.com/PublicExport/index_en.txt.lzma` |
| Wiki modules | n/a | Weapons/data/primary 2026-10-03, Mods/data 2026-09-27, Arcane/data 2026-09-27, DamageTypes/data 2026-10-01, Weapons/data/modular 2026-09-23, Enemies/data (index page) 2026-04-09 | DOCUMENTED live, [wiki API revisions query](https://wiki.warframe.com/api.php?action=query&prop=revisions&titles=Module:Weapons/data/primary%7CModule:Mods/data%7CModule:Arcane/data&rvprop=timestamp%7Csize&format=json) |

Newest weapon `introducedAt` inside the data: PEP 0.6.8 = 2026-04-08; PEP 0.6.11 and GitHub head = 2026-07-11.
Newest weapon `releaseDate` in WFCD 1.1276.6 = 2026-09-23.

---

## 1. What the two installed packages contain

### Takeaway

Neither package has numeric effects for ordinary mods: both carry only per-rank text (`levelStats[].stats[]` in
WFCD; nothing at all in PEP). Structured numbers do exist on disk for Rivens (`upgradeEntries`), Kuva/Tenet/Coda
bonus-element tags, set bonus values, arcane per-rank substitution values, enemy health/armour/shield, and, contrary
to the advisor's notes, radial damage: PEP has it under `behaviours[].projectile.explosiveAttack`, and WFCD has it
(with falloff) under `attacks[]`.

### Cited Findings

**PEP `ExportWeapons.json`** (object keyed by type path; 843 entries; 662 have `behaviours`). VERIFIED-ON-DISK
`PEP/ExportWeapons.json`, types in `PEP/index.d.ts` (`IWeapon`, `IWeaponBehaviour`, `IProjectile`, `IAttackData`).

- Base stats: `damagePerShot` (20 numbers), `totalDamage`, `criticalChance`, `criticalMultiplier`, `procChance`,
  `fireRate`, `multishot`, `magazineSize`, `reloadTime`, `accuracy`, `trigger`, `noise`, `masteryReq`, `slot`
  (0 secondary, 1 primary, 5 melee, 7 exalted), `productCategory`, `holsterCategory`, `omegaAttenuation`,
  `primeOmegaAttenuation` (5 kitgun chambers), `maxLevelCap` (52 entries), `variantType`
  (`VT_NORMAL|VT_PRIME|VT_KUVA|VT_VARIANT|VT_SYNDICATE|VT_STARTER`), `compatibilityTags`, `defaultUpgrades`
  (40 entries), `partType`/`gunType` (modular parts), `introducedAt`.
- `trigger` values seen: `SEMI` 106, `AUTO` 157, `BURST` 33, `CHARGE` 45, `HELD` 37, `ACTIVE` 10, `DUPLEX` 5,
  `Auto Burst` 2.
- `behaviours[]` shape (counts across all weapons): `stateName` (loc tag: SEMI/AUTO/BURST/ACTIVE/HELD/CHARGE/DUPLEX/
  "Auto Burst"/"Incarnon Form"), `fireIterations` (893), `impact{DT_*, procChance}` (885),
  `projectile.attack` (286), `projectile.explosiveAttack` (112), `projectile.embedDeathAttack` (61),
  `chargedProjectile.attack` (52), `chargedProjectile.explosiveAttack` (15), `chargedProjectile.embedDeathAttack` (7),
  `burst{count, delay}` (51). Damage keys are `DT_IMPACT, DT_PUNCTURE, DT_SLASH, DT_FIRE, DT_FREEZE, DT_ELECTRICITY,
  DT_POISON, DT_EXPLOSION, DT_RADIATION, DT_GAS, DT_MAGNETIC, DT_VIRAL, DT_CORROSIVE, DT_RADIANT, DT_SENTIENT`.
- Samples: Kuva Zarr `behaviours[0].projectile = {attack:{DT_IMPACT:50, procChance:0.31}, explosiveAttack:
  {DT_EXPLOSION:673, procChance:0.31}, embedDeathAttack:{DT_EXPLOSION:175}}`; Burston Prime
  `burst:{count:3, delay:0.04}`; Trumna Prime `behaviours[1].projectile.explosiveAttack = {DT_FIRE:1150}`.
- For projectile weapons the `impact` block is a placeholder (`DT_IMPACT 3.33333, DT_PUNCTURE 3.33333,
  DT_SLASH 3.33334, procChance 0.1` on Kuva Zarr, Kuva Bramma, Laetum alt-fire); the real numbers are under
  `projectile`.
- Not present anywhere in `ExportWeapons.json`: falloff, punch through, ammo, charge time, beam range/ramp-up,
  weapon polarities, exilus polarity, Incarnon evolution perks (a text search of the file for `falloff`,
  `punchThrough`, `polarit`, `Evo` finds no such fields).
- Kuva/Tenet bonus element hook: `defaultUpgrades: [{ItemType: "/Lotus/Weapons/Grineer/KuvaLich/Upgrades/
  InnateDamageRandomMod", Slot: -1}]`.
- README notes: "Non-weapon items such as modular parts are in here as well. These can be filtered by checking if
  `behaviours` is absent" and "the `behaviours` array should be preferred" over `damagePerShot`.
  VERIFIED-ON-DISK `PEP/README.md`.

**PEP `ExportUpgrades.json`** (1,601 entries). VERIFIED-ON-DISK `PEP/ExportUpgrades.json`, `IUpgrade` in
`PEP/index.d.ts`.

- Every mod: `name` (loc tag), `polarity` (`AP_ATTACK|AP_DEFENSE|AP_TACTIC|AP_POWER|AP_WARD|AP_UMBRA|AP_PRECEPT|
  AP_UNIVERSAL|AP_ANY`), `rarity`, `baseDrain`, `fusionLimit`, `compat` (parent weapon class path), `compatName`,
  `type` (`PRIMARY` 340, `SECONDARY` 174, `MELEE` 203, ...), `compatibilityTags` (110), `incompatibilityTags` (185),
  `isUtility` (195, exilus-capable), `modSet` (72), `modSetValues` (5), `subtype` (217), `isStarter` (104),
  `isFrivolous` (123), `tradable`, `introducedAt`.
- Sample (Serration): `{"polarity":"AP_ATTACK","rarity":"UNCOMMON","baseDrain":4,"fusionLimit":10,"compat":
  "/Lotus/Weapons/Tenno/Rifle/LotusRifle","compatName":"Rifle","type":"PRIMARY"}`. There is no effect field.
- `levelStats` exists on 1 entry only (a sample antique). Ordinary mods have **no numbers and no text** in PEP.
- `upgradeEntries` exists on 17 entries only: the 7 Riven classes, 9 Railjack innate-roll mods, and
  `/Lotus/Weapons/Grineer/KuvaLich/Upgrades/InnateDamageRandomMod`.
- Riven sample (`/Lotus/Upgrades/Mods/Randomized/LotusRifleRandomModRare`, 24 entries):
  `{tag:"WeaponCritChanceMod", prefixTag, suffixTag, canBeBuff:true, canBeCurse:true,
  upgradeValues:[{value:0.016666, locTag}]}`; other tags include `WeaponDamageAmountMod` 0.018333,
  `WeaponFireIterationsMod` 0.01, `WeaponCritDamageMod` 0.013333, `WeaponFireRateMod` 0.00667,
  `WeaponReloadSpeedMod` 0.005555, `WeaponClipMaxMod` 0.005555, `WeaponPunctureDepthMod` 0.03,
  `WeaponStunChanceMod` 0.01, `WeaponProcTimeMod` 0.01111, `WeaponFactionDamageGrineer/Corpus/Infested` 0.005,
  elemental and physical tags. Riven entries also carry `availableChallenges` and `compatibleItems` (7 entries).
- Lich bonus sample: `InnateDamageRandomMod.upgradeEntries` = 7 tags (`InnateElectricityDamage,
  InnateFreezeDamage, InnateHeatDamage, InnateImpactDamage, InnateMagDamage, InnateRadDamage, InnateToxinDamage`),
  each `upgradeValues:[{value:0.1}]`.
- Riven dispositions are `ExportWeapons[*].omegaAttenuation` (present on all 843 entries).

**PEP `ExportModSet.json`** (19 sets). VERIFIED-ON-DISK `PEP/ExportModSet.json`.

- Fields: `description` (loc tag), `icon`, `numUpgradesInSet`, `levelStats` (array of string maps, one per number
  of set pieces), `buffSet`.
- Sample: Vigilante `numUpgradesInSet: 6, levelStats: [{"STAT1":"5"},{"STAT1":"10"},...,{"STAT1":"30"}]`, and
  `dict.en.json` resolves its description to "|STAT1|% chance to enhance Critical Hits from Primary Weapons."
  Tek: `[{"RADIUS":"3","COOLDOWN":"60","DAMAGE":"50"}, ...]`.
- Set membership is `ExportUpgrades[mod].modSet` (e.g. Vigilante Armaments ->
  `/Lotus/Upgrades/Mods/Sets/Vigilante/VigilanteSetMod`). Umbral/Sacrificial mods also have `modSetValues`
  (e.g. Umbral Intensify `[0.25, 0.75]`).
- So the set bonus magnitude is structured; its meaning is still a text template.

**PEP `ExportArcanes.json`** (177 entries). VERIFIED-ON-DISK `PEP/ExportArcanes.json`, `IArcane`.

- Fields: `name`, `icon`, `rarity`, `fusionLimit`, `levelStats` (168), `distillPointValue`, `excludeFromCodex` (4).
- `levelStats[rank]` is an array of `{tag, sub}` where `tag` is a loc template and `sub` holds the values, with
  nested templates. Primary Merciless rank 0: `{tag: ".../CosmeticEnhancerDescriptionNoChanceWithDurationAndStacks",
  sub: {CONDITION: ".../OnKillCondition_Description", BONUS: {tag: ".../WeaponDamageModDesc", sub: {val: "+5"}},
  DURATION: "4", STACKS: "12"}}`. The template text is "|CONDITION|:\n|BONUS| for |DURATION|s. Stacks up to
  |STACKS|x.".
- This is the most structured arcane data found: condition, bonus kind, value, duration and stack cap are separate
  fields per rank (values are strings such as `"+5"`).
- Key path prefixes: `/Lotus/Upgrades/CosmeticEnhancers/{Offensive 76, Utility 30, Defensive 25, OperatorArmour 19,
  Zariman 12, OperatorAmps 10, Antiques 5}`.

**PEP `ExportEnemies.json`**. VERIFIED-ON-DISK `PEP/ExportEnemies.json`, `IExportEnemies`.

- Six tables: `agents` (1,499: `baseLevel`, `avatarTypes{STANDARD,EXIMUS,RARE}`, `items[]`), `avatars` (1,880:
  `name`, `faction`, `health`, `damageController`, `factionResistanceKeyword`, `killXPReward`, `droptable`),
  `damageControllers` (745: `armor`, `shield`, `unhandledProcTypes[]`, `hitProxies[{bone,type}]`), `hitProxies`
  (535: `damageAtten`, `criticalChance`, `criticalMultiplier`), `droptables` (400), `aiWeapons` (898, with
  `behaviours`).
- Sample: Corrupted Heavy Gunner avatar `{faction:"Orokin", health:700, damageController:".../
  BombardDamageController", factionResistanceKeyword:"RK_OROKIN_FACTION"}`; its controller `{armor:500, shield:0,
  hitProxies:[{bone:"GAME_C1_HEAD1", type:".../GrineerHead"}, ...]}`.
- `factionResistanceKeyword` values: `RK_GRINEER_FACTION` 375, `RK_CORPUS_FACTION` 485, `RK_INFESTED_FACTION` 73,
  `RK_GRINEER_KUVA_FACTION` 57, `RK_CORPUS_AMALGAM_FACTION` 73, `RK_NARMER_FACTION` 174, `RK_OROKIN_FACTION` 34,
  `RK_SENTIENT_FACTION` 64, `RK_MITW_FACTION` 61, `RK_INFESTED_DEIMOS_FACTION` 45, `RK_ZARIMAN_FACTION` 11,
  `RK_OROKIN_EMPIRE_FACTION` 69, `RK_PROTOINFESTED_FACTION` 22, `RK_LASRIA_FACTION` 18, absent on 299.
- `PEP/ExportFactions.json` is only `{FC_GRINEER:{index:0,name}, ...}` (12 factions). There is **no** table of
  damage-type multipliers per faction and no level-scaling data in the package.

**WFCD `Primary.json` / `Secondary.json` / `Melee.json`** (arrays; Primary has 197). VERIFIED-ON-DISK
`WFCD/Primary.json`; types in `node_modules/@wfcd/items/index.d.ts` (`Attack`, `Falloff`).

- DE fields as in the Public Export, plus wiki-derived: `attacks` (196/197), `polarities` (142; array of names such
  as `["vazarin","madurai"]`), `exilusPolarity` (189), `disposition` (1-5 pips), `tags`, `introduced`,
  `releaseDate`, `damage{impact,...}`.
- `attacks[]` keys across primary+secondary+melee (1,520 attacks): `name`, `speed`, `crit_chance`, `crit_mult`,
  `status_chance`, `damage{}`, `shot_type` (`AoE` 667, `Projectile` 301, `Hit-Scan` 258, `Thrown` 26, `DoT` 3),
  `falloff{start,end,reduction}` (764), `shot_speed`/`flight` (325), `charge_time` (133), `slide`, `slam`.
- Sample (Trumna Prime): `{"name":"Auto","shot_type":"Hit-Scan","damage":{"impact":32,"heat":53}}`,
  `{"name":"Auto AoE","shot_type":"AoE","falloff":{"start":0,"end":1.6,"reduction":0.15},"damage":{"heat":50}}`,
  `{"name":"Grenade Bounce AoE","shot_type":"AoE","falloff":{"start":0,"end":6,"reduction":0.4},
  "damage":{"heat":1150}}`.
- Not in WFCD attacks: punch through, ammo cost, multishot per attack, burst count (the wiki source has these; see
  section 3).

**WFCD `Mods.json`** (1,809 entries). VERIFIED-ON-DISK `WFCD/Mods.json`.

- Fields: `uniqueName`, `name`, `polarity`, `rarity`, `baseDrain`, `fusionLimit`, `compatName`, `type`,
  `levelStats` (1,625), `isUtility` (195), `isExilus` (37), `isAugment` (457), `modSet` (72), `modSetValues` (5),
  `upgradeEntries` (17), `availableChallenges` (7), `drops`, `introduced`, `releaseDate`, `transmutable`.
- Effects are text only: Galvanized Chamber rank 10 `{"stats":["+80% Multishot","On Kill:\n+30% Multishot for 20s.
  Stacks up to 5x."]}`.
- Set bonuses **are** in this file, as separate entries of `type: "Mod Set Mod"` (19) with `numUpgradesInSet` and
  `stats[]`: `{"uniqueName":"/Lotus/Upgrades/Mods/Sets/Vigilante/VigilanteSetMod","numUpgradesInSet":6,"stats":
  ["5% chance to enhance Critical Hits from Primary Weapons.", ..., "30% chance ..."]}`. The advisor's note that
  set bonuses are not listed is true of the member mods' `levelStats`, not of the file.
- Riven entries duplicate DE's `upgradeEntries` with corrupted `baseDrain`/`fusionLimit` (e.g. Rifle Riven Mod
  `baseDrain: -1812070400`).

**WFCD `Arcanes.json`** (172): `uniqueName`, `name`, `rarity`, `type` (e.g. "Primary Arcane"), `levelStats` text
only (Primary Merciless rank 5: `"On Kill:\n+30% Damage for 4s. Stacks up to 12x.\n+30% Reload Speed"`).
VERIFIED-ON-DISK `WFCD/Arcanes.json`.

**WFCD `Enemy.json`** (638): `health`, `shield`, `armor`, `type` (faction), `resistances[{amount, type,
affectors[{element, modifier}]}]`. The sample uses health-type names "Ferrite Armor" and "Cloned Flesh".
VERIFIED-ON-DISK `WFCD/Enemy.json`. The app's packaging config excludes `Enemy.json` from the build
(VERIFIED-ON-DISK `package.json` line 180).

**WFCD `Misc.json`** holds kitgun parts (`type: "Kitgun Component"`), e.g. Catchmoon
`/Lotus/Weapons/SolarisUnited/Secondary/SUModularSecondarySet1/Barrel/SUModularSecondaryBarrelAPart` with
`omegaAttenuation 0.75`, `primeOmegaAttenuation 1.1`, an `attacks` entry with zeroed stats and a `falloff`, and a
`damagePerShot` containing meaningless values (0.5 magnetic, 9.99 corrosive ...). VERIFIED-ON-DISK `WFCD/Misc.json`.

### Inferences

- Trumna Prime shows the two packages disagree on radial damage for one attack: PEP's primary-fire behaviour is a
  single `impact` block `{DT_IMPACT:32, DT_FIRE:53}` with no radial part, while WFCD (and the wiki, section 3)
  list a hit-scan `32 impact + 53 heat` **plus** a separate "Auto AoE" of 50 heat. PEP does carry the alt-fire
  explosion (1150 heat). So PEP's `explosiveAttack` covers projectile explosions but not every radial component.
- WFCD's enemy `resistances` look like the pre-2024 health-type model and should be treated as stale; PEP's
  `factionResistanceKeyword` matches the current faction-based model.
- WFCD `polarities` has no slot positions, so it gives the set of innate polarities but not which slot holds which.

### Gaps

- Incarnon evolution perks: no structured table found in either package (only a behaviour named "Incarnon Form"
  on some weapons in PEP and an "Incarnon Form" attack in WFCD).
- Punch through, ammo, beam ramp-up: in neither package.

---

## 2. Digital Extremes' official Public Export

### Takeaway

The official export is the upstream of both packages. It has base weapon stats and per-rank mod and arcane text,
Riven `upgradeEntries`, and mod set text; it has no `behaviours`, no radial damage, no polarities and no numeric
mod effects. It is the freshest source for new weapons (it already has the three new weapons the installed PEP
lacks), and the app already fetches it but throws the stat fields away.

### Cited Findings

- Fetch flow: download `index_<lang>.txt.lzma`, LZMA-decompress it to a list of `Name!hash` lines, then fetch
  `http://content.warframe.com/PublicExport/Manifest/<Name!hash>`; the hash changes whenever DE updates a manifest
  and hashed files can be cached forever. DOCUMENTED [wiki: Public Export](https://wiki.warframe.com/w/Public_Export)
  (the page says to take the index from `origin.warframe.com`; the app uses `content.warframe.com` and that worked
  live today).
- Index contents today (16 files): `ExportCustoms, ExportDrones, ExportFlavour, ExportFusionBundles, ExportGear,
  ExportKeys, ExportRecipes, ExportRegions, ExportRelicArcane, ExportResources, ExportSentinels,
  ExportSortieRewards, ExportUpgrades, ExportWarframes, ExportWeapons` (`_en.json`) and `ExportManifest.json`.
  DOCUMENTED live, `https://content.warframe.com/PublicExport/index_en.txt.lzma`. There is no enemy export.
- `ExportWeapons_en.json` top-level arrays: `ExportWeapons` (841) and `ExportRailjackWeapons` (143). Weapon keys:
  `name, uniqueName, codexSecret, damagePerShot, totalDamage, description, criticalChance, criticalMultiplier,
  procChance, fireRate, masteryReq, productCategory, slot, accuracy, omegaAttenuation, noise, trigger,
  magazineSize, reloadTime, multishot, maxLevelCap, sentinel, excludeFromCodex, primeOmegaAttenuation` plus melee
  fields. No `behaviours`, `compatibilityTags`, `variantType`, `parentName` or `icon`. DOCUMENTED live.
- `damagePerShot` is "a 20-element array of floats" in the order Impact, Puncture, Slash, Heat, Cold, Electricity,
  Toxin, Blast, Radiation, ... DOCUMENTED [wiki: Public Export, Guns](https://wiki.warframe.com/w/Public_Export#Guns).
- `ExportUpgrades_en.json` top-level arrays: `ExportUpgrades` (1,603), `ExportModSet` (19), `ExportAvionics` (82),
  `ExportFocusUpgrades` (105). Mod keys: `uniqueName, name, polarity, rarity, codexSecret, baseDrain, fusionLimit,
  compatName, type, description, levelStats (1,471), isUtility, modSet, modSetValues, subtype, excludeFromCodex,
  upgradeEntries (17), availableChallenges (7)`. `levelStats` is text: Galvanized Chamber rank 0
  `{"stats":["+7.3% Multishot","On Kill:\r\n+2.7% Multishot for 20s. Stacks up to 5x."]}`. DOCUMENTED live.
- The wiki describes arcane `levelStats` as "the localized arcane description (not actual value) at a particular
  rank" and mod sets as `uniqueName`, `numUpgradesInSet`, `stats` (localized strings).
  DOCUMENTED [wiki: Public Export](https://wiki.warframe.com/w/Public_Export).
- Differences from PEP: PEP is keyed by type path with localisation split into `dict.<lang>.json`; adds
  `behaviours`, `compatibilityTags`, `incompatibilityTags`, `compat`, `variantType`, `parentName`, `icon`,
  `introducedAt`, `defaultUpgrades`, modular `partType`/`gunType`, structured arcane `levelStats`, and whole tables
  DE does not publish (`ExportEnemies`, `ExportFactions`, `ExportModSet` as its own file, `ExportBundles`,
  `ExportVendors`, ...). PEP drops the per-rank mod text DE has. VERIFIED-ON-DISK `PEP/README.md` ("Contains
  everything missing in Public Export and more") and the file comparison above.
- The app already has a live fetcher: `services/publicExportSource.ts` reads the index, fetches manifests, strips
  control characters, and overlays entries the bundled package lacks. It keeps only `KEPT_FIELDS` (`uniqueName,
  name, description, icon, masteryReq, productCategory, parentName, ...`), which does not include
  `damagePerShot`, `criticalChance`, `fireRate` or any other stat. VERIFIED-ON-DISK
  `services/publicExportSource.ts` (lines 1-120, 156-250).

### Inferences

- Adding the stat fields to `KEPT_FIELDS` for `ExportWeapons` would let the advisor compute base stats for weapons
  newer than the bundled package, at the cost of having no `behaviours` or `compatibilityTags` for them.
- DE's own numbers are unrounded floats (`criticalChance: 0.18000001`); PEP rounds them (`0.24`).

### Gaps

- Versioning beyond "hash changes on update" (no changelog or build number in the index) was not found.
- Licence/terms for reusing Public Export data: the wiki only says data "should be used for informational purposes
  only"; I found no formal licence text.

---

## 3. The official wiki's data modules

### Takeaway

`Module:Weapons/data/*` is the richest per-attack source found: it has punch through, falloff, ammo cost, per-attack
multishot, burst and charge fields, innate polarities and Incarnon charge fields. Mod and arcane effects on the wiki
are still text (`Description`), but each mod and many arcanes carry `UpgradeTypes`, an enum naming which stat they
touch, and mods carry an `Incompatible` list of mutually exclusive mods. Licence is CC BY-NC-SA 3.0.

### Cited Findings

- Fetching: `https://wiki.warframe.com/w/<Module:Page>?action=raw` returns the Lua source; the MediaWiki API at
  `https://wiki.warframe.com/api.php` gives revision timestamps and site info. A browser-like User-Agent got an
  anti-bot "Please wait" page; a descriptive non-browser User-Agent got the raw Lua. DOCUMENTED live,
  [Module:Arcane/data raw](https://wiki.warframe.com/w/Module:Arcane/data?action=raw).
- Licence: `rightsinfo` = "CC BY-NC-SA 3.0". DOCUMENTED live,
  [siteinfo](https://wiki.warframe.com/api.php?action=query&meta=siteinfo&siprop=rightsinfo&format=json).
- `Module:Weapons/data/primary` (335 KB, 200 weapons, 450 attacks). Weapon-level fields: `Name, InternalName,
  Class, Slot, Family, Traits, Mastery, MaxRank, Magazine, Reload, AmmoMax, AmmoPickup, AmmoType, Accuracy, Trigger,
  Disposition, Polarities (154), ExilusPolarity (195), CompatibilityTags, DefaultUpgrades (56), IsLichWeapon (24),
  IncarnonCharges (37), IncarnonChargeGain (38), Zoom, SniperComboMin/Reset, Spool, ReloadStyle, ReloadDelay`.
  Attack-level fields: `AttackName, AttackIndex, AttackParentIndex (87), Damage{}, CritChance, CritMultiplier,
  StatusChance, FireRate, Multishot (439), PunchThrough (408), ShotType (440), ShotSpeed (184), Range (272),
  Falloff{StartRange, EndRange, Reduction} (166), AmmoCost (301), ChargeTime (67), BurstCount/BurstDelay (28),
  ForcedProcs (98), Trigger, MinSpread/MaxSpread, ExplosionDelay, ExtraHeadshotDmg, EffectDuration`.
  DOCUMENTED live, [Module:Weapons/data/primary raw](https://wiki.warframe.com/w/Module:Weapons/data/primary?action=raw).
- Trumna Prime entry there: attack 1 "Auto" `Damage = { Heat = 53, Impact = 32 }, ShotType = "Hit-Scan",
  PunchThrough = 0, AmmoCost = 1`; attack 2 "Auto AoE" `Damage = { Heat = 50 }, Falloff = { EndRange = 1.6,
  Reduction = 0.15, StartRange = 0 }, ShotType = "AoE"`; attack 4 "Grenade Bounce AoE" `Damage = { Heat = 1150 },
  Falloff = { EndRange = 6, Reduction = 0.4, StartRange = 0 }`; `Polarities = { "Vazarin", "Madurai" }`,
  `ExilusPolarity = "Naramon"`, `Disposition = 0.65`, `InternalName =
  "/Lotus/Weapons/Tenno/LongGuns/PrimeTrumna/PrimeTrumnaWeapon"`. Same URL.
- `Module:Mods/data` (942 KB). Fields reported: `BaseDrain, Class, CompatibilityTags, Conclave, Description, Icon,
  Image, Incompatible, IncompatibilityTags, InternalName, Introduced, IsAbilityAugment, IsExilus, IsFlawed,
  IsWeaponAugment, Link, MaxRank, Name, NotUpgradable, Polarity, Rarity, Set, Tradable, Transmutable, Type,
  UpgradeTypes`. Galvanized Chamber: `Description = "+80% Multishot\r\nOn Kill:\r\n+30% Multishot for 20s. Stacks
  up to 5x."`, `Incompatible = { "Split Chamber", "Flawed Split Chamber", "Split Flights" }`,
  `UpgradeTypes = { "WEAPON_FIRE_ITERATIONS" }`, `Class = "Galvanized"`. Vigilante Armaments:
  `Set = "Vigilante Set"`. Serration: `Incompatible = { "Amalgam Serration", "Higasa Serration", "Flawed
  Serration", "Spectral Serration" }`. Only the max-rank description is stored; there are no per-rank numbers.
  DOCUMENTED [Module:Mods/data raw](https://wiki.warframe.com/w/Module:Mods/data?action=raw) (read through an
  extraction tool that quoted the entries, not by me line by line).
- `Module:Arcane/data` (96 KB, 166 arcanes). Fields: `Name, InternalName, Type, Rarity, MaxRank, Description,
  Dissolution, IsRefreshable, Introduced, UpgradeTypes (92), IncompatibilityTags (92), CompatibilityTags (8)`.
  Primary Merciless: `Description = "On Kill:\r\n+30% Damage for 4s. Stacks up to 12x.\r\n+30% Reload Speed"`,
  `MaxRank = 5`, `UpgradeTypes = { "WEAPON_DAMAGE_AMOUNT", "WEAPON_RELOAD_SPEED" }`. Max-rank text only.
  DOCUMENTED live, [Module:Arcane/data raw](https://wiki.warframe.com/w/Module:Arcane/data?action=raw).
- `Module:DamageTypes/data` (47 KB). Per damage type: `Name, InternalName` (e.g. `DT_VIRAL`), `ProcInternalName`
  (`PT_INFECTED`), `Positives` / `Negatives` (lists of faction names), `Status`, `Types` (component elements),
  `Bypass`. Viral: `Negatives = { "Infested Deimos", "Tenno Shield", "The Murmur" }, Positives = { "Orokin" },
  Types = { "Cold", "Toxin" }`. The lists name factions without a multiplier value.
  DOCUMENTED live, [Module:DamageTypes/data raw](https://wiki.warframe.com/w/Module:DamageTypes/data?action=raw).
- `Module:Weapons/data/modular` (43 KB) has kitgun entries per chamber and slot: `['Catchmoon (Secondary)']`,
  `['Catchmoon (Primary)']`, `['Tombfinger (Secondary)']`, `['Tombfinger (Primary)']`.
  DOCUMENTED live, [Module:Weapons/data/modular raw](https://wiki.warframe.com/w/Module:Weapons/data/modular?action=raw).
- `Module:Enemies/data` is a 4.8 KB loader that stitches per-faction partitions (`grineer, corpus, infestation,
  orokin, sentient, stalker, narmer, themurmur, techrot, scaldra, anarchs, unaffiliated`); its last edit is
  2026-04-09. DOCUMENTED live, [Module:Enemies/data raw](https://wiki.warframe.com/w/Module:Enemies/data?action=raw).

### Inferences

- WFCD's `attacks`, `polarities`, `exilusPolarity` and `disposition` are a lossy copy of this wiki module (same
  attack names and numbers for Trumna Prime), so reading the wiki directly gains punch through, ammo cost,
  per-attack multishot, burst and charge fields.
- The NonCommercial and ShareAlike terms matter if the app is ever distributed commercially or bundles a copy of
  the Lua data; WFCD (MIT-labelled) redistributes wiki-derived fields, which does not change the wiki's terms.
- `UpgradeTypes` plus the first number in `Description` would give a semi-structured mod effect for simple mods,
  but multi-line and conditional mods still need text parsing.

### Gaps

- I did not open the per-faction enemy partitions, so their fields (health, armour, shield, level scaling) are
  unconfirmed.
- I did not read the kitgun entries' bodies, so whether they hold per-grip/per-loader stat combinations or only
  the chamber baseline is unconfirmed.
- Whether `Positives`/`Negatives` always mean +50% / -50% is not stated in the module (UNVERIFIED: that is the
  usual rule since the 2024 damage rework).

---

## 4. Community data projects

### Takeaway

No community dataset found has structured numeric mod effects per rank; every one inspected carries DE's per-rank
text. warframestat.us is a hosted copy of @wfcd/items, and warframe.market's Riven endpoints give tag-to-name maps
and dispositions that the app can already derive from PEP.

### Cited Findings

- **@wfcd/items (WFCD/warframe-items)**: MIT licence; README says it is "updated on every new release, drop rate
  change or image change" and badges Warframe update 44.0.1. Mods are text only (section 1). VERIFIED-ON-DISK
  `node_modules/@wfcd/items/README.md`, `LICENSE`, `package.json`.
- **warframestat.us**: `https://api.warframestat.us/weapons/search/trumna%20prime` returned the same `attacks`,
  `polarities` and `disposition` as the on-disk WFCD file, and `/mods/galvanized%20chamber` returned the same
  `levelStats` text. DOCUMENTED live, [api.warframestat.us](https://api.warframestat.us/weapons/search/trumna%20prime).
- **warframe-public-export-plus (calamity-inc)**: no licence declared (`license: null` on GitHub, no `license` field
  on npm); default branch `senpai`; last push 2026-10-06 UTC; latest commit message "ExportUpgrades: add
  mergeOptions to types". The head `IUpgrade` type adds `isAdvancedTrait`, `buffRestrictions`, `curseRestrictions`
  to Riven entries and a `mergeOptions` array; ordinary mods there still have no effect fields (Galvanized Chamber
  at head: name, icon, polarity, rarity, baseDrain, fusionLimit, compat, compatName, type, tradable, introducedAt).
  DOCUMENTED live, [GitHub repo](https://github.com/calamity-inc/warframe-public-export-plus),
  [index.d.ts at head](https://raw.githubusercontent.com/calamity-inc/warframe-public-export-plus/senpai/index.d.ts).
- **browse.wf**: the PEP README says browse.wf "uses this data and is open-source" and hosts game images by path.
  VERIFIED-ON-DISK `PEP/README.md`. The app's Riven decoder credits "browse.wf/rivencalc -> RivenParser.js
  `rivenIntToFloat`" for the fingerprint encoding. VERIFIED-ON-DISK `services/rivenFingerprint.ts` (comment above
  `rivenIntToFloat`).
- **warframe.market v2**: `GET /v2/riven/attributes` returns 32 attributes with `id, slug, gameRef, group, prefix,
  suffix, i18n` (e.g. `{"slug":"punch_through","gameRef":"WeaponPunctureDepthMod","prefix":"Lexi","suffix":"Nok"}`);
  `GET /v2/riven/weapons` returns 420 weapons with `slug, gameRef, group, rivenType, disposition, reqMasteryRank`
  (e.g. Kulstar `disposition: 1.3`). Response reports `apiVersion 0.25.0`. No base values or per-rank numbers.
  DOCUMENTED live, [attributes](https://api.warframe.market/v2/riven/attributes),
  [weapons](https://api.warframe.market/v2/riven/weapons).

### Inferences

- `gameRef` in warframe.market's attribute list is the same tag vocabulary as DE's `upgradeEntries[].tag` and the
  inventory fingerprint's `buffs[].Tag`, so one tag-to-stat map serves Rivens from all three.

### Gaps

- semlar.com, Overframe's internal data, and WFCD `warframe-worldstate-data` were not inspected; no claim is made
  about them. UNVERIFIED: worldstate-data is translation tables for world-state strings and has no weapon or mod
  numbers.
- I found no dataset with numeric mod effects per rank. The search was limited to the sources named here; an
  exhaustive search of GitHub was not done.

---

## 5. The player's inventory payload

### Takeaway

Everything the advisor is missing about a weapon instance is in the saved inventory: forma'd polarities
(`Polarity`), forma count (`Polarized`), a `Features` bitmask, the Kuva/Tenet/Coda bonus element
(`UpgradeType` + `UpgradeFingerprint`), kitgun parts (`ModularParts`), Incarnon state (`EvolutionProgress`,
`SkillTree`), and arcane ranks. For guns, `Configs[n].Upgrades` index 8 is the exilus slot and index 9 is the
weapon arcane.

### Cited Findings

All VERIFIED-ON-DISK from the structure of
`C:\Users\derek\Documents\code_projects\wfhelper-profile\api-helper\inventory.json` (194 top-level keys; saved
2026-10-05). No identifiers were printed or copied.

- Weapon arrays: `LongGuns` (53), `Pistols` (33), `Melee` (75), `SpaceGuns`, `SpaceMelee`, `SentinelWeapons`,
  `OperatorAmps`, `SpecialItems`.
- Per-weapon keys (counts over LongGuns): `ItemType` (53), `ItemId` (53), `Configs` (53), `UpgradeVer` (53), `XP`
  (53), `Features` (32), `Polarized` (20), `Polarity` (20), `SkillTree` (5), `UpgradeType` (4),
  `UpgradeFingerprint` (4), `FocusLens` (2), `ItemName` (1), `UnlockLevel` (1), `AltWeaponModeId` (1).
  Pistols also have `ModularParts` (2).
- `Configs`: always 3 entries per gun; each has optional `Upgrades` (array of strings), `Name`, `Skins`, `pricol`,
  `attcol`, `PvpUpgrades`.
- `Configs[n].Upgrades` lengths seen on guns: 7, 8, 9, 10, 11. Entries are `""` (empty), a 24-hex id that matches
  an entry in top-level `Upgrades` (848 references), or a `/Lotus/...` type path for an unranked mod (67
  references).
- What each index holds on guns, by resolving references against PEP: indices 0-7 hold only PRIMARY/SECONDARY
  mods and Rivens; index 8 holds only exilus-capable mods (`isUtility`) or empty (25 filled, 34 empty); index 9
  holds only arcanes (50 arcane, 5 unresolved); index 10 held an arcane twice.
- Melee differs: index 8 = stance (96 of 96), index 9 = exilus, index 10 = arcane. Warframes: 8 = aura,
  9 = exilus, 10 and 11 = arcanes.
- `Polarity`: array of `{Slot: number, Value: "AP_*"}`; `Slot` values 0-8 seen; values `AP_ATTACK` 115,
  `AP_TACTIC` 11, `AP_DEFENSE` 10, `AP_ANY` 3, `AP_UMBRA` 1. Present only on weapons that also have `Polarized`
  (20 of 53 long guns), i.e. it records changes, not the weapon's innate layout.
- `Polarized`: forma count, values 1-7 seen.
- `Features` values seen: 1, 3, 9, 32, 33, 35, 43, 545, 547, 1057, 1059.
- `UpgradeType` is always `/Lotus/Weapons/Grineer/KuvaLich/Upgrades/InnateDamageRandomMod` (10 weapons, including
  Tenet and Coda weapons); the matching `UpgradeFingerprint` is a JSON string
  `{"compat": "<weapon type>", "buffs": [{"Tag": "InnateHeatDamage" | "InnateToxinDamage" | "InnateRadDamage" |
  "InnateMagDamage" | "InnateElectricityDamage" | "InnateFreezeDamage", "Value": <integer>}]}`.
- `ModularParts`: array of three part type paths, e.g. `LotusModularSecondaryShotgun` -> barrel
  `SUModularSecondaryBarrelAPart`, clip `SUModularCritIReloadIIClipPart`, handle `SUModularSecondaryHandleCPart`.
- `SkillTree`: a string of 2-5 digits on Incarnon-capable weapons; top-level `EvolutionProgress` is an array of
  `{ItemType, Rank, Progress}` (15 entries).
- `FocusLens`: a lens type path (e.g. `/Lotus/Upgrades/Focus/AttackLens`). `ItemName`: custom name (kitguns).
- Top-level `Upgrades` (495): `{ItemType, ItemId, UpgradeFingerprint}`; fingerprint is `{"lvl": n}` for mods (388)
  and arcanes (72), and `{compat, lim, lvlReq, lvl?, rerolls?, pol, buffs[], curses?[]}` for unveiled Rivens,
  `{challenge: {...}}` for veiled ones. `RawUpgrades` (701): `{ItemType, ItemCount, LastAdded}` for unranked
  stacks, including 101 arcane stacks.
- Owned arcanes and ranks: ranked copies are in `Upgrades` with `UpgradeFingerprint.lvl`; unranked stacks are in
  `RawUpgrades` with `ItemCount`. Equipped arcane = the reference at the arcane index of `Configs[n].Upgrades`.
- Archon Shards: `Suits[*].ArchonCrystalUpgrades` = array of `{Color, UpgradeType}`, e.g.
  `/Lotus/Upgrades/Invigorations/ArchonCrystalUpgrades/ArchonCrystalUpgradeWarframeAbilityStrength`
  (18 of 57 warframes). No PEP export file contains those type paths (text search of every `Export*.json`).
- `XPInfo`: `{ItemType, XP}` per item type (479). `LoadOutPresets`: `NORMAL, SENTINEL, ARCHWING, ...`.
- The mod-slot reversal the app found is implemented as `arsenalOrder = slot < 8 ? -slot : slot`.
  VERIFIED-ON-DISK `services/buildAdvisor/gunBuildAdvisor.ts` (lines 345-348).

### Inferences

- `Features` decodes consistently as a bitmask with 1 = catalyst, 2 = exilus adapter, 8 = gilded, 32 = arcane
  slot unlocked, 512 = Incarnon genesis installed, 1024 = Valence-fused: 43 = 32+8+2+1 appears on a gilded kitgun,
  545 = 512+32+1, 1057 = 1024+32+1. The bit names are UNVERIFIED (recalled from the OpenWF SpaceNinjaServer
  `EquipmentFeatures` enum, which I could not fetch); only the observed values are verified.
- Rank from `XP`: UNVERIFIED formula `rank = floor(sqrt(XP / 500))` for weapons (cap 30, or `maxLevelCap`),
  capacity = rank, doubled when `Features & 1`.
- The Lich bonus `Value` is probably the same fixed-point encoding as Riven rolls (`Value / 0x3FFFFFFF`), mapped
  onto the 25%-60% range. UNVERIFIED: PEP gives only `upgradeValues: [{value: 0.1}]` for these tags, which does
  not by itself yield 25-60%.

### Gaps

- Whether `Polarity[].Slot` uses the same reversed order as `Upgrades` indices 0-7 is not determinable from
  structure alone; `Slot: 8` (2 occurrences) is presumably the exilus slot.
- The meaning of each `SkillTree` digit (one chosen perk per evolution tier is the obvious reading) is unconfirmed.
- No public documentation of the `inventory.php` format was fetched; everything here is from the file itself.

---

## 6. Reusing the app's Riven decoding

### Takeaway

Yes. `decodeAllRivens(inventory)` already returns every unveiled Riven as numbers keyed by DE stat tag, at the
current rank and at every rank, using only PEP data. The advisor needs a tag-to-effect map and a join on the mod's
inventory id.

### Cited Findings

All VERIFIED-ON-DISK in `services/rivenFingerprint.ts`, `services/rivenData.ts`, `services/rivenConstants.ts`.

- `decodeAllRivens(inventory)` walks `inventory.Upgrades`, selects entries whose `ItemType` contains `Randomized`
  or `RandomMod`, parses `UpgradeFingerprint` (handling double-stringified JSON), and returns
  `{unveiled: DecodedRiven[], veiled, veiledUnseen}`.
- `DecodedRiven` has `itemId`, `weaponName`, `weaponUniqueName` (= fingerprint `compat`), `currentRank`
  (`lvl`), `polarity` (`pol`), `disposition`, `rerolls`, and `stats[]` with `tag`, `name`, `displayValue`,
  `maxRankValue`, `rankValues[0..8]`, `positive`, `multiplier`, `rollFloat`.
- Roll decoding: `rollFloat = Value / 0x3FFFFFFF`.
- Buff value: `baseValue * (1.5 * disposition * 10) * 1.25^numCurses * lerp(0.9, 1.1, rollFloat) *
  NUM_BUFFS_ATTEN[numBuffs] * (lvl + 1)` with `NUM_BUFFS_ATTEN = [0, 1, 0.66, 0.5, 0.4, 0.35]`. Curses use
  `NUM_BUFFS_CURSE_ATTEN = [0, 1, 0.33, 0.5, 1.25, 1.5]` indexed by buff count.
- `baseValue` comes from PEP `ExportUpgrades[...RandomModRare].upgradeEntries[].upgradeValues[].value` and
  `disposition` from `ExportWeapons[].omegaAttenuation` (`rivenData.ts` lines 222-270, via `readPepExport`).
- Units: `displayValue` is a percentage number (`Math.round(raw * 1000) / 10`) for most tags; for
  `NON_PERCENTAGE_TAGS` (faction damage, punch through, melee range, combo duration, initial combo) it is the raw
  value, and faction damage is returned as a final multiplier such as 1.05 (`isMultiplierTag`).

### Inferences

- The join is `Configs[n].Upgrades[i]` (24-hex id) = `DecodedRiven.itemId`; the advisor currently reports Rivens as
  unrecognised because it looks the id's `ItemType` up in WFCD mods and finds no `levelStats`.
- The same decode path could serve the Lich bonus element, since it is stored as `buffs[{Tag, Value}]` with a PEP
  `upgradeEntries` row, once the value formula is confirmed.

### Gaps

- The app's Riven numbers are validated against Riven cards elsewhere in the app, not against arsenal stat totals;
  that check has not been done for the advisor.

---

## 7. Why five owned weapons are missing

### Takeaway

Three are simply newer than the bundled data and are still absent from the latest PEP release and its GitHub head;
DE's live Public Export has them. The other two are kitguns, which are virtual item types with no stat entry in any
export; their stats must be assembled from `ModularParts`.

### Cited Findings

- The five gun `ItemType`s with no key in PEP 0.6.8 `ExportWeapons.json`:
  `/Lotus/Weapons/Tenno/LongGuns/PrimeSteflos/PrimeSteflosShotgun`, `/Lotus/Weapons/Tenno/Bows/DuelistBow/DuelistBow`,
  `/Lotus/Weapons/Tenno/Pistols/DuelistPistols/DuelistPistols`,
  `/Lotus/Weapons/SolarisUnited/Secondary/LotusModularSecondaryShotgun`,
  `/Lotus/Weapons/SolarisUnited/Secondary/LotusModularSecondary`. VERIFIED-ON-DISK (inventory `ItemType`s checked
  against `PEP/ExportWeapons.json`).
- WFCD 1.1276.6 on disk has all three new weapons: "Nunchasa" (`DuelistBow`, `releaseDate 2026-09-23`, with
  `attacks`, `polarities ["naramon"]`), "Aksondol" (`DuelistPistols`, `releaseDate 2026-09-23`, with `attacks`),
  and "Steflos Prime" (base stats `damagePerShot [195,0,0,285,...]`, crit 0.18, fire rate 3.0, magazine 12; no
  `attacks`, `polarities` or `releaseDate` yet). VERIFIED-ON-DISK `WFCD/Primary.json`, `WFCD/Secondary.json`.
- PEP 0.6.11 (the latest npm release) and the GitHub head both still lack all three; their newest weapon
  `introducedAt` is 2026-07-11. DOCUMENTED live,
  [unpkg 0.6.11 ExportWeapons.json](https://unpkg.com/warframe-public-export-plus@0.6.11/ExportWeapons.json),
  [GitHub head ExportWeapons.json](https://raw.githubusercontent.com/calamity-inc/warframe-public-export-plus/senpai/ExportWeapons.json).
- DE's live `ExportWeapons_en.json` has all three with full base stats, e.g. Nunchasa `trigger: "CHARGE",
  damagePerShot[1] = 200 (puncture), damagePerShot[4] = 200 (cold), criticalChance 0.32, fireRate 1`; Aksondol
  `trigger: "SEMI", 70 puncture + 70 cold, criticalChance 0.24, criticalMultiplier 2.6, fireRate 4, magazineSize 8`.
  It has no entry for `LotusModularSecondaryShotgun`. DOCUMENTED live, `https://content.warframe.com/PublicExport/`.
- Kitguns: PEP has the parts (`partType: LWPT_GUN_BARREL | LWPT_GUN_CLIP | LWPT_GUN_PRIMARY_HANDLE |
  LWPT_GUN_SECONDARY_HANDLE`, `gunType: GT_SHOTGUN | GT_RIFLE | GT_BEAM`, `omegaAttenuation`,
  `primeOmegaAttenuation`) but every stat on them is zero (`damagePerShot` all 0, `criticalChance 0`, `fireRate 0`)
  and they have no `behaviours`. `PEP/ExportVirtuals.json` has no modular-weapon entries. VERIFIED-ON-DISK
  `PEP/ExportWeapons.json`, `PEP/ExportVirtuals.json`.
- The two owned kitguns' chambers are `SUModularSecondaryBarrelAPart` (Catchmoon) and
  `SUModularSecondaryBarrelBPart` (Tombfinger), per WFCD's part names. VERIFIED-ON-DISK inventory `ModularParts`
  and `WFCD/Misc.json`.
- The wiki has `Catchmoon (Secondary)`, `Catchmoon (Primary)`, `Tombfinger (Secondary)`, `Tombfinger (Primary)`
  entries in `Module:Weapons/data/modular`. DOCUMENTED live (section 3).

### Inferences

- Upgrading PEP will not fix the three new weapons today. The practical fix is the app's existing DE overlay with
  stat fields kept, or WFCD as a fallback for base stats (it is already bundled and already has them).
- Nunchasa is a bow with a charge trigger, so the advisor would refuse it anyway under its current rules; only
  Steflos Prime and Aksondol become advisable from base stats alone.

### Gaps

- Why PEP lags the September 2026 update is not stated anywhere I read.
- Kitgun stat composition (chamber base, grip damage/fire-rate trade, loader crit/status/magazine/reload) was not
  found in structured form; the wiki modular module's entry bodies were not read.

---

## Recommended source per gap

| Gap | Best source and exact field | Status |
| --- | --- | --- |
| Radial / AoE damage | First choice: wiki `Module:Weapons/data/{primary,secondary}` `Attacks[]` with `ShotType = "AoE"`, `Damage`, `Falloff{StartRange,EndRange,Reduction}`. Already bundled equivalent: WFCD `Primary.json`/`Secondary.json` `attacks[]` (`shot_type: "AoE"`, `damage`, `falloff`). PEP `behaviours[].projectile.explosiveAttack` / `chargedProjectile.explosiveAttack` covers projectile explosions but missed Trumna Prime's primary-fire AoE. | Structured source exists |
| Projectile weapons reading wrong damage | PEP `behaviours[].projectile.attack` (the `impact` block is a 3.33/3.33/3.33 placeholder on these) | Structured, on disk |
| Burst, charge, beam, duplex triggers (currently refused) | PEP `trigger`, `behaviours[].burst{count,delay}`, `chargedProjectile`; wiki `BurstCount`, `BurstDelay`, `ChargeTime`, `Spool`, `AmmoCost` | Structured data exists; firing-rate rules still need code |
| Punch through, falloff, ammo | Wiki `Attacks[].PunchThrough`, `Falloff`, `AmmoCost`, `AmmoMax` | Wiki only |
| Mod numeric effects | None. Keep parsing `levelStats[].stats[]` text (WFCD `Mods.json`, same text as DE). Wiki `UpgradeTypes` and `Incompatible` can cross-check the parser and replace the name-stem family heuristic. | No structured source; text parsing unavoidable |
| Set membership | PEP `ExportUpgrades[mod].modSet`, or WFCD `Mods.json` `modSet` | Structured, on disk |
| Set bonus values | PEP `ExportModSet.json` `levelStats[piecesEquipped-1]` (e.g. Vigilante `STAT1: "5".."30"`) with `numUpgradesInSet`; text in WFCD `Mods.json` entries of `type: "Mod Set Mod"` (`stats[]`) | Numbers structured; what the number does needs a hand-written rule per set (19 sets) |
| Arcanes | PEP `ExportArcanes.json` `levelStats[rank][]{tag, sub{CONDITION, BONUS{tag, sub{val}}, DURATION, STACKS}}`; equipped arcane = inventory `Configs[n].Upgrades[9]` for guns ([10] for melee), rank = `Upgrades[].UpgradeFingerprint.lvl` | Semi-structured; needs a map from ~dozens of loc tags to effects |
| Rivens | Existing `decodeAllRivens()` in `services/rivenFingerprint.ts` -> `stats[].tag` + `displayValue`; base values PEP `ExportUpgrades[...RandomModRare].upgradeEntries`, disposition `ExportWeapons[].omegaAttenuation` | Structured; reuse existing code |
| Kuva/Tenet/Coda bonus element | Inventory weapon `UpgradeType` + `UpgradeFingerprint.buffs[0].Tag` (element) and `.Value` (magnitude) | Element structured; value formula unconfirmed |
| Weapon polarities (innate) | WFCD `polarities[]` + `exilusPolarity`, or wiki `Polarities` + `ExilusPolarity` | Structured, but no slot positions |
| Weapon polarities (after forma) and capacity | Inventory `Polarity[{Slot, Value}]`, `Polarized`, `Features`, `XP`; mod side PEP `ExportUpgrades[].polarity`, `baseDrain`, `fusionLimit` | Structured; slot order and bit meanings need one in-game check |
| Exilus slot | Inventory `Configs[n].Upgrades[8]` for guns; eligibility PEP `isUtility`; unlocked when `Features & 2` (bit meaning unconfirmed) | Structured |
| Five missing weapons | Steflos Prime, Aksondol, Nunchasa: DE live `ExportWeapons_en.json` (add stat fields to `KEPT_FIELDS` in `services/publicExportSource.ts`) or WFCD base stats. Kitguns: inventory `ModularParts` + wiki `Module:Weapons/data/modular` | New weapons solvable now; kitguns need a hand-built or wiki-derived table |
| Incarnon evolutions | State: inventory `EvolutionProgress[]{ItemType, Rank}` and weapon `SkillTree`; Incarnon-form attack: PEP `behaviours[]` with the "Incarnon Form" state / WFCD attack "Incarnon Form"; perk effects: none | Perk effects need a hand-maintained table |
| Enemies (health, armour, shield, faction) | PEP `ExportEnemies.json` `avatars[].health`, `.faction`, `.factionResistanceKeyword`, `damageControllers[].armor`, `.shield`, `agents[].baseLevel` (PEP is bundled; WFCD `Enemy.json` is excluded from the build and looks stale) | Structured, on disk |
| Faction damage-type modifiers | Wiki `Module:DamageTypes/data` `Positives` / `Negatives` per damage type | Lists only; multiplier values and level-scaling formulas must be hand-coded |
| Archon Shards | Inventory `Suits[].ArchonCrystalUpgrades[]{Color, UpgradeType}` | Ownership structured; effect values not in any export checked |

## Open questions

1. Trumna Prime primary fire: is the true model "32 impact + 53 heat direct, plus a separate 50 heat radial" (wiki,
   WFCD) or "32 impact + 53 heat" only (PEP, DE)? The arsenal screenshot's Radial Attack section should settle it.
2. What exact formula turns a Lich weapon's `UpgradeFingerprint.buffs[0].Value` into the 25-60% bonus? Check
   against one owned weapon whose percentage is known.
3. Does `Polarity[].Slot` use the same reversed indexing as `Configs[n].Upgrades[0..7]`, and which slots do a
   weapon's innate polarities (which have no position in WFCD or the wiki) occupy?
4. `Features` bit meanings (1, 2, 8, 32, 512, 1024) are inferred from observed values and memory of OpenWF's enum;
   confirm against a weapon with a known catalyst, exilus adapter and arcane adapter state.
5. What is gun `Upgrades` index 10 (seen twice holding an arcane)? Which weapons have a second arcane slot?
6. What do the `SkillTree` digits mean, and where can Incarnon perk values be read other than wiki page text?
7. Do the wiki `Module:Weapons/data/modular` kitgun entries encode every grip and loader combination, or only a
   baseline?
8. What fields do the wiki's per-faction enemy partitions hold, and are they current (the index page was last
   edited 2026-04-09)?
9. Is CC BY-NC-SA 3.0 acceptable for how the app would use wiki data (fetch at runtime versus bundle)? PEP has no
   declared licence at all.
10. Why has PEP not picked up the 2026-09-23 weapons, and will it? Until then the DE overlay or WFCD is needed.
11. The rank-from-XP formula and the +50%/-50% faction modifier values are from memory and need a source.
