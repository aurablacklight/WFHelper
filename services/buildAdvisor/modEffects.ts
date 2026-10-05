// Turns the per-rank stat lines @wfcd/items ships for a mod into numbers. A line
// that is not matched whole is reported as ignored, never partly read.

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

interface ParsedModRules {
  effects: ModEffect[];
  /** Sentences that state a rule the calculator does not model. */
  unmodelled: string[];
}

const FIRE_RATE_LOCK = "Fire Rate cannot be modified.";
// Enforced through the mod's compatibility tags, so nothing to model here.
const NEUTRAL_RULES: ReadonlySet<string> = new Set(["Only compatible with Semi-Auto Trigger."]);

/** Reads the rules a mod states in its description rather than its stat lines. */
export function parseModDescription(description: string): ParsedModRules {
  const result: ParsedModRules = { effects: [], unmodelled: [] };
  for (const sentence of description.split(/(?<=\.)\s+/)) {
    const rule = sentence.trim();
    if (!rule || NEUTRAL_RULES.has(rule)) continue;
    if (rule === FIRE_RATE_LOCK) result.effects.push({ stat: "lockFireRate" });
    else result.unmodelled.push(rule);
  }
  return result;
}

interface ParsedModStats {
  effects: ModEffect[];
  ignored: string[];
}

const PERCENT = "([+-]\\d+(?:\\.\\d+)?)%";

const PLAIN_STATS: ReadonlyArray<[RegExp, PlainGunStat]> = [
  [new RegExp(`^${PERCENT} Damage$`), "damage"],
  [new RegExp(`^${PERCENT} Multishot$`), "multishot"],
  [new RegExp(`^${PERCENT} Critical Chance$`), "criticalChance"],
  [new RegExp(`^${PERCENT} Critical Damage$`), "criticalDamage"],
  [new RegExp(`^${PERCENT} Fire Rate(?: \\(x2 for Bows\\))?$`), "fireRate"],
  [new RegExp(`^${PERCENT} Status Chance$`), "statusChance"],
  [new RegExp(`^${PERCENT} Reload Speed$`), "reloadSpeed"],
  [new RegExp(`^${PERCENT} Magazine Capacity$`), "magazineCapacity"],
];

const TYPED_DAMAGE = new RegExp(`^${PERCENT} <DT_([A-Z]+)_COLOR>[A-Za-z]+$`);

// DE's damage type tags, as they appear in mod text and weapon data.
const DAMAGE_TYPE_BY_TAG: Readonly<Record<string, DamageType>> = {
  IMPACT: "impact",
  PUNCTURE: "puncture",
  SLASH: "slash",
  FIRE: "heat",
  FREEZE: "cold",
  ELECTRICITY: "electricity",
  POISON: "toxin",
  EXPLOSION: "blast",
  RADIATION: "radiation",
  GAS: "gas",
  MAGNETIC: "magnetic",
  VIRAL: "viral",
  CORROSIVE: "corrosive",
};

// Decimal shift on the text, so "72.7" becomes 0.727 and not 0.7270000000000001.
function fraction(percent: string): number {
  return Number(`${percent}e-2`);
}

function parseLine(line: string): ModEffect | null {
  for (const [pattern, stat] of PLAIN_STATS) {
    const match = pattern.exec(line);
    if (match) return { stat, value: fraction(match[1]) };
  }
  const typed = TYPED_DAMAGE.exec(line);
  const damageType = typed ? DAMAGE_TYPE_BY_TAG[typed[2]] : undefined;
  if (typed && damageType) return { stat: "typedDamage", damageType, value: fraction(typed[1]) };
  return null;
}

export function parseModStats(lines: readonly string[]): ParsedModStats {
  const result: ParsedModStats = { effects: [], ignored: [] };
  for (const line of lines) {
    const effect = parseLine(line);
    if (effect) result.effects.push(effect);
    else result.ignored.push(line);
  }
  return result;
}
