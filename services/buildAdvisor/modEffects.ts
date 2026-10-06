// Turns the per-rank stat lines @wfcd/items ships for a mod into numbers. A line
// that is not matched whole is reported as ignored, never partly read.

import type { DamageType, ModEffect, PlainGunStat } from "../../config/shared/buildAdvisorTypes";

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
  /** Conditional lines counted as active because the caller asked for that. */
  assumed: string[];
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

const CONDITIONAL_STATS: Readonly<Record<string, PlainGunStat>> = {
  Multishot: "multishot",
  "Critical Chance": "criticalChance",
  "Critical Damage": "criticalDamage",
  "Fire Rate": "fireRate",
  "Status Chance": "statusChance",
};

// The bundled data writes a line break as a backslash and an n; tests and other
// sources may use a real newline.
const LINE_BREAK = "(?:\\\\n|\\n)";

// "On Kill:\n+30% Multishot for 20s. Stacks up to 5x." A line may hold several.
const CONDITIONAL_CLAUSE =
  `On [A-Za-z ]+:${LINE_BREAK}([+-]\\d+(?:\\.\\d+)?)% (` +
  Object.keys(CONDITIONAL_STATS).join("|") +
  ")(?: when Aiming)? for \\d+(?:\\.\\d+)?s(?:\\. Stacks up to (\\d+)x\\.)?";
const CONDITIONAL_LINE = new RegExp(
  `^${CONDITIONAL_CLAUSE}(?:${LINE_BREAK}${CONDITIONAL_CLAUSE})*$`,
);

/** The bonuses of a conditional line with every stack up, or null when any part
 *  of the line is not understood. */
function parseConditionalLine(line: string): ModEffect[] | null {
  if (!CONDITIONAL_LINE.test(line)) return null;
  const effects: ModEffect[] = [];
  for (const clause of line.matchAll(new RegExp(CONDITIONAL_CLAUSE, "g"))) {
    const stacks = clause[3] ? Number(clause[3]) : 1;
    const value = fraction(String(Number(clause[1]) * stacks));
    effects.push({ stat: CONDITIONAL_STATS[clause[2]], value });
  }
  return effects;
}

interface ParseModStatsOptions {
  /** Count "On Kill" and similar bonuses as active at full stacks. */
  assumeConditionals?: boolean;
}

export function parseModStats(
  lines: readonly string[],
  options: ParseModStatsOptions = {},
): ParsedModStats {
  const result: ParsedModStats = { effects: [], ignored: [], assumed: [] };
  for (const line of lines) {
    const effect = parseLine(line);
    const conditional = effect || !options.assumeConditionals ? null : parseConditionalLine(line);
    if (effect) {
      result.effects.push(effect);
    } else if (conditional) {
      result.effects.push(...conditional);
      result.assumed.push(line);
    } else {
      result.ignored.push(line);
    }
  }
  return result;
}
