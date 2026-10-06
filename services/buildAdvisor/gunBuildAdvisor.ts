// Recommends a gun build from the mods an inventory holds. Joins the inventory
// payload to the bundled game data; the maths lives in gunStats and gunBuildSearch.

import { unwrapInventoryPayload } from "../../config/shared/inventoryPayload";
import { asRecord } from "../../config/shared/objectValidation";
import { readPepDict, readPepExport, readWfcdItems } from "../bundledGameData";
import { getRivenFamilySlug, getWeaponDisposition } from "../rivenData";
import { decodeAllRivens } from "../rivenFingerprint";
import { findBestGunBuild, type BuildCandidate } from "./gunBuildSearch";
import type {
  AdvisorFaction,
  DamageByType,
  DamageType,
  EvaluatedMod,
  GunBaseStats,
  GunBuildAdvice,
  GunBuildAdviceFailure,
  GunBuildReview,
  GunCategory,
  GunConfigEvaluation,
  GunStats,
  ModEffect,
  OwnedGunSummary,
  SavedGunConfig,
} from "../../config/shared/buildAdvisorTypes";
import { computeGunStats } from "./gunStats";
import { parseArcaneRank } from "./arcaneEffects";

import { minimumDrain, type SlottedMod } from "./modCapacity";
import { rivenEffects } from "./rivenEffects";
import { targetDps } from "./statusModel";
import { parseModDescription, parseModStats } from "./modEffects";

/** The @wfcd/items mod fields the advisor reads. */
interface AdvisorModEntry {
  uniqueName: string;
  name: string;
  fusionLimit?: number;
  levelStats?: ReadonlyArray<{ stats?: readonly string[] }>;
}

/** An unveiled Riven as the app's decoder reports it. */
interface AdvisorRiven {
  itemId: string;
  /** The weapon the Riven names, which may be a variant's base weapon. */
  weaponName: string;
  name: string;
  rank: number;
  maxRank: number;
  polarity: string;
  stats: Parameters<typeof rivenEffects>[0];
}

export interface AdvisorGameData {
  /** The app's Riven decoder and its weapon family and disposition tables. */
  rivens: {
    owned: (inventory: Record<string, unknown>) => readonly AdvisorRiven[];
    family: (weaponName: string) => string;
    disposition: (weaponName: string) => number | null;
  };
  /** Built-in mod slot polarities by weapon, as @wfcd/items names them. */
  polarities: Readonly<Record<string, readonly string[]>>;
  /** ExportArcanes from warframe-public-export-plus. */
  arcanes: Readonly<Record<string, unknown>>;
  /** ExportWeapons from warframe-public-export-plus. */
  weapons: Readonly<Record<string, unknown>>;
  /** ExportUpgrades from warframe-public-export-plus. */
  upgrades: Readonly<Record<string, unknown>>;
  /** The Mods category of @wfcd/items. */
  mods: readonly AdvisorModEntry[];
  /** DE's English string table. */
  strings: Readonly<Record<string, string>>;
}

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
    rivens: {
      owned: (inventory) =>
        decodeAllRivens(inventory).unveiled.map((riven) => ({
          itemId: riven.itemId,
          weaponName: riven.weaponName,
          name: riven.rivenName,
          rank: riven.currentRank,
          maxRank: riven.maxRank,
          polarity: riven.polarity,
          stats: riven.stats,
        })),
      family: getRivenFamilySlug,
      disposition: getWeaponDisposition,
    },
    polarities: bundledPolarities(),
    arcanes: readPepExport("ExportArcanes") ?? {},
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
function familyKeys(type: string, compat: string, name: string): string[] {
  const segment = type.slice(type.lastIndexOf("/") + 1);
  const pathStem = segment
    .replace(/(?:Beginner|Intermediate|Expert)+$/, "")
    .replace(/SPMod$/, "Mod")
    .replace(/^Primed/, "");
  const nameStem = name.replace(/^(?:Primed|Flawed|Amalgam|Galvanized) /, "");
  const keys = [`path|${compat}|${pathStem}`, `name|${compat}|${nameStem}`];
  const analogue = CORRUPTED_ANALOGUE[segment];
  if (analogue) keys.push(`path|${compat}|${analogue}`);
  return keys;
}

