/** What the build advisor returns, shared by the main process and the renderer. */

export type DamageType =
  | "impact"
  | "puncture"
  | "slash"
  | "heat"
  | "cold"
  | "electricity"
  | "toxin"
  | "blast"
  | "radiation"
  | "gas"
  | "magnetic"
  | "viral"
  | "corrosive";

export type PlainGunStat =
  | "damage"
  | "multishot"
  | "criticalChance"
  | "criticalDamage"
  | "fireRate"
  | "statusChance"
  | "reloadSpeed"
  | "magazineCapacity";

/** One bonus as a fraction: +165% is 1.65, -20% is -0.2. */
export type ModEffect =
  | { stat: PlainGunStat; value: number }
  | { stat: "typedDamage"; damageType: DamageType; value: number }
  /** "Fire Rate cannot be modified": every fire rate bonus on the build is void. */
  | { stat: "lockFireRate" };

export type DamageByType = Partial<Record<DamageType, number>>;

export interface GunBaseStats {
  /** Per projectile, as the arsenal lists it. */
  damage: DamageByType;
  multishot: number;
  criticalChance: number;
  criticalMultiplier: number;
  statusChance: number;
  /** Shots per second. */
  fireRate: number;
  magazineSize: number;
  /** Seconds. */
  reloadTime: number;
}

export interface GunStats extends GunBaseStats {
  totalDamage: number;
  /** Average damage per second while firing, crits averaged in. */
  burstDps: number;
  /** Burst damage per second spread over a full magazine and its reload. */
  sustainedDps: number;
}

interface AdvisorMod {
  type: string;
  name: string;
  rank: number;
  maxRank: number;
  effects: readonly ModEffect[];
  /** Stat lines the calculator does not model. */
  ignored: readonly string[];
  /** Conditional lines counted as active at full stacks. */
  assumed: readonly string[];
}

interface AdvisedMod extends AdvisorMod {
  /** Fraction of the build's burst damage per second lost without this mod. */
  burstDpsShare: number;
}

export interface EvaluatedMod extends AdvisorMod {
  /** Index in the inventory's stored order, which is the arsenal's reversed. */
  slot: number;
}

export type GunBuildAdviceFailure = "unknown-weapon" | "unsupported-weapon" | "weapon-not-owned";

export type GunBuildAdvice =
  | {
      ok: true;
      weapon: { type: string; name: string };
      mods: AdvisedMod[];
      /** The weapon arcane to equip, or null when none owned adds burst damage. */
      arcane: AdvisedMod | null;
      stats: GunStats;
      unmodded: GunStats;
    }
  | { ok: false; reason: GunBuildAdviceFailure };

export type GunConfigEvaluation =
  | {
      ok: true;
      weapon: { type: string; name: string };
      /** In arsenal order. */
      mods: EvaluatedMod[];
      /** The equipped weapon arcane, when it is one the calculator models. */
      arcane: EvaluatedMod | null;
      /** Equipped things with no usable data: rivens, other arcanes, unknown ids. */
      unrecognised: string[];
      stats: GunStats;
    }
  | { ok: false; reason: GunBuildAdviceFailure | "no-such-config" };

export type GunCategory = "LongGuns" | "Pistols";

export interface OwnedGunSummary {
  type: string;
  name: string;
  category: GunCategory;
  /** Null when the advisor can build for it. */
  unsupported: GunBuildAdviceFailure | null;
}

export interface SavedGunConfig {
  /** 0 is config A. */
  index: number;
  name: string | null;
  mods: EvaluatedMod[];
  arcane: EvaluatedMod | null;
  unrecognised: string[];
  stats: GunStats;
}

export interface GunBuildReview {
  advice: GunBuildAdvice;
  /** The gun's saved configs that have at least one mod, for comparison. */
  configs: SavedGunConfig[];
}
