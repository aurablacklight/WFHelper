// Recommends a gun build from the mods an inventory holds. Joins the inventory
// payload to the bundled game data; the maths lives in gunStats and gunBuildSearch.

import { unwrapInventoryPayload } from "../../config/shared/inventoryPayload";
import { asRecord } from "../../config/shared/objectValidation";
import { readPepDict, readPepExport, readWfcdItems } from "../bundledGameData";
import { findBestGunBuild, type BuildCandidate } from "./gunBuildSearch";
import { computeGunStats, type DamageByType, type GunBaseStats, type GunStats } from "./gunStats";
import { parseModDescription, parseModStats, type DamageType, type ModEffect } from "./modEffects";

/** The @wfcd/items mod fields the advisor reads. */
interface AdvisorModEntry {
  uniqueName: string;
  name: string;
  fusionLimit?: number;
  levelStats?: ReadonlyArray<{ stats?: readonly string[] }>;
}

export interface AdvisorGameData {
  /** ExportWeapons from warframe-public-export-plus. */
  weapons: Readonly<Record<string, unknown>>;
  /** ExportUpgrades from warframe-public-export-plus. */
  upgrades: Readonly<Record<string, unknown>>;
  /** The Mods category of @wfcd/items. */
  mods: readonly AdvisorModEntry[];
  /** DE's English string table. */
  strings: Readonly<Record<string, string>>;
}

interface AdvisedMod {
  type: string;
  name: string;
  rank: number;
  maxRank: number;
  effects: readonly ModEffect[];
  /** Stat lines the calculator does not model, such as "On Kill" bonuses. */
  ignored: readonly string[];
  /** Fraction of the build's burst damage per second lost without this mod. */
  burstDpsShare: number;
}

type GunBuildAdviceFailure = "unknown-weapon" | "unsupported-weapon" | "weapon-not-owned";

type GunBuildAdvice =
  | {
      ok: true;
      weapon: { type: string; name: string };
      mods: AdvisedMod[];
      stats: GunStats;
      unmodded: GunStats;
    }
  | { ok: false; reason: GunBuildAdviceFailure };

const GUN_CATEGORIES = ["LongGuns", "Pistols"] as const;
// Charge, held, burst and duplex triggers change damage or fire rate in ways
// the calculator does not model.
const SUPPORTED_TRIGGERS = new Set(["AUTO", "SEMI"]);
// Bows double fire rate bonuses.
const UNSUPPORTED_HOLSTERS = new Set(["BOW"]);
const BOW_CLASS_DIR = "/Bows/";
const PVP_MOD = "/PvPMods/";
const RIVEN_MOD = "/Randomized/";

// ExportWeapons.damagePerShot is indexed by DE's damage type enum.
const DAMAGE_TYPE_ORDER: readonly DamageType[] = [
  "impact",
  "puncture",
  "slash",
  "heat",
  "cold",
  "electricity",
  "toxin",
  "blast",
  "radiation",
  "gas",
  "magnetic",
  "viral",
  "corrosive",
];

let bundled: AdvisorGameData | null = null;

function bundledGameData(): AdvisorGameData {
  bundled ??= {
    weapons: readPepExport("ExportWeapons") ?? {},
    upgrades: readPepExport("ExportUpgrades") ?? {},
    mods: readWfcdItems(["Mods"]) as AdvisorModEntry[],
    strings: readPepDict("en") ?? {},
  };
  return bundled;
}

function positive(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) && value > 0 ? value : null;
}

function strings(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((v): v is string => typeof v === "string") : [];
}

function baseStats(weapon: Record<string, unknown>): GunBaseStats | null {
  if (!GUN_CATEGORIES.some((category) => category === weapon.productCategory)) return null;
  if (typeof weapon.trigger !== "string" || !SUPPORTED_TRIGGERS.has(weapon.trigger)) return null;
  if (
    typeof weapon.holsterCategory === "string" &&
    UNSUPPORTED_HOLSTERS.has(weapon.holsterCategory)
  ) {
    return null;
  }
  const perShot = Array.isArray(weapon.damagePerShot) ? weapon.damagePerShot : [];
  const damage: DamageByType = {};
  DAMAGE_TYPE_ORDER.forEach((type, index) => {
    const amount = positive(perShot[index]);
    if (amount !== null) damage[type] = amount;
  });
  const fireRate = positive(weapon.fireRate);
  const criticalMultiplier = positive(weapon.criticalMultiplier);
  const magazineSize = positive(weapon.magazineSize);
  if (!Object.keys(damage).length || !fireRate || !criticalMultiplier || !magazineSize) return null;
  return {
    damage,
    multishot: positive(weapon.multishot) ?? 1,
    criticalChance: positive(weapon.criticalChance) ?? 0,
    criticalMultiplier,
    statusChance: positive(weapon.procChance) ?? 0,
    fireRate,
    magazineSize,
    reloadTime: positive(weapon.reloadTime) ?? 0,
  };
}