// The wiki's Mod page: a corrupted mod that adds critical chance cannot be
// equipped with its standard counterpart (Critical Delay with Point Strike).
// Neither the path nor the name links them, so they are listed.
const CORRUPTED_ANALOGUE: Readonly<Record<string, string>> = {
  CorruptedCritRateFireRateRifle: "WeaponCritChanceMod",
  CorruptedCritChanceFireRateShotgun: "WeaponCritChanceMod",
  CorruptedCritChanceFireRatePistol: "WeaponCritChanceMod",
};

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

function findGun(inventory: Record<string, unknown>, type: string): unknown {
  for (const category of GUN_CATEGORIES) {
    const entries: unknown = inventory[category];
    if (!Array.isArray(entries)) continue;
    const found: unknown = entries.find((entry) => asRecord(entry)?.ItemType === type);
    if (found) return found;
  }
  return undefined;
}

function ownsWeapon(inventory: Record<string, unknown>, type: string): boolean {
  return findGun(inventory, type) !== undefined;
}

interface AdvisorOptions {
  /** Count "On Kill" and similar bonuses as active at full stacks. */
  assumeConditionals: boolean;
  /** Rank on damage to this faction; leave out to rank on the raw number. */
  faction?: AdvisorFaction | null;
  /** Only recommend what fits the weapon as it is; on unless set to false. */
  respectCapacity?: boolean;
}

// What experienced players assume when they compare builds.
const STACKS_UP: AdvisorOptions = { assumeConditionals: true };
// What the arsenal screen shows.
const ARSENAL_ONLY: AdvisorOptions = { assumeConditionals: false };

interface RankedMod {
  name: string;
  rank: number;
  maxRank: number;
  effects: readonly ModEffect[];
  ignored: readonly string[];
  assumed: readonly string[];
  /** True when the description states a rule that could change the numbers. */
  unmodelledRule: boolean;
}

interface Candidate extends BuildCandidate, RankedMod, SlottedMod {}

function modAtRank(
  entry: AdvisorModEntry,
  rank: number,
  data: AdvisorGameData,
  options: AdvisorOptions,
): RankedMod | null {
  const levels = entry.levelStats;
  if (!levels?.length) return null;
  const maxRank = levels.length - 1;
  const usedRank = Math.min(rank, maxRank);
  const { effects, ignored, assumed } = parseModStats(levels[usedRank].stats ?? [], options);
  const descriptionKey = asRecord(data.upgrades[entry.uniqueName])?.description;
  const description = typeof descriptionKey === "string" ? data.strings[descriptionKey] : undefined;
  const rules = parseModDescription(description ?? "");
  return {
    name: entry.name,
    rank: usedRank,
    maxRank,
    effects: [...effects, ...rules.effects],
    ignored: [...ignored, ...rules.unmodelled],
    assumed,
    unmodelledRule: rules.unmodelled.length > 0,
  };
}

// The weapon arcanes the calculator models: stacking damage that adds to the
// same bucket as base damage mods. The wiki confirms that for Merciless; for
// Deadhead and Dexterity it is read from the identical data tag.
const OFFENSIVE_ARCANES = "/Lotus/Upgrades/CosmeticEnhancers/Offensive/";
const MODELLED_ARCANES: Readonly<Record<GunCategory, readonly string[]>> = {
  LongGuns: ["PrimaryDamageOnKill", "PrimaryDamageOnNoMelee", "PrimaryDamageOnMeleeKill"],
  Pistols: ["SecondaryDamageOnKill", "SecondaryDamageOnNoMelee", "SecondaryDamageOnMeleeKill"],
};
// Where a gun config keeps its arcane; slot 8 is the exilus mod.
const GUN_ARCANE_SLOT = 9;
// An arcane with only a passive (stacks not assumed) adds no burst damage;
// float noise must not make it look like a recommendation.
const MIN_ARCANE_GAIN = 1e-9;

function modelledArcanes(weapon: Record<string, unknown>): string[] {
  const category = GUN_CATEGORIES.find((c) => c === weapon.productCategory);
  return category ? MODELLED_ARCANES[category].map((name) => OFFENSIVE_ARCANES + name) : [];
}

function arcaneAtRank(
  type: string,
  rank: number,
  data: AdvisorGameData,
  options: AdvisorOptions,
): RankedMod | null {
  const arcane = asRecord(data.arcanes[type]);
  const levels: unknown = arcane?.levelStats;
  if (!arcane || !Array.isArray(levels) || levels.length === 0) return null;
  const maxRank = levels.length - 1;
  const usedRank = Math.min(rank, maxRank);
  const parsed = parseArcaneRank(levels[usedRank], data.strings, options);
  const name = typeof arcane.name === "string" ? data.strings[arcane.name] : undefined;
  return {
    name: name ?? type.slice(type.lastIndexOf("/") + 1),
    rank: usedRank,
    maxRank,
    ...parsed,
    unmodelledRule: false,
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

const INVENTORY_ITEM_ID = /^[0-9a-f]{24}$/i;
const GUN_MOD_SLOTS = 8;

/** The arsenal stats of one of a gun's saved mod configs, for checking the
 *  calculator against the game. */
export function evaluateGunConfig(
  payload: unknown,
  weaponType: string,
  configIndex: number,
  data: AdvisorGameData = bundledGameData(),
  options: AdvisorOptions = ARSENAL_ONLY,
): GunConfigEvaluation {
  const gun = ownedGun(payload, weaponType, data);
  if (typeof gun === "string") return { ok: false, reason: gun };

  const configs = asRecord(findGun(gun.inventory, weaponType))?.Configs;
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
  const rivens = new Map(rivensFor(gun, data).map((riven) => [riven.type, riven]));

  const mods: EvaluatedMod[] = [];
  let arcane: EvaluatedMod | null = null;
  const unrecognised: string[] = [];
  const arcaneTypes = modelledArcanes(gun.weapon);
  const refs = Array.isArray(config.Upgrades) ? config.Upgrades.slice(0, 32) : [];
  refs.forEach((ref, slot) => {
    if (typeof ref !== "string" || ref === "") return;
    // A ranked mod is referenced by its inventory id, an unranked one by type.
    const owned = INVENTORY_ITEM_ID.test(ref) ? ranked.get(ref) : { type: ref, rank: 0 };
    const type = typeof owned?.type === "string" ? owned.type : null;
    const rank = owned?.rank ?? 0;
    if (type && slot === GUN_ARCANE_SLOT && arcaneTypes.includes(type)) {
      const equipped = arcaneAtRank(type, rank, data, options);
      if (equipped) {
        arcane = { slot, type, ...equipped };
        return;
      }
    }
    const known = type ? byType.get(type) : undefined;
    const riven = INVENTORY_ITEM_ID.test(ref) ? rivens.get(`${RIVEN_ID}${ref}`) : undefined;
    const mod = riven ?? (known ? modAtRank(known, rank, data, options) : null);
    if (type && mod) mods.push({ slot, type, ...mod });
    else unrecognised.push(type ?? ref);
  });
  const equippedArcane = arcane as EvaluatedMod | null;
  // The inventory stores the eight mod slots in the reverse of the arsenal's
  // left-to-right, top-to-bottom order, and elements combine in arsenal order.
  const arsenalOrder = (slot: number): number => (slot < GUN_MOD_SLOTS ? -slot : slot);
  mods.sort((a, b) => arsenalOrder(a.slot) - arsenalOrder(b.slot));
  const stats = computeGunStats(gun.base, [
    ...mods.map((m) => m.effects),
    ...(equippedArcane ? [equippedArcane.effects] : []),
  ]);

  return {
    ok: true,
    weapon: { type: weaponType, name: gun.name },
    mods,
    arcane: equippedArcane,
    unrecognised,
    stats,
    versus: options.faction ? targetDps(stats, options.faction) : null,
  };
}

export function adviseGunBuild(
  payload: unknown,
  weaponType: string,
  data: AdvisorGameData = bundledGameData(),
  options: AdvisorOptions = STACKS_UP,
): GunBuildAdvice {
  const gun = ownedGun(payload, weaponType, data);
  if (typeof gun === "string") return { ok: false, reason: gun };
  const { base, classes } = gun;

  const weaponTags = strings(gun.weapon.compatibilityTags);
  const owned = ownedModRanks(gun.inventory);
  const candidates: Candidate[] = [];
  const keys = new Map<string, string[]>();
  for (const entry of data.mods) {
    const rank = owned.get(entry.uniqueName);
    const upgrade = asRecord(data.upgrades[entry.uniqueName]);
    if (rank === undefined || !upgrade || !modFits(upgrade, classes, weaponTags)) continue;
    const mod = modAtRank(entry, rank, data, options);
    // Recommending a mod with a rule the numbers leave out would overrate it.
    if (!mod?.effects.length || mod.unmodelledRule) continue;
    candidates.push({
      id: entry.uniqueName,
      family: entry.uniqueName,
      ...mod,
      drain: (positive(upgrade.baseDrain) ?? 0) + mod.rank,
      polarity: typeof upgrade.polarity === "string" ? upgrade.polarity : null,
    });
    keys.set(entry.uniqueName, familyKeys(entry.uniqueName, upgrade.compat as string, mod.name));
  }
  assignFamilies(candidates, keys);
  for (const riven of rivensFor(gun, data)) {
    if (riven.effects.length === 0) continue;
    candidates.push({
      id: riven.type,
      // A weapon holds one Riven.
      family: "riven",
      ...riven,
      drain: RIVEN_BASE_DRAIN + riven.rank,
    });
  }

  // An arcane changes which mods are worth a slot, so each owned one gets its
  // own search and the strongest whole build wins. No arcane is the baseline.
  let arcane: (RankedMod & { type: string }) | null = null;
  const faction = options.faction ?? null;
  const score = faction
    ? (stats: GunStats): number => targetDps(stats, faction).burstDps
    : undefined;
  const valueOf = (stats: GunStats): number => (score ? score(stats) : stats.burstDps);
  const capacity = options.respectCapacity === false ? null : weaponCapacity(gun, weaponType, data);
  const limit = capacity
    ? (mods: readonly Candidate[]): boolean =>
        minimumDrain(mods, capacity.polarities) <= capacity.total
    : undefined;
  let build = findBestGunBuild(base, candidates, undefined, [], score, limit);
  for (const type of capacity?.arcaneSlot === false ? [] : modelledArcanes(gun.weapon)) {
    const rank = owned.get(type);
    const option = rank === undefined ? null : arcaneAtRank(type, rank, data, options);
    if (!option?.effects.length) continue;
    const withArcane = findBestGunBuild(
      base,
      candidates,
      undefined,
      [option.effects],
      score,
      limit,
    );
    if (valueOf(withArcane.stats) > valueOf(build.stats) * (1 + MIN_ARCANE_GAIN)) {
      build = withArcane;
      arcane = { type, ...option };
    }
  }

  const chosenArcane = arcane as (RankedMod & { type: string }) | null;
  const arcaneEffects = chosenArcane ? [chosenArcane.effects] : [];
  const total = valueOf(build.stats);
  const share = (rest: readonly (readonly ModEffect[])[]): number =>
    total > 0 ? (total - valueOf(computeGunStats(base, rest))) / total : 0;
  const modEffects = (skip?: Candidate): (readonly ModEffect[])[] =>
    build.mods.filter((m) => m !== skip).map((m) => m.effects);

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
      assumed: m.assumed,
      burstDpsShare: share([...modEffects(m), ...arcaneEffects]),
    })),
    arcane: chosenArcane
      ? {
          type: chosenArcane.type,
          name: chosenArcane.name,
          rank: chosenArcane.rank,
          maxRank: chosenArcane.maxRank,
          effects: chosenArcane.effects,
          ignored: chosenArcane.ignored,
          assumed: chosenArcane.assumed,
          burstDpsShare: share(modEffects()),
        }
      : null,
    stats: build.stats,
    versus: faction ? targetDps(build.stats, faction) : null,
    capacity: capacity
      ? { used: minimumDrain(build.mods, capacity.polarities), total: capacity.total }
      : null,
    unmodded: computeGunStats(base, []),
  };
}