// The classes general mods name. ExportWeapons stops below them, so they are
// inferred from the weapon's category instead of read from its parents.
const ANY_PRIMARY_CLASS = "/Lotus/Weapons/Tenno/LotusLongGun";
const RIFLE_CLASS = "/Lotus/Weapons/Tenno/Rifle/LotusRifle";
const SHOTGUN_CLASS = "/Lotus/Weapons/Tenno/Shotgun/LotusShotgun";
const PISTOL_CLASS = "/Lotus/Weapons/Tenno/Pistol/LotusPistol";

// A mod names the weapon class it fits; the weapon inherits its classes. Mods
// for a narrower class the export does not reach (sniper, bow) are left out.
function weaponClasses(
  type: string,
  weapon: Record<string, unknown>,
  weapons: Readonly<Record<string, unknown>>,
): Set<string> {
  const classes = new Set<string>();
  for (let current: unknown = type; typeof current === "string" && !classes.has(current); ) {
    classes.add(current);
    current = asRecord(weapons[current])?.parentName;
  }
  if (weapon.productCategory === "Pistols") {
    classes.add(PISTOL_CLASS);
  } else {
    const shotgun =
      weapon.holsterCategory === "SHOTGUN" || [...classes].some((c) => /Shotgun/i.test(c));
    classes.add(ANY_PRIMARY_CLASS);
    classes.add(shotgun ? SHOTGUN_CLASS : RIFLE_CLASS);
  }
  return classes;
}

function modFits(
  mod: Record<string, unknown>,
  classes: ReadonlySet<string>,
  weaponTags: readonly string[],
): boolean {
  if (typeof mod.compat !== "string" || !classes.has(mod.compat)) return false;
  const required = strings(mod.compatibilityTags);
  if (required.length && !required.some((tag) => weaponTags.includes(tag))) return false;
  return !strings(mod.incompatibilityTags).some((tag) => weaponTags.includes(tag));
}

// A mod and its other forms cannot be equipped together. Flawed, Primed and
// Galvanized forms share a path stem; an Amalgam form shares only the name.
function familyKeys(type: string, compat: string, name: string): [string, string] {
  const pathStem = type
    .slice(type.lastIndexOf("/") + 1)
    .replace(/(?:Beginner|Intermediate|Expert)$/, "")
    .replace(/SPMod$/, "Mod")
    .replace(/^Primed/, "");
  const nameStem = name.replace(/^(?:Primed|Flawed|Amalgam|Galvanized) /, "");
  return [`path|${compat}|${pathStem}`, `name|${compat}|${nameStem}`];
}

/** Gives every mod linked through a shared key the same family. */
function assignFamilies(
  candidates: readonly Candidate[],
  keys: ReadonlyMap<string, readonly string[]>,
): void {
  const parent = new Map<string, string>();
  const find = (key: string): string => {
    let root = key;
    for (let next = parent.get(root); next !== undefined; next = parent.get(root)) root = next;
    return root;
  };
  for (const candidate of candidates) {
    const [first, ...rest] = (keys.get(candidate.id) ?? []).map(find);
    for (const other of rest) if (other !== first) parent.set(other, first);
  }
  for (const candidate of candidates) {
    const first = keys.get(candidate.id)?.[0];
    if (first !== undefined) candidate.family = find(first);
  }
}