/** Every primary and secondary the inventory holds, by name. */
export function listOwnedGuns(
  payload: unknown,
  data: AdvisorGameData = bundledGameData(),
): OwnedGunSummary[] {
  const inventory = asRecord(unwrapInventoryPayload(payload));
  if (!inventory) return [];
  const guns = new Map<string, OwnedGunSummary>();
  for (const category of GUN_CATEGORIES) {
    const entries: unknown = inventory[category];
    if (!Array.isArray(entries)) continue;
    for (const entry of entries.slice(0, 10_000)) {
      const type = asRecord(entry)?.ItemType;
      if (typeof type !== "string" || guns.has(type)) continue;
      const gun = ownedGun(inventory, type, data);
      guns.set(type, {
        type,
        name: typeof gun === "string" ? fallbackName(type, data) : gun.name,
        category: category satisfies GunCategory,
        unsupported: typeof gun === "string" ? gun : null,
      });
    }
  }
  return [...guns.values()].sort(
    (a, b) => a.name.localeCompare(b.name) || a.type.localeCompare(b.type),
  );
}

function fallbackName(type: string, data: AdvisorGameData): string {
  const key = asRecord(data.weapons[type])?.name;
  const name = typeof key === "string" ? data.strings[key] : undefined;
  return name ?? type.slice(type.lastIndexOf("/") + 1);
}

/** The recommendation for one gun beside its saved configs. */
export function reviewGun(
  payload: unknown,
  weaponType: string,
  data: AdvisorGameData = bundledGameData(),
  options: AdvisorOptions = STACKS_UP,
): GunBuildReview {
  const advice = adviseGunBuild(payload, weaponType, data, options);
  if (!advice.ok) return { advice, configs: [] };

  const inventory = asRecord(unwrapInventoryPayload(payload)) ?? {};
  const rawConfigs = asRecord(findGun(inventory, weaponType))?.Configs;
  const configs: SavedGunConfig[] = [];
  (Array.isArray(rawConfigs) ? rawConfigs.slice(0, 16) : []).forEach((raw, index) => {
    const config = asRecord(raw);
    const refs: unknown = config?.Upgrades;
    if (!Array.isArray(refs) || !refs.some((ref) => typeof ref === "string" && ref !== "")) return;
    const evaluation = evaluateGunConfig(payload, weaponType, index, data, options);
    if (!evaluation.ok) return;
    configs.push({
      index,
      name: typeof config?.Name === "string" && config.Name ? config.Name.slice(0, 120) : null,
      mods: evaluation.mods,
      arcane: evaluation.arcane,
      unrecognised: evaluation.unrecognised,
      stats: evaluation.stats,
      versus: evaluation.versus,
    });
  });
  return { advice, configs };
}

// @wfcd/items names polarities by focus school; the game data uses these tags.
const POLARITY_TAGS: Readonly<Record<string, string>> = {
  madurai: "AP_ATTACK",
  vazarin: "AP_DEFENSE",
  naramon: "AP_TACTIC",
  zenurik: "AP_POWER",
  unairu: "AP_WARD",
  penjaga: "AP_PRECEPT",
  umbra: "AP_UMBRA",
};

function bundledPolarities(): Record<string, readonly string[]> {
  const polarities: Record<string, readonly string[]> = {};
  for (const item of readWfcdItems(["Primary", "Secondary"])) {
    const listed: unknown = (item as { polarities?: unknown }).polarities;
    if (Array.isArray(listed)) polarities[item.uniqueName] = strings(listed);
  }
  return polarities;
}