/** The highest rank owned of every mod type. Unranked stacks are rank 0. */
function ownedModRanks(inventory: Record<string, unknown>): Map<string, number> {
  const owned = new Map<string, number>();
  const note = (type: unknown, rank: number): void => {
    if (typeof type !== "string" || !type.startsWith("/Lotus/")) return;
    if (type.includes(RIVEN_MOD) || type.includes(PVP_MOD)) return;
    owned.set(type, Math.max(owned.get(type) ?? 0, rank));
  };
  if (Array.isArray(inventory.RawUpgrades)) {
    for (const entry of inventory.RawUpgrades.slice(0, 100_000)) note(asRecord(entry)?.ItemType, 0);
  }
  if (Array.isArray(inventory.Upgrades)) {
    for (const entry of inventory.Upgrades.slice(0, 100_000)) {
      const upgrade = asRecord(entry);
      note(upgrade?.ItemType, fingerprintRank(upgrade?.UpgradeFingerprint));
    }
  }
  return owned;
}

function fingerprintRank(value: unknown): number {
  if (typeof value !== "string" || value.length > 16_384) return 0;
  try {
    const rank = asRecord(JSON.parse(value))?.lvl;
    return typeof rank === "number" && Number.isSafeInteger(rank) && rank >= 0 && rank <= 100
      ? rank
      : 0;
  } catch {
    return 0;
  }
}

function ownsWeapon(inventory: Record<string, unknown>, type: string): boolean {
  return GUN_CATEGORIES.some((category) => {
    const entries = inventory[category];
    return Array.isArray(entries) && entries.some((entry) => asRecord(entry)?.ItemType === type);
  });
}

interface RankedMod {
  name: string;
  rank: number;
  maxRank: number;
  effects: readonly ModEffect[];
  ignored: readonly string[];
  /** True when the description states a rule that could change the numbers. */
  unmodelledRule: boolean;
}

interface Candidate extends BuildCandidate, RankedMod {}

function modAtRank(entry: AdvisorModEntry, rank: number, data: AdvisorGameData): RankedMod | null {
  const levels = entry.levelStats;
  if (!levels?.length) return null;
  const maxRank = levels.length - 1;
  const usedRank = Math.min(rank, maxRank);
  const { effects, ignored } = parseModStats(levels[usedRank].stats ?? []);
  const descriptionKey = asRecord(data.upgrades[entry.uniqueName])?.description;
  const description = typeof descriptionKey === "string" ? data.strings[descriptionKey] : undefined;
  const rules = parseModDescription(description ?? "");
  return {
    name: entry.name,
    rank: usedRank,
    maxRank,
    effects: [...effects, ...rules.effects],
    ignored: [...ignored, ...rules.unmodelled],
    unmodelledRule: rules.unmodelled.length > 0,
  };
}

interface OwnedGun {
  inventory: Record<string, unknown>;
  weapon: Record<string, unknown>;
  name: string;
  base: GunBaseStats;
  classes: Set<string>;
}

function ownedGun(
  payload: unknown,
  weaponType: string,
  data: AdvisorGameData,
): OwnedGun | GunBuildAdviceFailure {
  const inventory = asRecord(unwrapInventoryPayload(payload));
  if (!inventory || !ownsWeapon(inventory, weaponType)) return "weapon-not-owned";
  const weapon = asRecord(data.weapons[weaponType]);
  if (!weapon) return "unknown-weapon";
  const base = baseStats(weapon);
  if (!base) return "unsupported-weapon";
  const classes = weaponClasses(weaponType, weapon, data.weapons);
  // Crossbows holster as rifles but sit under the bow classes.
  if ([...classes].some((c) => c.includes(BOW_CLASS_DIR))) return "unsupported-weapon";
  const name = typeof weapon.name === "string" ? data.strings[weapon.name] : undefined;
  return { inventory, weapon, name: name ?? weaponType, base, classes };
}

interface EvaluatedMod extends RankedMod {
  slot: number;
  type: string;
}

type GunConfigEvaluation =
  | {
      ok: true;
      weapon: { type: string; name: string };
      mods: EvaluatedMod[];
      /** Equipped things with no mod data: rivens, arcanes, unknown ids. */
      unrecognised: string[];
      stats: GunStats;
    }
  | { ok: false; reason: GunBuildAdviceFailure | "no-such-config" };

const INVENTORY_ITEM_ID = /^[0-9a-f]{24}$/i;

/** The arsenal stats of one of a gun's saved mod configs, for checking the
 *  calculator against the game. */