// Bits of an inventory weapon's Features, matched against 86 owned guns: every
// gun whose saved mods need more than 30 capacity has bit 1, and 29 of the 30
// with an arcane equipped have bit 32.
const FEATURE_CATALYST = 1;
const FEATURE_ARCANE_ADAPTER = 32;
const AFFINITY_PER_RANK_SQUARED = 500;
const DEFAULT_MAX_RANK = 30;

interface WeaponCapacity {
  total: number;
  /** Polarities of the eight mod slots, in no particular order. */
  polarities: string[];
  /** False when the weapon has no arcane slot unlocked. */
  arcaneSlot: boolean;
}

/** What the owned weapon can hold, or null when the inventory does not say.
 *  Built-in polarities and forma are added together; a forma that replaced a
 *  built-in polarity is therefore counted twice. */
function weaponCapacity(
  gun: OwnedGun,
  weaponType: string,
  data: AdvisorGameData,
): WeaponCapacity | null {
  const entry = asRecord(findGun(gun.inventory, weaponType));
  const affinity = positive(entry?.XP);
  if (!entry || affinity === null) return null;
  const maxRank = positive(gun.weapon.maxLevelCap) ?? DEFAULT_MAX_RANK;
  const rank = Math.min(maxRank, Math.floor(Math.sqrt(affinity / AFFINITY_PER_RANK_SQUARED)));
  const features = typeof entry.Features === "number" ? entry.Features : 0;

  const polarities = (data.polarities[weaponType] ?? []).flatMap(
    (name) => POLARITY_TAGS[name] ?? [],
  );
  const forma: unknown = entry.Polarity;
  for (const raw of Array.isArray(forma) ? forma.slice(0, 16) : []) {
    const slot = asRecord(raw);
    if (typeof slot?.Value !== "string" || typeof slot.Slot !== "number") continue;
    if (slot.Slot < GUN_MOD_SLOTS) polarities.push(slot.Value);
  }

  const configs: unknown = entry.Configs;
  const arcaneEquipped =
    Array.isArray(configs) &&
    configs.some((config) => {
      const refs: unknown = asRecord(config)?.Upgrades;
      return (
        Array.isArray(refs) && typeof refs[GUN_ARCANE_SLOT] === "string" && refs[GUN_ARCANE_SLOT]
      );
    });
  return {
    total: rank * ((features & FEATURE_CATALYST) !== 0 ? 2 : 1),
    polarities: polarities.slice(0, GUN_MOD_SLOTS),
    arcaneSlot: (features & FEATURE_ARCANE_ADAPTER) !== 0 || arcaneEquipped,
  };
}

const RIVEN_ID = "riven:";
const RIVEN_BASE_DRAIN = 10;

interface RivenMod extends RankedMod {
  /** "riven:" and the Riven's inventory id, since Rivens share item types. */
  type: string;
  polarity: string | null;
}

/** The owned Rivens that fit this gun: any Riven for a weapon of its family,
 *  with its stats rescaled from the named weapon's disposition to this one's. */
function rivensFor(gun: OwnedGun, data: AdvisorGameData): RivenMod[] {
  const family = data.rivens.family(gun.name);
  const disposition = data.rivens.disposition(gun.name);
  const fitting: RivenMod[] = [];
  for (const riven of data.rivens.owned(gun.inventory)) {
    if (data.rivens.family(riven.weaponName) !== family) continue;
    const named = data.rivens.disposition(riven.weaponName);
    const scale = disposition && named ? disposition / named : 1;
    const { effects, ignored } = rivenEffects(riven.stats, scale);
    fitting.push({
      type: `${RIVEN_ID}${riven.itemId}`,
      name: riven.name,
      rank: riven.rank,
      maxRank: riven.maxRank,
      effects,
      ignored,
      assumed: [],
      unmodelledRule: false,
      polarity: riven.polarity || null,
    });
  }
  return fitting;
}