export function evaluateGunConfig(
  payload: unknown,
  weaponType: string,
  configIndex: number,
  data: AdvisorGameData = bundledGameData(),
): GunConfigEvaluation {
  const gun = ownedGun(payload, weaponType, data);
  if (typeof gun === "string") return { ok: false, reason: gun };

  const entry = GUN_CATEGORIES.flatMap((category) => {
    const entries = gun.inventory[category];
    return Array.isArray(entries) ? (entries as unknown[]) : [];
  }).find((candidate) => asRecord(candidate)?.ItemType === weaponType);
  const configs = asRecord(entry)?.Configs;
  const config = Array.isArray(configs) ? asRecord(configs[configIndex]) : null;
  if (!config) return { ok: false, reason: "no-such-config" };

  const ranked = new Map<string, { type: unknown; rank: number }>();
  if (Array.isArray(gun.inventory.Upgrades)) {
    for (const raw of gun.inventory.Upgrades.slice(0, 100_000)) {
      const upgrade = asRecord(raw);
      const id = asRecord(upgrade?.ItemId)?.$oid;
      if (typeof id === "string" && upgrade) {
        ranked.set(id, {
          type: upgrade.ItemType,
          rank: fingerprintRank(upgrade.UpgradeFingerprint),
        });
      }
    }
  }
  const byType = new Map(data.mods.map((mod) => [mod.uniqueName, mod]));

  const mods: EvaluatedMod[] = [];
  const unrecognised: string[] = [];
  const refs = Array.isArray(config.Upgrades) ? config.Upgrades.slice(0, 32) : [];
  refs.forEach((ref, slot) => {
    if (typeof ref !== "string" || ref === "") return;
    // A ranked mod is referenced by its inventory id, an unranked one by type.
    const owned = INVENTORY_ITEM_ID.test(ref) ? ranked.get(ref) : { type: ref, rank: 0 };
    const type = typeof owned?.type === "string" ? owned.type : null;
    const known = type ? byType.get(type) : undefined;
    const mod = known ? modAtRank(known, owned?.rank ?? 0, data) : null;
    if (type && mod) mods.push({ slot, type, ...mod });
    else unrecognised.push(type ?? ref);
  });

  return {
    ok: true,
    weapon: { type: weaponType, name: gun.name },
    mods,
    unrecognised,
    stats: computeGunStats(
      gun.base,
      mods.map((m) => m.effects),
    ),
  };
}

export function adviseGunBuild(
  payload: unknown,
  weaponType: string,
  data: AdvisorGameData = bundledGameData(),
): GunBuildAdvice {
  const gun = ownedGun(payload, weaponType, data);
  if (typeof gun === "string") return { ok: false, reason: gun };
  const { base, classes } = gun;

  const weaponTags = strings(gun.weapon.compatibilityTags);
  const owned = ownedModRanks(gun.inventory);
  const candidates: Candidate[] = [];
  const keys = new Map<string, [string, string]>();
  for (const entry of data.mods) {
    const rank = owned.get(entry.uniqueName);
    const upgrade = asRecord(data.upgrades[entry.uniqueName]);
    if (rank === undefined || !upgrade || !modFits(upgrade, classes, weaponTags)) continue;
    const mod = modAtRank(entry, rank, data);
    // Recommending a mod with a rule the numbers leave out would overrate it.
    if (!mod?.effects.length || mod.unmodelledRule) continue;
    candidates.push({ id: entry.uniqueName, family: entry.uniqueName, ...mod });
    keys.set(entry.uniqueName, familyKeys(entry.uniqueName, upgrade.compat as string, mod.name));
  }
  assignFamilies(candidates, keys);

  const build = findBestGunBuild(base, candidates);
  const without = (skip: Candidate): number =>
    computeGunStats(
      base,
      build.mods.filter((m) => m !== skip).map((m) => m.effects),
    ).burstDps;

  return {
    ok: true,
    weapon: { type: weaponType, name: gun.name },
    mods: build.mods.map((m) => ({
      type: m.id,
      name: m.name,
      rank: m.rank,
      maxRank: m.maxRank,
      effects: m.effects,
      ignored: m.ignored,
      burstDpsShare:
        build.stats.burstDps > 0 ? (build.stats.burstDps - without(m)) / build.stats.burstDps : 0,
    })),
    stats: build.stats,
    unmodded: computeGunStats(base, []),
  };
}
